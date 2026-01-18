from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os, uuid, re
import PyPDF2
from pinecone import Pinecone
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
from dotenv import load_dotenv
import tempfile

# ---------------- SETUP ----------------
load_dotenv()
app = Flask(__name__)
# Configure CORS to allow authorization header
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL is not set")

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)

# ---------------- MODELS ----------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Initialize DB
with app.app_context():
    db.create_all()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("fest2")

llm = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0.3
)

embeddings_model = MistralAIEmbeddings(model="mistral-embed")


# ---------------- AUTH ROUTES ----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=username)
        return jsonify({"access_token": access_token}), 200

    return jsonify({"error": "Invalid credentials"}), 401


# ---------------- PROTECTED ROUTES ----------------
@app.route("/upload", methods=["POST"])
@jwt_required()
def upload_pdf():
    current_user = get_jwt_identity() # Use username as namespace
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "Missing file"}), 400

    temp_dir = tempfile.gettempdir()
    path = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")
    file.save(path)

    pages = extract_text_from_pdf(path)
    chunks = chunk_text_with_pages(pages)

    vectors = []
    for page, chunk in chunks:
        emb = embeddings_model.embed_query(chunk)
        vectors.append((
            str(uuid.uuid4()),
            emb,
            {"text": chunk, "page": page}
        ))

    if vectors:
        index.upsert(vectors=vectors, namespace=current_user)
        
    # Clean up temp file
    try:
        os.remove(path)
    except:
        pass

    return jsonify({"status": "uploaded", "namespace": current_user})

@app.route("/delete_uploads", methods=["DELETE"])
@jwt_required()
def delete_uploads():
    current_user = get_jwt_identity()
    try:
        index.delete(delete_all=True, namespace=current_user)
        return jsonify({"message": "Knowledge base cleared successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    current_user = get_jwt_identity()
    data = request.json
    query = data.get("query")

    if not query:
        return jsonify({"error": "Missing query"}), 400

    q_emb = embeddings_model.embed_query(query)

    results = index.query(
        vector=q_emb,
        top_k=8,
        namespace=current_user,
        include_metadata=True
    )

    context = ""
    for match in results["matches"]:
        if "text" in match["metadata"]:
             context += f"(Page {match['metadata'].get('page', '?')}) {match['metadata']['text']}\n"

    prompt = f"""
    Use the context below if relevant.
    Otherwise DO NOT answer the query, just respond out of context.

    Context:
    {context}

    User: {query}
    """

    res = llm.invoke(prompt)
    clean = re.sub(r"\*\*(.*?)\*\*", r"\1", res.content)
    return jsonify({"response": clean})




# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    page_texts = []
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(reader.pages):
                extracted = page.extract_text()
                if extracted:
                    page_texts.append((page_num + 1, extracted.strip()))
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
    return page_texts

# Function to chunk text with page numbers
def chunk_text_with_pages(page_texts, chunk_size=512, overlap=100):
    chunks = []
    for page_num, text in page_texts:
        words = text.split()
        i = 0
        while i < len(words):
            chunk = " ".join(words[i : i + chunk_size])
            chunks.append((page_num, chunk))
            i += chunk_size - overlap
    return chunks


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
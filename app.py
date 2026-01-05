from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import uuid
import PyPDF2
from pinecone import Pinecone, ServerlessSpec
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
from dotenv import load_dotenv
import re
load_dotenv()
app = Flask(__name__) 

# Configure APIs
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
llm = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0.3
)

embeddings_model = MistralAIEmbeddings(
    model="mistral-embed"
)

pinecone_client = Pinecone(api_key=PINECONE_API_KEY)

INDEX_NAME = "fest2"
index = pinecone_client.Index(INDEX_NAME)

conversation_history = ""

# Home route
@app.route("/")
def home():
    return render_template("home.html")

# Admin route
@app.route("/admin", methods=["GET", "POST"])
def admin():
    if request.method == "POST":
        if "pdf" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        pdf_file = request.files["pdf"]
        if pdf_file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        pdf_path = os.path.join("resources", pdf_file.filename)
        pdf_file.save(pdf_path)

        process_pdf_and_store_embeddings(pdf_path)
        return jsonify({"message": "PDF processed and embeddings stored successfully!"})

    return render_template("admin.html")

# User route
@app.route("/user", methods=["GET", "POST"])
def user():
    if request.method == "POST":
        user_query = request.json.get("query")
        if not user_query:
            return jsonify({"error": "No query provided"}), 400

        response = generate_response(user_query)
        return jsonify({"response": response})

    return render_template("user.html")

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

# Function to process PDF and store embeddings
def process_pdf_and_store_embeddings(pdf_path):
    page_texts = extract_text_from_pdf(pdf_path)
    text_chunks = chunk_text_with_pages(page_texts)

    upsert_data = []
    for page_num, chunk in text_chunks:
        if chunk.strip():
            try:
                embedding = embeddings_model.embed_query(chunk)
                if embedding:
                    upsert_data.append(
                        (str(uuid.uuid4()), embedding, {"text": chunk, "page": page_num})
                    )
            except Exception as e:
                print(f"Error embedding chunk: {e}")

    if upsert_data:
        index.upsert(upsert_data)
        print("PDF content successfully processed and stored in Pinecone!")
    else:
        print("No valid embeddings were generated.")

# Function to query Pinecone
def query_pinecone(query_text):
    try:
        query_embedding = embeddings_model.embed_query(query_text)


        if not query_embedding:
            return "Error: Failed to generate embedding for query."

        search_results = index.query(vector=query_embedding, top_k=20, include_metadata=True)
        matches = search_results.get("matches", [])

        if not matches:
            return "No relevant results found."

        responses = "\nSearch Results:\n"
        for match in matches:
            page = match["metadata"].get("page", "Unknown Page")
            responses += f"(Page {page}) {match['metadata']['text']}\n\n"

        return responses.strip()

    except Exception as e:
        return f"Error querying Pinecone: {e}"

# Function to generate response
def generate_response(user_query):
    global conversation_history
    relevant_context = query_pinecone(user_query)
    prompt = f"  The context is provided. Answer on the basis of context or generate new your own answer.  You are allowed to answer the question which is out of context also. Context: {relevant_context}\n\nUser: {user_query}\n"
    # prompt = f"  The relevant context might have related information. carefully check, make summary and answer the query. Context: {relevant_context}\n\nUser: {user_query}\n"


    try:
        
        result = llm.invoke(prompt)
        clean_content = re.sub(r"\*\*(.*?)\*\*", r"\1", result.content)
        return clean_content

    except Exception as e:
        return f"Error generating response: {e}"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
RAGworks

An intelligent document Q&A platform powered by Retrieval-Augmented Generation (RAG), enabling secure, context-aware querying of PDF documents with namespace-based isolation.


Overview
RAGworks is a production-ready document Q&A system that combines PDF processing, vector search, and Large Language Models to provide accurate, context-aware answers. Built with enterprise-grade security and multi-tenant architecture, it's ideal for knowledge bases, internal documentation, and AI-powered customer support.
Key Differentiator: Namespace-based vector storage using Pinecone ensures complete data isolation between users and document sets, preventing information leakage while maintaining high retrieval accuracy.

Features
🔐 Secure Authentication

JWT-based user authentication
User credential storage with SQLAlchemy
Protected API endpoints
Session management with token-based access control

📄 PDF Document Processing

Upload PDFs up to 10MB
Automatic text extraction and chunking
Mistral-powered embedding generation
Persistent knowledge base storage in Pinecone

🧠 Intelligent Retrieval

Namespace isolation - Each user/document set gets a dedicated Pinecone namespace
Semantic search using Mistral embeddings
Context-aware answer generation with Mistral LLM
Reduced hallucinations through grounded retrieval

💻 Modern Tech Stack

Frontend: Next.js 14, React, TypeScript, Tailwind CSS
Backend: Flask, SQLAlchemy, JWT authentication
AI/ML: Mistral AI (LLM + Embeddings)
Vector Database: Pinecone (namespace-based storage)
User Database: SQLAlchemy
Deployment: Vercel (Frontend), Cloud hosting (Backend)


Screenshots
<div align="center">
Authentication
<img src="auth.png" alt="Login Page" width="800"/>
Knowledge Base Management
<img src="home.png" alt="Home Page" width="800"/>
Interactive Q&A
<img src="q&a.png" alt="Question Answering Interface" width="800"/>
</div>
Architecture
<img src="flowchat.png" alt="flowchart" width="800"/>
</div>

Why Namespace-Based Retrieval?
Traditional RAG systems store all embeddings in a shared space, leading to:

❌ Irrelevant context from other users' documents
❌ Privacy and data leakage concerns
❌ Reduced accuracy in multi-tenant environments

RAGworks Solution with Pinecone Namespaces:

✅ Dedicated namespace per user/document set
✅ Complete data isolation at the vector database level
✅ Higher precision retrieval with no cross-contamination
✅ Scalable multi-tenant architecture
✅ Efficient resource utilization

Contact
Abhiram Karanth
Project Link: https://github.com/abhiram-karanth-core/faq-rag
Live Demo: https://ragworks-wheat.vercel.app
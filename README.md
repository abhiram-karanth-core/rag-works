🚀 Intelligent Document Q&A Platform (RAG)

A production-grade Retrieval-Augmented Generation (RAG) application that allows users to securely query documents using namespace-based semantic retrieval, powered by a modern Next.js frontend, JWT authentication, and a scalable backend architecture.

Built for multi-user and multi-dataset isolation, making it suitable for enterprise knowledge bases, documentation search, and AI-powered assistants.

✨ Key Features
🔐 Authentication & Security

JWT-based authentication

Secure user sessions

Protected backend APIs

Token-based access control

📚 Namespace-Based Text Retrieval

Each document set is indexed under its own namespace

Prevents cross-user and cross-document data leakage

Improves retrieval accuracy and relevance

Scales cleanly for multi-tenant systems

🧠 Retrieval-Augmented Generation (RAG)

Context retrieval before LLM inference

Reduced hallucinations

High-precision, context-aware responses

🖥️ Modern Frontend (Next.js)

Built with Next.js

Clean routing and API integration

Responsive and user-friendly UI

🎨 Improved UI/UX

Clear auth, home, and Q&A flows

Minimal and intuitive interface

Improved user experience

🖼️ Screenshots
🔑 Authentication
<a href="./auth.png" target="_blank"> <img src="./auth.png" alt="Authentication Page" width="800"/> </a>
🏠 Home Page
<a href="./home.png" target="_blank"> <img src="./home.png" alt="Home Page" width="800"/> </a>
💬 Document Q&A
<a href="./q&a.png" target="_blank"> <img src="./q&a.png" alt="Document Q&A" width="800"/> </a>
🏗️ System Architecture
User (Browser)
   │
   ▼
Next.js Frontend
   │
   ▼
Backend API
   ├── JWT Authentication
   ├── Document Ingestion
   ├── Namespace-based Vector Retrieval
   ├── Vector Database
   └── LLM (RAG Pipeline)

🧩 Tech Stack
Frontend

Next.js

React

Modern UI components

Backend

Python

REST APIs

JWT authentication

AI / NLP

Embedding models

Namespace-based vector search

Large Language Models (LLMs)

Storage

Vector database (namespaced indexing)

Document storage

🔍 Why Namespace-Based Retrieval?

Most RAG systems store all embeddings together, which can cause:

Irrelevant context retrieval

Security and data isolation issues

This project solves that by:

Assigning separate namespaces per dataset/user

Querying only within the relevant namespace

Improving both accuracy and security

📈 Key Improvements

✅ Namespace-based semantic retrieval

✅ Next.js frontend

✅ JWT authentication

✅ Improved UI/UX

✅ Production-ready architecture

🛣️ Future Enhancements

Role-based access control (RBAC)

Document upload and management dashboard

Streaming LLM responses

Multi-model support

Usage analytics
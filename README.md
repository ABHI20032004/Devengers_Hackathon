# NSpectAI

> **Sovereign On-Premise Agentic AI Workbench for Confidential Industrial Inspection and Knowledge Work**

NSpectAI is an OFFLINE on-premise, local-first AI workbench designed for confidential industrial inspection and enterprise knowledge workflows. It combines local open-weight AI models, Retrieval-Augmented Generation (RAG), OCR, multimodal document understanding, inspection analysis, evidence management, corrective-action tracking, and reporting workflows.

**Bring AI to the data — not the data to the AI.**

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [AI Model Stack](#ai-model-stack)
- [Project Workflow](#project-workflow)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Ollama Model Setup](#ollama-model-setup)
- [Running the Project](#running-the-project)
- [Using NSpectAI](#using-nspectai)
- [PDF / RAG Workflow](#pdf--rag-workflow)
- [Inspection Workflow](#inspection-workflow)
- [AI Model Routing](#ai-model-routing)
- [Authentication](#authentication)
- [Network Sovereignty](#network-sovereignty)
- [Evaluation](#evaluation)
- [Security Considerations](#security-considerations)
- [Limitations](#limitations)
- [Future Scope](#future-scope)
- [SIH / MRPL Context](#sih--mrpl-context)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Industrial organizations work with highly confidential information such as:

- Inspection reports
- Engineering calculations
- P&IDs and technical drawings
- Internal correspondence
- Safety documentation
- SOPs and manuals
- Vendor information
- Financial and business documents
- Internal code and technical documentation

NSpectAI provides a local AI workbench in which the major AI processing pipeline can run inside the organization's controlled environment.

### Core capabilities

```text
                 ┌─────────────────────────┐
                 │       NSpectAI UI        │
                 │ React + Vite             │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │       FastAPI API       │
                 │ Authentication          │
                 │ AI Routing              │
                 │ Inspection APIs         │
                 └────────────┬────────────┘
                              │
             ┌────────────────┼─────────────────┐
             │                │                 │
             ▼                ▼                 ▼
        ┌─────────┐      ┌──────────┐     ┌──────────┐
        │  RAG    │      │   OCR    │     │   Code   │
        │ ChromaDB│      │ Tesseract│     │  Qwen    │
        └────┬────┘      └────┬─────┘     └────┬─────┘
             │                │                 │
             └────────────────┼─────────────────┘
                              ▼
                     ┌─────────────────┐
                     │ Ollama Runtime  │
                     │ Local LLMs      │
                     └─────────────────┘
```

---

## Key Features

### 1. Sovereign Local AI

Run AI workloads using local models through Ollama without requiring cloud AI APIs.

### 2. Automatic Model Routing

NSpectAI analyzes the user's request and selects an appropriate local model.

| Task | Component / Model |
|---|---|
| General questions | Llama 3.1 8B |
| PDF / document questions | ChromaDB RAG + Llama 3.1 8B |
| Inspection analysis | Llama 3.1 8B + retrieved document context |
| Image OCR | Tesseract OCR + Llama 3.1 8B |
| Coding tasks | Qwen 2.5 Coder 7B |

### 3. PDF Intelligence

PDFs can be processed, chunked, embedded, indexed in ChromaDB, and queried using semantic retrieval.

Retrieved chunks retain:

- Document ID
- Filename
- Page number
- Chunk ID

This enables source-aware answers.

### 4. Retrieval-Augmented Generation

```text
Question
   ↓
Embedding
   ↓
ChromaDB similarity search
   ↓
Relevant document chunks
   ↓
Llama 3.1 8B
   ↓
Grounded answer + sources
```

### 5. OCR and Multimodal Processing

```text
Image
  ↓
Tesseract OCR
  ↓
Extracted text
  ↓
Llama 3.1 8B
  ↓
Answer / inspection interpretation
```

### 6. Industrial Inspection Analysis

Supports:

- Inspection creation
- PDF association
- AI analysis
- Risk classification
- Compliance scoring
- Finding generation
- Severity classification
- Recommendations
- Evidence
- Corrective actions
- Reporting

### 7. Evidence Management

Evidence can be associated with inspection findings and stored locally for traceability.

### 8. Corrective Action Tracking

Corrective actions can contain:

- Title
- Assigned person
- Priority
- Due date
- Status
- Notes

### 9. Authentication

The backend provides:

- Registration
- Password hashing
- JWT authentication
- Login
- Current-user endpoint
- Protected frontend routes

### 10. Network Sovereignty Monitoring

The application can expose application-level network information to help demonstrate the intended local communication path. Wireshark can be used separately for packet-level verification.

---

## Architecture

### High-Level Architecture

```text
                         NSpectAI
                            │
              ┌─────────────┴─────────────┐
              │                           │
         React Frontend               FastAPI
              │                           │
              │                    ┌──────┴──────┐
              │                    │             │
              │                 Auth/API    AI Router
              │                                  │
              │                    ┌─────────────┼─────────────┐
              │                    │             │             │
              │                   RAG           OCR          Code
              │                    │             │             │
              │                ChromaDB      Tesseract       Qwen
              │                    │             │             │
              │                    └─────────────┼─────────────┘
              │                                  │
              │                              Ollama
              │                                  │
              │                           Local LLM Models
              │
              └──────────── Local API ───────────┘
```

### Data Flow

#### General Question

```text
User → React Copilot → FastAPI /api/chat
     → Automatic Router → Llama 3.1 8B → Response
```

#### PDF Question

```text
User
 ↓
React Copilot
 ↓
FastAPI /api/chat
 ↓
PDF Route
 ↓
Question Embedding
 ↓
ChromaDB
 ↓
Top-K Relevant Chunks
 ↓
Document + Page Metadata
 ↓
Llama 3.1 8B
 ↓
Answer + Sources
```

#### Coding Question

```text
User → FastAPI → Question Type Detection
     → Qwen 2.5 Coder 7B → Code Response
```

#### Image Question

```text
Image
 ↓
FastAPI
 ↓
Tesseract OCR
 ↓
Extracted Text
 ↓
Llama 3.1 8B
 ↓
Analysis
```

---

## AI Model Stack

### Llama 3.1 8B

Used for:

- General questions
- PDF/RAG answers
- Industrial inspection interpretation
- OCR text analysis

### Qwen 2.5 Coder 7B

Used for:

- Programming questions
- Code generation
- Debugging
- Algorithms
- Programming explanations

### Tesseract OCR

Tesseract is an OCR engine, not an LLM. It extracts text from uploaded images locally.

### ChromaDB

ChromaDB is a local vector database used for document embedding storage and semantic retrieval.

### Ollama

Ollama is the local runtime used to serve the open-weight models.

---

## Project Workflow

### Document Workflow

```text
Upload PDF
    ↓
Process PDF
    ↓
Extract text
    ↓
Split into chunks
    ↓
Generate embeddings
    ↓
Store in ChromaDB
    ↓
Document becomes Ready
```

### Inspection Workflow

```text
Documents
    ↓
Upload PDF
    ↓
Process
    ↓
Create Inspection
    ↓
Select Ready PDF
    ↓
Analyze with AI
    ↓
Risk Level
Compliance Score
Findings
Recommendations
    ↓
Evidence
    ↓
Corrective Actions
    ↓
Report
```

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- CSS
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT
- Passlib
- bcrypt

### AI / ML

- Ollama
- Llama 3.1 8B
- Qwen 2.5 Coder 7B
- Tesseract OCR

### RAG

- ChromaDB
- Local embeddings
- Semantic similarity search

### Database

- SQLite
- SQLAlchemy ORM

### Development

- Git
- GitHub
- VS Code
- Postman / Swagger UI

---

## Project Structure

```text
NSpectAI/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── documents.py
│   │   │   ├── inspections.py
│   │   │   ├── findings.py
│   │   │   ├── corrective_actions.py
│   │   │   ├── evidence.py
│   │   │   ├── reports.py
│   │   │   ├── dashboard.py
│   │   │   └── network.py
│   │   ├── services/
│   │   │   ├── model_router.py
│   │   │   ├── ollama_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── chroma_service.py
│   │   │   ├── ocr_service.py
│   │   │   ├── auth_service.py
│   │   │   └── network_monitor.py
│   │   └── schemas/
│   │       └── auth.py
│   ├── data/
│   │   ├── chroma/
│   │   ├── documents/
│   │   ├── evidence/
│   │   └── chat_images/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Prerequisites

Install:

- Python 3.10+
- Node.js 18+
- npm
- Ollama
- Tesseract OCR
- Git

A GPU is recommended for practical local LLM inference. Actual performance depends on available hardware and model size.

---

## Installation

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd NSpectAI
```

---

## Backend Setup

```bash
cd backend
```

Create a virtual environment.

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

If needed, the current development environment uses packages including:

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-multipart
pip install passlib==1.7.4 bcrypt==4.0.1
pip install python-jose email-validator
pip install chromadb pytesseract pillow psutil
```

---

## Tesseract OCR Setup

Install Tesseract OCR.

The current Windows development configuration uses:

```text
C:\Program Files\Tesseract-OCR\tesseract.exe
```

If Tesseract is installed elsewhere, update the OCR service path.

Verify:

```bash
tesseract --version
```

---

## Ollama Model Setup

Install Ollama and pull the required local models:

```bash
ollama pull llama3.1:8b
ollama pull qwen2.5-coder:7b
```

Verify:

```bash
ollama list
```

Test:

```bash
ollama run llama3.1:8b
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite frontend normally runs at:

```text
http://localhost:5173
```

---

## Running the Project

Start the backend in one terminal:

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Using NSpectAI

### 1. Register

Create a user account.

### 2. Login

Login with the registered credentials.

### 3. Upload a document

Go to:

```text
Documents → Upload
```

Upload an inspection PDF.

### 4. Process the PDF

Process the uploaded document. Once complete, it should have a `ready` status.

### 5. Create an inspection

Go to:

```text
Inspections → New Inspection
```

Select the processed PDF and create the inspection.

### 6. Analyze with AI

Click:

```text
Analyze with AI
```

The system can generate:

- Risk level
- Compliance score
- Findings
- Severity
- Categories
- Recommendations
- Page references

### 7. Ask Copilot

Go to:

```text
Copilot
```

For PDF questions, NSpectAI uses ChromaDB retrieval followed by Llama 3.1 8B.

---

## PDF / RAG Workflow

Each indexed chunk stores metadata such as:

```json
{
  "document_id": "12",
  "filename": "inspection_report.pdf",
  "page_number": 4,
  "chunk_id": 2
}
```

The intended source-aware response is:

```text
The inspection identified inadequate PPE usage.
[Source 1, Page 4]

The report recommends improving PPE monitoring.
[Source 2, Page 7]

PDF Sources

inspection_report.pdf — Page 4
inspection_report.pdf — Page 7
```

This provides traceability between an AI response and the underlying PDF content.

---

## Inspection Workflow

The inspection module follows:

```text
PDF
 ↓
Document Processing
 ↓
ChromaDB
 ↓
Create Inspection
 ↓
AI Analysis
 ↓
Risk Assessment
 ↓
Compliance Score
 ↓
Findings
 ↓
Recommendations
 ↓
Evidence
 ↓
Corrective Actions
 ↓
Report
```

### Findings

A finding can contain:

- Title
- Description
- Category
- Severity
- Status
- Recommendation
- Page number
- Source document

### Corrective Actions

A corrective action can contain:

- Title
- Assigned person
- Priority
- Due date
- Status
- Notes

---

## AI Model Routing

```text
                    User Question
                          │
                          ▼
                Question Type Detector
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
       General           PDF             Code
          │               │               │
          ▼               ▼               ▼
      Llama 3.1       ChromaDB +      Qwen Coder
         8B            Llama 3.1          7B
                          8B

                       Image
                         │
                         ▼
                    Tesseract OCR
                         │
                         ▼
                    Llama 3.1 8B
```

---

## Authentication

Authentication uses JWT access tokens.

### Registration

```text
POST /api/auth/register
```

### Login

```text
POST /api/auth/login
```

### Current user

```text
GET /api/auth/me
```

For production deployment, store the JWT secret in an environment variable or secure secret-management system rather than hard-coding it.

---

## Network Sovereignty

The intended local communication path is:

```text
React
  │
  ▼
FastAPI
  │
  ▼
Ollama
  │
  ▼
Local Models
```

Supporting local services include:

```text
SQLite
ChromaDB
Tesseract
Local document storage
```

Expected local endpoints include:

```text
React       → 127.0.0.1:5173
FastAPI     → 127.0.0.1:8000
Ollama      → 127.0.0.1:11434
```

### Wireshark Verification

Wireshark should be used as an independent packet-level verification tool rather than embedded into the application.

During a demo, traffic can be observed while performing:

- PDF upload
- PDF processing
- AI question
- Inspection analysis
- OCR
- Code generation

A network capture demonstrates observed traffic during the test; it does not by itself prove that a machine is physically air-gapped.

---

## Evaluation

Evaluation should use actual measured test cases rather than invented values.

### Llama 3.1 8B

Suggested metrics:

- Accuracy
- Relevance
- Groundedness
- Hallucination rate
- Risk classification accuracy
- Finding detection accuracy
- Severity classification accuracy
- Average response time
- Task success rate

### Qwen 2.5 Coder 7B

Suggested metrics:

- Generation success
- Code accuracy
- Execution success
- Test pass rate
- Bug-fix rate
- Hallucination rate
- Average response time
- Pass@1

### Tesseract OCR

Suggested metrics:

- Processing success
- Character Error Rate (CER)
- Word Error Rate (WER)
- Number recognition accuracy
- Processing time per page

### ChromaDB / RAG

Suggested metrics:

- Retrieval precision
- Retrieval recall
- Faithfulness
- Source accuracy
- Unsupported-answer rate
- Hallucination rate
- Retrieval latency
- End-to-end response time

---

## Security Considerations

Local deployment does not automatically guarantee security. Recommended production controls include:

- Physical or logical network isolation
- Firewall rules
- Strict outbound network policies
- Secure JWT secret management
- Strong passwords
- Role-based access control
- File type and size validation
- Malware scanning where appropriate
- Encrypted storage
- Encrypted backups
- Audit logging
- Access logging
- Model integrity verification
- Least-privilege execution
- Sandboxed code execution
- Secure GPU server configuration
- Regular dependency updates

AI output should be reviewed by authorized personnel before being used for safety-critical decisions.

---

## Limitations

1. Local LLM performance depends heavily on available CPU/GPU resources.
2. OCR quality depends on image quality, handwriting, layout, and scan quality.
3. RAG quality depends on document extraction, chunking, embedding quality, and retrieval.
4. LLM responses can still contain errors or hallucinations.
5. AI-generated inspection findings should not automatically become final safety decisions.
6. Network monitoring is visibility tooling, not a replacement for infrastructure-level network controls.
7. Production deployments require stronger authentication, authorization, auditing, and secret management than a development environment.
8. Document-specific Copilot retrieval requires passing selected-document context when Q&A must be restricted to one PDF.

---

## Future Scope

NSpectAI can evolve into a broader **Sovereign AI Workbench**.

### Predictive Maintenance

Integrate:

- IoT sensor data
- Equipment telemetry
- Historical maintenance records
- Failure patterns

### Digital Twins

Connect AI analysis with digital representations of:

- Plants
- Equipment
- Pipelines
- Process units

### Agentic Workflows

Future controlled workflows could perform:

```text
Read document
    ↓
Extract findings
    ↓
Search SOP
    ↓
Compare requirements
    ↓
Draft corrective action
    ↓
Generate approval note
    ↓
Request human approval
```

### Knowledge Graph

Build relationships between:

```text
Equipment
   ↕
Inspection
   ↕
Finding
   ↕
Risk
   ↕
SOP
   ↕
Corrective Action
```

### Enterprise Expansion

The architecture can be adapted for:

- Defence & aerospace
- Energy and utilities
- Manufacturing
- Ports and maritime
- Healthcare
- Banking and finance
- Government and PSUs
- Corporate knowledge management

The inspection workflow is a domain-specific implementation of a broader sovereign AI workbench.

---

## SIH / MRPL Context

NSpectAI was designed around the Smart Automation problem of building a:

**Sovereign On-Premise Agentic AI Workbench using Open-Weight Multimodal LLMs for Confidential Industrial Work.**

The project addresses the challenge of applying AI to confidential organizational information without requiring that information to be sent to external cloud AI services.

### Problem

Industrial organizations handle sensitive information including:

- P&IDs
- Engineering documents
- Inspection reports
- Internal correspondence
- Business information
- Confidential designs
- Vendor information

### Proposed Approach

```text
Sovereign Local Infrastructure
          +
Open-Weight Models
          +
Automatic Model Routing
          +
RAG
          +
OCR
          +
Multimodal Processing
          +
Industrial Inspection Workflow
          +
Evidence & Traceability
          +
Human-in-the-Loop
```

### Core Innovation

The primary innovation is not a new foundation model. It is the orchestration and integration of multiple local AI capabilities into a traceable industrial workflow.

```text
Multimodal Data
      ↓
Local AI Orchestration
      ↓
Knowledge Retrieval
      ↓
Inspection Intelligence
      ↓
Findings
      ↓
Evidence
      ↓
Corrective Actions
      ↓
Reports
```

---

## Contributing

Contributions are welcome.

```bash
git checkout -b feature/your-feature
```

After making changes:

```bash
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Open a pull request for review.

---

## License

Add the project's chosen license here.

For example:

```text
MIT License
```

If the project uses third-party models or datasets, their individual licenses and usage terms must also be followed.

---

## Project Vision

NSpectAI demonstrates how confidential industrial AI can be built around local models, local knowledge, local orchestration, and human oversight.

**Local models + local knowledge + local orchestration + human oversight = sovereign AI workflows.**

> **Bring AI to the data — not the data to the AI.**

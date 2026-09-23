# 🕵️‍♂️ AI-Powered Tech Watch Agent

An autonomous tech-intelligence agent that extracts, cleans, and synthesizes live data from multiple web sources in real time. The application leverages a cutting-edge LLM via the Groq architecture to generate structured, actionable reports inside a highly optimized microservices framework.

## 🚀 Key Features
- **High-Performance Async Scraping**: Multi-source parallel extraction powered by Crawl4AI and Headless Chromium (HTML purification, stripping layout noise, overlays, and modals).
- **Advanced AI Reasoning**: Precise structured trend analysis driven by the Qwen model (via Groq API Gateway) featuring real-time terminal token usage tracking and an automated industrial disruption matrix.
- **Security & Quotas**: Integrated bot-detection shields (Arcjet, signature rotation) and strict generation quota limits mapped per user session.
- **Production-Ready Architecture**: Single-domain reverse proxy topology removing 100% of CORS issues, coupled with seamless cookie-state session sharing (fully Safari ITP compliant).

## 🛠️ Technical Stack
- **Frontend**: React 19, Vite, TailwindCSS (Smooth UI layout with interactive generation history logs and formatted PDF export triggers).
- **Backend API**: Node.js 23, Express, MongoDB & Mongoose (Auth flow, secure HttpOnly cookie session handshakes, and quota management).
- **AI Microservice**: Python 3.14, FastAPI, LangChain, Crawl4AI, Playwright (Async extraction pipeline and structured LLM inference).
- **DevOps & Prod**: Docker & Docker Compose, Nginx, Linux SWAP & OOM-safeguards.

## 🏗️ Architecture Overview

[ Internet / Client Browser ]
              │  (HTTPS - Port 443)
              ▼
┌───────────────────────────┐
│      Nginx / Certbot      │  (Reverse Proxy / SSL)
└──────┬─────────────┬──────┘
       │             │
       │ (Serves static /dist assets directly from disk)
       │             │
       │             ▼
       │      ┌───────────────┐
       │      │ React Frontend│
       │      └───────────────┘
       │
       │ (Internal Proxy - Port 5001)
       ▼
┌───────────────────────────┐
│     Backend Container     │
│  • Node.js 23 / Express   │  (Serves API Routes, handles database mapping)
└─────────────┬─────────────┘
              │  (Docker Bridge Network)
              ▼
┌───────────────────────────┐
│     Scraper Container     │
│  • Python 3.14 / FastAPI  │  (Executes Crawl4AI/Playwright
│  • Headless Chromium      │   and manages Groq API Gateway)
└───────────────────────────┘

## ⚙️ Local Configuration & Deployment

### Prerequisites
- Docker and Docker Compose installed.
- Node.js installed locally (for frontend dev server).
- A valid [Groq Cloud](https://groq.com) API Key.

### 1. Environment Setup
Configure the environment variables in their respective directories before launching.

**`/backend/.env`**:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/techwatch
FASTAPI_URL=http://127.0.0.1:8000
```

**`/ai-service/.env`**:
```env
GROQ_API_KEY=gsk_your_official_groq_api_key
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 2. Launching the Ecosystem (Local Development)

Open three separate terminal tabs to run the components concurrently:

- **Terminal 1 (AI Microservice)**:
  ```bash
  cd ai-service
  pip install -r requirements.txt
  playwright install chromium --with-deps
  uvicorn main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **Terminal 2 (Express Backend)**:
  ```bash
  cd backend
  npm install
  node src/server.js
  ```
- **Terminal 3 (React Frontend)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
The application will be instantly accessible at `http://localhost:5173`.

## 📈 VPS Production Optimizations
Deployed on a VPS with 8 GB RAM alongside companion AI portfolio projects (Kokoro TTS & Whisper Voice Cloning), the system includes critical server-hardening configurations:
- **Chromium Memory Safety**: Allocation of a 4 GB Linux SWAP file coupled with `swappiness` locked at `10` to maximize physical RAM utility, alongside restrictive single-worker Uvicorn constraints to neutralize Linux OOM-Killer termination risks.
- **Static Content Offloading**: Nginx is configured to serve the React production compilation bundle directly from the file system, bypassing Node.js to achieve ultra-low file transfer latencies.
- **Payload Restrictions**: Hard-capped incoming JSON ingestion to 1 MB to prevent denial-of-service (DoS) system saturation.

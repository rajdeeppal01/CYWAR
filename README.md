# CYWAR 🌐🛡️

**CYWAR** is a real-time, AI-driven Geopolitical Cyber Threat Prediction Engine. It simulates, aggregates, and correlates global cyber warfare telemetry by analyzing live Open Source Intelligence (OSINT) and employing advanced LLM reasoning to deduce active state-sponsored threat actors and attack vectors.

![CYWAR Dashboard](https://img.shields.io/badge/Status-Online_Stream-success?style=for-the-badge) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Key Features
- **Real-Time Threat Telemetry:** Streams simulated, high-volume geopolitical cyber attack packets.
- **AI-Powered OSINT Reasoning:** Leverages the **Google Gemini API** to continuously parse world news, detect emerging global hotspots, and attribute attacks to specific APT groups (e.g., Volt Typhoon, Sandworm).
- **Military-Grade Visualization:** A premium, dark-mode, glassmorphic UI featuring an interactive equirectangular world map with animated threat arcs.
- **Drill-Down Analytics:** Deep-dive panels displaying volumetric data, Z-Score anomaly metrics, and diplomatic tension scales for targeted nations.
- **Server-Sent Events (SSE):** Seamless, low-latency data streaming architecture connecting the frontend to the backend engine.

## 🏗️ Architecture Stack
- **Frontend:** React, TailwindCSS, Vite (Deployed on Vercel)
- **Backend:** Python, FastAPI, Uvicorn (Deployed on Render)
- **AI Engine:** Google Generative AI (Gemini)

## 🚀 Live Deployment
- **Frontend (Vercel):** *Your Vercel URL here*
- **API (Render):** *Your Render URL here*

## 🛠️ Local Setup
### 1. Backend (Python/FastAPI)
```bash
cd backend
pip install -r requirements.txt
# Set your GEMINI_API_KEY environment variable
python main.py
```
*The API will run on `http://127.0.0.1:8000`*

### 2. Frontend (React/Vite)
```bash
cd frontend
npm install
# Set VITE_API_URL or VITE_API_BASE to http://127.0.0.1:8000/api if running locally
npm run dev
```

## 🔒 Environment Variables
To run this project, you will need to add the following environment variables:
- `GEMINI_API_KEY` (Backend) - Your Google Gemini API Key for threat analysis.
- `VITE_API_BASE` (Frontend) - The URL of your deployed FastAPI backend (e.g., `https://cywar-api.onrender.com/api`).

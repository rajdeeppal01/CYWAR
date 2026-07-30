# CYWAR // Geopolitical Threat & Conflict Predictor

CYWAR is a high-fidelity cyber threat monitoring and prediction platform. It correlates anomalies in cyber warfare traffic with real-time news headlines to forecast physical geopolitical escalation windows.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **Python (v3.10+)** installed on your system.

### 2. Run the Backend Simulator
The Python backend simulates the packet capture pipeline, calculates statistical Z-score volumes, and triggers Gemini LLM assessments for cyber-surges.

```bash
# Navigate to the backend directory
cd backend

# (Optional) Activate the virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies (already completed in workspace)
pip install -r requirements.txt

# (Optional) Set your Gemini API key for real-time geopolitical briefings
# Windows (PowerShell):
$env:GEMINI_API_KEY="your_api_key_here"
# macOS/Linux:
export GEMINI_API_KEY="your_api_key_here"

# Start the FastAPI server
python main.py
```
The server will run on [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 3. Run the Frontend Dashboard
The React interface displays the live packet flows, threat metrics, and predictions.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (already completed in workspace)
npm install

# Start the Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack & Architecture

* **UI Dashboard:** React, Vite, and custom Vanilla CSS styled with dark glassmorphism and animated SVG mapping.
* **Map Engine:** High-performance, reactive custom SVG mapping with animated Bezier curves for 60fps packet animations. Zero external map server dependencies.
* **Backend API:** FastAPI, running a Server-Sent Events (SSE) server for real-time threat feed broadcasting.
* **Analytical Reasoning Engine:** Integrated with Google Gemini API to translate mathematical cyber spikes into context-aware geopolitical briefs. Falls back to a local ruleset if offline.

---

## 📦 Push to a New GitHub Repository

To push this project to your personal GitHub account, follow these commands:

1. Create a **new empty repository** on GitHub (do not initialize with README or .gitignore).
2. Open your terminal in the `CYWAR` root folder and run:

```bash
# Add all files to stage
git add .

# Create initial commit
git commit -m "feat: initial release of CYWAR defcon forecast platform"

# Rename default branch to main
git branch -M main

# Link your personal GitHub repo url (Replace URL below)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to your new repository
git push -u origin main
```

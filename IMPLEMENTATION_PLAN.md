# Method of Procedure (MOP) & Implementation Plan: CYWAR

CYWAR is a geopolitical conflict predictor that analyzes cyberattack anomalies and news sentiment. This document details the step-by-step implementation for the project workspace.

---

## System Architecture

```
+--------------------+      +--------------------+
|  Cyber Threat Data |      |   GDELT News API   |
+---------+----------+      +---------+----------+
          |                           |
          v                           v
+---------+----------+      +---------+----------+
| Attacker IP -> APT |      | NLP Sentiment &    |
| Source Country Map |      | Bilateral Tension  |
+---------+----------+      +---------+----------+
          |                           |
          +-------------+-------------+
                        |
                        v
          +-------------+-------------+
          | Time-Series Feature Engine|
          |  - Cyber Anomaly (Z-Score)|
          |  - Port Targeting Shift   |
          |  - Sentiment Drop Rate    |
          +-------------+-------------+
                        |
                        v
          +-------------+-------------+
          | XGBoost/LSTM Prediction   |
          |          Model            |
          +-------------+-------------+
                        |
                        v
          +-------------+-------------+
          | Conflict Risk Score (0-100|
          +---------------------------+
```

### Tech Stack
1. **Frontend:** React + Vite + Vanilla CSS (Custom Glassmorphism and Animations)
2. **Backend:** Python FastAPI (Uvicorn)
3. **Simulation:** Python-based cyber scan generator, news sentiment generator, and LLM-agent reasoning pipeline (using Gemini API).

---

## Directory Layout
```
CYWAR/
├── README.md               # User manual and quickstart guide
├── ARCHITECTURE.md         # Extended architecture writeup
├── .gitignore              # Standard git exclusion lists
├── backend/
│   ├── main.py             # FastAPI entrypoint and SSE broadcast
│   ├── simulator.py        # Cyber attack/news simulation engine
│   ├── reasoning_engine.py # LLM geopolitical analysis agent
│   └── requirements.txt    # Python requirements
└── frontend/               # Vite React App
    ├── index.html          # Entry HTML
    ├── package.json        # Node requirements
    ├── vite.config.js      # Vite compilation configurations
    └── src/
        ├── App.jsx         # App container and state controller
        ├── index.css       # Custom glassmorphic styling system
        └── components/
            ├── ThreatMap.jsx     # High-fidelity SVG map showing live cyber-arcs
            ├── ForecastPanel.jsx # AI prediction and analysis container
            └── ThreatStream.jsx  # Live scrolling CLI log stream
```

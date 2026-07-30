# CYWAR Architecture Specification

CYWAR combines cyber-threat intelligence (CTI) with real-time news analytics to predict kinetic geopolitical conflict hotspots. This document describes the data flow, algorithms, and models powering the system.

## 1. Data Flow

```
[Cyber Threat Feeds]  --> (Ingestion / Redis Buffer)
                                  |
                                  v
[GDELT News Stream]   --> [Time-Series Engine] --> [Anomaly Detector]
                                                        |
                                                        v (Alert Triggered)
[Gemini LLM Agent]   <-- [Context Builder] <------------+
        |
        v
[Risk Forecast Output] --> [WebSockets / SSE] --> [React Map UI]
```

## 2. Technical Stack and Choice Rationale

### A. Backend Ingestion & Processing
* **FastAPI:** Used for its speed, support for asynchronous operations, and clean SSE (Server-Sent Events) streaming.
* **Uvicorn:** Fast ASGI server.
* **Google Gemini API:** Leveraged for structured geopolitical assessment of cyber anomalies, as raw numbers do not capture political context.

### B. Machine Learning & Forecasting
* **Statistical Anomaly Detection (Z-Score & Isolation Forest):** Scans country-to-country cyber packet frequencies. Spikes in scan frequencies on critical operational technology (OT) ports (e.g., Modbus, DNP3) trigger an anomaly.
* **LLM Geopolitical Agent:** Evaluates the anomaly against news headlines to produce a descriptive narrative and forecast index.

### C. Frontend Dashboard
* **React + Vite:** For lightweight, hot-reloading rendering.
* **SVG Interactive War Map:** Custom vector world map displaying pulsing threat sources and animated Bezier arc trajectories. No external tilesets (like Mapbox) are required, ensuring offline capability.
* **Glassmorphism CSS:** Dark-themed cyberpunk terminal design to mimic military command center consoles.

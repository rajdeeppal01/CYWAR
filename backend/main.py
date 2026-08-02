import json
import random
import asyncio
from datetime import datetime
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from simulator import CYWARSimulator, COUNTRIES, SCENARIOS
from reasoning_engine import CYWARReasoner

app = FastAPI(title="CYWAR - Geopolitical Prediction System API")

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

simulator = CYWARSimulator()
reasoner = CYWARReasoner()

@app.get("/api/config")
async def get_config():
    return {
        "countries": COUNTRIES,
        "scenarios": {
            k: {
                "name": v["name"],
                "description": v["description"]
            } for k, v in SCENARIOS.items()
        }
    }

@app.post("/api/scenario")
async def update_scenario(request: Request):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    scenario = body.get("scenario")
    if not scenario:
        raise HTTPException(status_code=400, detail="Missing scenario field")
        
    success = simulator.set_scenario(scenario)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid scenario ID")
    
    # Run immediate re-analysis on scenario change
    metrics = simulator.get_anomaly_metrics()
    recent = list(simulator.attack_history)
    analysis = reasoner.analyze(scenario, metrics, recent)
    
    return {
        "status": "success", 
        "current_scenario": scenario, 
        "analysis": analysis,
        "articles": simulator.live_articles[:5]
    }

@app.get("/api/status")
async def get_status():
    import time
    # Force GDELT feed refresh if it is older than 10 seconds
    if time.time() - simulator.last_gdelt_fetch_time > 10:
        simulator.fetch_gdelt_feed()
        
    metrics = simulator.get_anomaly_metrics()
    recent = list(simulator.attack_history)
    analysis = reasoner.analyze(simulator.current_scenario, metrics, recent)
    return {
        "scenario": simulator.current_scenario,
        "metrics": metrics,
        "analysis": analysis,
        "articles": simulator.live_articles[:5]
    }

class LogIngest(BaseModel):
    src: str
    dest: str
    port: int
    severity: str
    type: str

@app.post("/api/ingest")
async def ingest_log(log: LogIngest):
    if simulator.current_scenario != "enterprise":
        raise HTTPException(status_code=400, detail="Backend must be in Enterprise scenario mode to accept logs.")
    
    event = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "src": log.src,
        "dest": log.dest,
        "src_name": COUNTRIES.get(log.src, log.src),
        "dest_name": COUNTRIES.get(log.dest, log.dest),
        "port": log.port,
        "severity": log.severity,
        "type": log.type
    }
    simulator.ingestion_queue.append(event)
    return {"status": "success", "message": "Log ingested"}

async def event_generator():
    """Generates real-time packet flows and periodic AI forecasts"""
    last_analysis_time = 0
    cached_analysis = None
    
    while True:
        try:
            # 1. Generate live cyber threat packet
            event = simulator.generate_event()
            
            # 2. Every 5 seconds, perform full analysis to update forecast stats
            current_time = asyncio.get_event_loop().time()
            if current_time - last_analysis_time >= 5.0 or cached_analysis is None:
                metrics = simulator.get_anomaly_metrics()
                recent = list(simulator.attack_history)
                # Run the reasoning engine
                cached_analysis = reasoner.analyze(simulator.current_scenario, metrics, recent)
                last_analysis_time = current_time
                
                # Combine metrics and AI reasoning into a consolidated state update
                state_update = {
                    "type": "forecast_update",
                    "metrics": metrics,
                    "analysis": cached_analysis,
                    "articles": simulator.live_articles[:5]
                }
                yield f"data: {json.dumps(state_update)}\n\n"
            
            # Send the individual attack packet event to draw on the map
            if event:
                packet_update = {
                    "type": "attack_packet",
                    "data": event
                }
                yield f"data: {json.dumps(packet_update)}\n\n"
            
            # Random delay between 0.3s and 1.2s to simulate real-time packet flows
            await asyncio.sleep(random.uniform(0.3, 1.2))
            
        except asyncio.CancelledError:
            print("[SSE CONNECTION] Client disconnected")
            break
        except Exception as e:
            print(f"[SSE ERROR] Generator encountered error: {e}")
            await asyncio.sleep(1.0)

@app.get("/api/stream")
async def stream_threats():
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0" if os.environ.get("RENDER") else "127.0.0.1"
    uvicorn.run("main:app", host=host, port=port, reload=False if os.environ.get("RENDER") else True)

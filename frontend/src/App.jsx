import React, { useState, useEffect, useRef } from 'react';
import ThreatMap from './components/ThreatMap';
import ForecastPanel from './components/ForecastPanel';
import ThreatStream from './components/ThreatStream';
import AIBriefing from './components/AIBriefing';
import ThreatAnalytics from './components/ThreatAnalytics';
import { Shield, Radio, Terminal, Cpu } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

export default function App() {
  const [activeScenario, setActiveScenario] = useState('standard');
  const [packets, setPackets] = useState([]);
  const [metrics, setMetrics] = useState({
    scenario_name: "Standard Background Noise",
    scenario_desc: "Routine automated global scanning.",
    z_score: 0.8,
    anomaly_detected: false,
    news_headline: "Global threat landscape within baseline margins.",
    sentiment_score: 0.05,
    risk_score: 12
  });
  const [analysis, setAnalysis] = useState({
    summary: "Awaiting backend connection to begin geopolitical briefing streams...",
    primary_actors: ["Unknown"],
    critical_sectors: ["None"],
    tactical_assessment: "Establish backend connection to synchronize firewall metrics."
  });
  
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  
  const eventSourceRef = useRef(null);
  const mockIntervalRef = useRef(null);

  // Synchronize with API status on startup
  useEffect(() => {
    fetchStatus();
    connectSSE();
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
      }
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (res.ok) {
        const data = await res.json();
        setActiveScenario(data.scenario);
        setMetrics(data.metrics);
        setAnalysis(data.analysis);
        setIsBackendConnected(true);
        stopLocalSimulation();
      } else {
        startLocalSimulation();
      }
    } catch (e) {
      console.warn("Backend server not running. Initiating standalone simulation.");
      startLocalSimulation();
    }
  };

  const startLocalSimulation = () => {
    if (mockIntervalRef.current) return;
    
    // Sync initial metrics offline
    mockLocalScenario(activeScenario);

    // Periodically push random threat traffic packets
    mockIntervalRef.current = setInterval(() => {
      const activeNodes = ['US', 'GB', 'DE', 'PL', 'UA', 'RU', 'IL', 'IR', 'CN', 'TW', 'VN', 'PH', 'KP', 'KR', 'IN', 'CA', 'GL', 'BR', 'AF', 'MG', 'NZ'];
      const src = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      let dest = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      while (dest === src) {
        dest = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      }

      const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const severity = severities[Math.floor(Math.random() * severities.length)];

      const ports = [22, 443, 80, 8080, 4840, 102];
      const port = ports[Math.floor(Math.random() * ports.length)];

      const types = [
        "Automated SCADA scan probe", 
        "DDoS volumetric flood stream", 
        "Encrypted command-and-control beacon", 
        "Database SQL injection attempt", 
        "Directory traversal exploit check"
      ];
      const type = types[Math.floor(Math.random() * types.length)];
      const timestamp = new Date().toLocaleTimeString();

      const mockPacket = {
        timestamp,
        src,
        src_name: src,
        dest,
        dest_name: dest,
        port,
        type,
        severity
      };

      setPackets(prev => {
        const next = [...prev, mockPacket];
        return next.slice(-150);
      });
    }, 1000);
  };

  const stopLocalSimulation = () => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  };

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`${API_BASE}/stream`);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsBackendConnected(true);
      stopLocalSimulation();
    };

    es.onerror = () => {
      setIsBackendConnected(false);
      es.close();
      startLocalSimulation();
      // Retry connection in 5 seconds
      setTimeout(connectSSE, 5000);
    };

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'attack_packet') {
          setPackets((prev) => {
            const next = [...prev, payload.data];
            // Keep log stream capped at 150 items to optimize DOM performance
            return next.slice(-150);
          });
        } else if (payload.type === 'forecast_update') {
          setMetrics(payload.metrics);
          setAnalysis(payload.analysis);
        }
      } catch (err) {
        console.error("Error processing SSE message:", err);
      }
    };
  };

  const handleScenarioChange = async (scenarioId) => {
    setIsLoading(true);
    // Clear old packets to visualize the new scenario clean
    setPackets([]);
    try {
      const res = await fetch(`${API_BASE}/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioId })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveScenario(data.current_scenario);
        setAnalysis(data.analysis);
        // Force refresh state metrics
        fetchStatus();
      }
    } catch (err) {
      console.error("Failed to update scenario on backend:", err);
      // Local fallback simulation if server is offline
      setActiveScenario(scenarioId);
      mockLocalScenario(scenarioId);
    } finally {
      setIsLoading(false);
    }
  };

  const mockLocalScenario = (scenarioId) => {
    const isStandard = scenarioId === 'standard';
    const risk = isStandard ? 12 : scenarioId === 'eastern_europe' ? 88 : scenarioId === 'south_china_sea' ? 62 : 92;
    setMetrics({
      scenario_name: scenarioId.replace('_', ' ').toUpperCase(),
      scenario_desc: isStandard ? "Baseline telemetry levels stable." : `Elevated risk warning in ${scenarioId.replace('_', ' ').toUpperCase()} sector.`,
      z_score: isStandard ? 0.7 : 3.8,
      anomaly_detected: !isStandard,
      news_headline: isStandard 
        ? "Global threat landscape within baseline margins."
        : scenarioId === 'eastern_europe' 
        ? "State-sponsored cyber hostilities reported on energy routers across Eastern Europe borders."
        : scenarioId === 'south_china_sea'
        ? "Maritime satellite links compromised in contested South China Sea waters."
        : "Critical database perimeter intrusion reported at naval operations command server.",
      sentiment_score: isStandard ? 0.05 : -0.75,
      risk_score: risk
    });
    setAnalysis({
      summary: isStandard 
        ? "Operational environment remains clear. Dynamic telemetry scans report zero targeted anomalies. Threat detectors continue monitoring ingress firewall zones."
        : scenarioId === 'eastern_europe'
        ? "Eastern Europe sector indicates active APT campaigns targeting state infrastructure grid perimeters. Advanced DDoS vectors and SCADA scanning anomalies observed routing through active state nodes."
        : scenarioId === 'south_china_sea'
        ? "Contested maritime operations report heavy telecommunication port probes. Dynamic proxy routers detected routing encrypted command-and-control streams."
        : "Levant infrastructure threat assessment reports targeted database intrusions and SQL queries probing command perimeters.",
      primary_actors: isStandard ? ["Generic Scanners"] : scenarioId === 'eastern_europe' ? ["Sandworm (APT44)", "APT28 (Fancy Bear)"] : scenarioId === 'south_china_sea' ? ["Volt Typhoon", "APT41"] : ["MuddyWater (APT33)", "UNC2589"],
      critical_sectors: isStandard ? ["None"] : scenarioId === 'eastern_europe' ? ["Power Grids", "Logistics Control"] : scenarioId === 'south_china_sea' ? ["Maritime SATCOM", "Routing Nodes"] : ["Water Distribution", "Tactical Mainframes"],
      tactical_assessment: isStandard ? "Maintain standard firewalls." : "Initiate immediate honeynet logging, segment SCADA ports 4840, and blackhole hostile transit nodes."
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#06070d]">
      {/* Aurora glowing background spheres */}
      <div className="aurora-sphere sphere-1"></div>
      <div className="aurora-sphere sphere-2"></div>
      <div className="aurora-sphere sphere-3"></div>

      <div className="cyber-container">
        {/* 1. FIXED TOP HEADER BAR */}
        <header className="cyber-header">
          <div className="flex items-center gap-sm">
            <span 
              onClick={() => {
                handleScenarioChange('standard');
                setSelectedCountry(null);
              }}
              className="cursor-pointer hover:text-[var(--neon-cyan)] transition-all duration-200"
              style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-white)', letterSpacing: '-0.02em' }}
            >
              CYWAR
            </span>
            <span 
              style={{ 
                fontSize: '0.7rem', 
                fontWeight: 600, 
                color: 'var(--text-muted)', 
                border: '1px solid var(--border-slate)',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-dark)',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Command Node v1.0
            </span>
          </div>
          
          {/* Systems metrics formatted as clean rectangular status badges */}
          <div className="flex items-center gap-sm">
            
            {/* Node status indicator */}
            <div className="status-badge">
              <span 
                className="dot animate-pulse" 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: isBackendConnected ? 'var(--neon-cyan)' : 'var(--neon-red)',
                  display: 'inline-block'
                }}
              ></span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Status:</span>
              <span style={{ color: 'var(--text-bright)', fontWeight: 700 }}>
                {isBackendConnected ? "ONLINE_STREAM" : "OFFLINE_SIM"}
              </span>
            </div>

            {/* Database indicator */}
            <div className="status-badge hidden md:flex">
              <span 
                className="dot" 
                style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--text-dark)',
                  display: 'inline-block'
                }}
              ></span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Database:</span>
              <span style={{ color: 'var(--text-bright)', fontWeight: 700 }}>TimescaleDB</span>
            </div>

          </div>
        </header>

        {/* 2. DASHBOARD GRID */}
        <div className="cyber-grid-container">
          
          {/* LEFT SIDE: Map + Live logs + AI Briefing */}
          <div className="col-span-8 flex flex-col gap-lg h-full overflow-y-auto pad-right-sm custom-scrollbar">
            <div style={{ height: '410px', flexShrink: 0 }}>
              <ThreatMap 
                packets={packets} 
                metrics={metrics}
                selectedCountry={selectedCountry} 
                onSelectCountry={setSelectedCountry} 
              />
            </div>
            <div style={{ height: '220px', flexShrink: 0 }}>
              <ThreatStream 
                packets={packets} 
                filterCountry={selectedCountry} 
              />
            </div>
            <div style={{ flexShrink: 0 }}>
              <AIBriefing 
                metrics={metrics}
                analysis={analysis}
                selectedCountry={selectedCountry}
                packets={packets}
              />
            </div>
          </div>

          {/* RIGHT SIDE: Anomaly prediction selectors & Analytics */}
          <div className="col-span-4 flex flex-col gap-lg h-full overflow-y-auto pad-right-sm custom-scrollbar">
            <div style={{ flexShrink: 0 }}>
              <ForecastPanel 
                metrics={metrics}
                selectedCountry={selectedCountry}
                analysis={analysis}
                activeScenario={activeScenario}
                onScenarioChange={handleScenarioChange}
                isLoading={isLoading}
              />
            </div>
            <div style={{ flexShrink: 0 }}>
              <ThreatAnalytics packets={packets} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

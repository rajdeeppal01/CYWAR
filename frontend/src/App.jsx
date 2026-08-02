import React, { useState, useEffect, useRef } from 'react';
import ThreatMap from './components/ThreatMap';
import ForecastPanel from './components/ForecastPanel';
import ThreatStream from './components/ThreatStream';
import AIBriefing from './components/AIBriefing';
import ThreatAnalytics from './components/ThreatAnalytics';
import ThreatNews from './components/ThreatNews';
import DrillDownPanel from './components/DrillDownPanel';
import TimelineSlider from './components/TimelineSlider';
import { Shield, Radio, Terminal, Cpu, Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from './utils/audioEngine';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

const FALLBACK_COUNTRIES = {
  "US": "United States", "RU": "Russia", "CN": "China", "UA": "Ukraine", "IL": "Israel", 
  "IR": "Iran", "AU": "Australia", "CA": "Canada", "GL": "Greenland", "BR": "Brazil", 
  "AF": "South Africa", "MG": "Madagascar", "NZ": "New Zealand", "DE": "Germany", 
  "GB": "United Kingdom", "PL": "Poland", "JP": "Japan", "VN": "Vietnam", "PH": "Philippines",
  "KP": "North Korea", "KR": "South Korea"
};

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
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [articles, setArticles] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackCursor, setPlaybackCursor] = useState(null);
  
  const eventSourceRef = useRef(null);
  const mockIntervalRef = useRef(null);
  const sseReconnectDelayRef = useRef(2000);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/config`);
      if (res.ok) {
        const data = await res.json();
        if (data.countries) {
          setCountries(data.countries);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch backend configuration. Operating in standalone fallback mode.");
    }
  };

  // Synchronize with API status and config on startup
  useEffect(() => {
    fetchConfig();
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
        if (data.articles) {
          setArticles(data.articles);
        }
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
      sseReconnectDelayRef.current = 2000; // Reset delay on successful connection
    };

    es.onerror = () => {
      setIsBackendConnected(false);
      es.close();
      startLocalSimulation();
      
      const currentDelay = sseReconnectDelayRef.current;
      console.warn(`SSE connection failed. Retrying in ${currentDelay / 1000}s...`);
      setTimeout(connectSSE, currentDelay);
      
      // Exponential backoff capped at 30 seconds
      sseReconnectDelayRef.current = Math.min(currentDelay * 2, 30000);
    };

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'attack_packet') {
          audioEngine.playPacketSound(payload.data.severity);
          setPackets((prev) => {
            const next = [...prev, payload.data];
            // Keep log stream capped at 500 items for historical playback buffer
            return next.slice(-500);
          });
        } else if (payload.type === 'forecast_update') {
          audioEngine.setAmbientIntensity(Math.min(payload.metrics.z_score / 4.0, 1.0));
          setMetrics(payload.metrics);
          setAnalysis(payload.analysis);
          if (payload.articles) {
            setArticles(payload.articles);
          }
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
        if (data.articles) {
          setArticles(data.articles);
        }
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

    const localMocks = {
      standard: [
        {title: "Global cyber telemetry reports low-intensity baseline scanning across corporate networks.", source: "Cyber Sentinel Feed", url: "https://news.google.com/search?q=corporate+network+cyberattack+breach"},
        {title: "Security analysts identify new automated botnet targeting vulnerable IoT routers.", source: "Infosec Wire", url: "https://news.google.com/search?q=IoT+botnet+router+malware+cyberattack"},
        {title: "Ransomware groups target corporate software supply chains with phishing campaigns.", source: "Threat Ledger", url: "https://news.google.com/search?q=software+supply+chain+ransomware+phishing"},
        {title: "Global cloud hosting providers implement updated volumetric DDoS defenses.", source: "NetSec Global", url: "https://news.google.com/search?q=cloud+hosting+DDoS+attack"},
        {title: "Threat intelligence networks report routine port scanning on enterprise gateway firewalls.", source: "Security Brief", url: "https://news.google.com/search?q=enterprise+firewall+cyberattack+port+scanning"}
      ],
      eastern_europe: [
        {title: "Cybersecurity alerts issued as critical energy routers in Ukraine report wiper malware probes.", source: "Kiev Intel Dispatch", url: "https://news.google.com/search?q=Ukraine+energy+cyberattack+wiper+malware"},
        {title: "Security agencies warn of advanced phishing vectors targeting logistic nodes in Poland.", source: "Warsaw Security Journal", url: "https://news.google.com/search?q=Poland+logistics+cyberattack+phishing"},
        {title: "State-backed threat groups coordinate volumetric DDoS floods against Baltic defense mainframes.", source: "EuroDef Observer", url: "https://news.google.com/search?q=Baltic+states+DDoS+cyberattack"},
        {title: "Energy grids in Eastern Europe configure OT ports to counter malicious firmware scans.", source: "GridSec Weekly", url: "https://news.google.com/search?q=Eastern+Europe+energy+grid+cyberattack+OT"},
        {title: "Defense officials track massive coordinated reconnaissance campaigns on tactical servers.", source: "Tactical Intel", url: "https://news.google.com/search?q=military+tactical+server+cyberattack+reconnaissance"}
      ],
      south_china_sea: [
        {title: "Maritime logistics hubs in the Philippines report automated SCADA scans on routing perimeters.", source: "Manila Tech Gazette", url: "https://news.google.com/search?q=Philippines+maritime+SCADA+cyberattack"},
        {title: "Naval command servers identify beacon attempts communicating with contested IP blocks.", source: "Maritime Signal", url: "https://news.google.com/search?q=naval+command+cyberattack"},
        {title: "Port authorities in South China Sea detect critical satellite link intrusions.", source: "Pacific Threat Map", url: "https://news.google.com/search?q=South+China+Sea+cyberattack+satellite"},
        {title: "Geopolitical tensions increase as deep-sea telemetry networks observe coordinated port sweeps.", source: "Aviation & Ocean Intel", url: "https://news.google.com/search?q=deep+sea+cable+cyberattack"},
        {title: "Military communications grids enhance logging to segment persistent cyber probes.", source: "Defense Perimeter Daily", url: "https://news.google.com/search?q=military+communications+cyberattack"}
      ],
      middle_east: [
        {title: "Water command systems in Israel detect volumetric port floods originating from proxy nodes.", source: "Tel Aviv Cyber News", url: "https://news.google.com/search?q=Israel+water+infrastructure+cyberattack"},
        {title: "Petrochemical mainframes in Iran experience automatic emergency failsafes after port sweeps.", source: "Tehran Technology Review", url: "https://news.google.com/search?q=Iran+petrochemical+cyberattack"},
        {title: "Regional cyber alert issued over database perimeter intrusions in Levant region.", source: "Levant Threat Desk", url: "https://news.google.com/search?q=Middle+East+database+cyberattack"},
        {title: "Tactical mainframes filter targeted SQL commands on critical defense servers.", source: "Military NetSec", url: "https://news.google.com/search?q=military+defense+server+cyberattack+SQL"},
        {title: "Geopolitical threat intelligence teams warn of retaliatory wiper activity in the region.", source: "Mideast Analyst Group", url: "https://news.google.com/search?q=Middle+East+wiper+malware+cyberattack"}
      ]
    };
    setArticles(localMocks[scenarioId] || localMocks.standard);
  };

  const visiblePackets = playbackCursor === null ? packets : packets.slice(0, Math.max(1, playbackCursor + 1));

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

            {/* Audio Toggle */}
            <button 
              onClick={() => setIsMuted(audioEngine.toggleMute())}
              className="ml-2 pad-xs rounded text-slate-400 hover:text-[var(--neon-cyan)] transition-colors border border-transparent hover:border-white-trans-10"
              title="Toggle Audio"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

          </div>
        </header>

        {/* 2. DASHBOARD GRID */}
        <div className="cyber-grid-container">
          
          {/* LEFT SIDE: Map + Live logs + AI Briefing */}
          <div className="col-span-8 flex flex-col justify-start gap-lg h-full overflow-y-auto pad-right-sm custom-scrollbar relative">
            <div style={{ height: '410px', flexShrink: 0 }}>
              <ThreatMap 
                packets={visiblePackets} 
                metrics={metrics}
                selectedCountry={selectedCountry} 
                onSelectCountry={setSelectedCountry} 
              />
            </div>
            <div style={{ height: '220px', flexShrink: 0 }}>
              <ThreatStream 
                packets={visiblePackets} 
                filterCountry={selectedCountry} 
              />
            </div>
            <div style={{ flexShrink: 0 }}>
              <AIBriefing 
                metrics={metrics}
                analysis={analysis}
                selectedCountry={selectedCountry}
              />
            </div>
          </div>

          {/* RIGHT SIDE: Anomaly prediction selectors & Analytics */}
          <div className="col-span-4 flex flex-col justify-start gap-lg h-full overflow-y-auto pad-right-sm custom-scrollbar">
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
              <ThreatAnalytics packets={visiblePackets} countries={countries} />
            </div>
            <div style={{ flexShrink: 0 }}>
              <ThreatNews articles={articles} activeScenario={activeScenario} />
            </div>
          </div>

        </div>

        {/* Drill Down Overlay Panel */}
        <DrillDownPanel 
          countryCode={selectedCountry}
          countryName={countries[selectedCountry] || selectedCountry}
          packets={visiblePackets}
          onClose={() => setSelectedCountry(null)}
        />

        {/* Timeline Slider Overlay */}
        <TimelineSlider 
          packets={packets} 
          playbackCursor={playbackCursor} 
          setPlaybackCursor={setPlaybackCursor} 
        />
      </div>
    </div>
  );
}

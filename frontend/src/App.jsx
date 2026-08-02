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
  const [dynamicScenarios, setDynamicScenarios] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackCursor, setPlaybackCursor] = useState(null);
  
  const eventSourceRef = useRef(null);
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
        if (data.dynamic_scenarios) {
          setDynamicScenarios(data.dynamic_scenarios);
        }
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }
    } catch (e) {
      console.warn("Backend server not running. Operating in offline mode.");
      setIsBackendConnected(false);
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
      sseReconnectDelayRef.current = 2000; // Reset delay on successful connection
    };

    es.onerror = () => {
      setIsBackendConnected(false);
      es.close();
      
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
      setActiveScenario(scenarioId);
    } finally {
      setIsLoading(false);
    }
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
              className="ml-2 pad-xs rounded text-slate-400 bg-transparent hover:text-[var(--neon-cyan)] transition-colors border border-transparent hover:border-white-trans-10"
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
                dynamicScenarios={dynamicScenarios}
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

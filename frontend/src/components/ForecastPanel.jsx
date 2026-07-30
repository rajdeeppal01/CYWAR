import React from 'react';
import { Shield, AlertTriangle, Cpu, Globe, Activity, Eye } from 'lucide-react';

const SCENARIOS = [
  { id: 'standard', name: 'Background Noise', icon: Activity },
  { id: 'eastern_europe', name: 'Eastern Europe', icon: Shield },
  { id: 'south_china_sea', name: 'South China Sea', icon: Globe },
  { id: 'middle_east', name: 'Middle East', icon: AlertTriangle }
];

export default function ForecastPanel({ metrics, selectedCountry, analysis, activeScenario, onScenarioChange, isLoading }) {
  
  // Compute display metrics based on selected country
  const displayMetrics = React.useMemo(() => {
    if (!selectedCountry) return metrics;

    const hotspots = {
      "eastern_europe": ["RU", "UA", "PL"],
      "south_china_sea": ["CN", "PH", "VN", "US"],
      "middle_east": ["IR", "IL", "US"]
    };
    
    const activeHotspots = hotspots[activeScenario] || [];
    if (activeHotspots.includes(selectedCountry)) {
      // Hotspots inherit the scenario's active cyber warfare spikes
      return metrics;
    }

    // Baseline definitions for non-hotspot countries
    const baselineScores = {
      "US": { z: 1.1, tension: 0.1, index: 32 },
      "RU": { z: 2.1, tension: -0.4, index: 55 },
      "CN": { z: 1.9, tension: -0.3, index: 48 },
      "UA": { z: 1.8, tension: -0.2, index: 40 },
      "IL": { z: 1.7, tension: -0.3, index: 45 },
      "IR": { z: 2.0, tension: -0.4, index: 52 },
      "AU": { z: 0.5, tension: 0.8, index: 12 },
      "CA": { z: 0.4, tension: 0.85, index: 8 },
      "GL": { z: 0.2, tension: 0.9, index: 5 },
      "BR": { z: 0.7, tension: 0.6, index: 18 },
      "AF": { z: 0.8, tension: 0.5, index: 22 },
      "MG": { z: 0.3, tension: 0.8, index: 10 },
      "NZ": { z: 0.3, tension: 0.9, index: 6 },
      "DE": { z: 0.6, tension: 0.75, index: 15 },
      "GB": { z: 0.8, tension: 0.7, index: 20 },
      "PL": { z: 0.9, tension: 0.5, index: 25 },
      "JP": { z: 0.6, tension: 0.75, index: 14 }
    };

    const base = baselineScores[selectedCountry] || { z: 0.5, tension: 0.7, index: 15 };
    const isAnomaly = base.z > 2.0;

    return {
      ...metrics,
      z_score: base.z,
      sentiment_score: base.tension,
      risk_score: base.index,
      anomaly_detected: isAnomaly
    };
  }, [selectedCountry, metrics, activeScenario]);

  const getRiskColor = (score) => {
    if (score < 30) return 'var(--neon-green)';
    if (score < 60) return 'var(--neon-orange)';
    return 'var(--neon-red)';
  };

  const getRiskBadgeClass = (score) => {
    if (score < 30) return 'cyber-badge-green';
    if (score < 60) return 'cyber-badge-orange';
    return 'cyber-badge-red';
  };

  const getRiskLabel = (score) => {
    if (score < 30) return 'LOW RISK';
    if (score < 60) return 'ELEVATED TENSION';
    return 'IMMINENT KINETIC CONFLICT';
  };

  return (
    <div className="flex flex-col gap-lg h-full overflow-hidden">
      
      {/* 1. SCENARIO SELECTOR */}
      <div className="cyber-panel pad-lg flex flex-col gap-xs shrink-0">
        <h3 className="text-small font-extrabold text-slate-400 tracking-wider flex items-center gap-xs font-sans uppercase">
          <Cpu className="w-icon-sm text-[var(--neon-cyan)]" />
          SIMULATION SCENARIOS
        </h3>
        <div className="grid grid-cols-2 gap-sm margin-top-xs">
          {SCENARIOS.map((sc) => {
            const Icon = sc.icon;
            const isActive = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onScenarioChange(sc.id)}
                disabled={isLoading}
                className={`cyber-btn justify-start text-small font-sans pad-y-sm pad-x-sm border transition-all ${
                  isActive
                    ? 'cyber-btn-primary border-transparent'
                    : 'bg-trans-black-20 text-slate-400 border-white-trans-5 hover:bg-white-trans-5 hover:text-slate-300'
                }`}
                style={{ borderRadius: '14px' }}
              >
                <Icon className={`w-icon-sm shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                <span className="truncate">{sc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. RISK FORECAST GAUGE */}
      <div className="cyber-panel pad-lg flex flex-col gap-md relative overflow-hidden shrink-0">
        {isLoading && (
          <div 
            className="absolute inset-0 z-20 flex items-center justify-center font-sans text-xs text-[var(--neon-cyan)]"
            style={{ backgroundColor: 'rgba(6, 7, 13, 0.8)', backdropFilter: 'blur(4px)' }}
          >
            <span className="w-icon-xs rounded-full bg-[var(--neon-cyan)] animate-ping mr-2" style={{ width: '8px', height: '8px' }}></span>
            RE-CALCULATING FORECAST...
          </div>
        )}
        
        <h3 className="text-small font-extrabold text-slate-400 tracking-wider flex items-center gap-xs font-sans uppercase">
          <Eye className="w-icon-sm text-[var(--neon-red)]" />
          CONFLICT PREDICTION MATRIX
        </h3>
        
        {/* Risk Score Circle */}
        <div className="flex flex-col items-center justify-center pad-y-xs">
          <div 
            className="risk-circle flex flex-col items-center justify-center transition-all duration-500 bg-trans-black-30"
            style={{ 
              borderColor: getRiskColor(displayMetrics.risk_score), 
              boxShadow: `0 0 20px ${getRiskColor(displayMetrics.risk_score)}20`,
            }}
          >
            <span className="text-large-val font-extrabold font-sans tracking-tight" style={{ color: getRiskColor(displayMetrics.risk_score) }}>
              {displayMetrics.risk_score}%
            </span>
            <span className="text-tiny font-mono text-slate-500 font-bold margin-top-xs tracking-wider uppercase">CONFLICT INDEX</span>
          </div>
          <span 
            className={`cyber-badge ${getRiskBadgeClass(displayMetrics.risk_score)} margin-top-lg text-xs pad-x-sm pad-y-xs`}
          >
            {getRiskLabel(displayMetrics.risk_score)}
          </span>
        </div>

        {/* Dynamic Metric Sliders */}
        <div 
          className="flex flex-col gap-md font-sans text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}
        >
          {/* Cyber Anomaly Z-Score */}
          <div>
            <div className="flex justify-between text-slate-300 margin-bottom-sm font-mono text-small">
              <span>CYBER ANOMALY (Z-SCORE):</span>
              <span className={displayMetrics.anomaly_detected ? 'text-[var(--neon-red)] font-bold' : 'text-[var(--neon-green)] font-bold'}>
                {displayMetrics.z_score} σ
              </span>
            </div>
            <div 
              className="rounded-full overflow-hidden" 
              style={{ height: '8px', backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${Math.min(100, (displayMetrics.z_score / 5) * 100)}%`,
                  background: displayMetrics.anomaly_detected ? 'var(--neon-red)' : 'var(--neon-green)'
                }}
              ></div>
            </div>
          </div>

          {/* news sentiment */}
          <div>
            <div className="flex justify-between text-slate-300 margin-bottom-sm font-mono text-small">
              <span>DIPLOMATIC TENSION TONE:</span>
              <span style={{ color: displayMetrics.sentiment_score < 0 ? 'var(--neon-red)' : 'var(--neon-green)' }} className="font-bold">
                {displayMetrics.sentiment_score > 0 ? '+' : ''}{displayMetrics.sentiment_score}
              </span>
            </div>
            <div 
              className="rounded-full relative" 
              style={{ height: '8px', backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div 
                className="absolute h-full rounded-full transition-all duration-500" 
                style={{ 
                  left: '50%', 
                  width: `${Math.abs(displayMetrics.sentiment_score) * 50}%`,
                  transform: displayMetrics.sentiment_score < 0 ? 'translateX(-100%)' : 'none',
                  background: displayMetrics.sentiment_score < 0 ? 'var(--neon-red)' : 'var(--neon-green)'
                }}
              ></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-icon-xs h-3.5 bg-slate-500 rounded" style={{ width: '4px' }}></div>
            </div>
            <div className="flex justify-between text-tiny font-mono text-slate-500 margin-top-sm uppercase tracking-wider">
              <span>Hostile / Conflict</span>
              <span>Collaborative / Allied</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

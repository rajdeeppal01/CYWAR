import React, { useMemo, useState } from 'react';

// Exact coordinates for cyber nodes on our 800x400 map grid (geographically matched to detailed coordinates)
export const NODES = {

  "US": { x: 155, y: 145, name: "United States" },
  "GB": { x: 358, y: 98, name: "United Kingdom" },
  "DE": { x: 395, y: 122, name: "Germany" },
  "PL": { x: 418, y: 122, name: "Poland" },
  "UA": { x: 442, y: 126, name: "Ukraine" },
  "RU": { x: 535, y: 100, name: "Russia" },
  "IL": { x: 452, y: 175, name: "Israel" },
  "IR": { x: 485, y: 170, name: "Iran" },
  "CN": { x: 585, y: 150, name: "China" },
  "TW": { x: 635, y: 168, name: "Taiwan" },
  "VN": { x: 622, y: 190, name: "Vietnam" },
  "PH": { x: 652, y: 198, name: "Philippines" },
  "KP": { x: 628, y: 138, name: "North Korea" },
  "KR": { x: 630, y: 144, name: "South Korea" },
  "IN": { x: 518, y: 168, name: "India" },
  "CA": { x: 135, y: 70, name: "Canada" },
  "GL": { x: 232, y: 38, name: "Greenland" },
  "BR": { x: 210, y: 300, name: "Brazil" },
  "AF": { x: 410, y: 260, name: "South Africa" },
  "MG": { x: 448, y: 304, name: "Madagascar" },
  "NZ": { x: 745, y: 352, name: "New Zealand" }
};

// Detailed SVG landmass layers representing individual countries/regions (Flat SaaS Outline)
const COUNTRIES = {
  "US": "M 80,105 L 125,100 L 140,88 L 195,85 L 210,105 L 220,105 L 210,140 L 218,185 L 200,185 L 185,170 L 185,200 L 175,230 L 165,245 L 155,245 L 155,220 L 140,195 L 130,195 L 125,175 L 100,150 L 90,120 L 75,105 Z",
  "CA": "M 80,70 L 90,60 L 120,50 L 150,55 L 165,65 L 195,50 L 210,70 L 220,105 L 195,85 L 140,88 L 125,100 L 80,105 L 75,105 L 60,110 L 50,90 L 65,80 Z",
  "GL": "M 210,35 L 235,25 L 255,28 L 245,55 L 220,50 Z",
  "BR": "M 175,248 L 188,242 L 200,248 L 222,258 L 235,270 L 232,295 L 220,320 L 205,355 L 195,385 L 190,388 L 188,375 L 180,340 L 174,310 L 166,285 L 166,268 L 170,256 Z",
  "AF": "M 365,190 L 385,188 L 410,192 L 420,185 L 425,195 L 435,212 L 450,225 L 448,255 L 440,285 L 430,315 L 422,345 L 415,355 L 410,355 L 405,340 L 395,310 L 385,280 L 372,258 L 350,245 L 340,225 L 342,208 L 355,198 Z",
  "MG": "M 442,295 L 448,290 L 455,305 L 448,318 L 442,310 Z",
  "RU": "M 425,75 L 450,72 L 500,75 L 550,75 L 600,78 L 650,85 L 685,90 L 688,98 L 672,112 L 650,118 L 640,115 L 625,110 L 600,108 L 580,105 L 550,105 L 500,108 L 475,110 L 450,110 L 425,112 Z",
  "CN": "M 528,160 L 548,175 L 562,192 L 570,180 L 582,195 L 582,175 L 590,165 L 605,170 L 615,160 L 625,148 L 628,138 L 615,135 L 590,135 L 570,128 L 550,132 Z",
  "IN": "M 505,160 L 518,175 L 528,175 L 528,160 Z",
  "IR": "M 478,155 L 498,152 L 508,168 L 488,172 L 478,160 Z",
  "IL": "M 448,165 L 472,165 L 478,155 L 455,150 Z",
  "UA": "M 445,118 L 465,120 L 468,132 L 448,138 L 442,130 Z",
  "PL": "M 415,115 L 435,115 L 440,125 L 420,125 Z",
  "DE": "M 390,115 L 415,115 L 415,125 L 390,125 Z",
  "GB": "M 352,98 L 358,90 L 364,95 L 360,108 L 354,105 Z",
  "JP": "M 638,122 L 644,128 L 648,135 L 642,142 L 635,135 Z",
  "AU": "M 648,285 L 662,275 L 680,270 L 698,280 L 712,282 L 722,298 L 728,322 L 718,335 L 695,340 L 675,340 L 655,328 L 642,310 L 642,295 Z",
  "NZ": "M 738,348 L 745,342 L 752,352 L 744,362 Z",
  "VN": "M 618,175 L 625,178 L 622,192 L 616,185 Z",
  "PH": "M 648,192 L 656,192 L 654,204 L 646,204 Z",
  "KP": "M 625,135 L 630,135 L 630,140 L 625,140 Z",
  "KR": "M 625,140 L 630,140 L 630,145 L 625,145 Z"
};

const SEVERITY_COLORS = {
  "LOW": "#38bdf8",            // Cyber Blue
  "MEDIUM": "var(--neon-orange)",  // Volt Yellow
  "HIGH": "var(--neon-red)",       // Magenta
  "CRITICAL": "var(--neon-cyan)"   // Teal
};

export default function ThreatMap({ packets, metrics, selectedCountry, onSelectCountry }) {
  // Generate curve path between two nodes (quadratic bezier)
  const getCurvePath = (src, dest) => {
    const s = NODES[src];
    const d = NODES[dest];
    if (!s || !d) return "";
    
    const dx = d.x - s.x;
    const dy = d.y - s.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const midX = (s.x + d.x) / 2;
    const midY = Math.min(s.y, d.y) - Math.min(100, dist * 0.4);
    
    return `M ${s.x} ${s.y} Q ${midX} ${midY} ${d.x} ${d.y}`;
  };

  const [selectedEvent, setSelectedEvent] = useState(null);

  const activeHotspots = useMemo(() => {
    if (!metrics || !metrics.anomaly_detected) return [];

    
    if (metrics.scenario_name.includes("Eastern Europe")) {
      return ["RU", "UA", "PL"];
    } else if (metrics.scenario_name.includes("South China Sea")) {
      return ["CN", "PH", "VN", "US"];
    } else if (metrics.scenario_name.includes("Middle East")) {
      return ["IR", "IL", "US"];
    }
    return [];
  }, [metrics]);

  const trafficStats = useMemo(() => {
    if (!packets || packets.length === 0) return { attacker: null, victim: null };
    
    const srcCounts = {};
    const destCounts = {};
    
    packets.forEach(p => {
      srcCounts[p.src] = (srcCounts[p.src] || 0) + 1;
      destCounts[p.dest] = (destCounts[p.dest] || 0) + 1;
    });
    
    const topAttacker = Object.entries(srcCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || null;
    const topVictim = Object.entries(destCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || null;
    
    return { attacker: topAttacker, victim: topVictim };
  }, [packets]);

  return (
    <div className="cyber-panel cyber-grid relative overflow-hidden flex flex-col h-full" style={{ padding: 0 }}>
      {/* Map header */}
      <div className="flex justify-between items-center pad-x-lg pad-y-sm border-b border-white-trans-5 bg-trans-black-35 z-10">
        <div>
          <h2 className="text-small font-extrabold tracking-wider text-slate-200 flex items-center gap-xs font-sans">
            <span className="w-icon-xs rounded-full bg-[var(--neon-cyan)] animate-pulse" style={{ width: '6px', height: '6px' }}></span>
            LIVE GEOPOLITICAL CYBER THREAT INDEX
          </h2>
          <p className="text-caption text-slate-500 font-mono margin-top-xs uppercase tracking-widest">
            Equirectangular Projection // Region Map Grid Overlay V1.1
          </p>
        </div>
        {selectedCountry && (
          <button 
            onClick={() => onSelectCountry(null)}
            className="cyber-btn cyber-btn-secondary text-caption pad-y-xs pad-x-sm"
            style={{ borderRadius: '4px' }}
          >
            Clear Filter: <span className="text-[var(--neon-cyan)] font-bold font-mono ml-1">{selectedCountry}</span>
          </button>
        )}
      </div>

      {/* Main Map SVG Wrapper */}
      <div className="flex-1 relative flex items-center justify-center pad-sm bg-trans-black-10">
        <svg 
          viewBox="0 0 800 400" 
          preserveAspectRatio="xMidYMid meet"
          className="select-none"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            {/* Dot grid pattern */}
            <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.6" fill="rgba(255, 255, 255, 0.03)" />
            </pattern>
            
            {/* Arrowhead markers to show attack direction clearly */}
            <marker 
              id="arrow" 
              viewBox="0 0 10 10" 
              refX="6" 
              refY="5" 
              markerWidth="4" 
              markerHeight="4" 
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 Z" fill="currentColor" />
            </marker>
          </defs>
          
          {/* Dot grid filling background */}
          <rect width="800" height="400" fill="url(#dotGrid)" />

          {/* Countries drawing (Detailed regions with outline and hover transitions) */}
          <g fill="rgba(22, 22, 26, 0.65)" stroke="var(--border-slate)" strokeWidth="0.8">
            {Object.entries(COUNTRIES).map(([code, path]) => {
              const isSelected = selectedCountry === code;
              const isHotspot = activeHotspots.includes(code);
              const isTopAttacker = trafficStats.attacker === code;
              const isTopVictim = trafficStats.victim === code;
              
              let fillVal = "rgba(22, 22, 26, 0.65)";
              let strokeVal = "var(--border-slate)";
              
              if (isSelected) {
                fillVal = "rgba(20, 184, 166, 0.12)";
                strokeVal = "var(--neon-cyan)";
              } else if (isTopAttacker) {
                fillVal = "rgba(239, 68, 68, 0.08)"; // Red tint for source
                strokeVal = "var(--neon-red)";       // Red outline
              } else if (isTopVictim) {
                fillVal = "rgba(251, 191, 36, 0.06)"; // Orange/Yellow tint for target
                strokeVal = "var(--neon-orange)";    // Orange outline
              } else if (isHotspot) {
                fillVal = "rgba(217, 70, 239, 0.03)";
                strokeVal = "rgba(217, 70, 239, 0.35)";
              }

              return (
                <path 
                  key={code} 
                  d={path} 
                  className="country-path"
                  onClick={() => onSelectCountry(isSelected ? null : code)}
                  fill={fillVal}
                  stroke={strokeVal}
                />
              );
            })}
          </g>

          {/* Glowing risk zones (Sleek static indicator circles) */}
          {activeHotspots.map(code => {
            const node = NODES[code];
            if (!node) return null;
            return (
              <g key={`hotspot-${code}`}>
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r="16" 
                  fill="none" 
                  stroke="var(--neon-red)" 
                  strokeWidth="1" 
                  strokeOpacity="0.4"
                />
                <circle 
                  cx={node.x} 
                  cy={node.y} 
                  r="8" 
                  fill="rgba(217, 70, 239, 0.08)" 
                />
              </g>
            );
          })}

          {/* Faint static curved track lines WITH ARROWHEADS */}
          <g>
            {packets.map((pkt, idx) => {
              const path = getCurvePath(pkt.src, pkt.dest);
              if (!path) return null;
              const color = SEVERITY_COLORS[pkt.severity] || "#fff";
              
              return (
                <path 
                  key={`track-${pkt.timestamp}-${idx}`}
                  d={path} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="0.8" 
                  strokeOpacity="0.22"
                  style={{ color: color }}
                  markerEnd="url(#arrow)"
                />
              );
            })}
          </g>

          {/* Running animated packets along curves (Continuous loops for easy flow tracking) */}
          <g>
            {packets.map((pkt, idx) => {
              const path = getCurvePath(pkt.src, pkt.dest);
              if (!path) return null;
              const color = SEVERITY_COLORS[pkt.severity] || "var(--neon-cyan)";
              
              return (
                <path 
                  key={`packet-${pkt.timestamp}-${idx}`}
                  d={path} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="1.8" 
                  strokeDasharray="5, 35" 
                  strokeOpacity="0.8"
                  style={{
                    animation: 'dash 2s linear infinite'
                  }}
                />
              );
            })}
          </g>

          {/* Stylesheet inline for animation paths */}
          <style>{`
            @keyframes dash {
              from {
                stroke-dashoffset: 40;
              }
              to {
                stroke-dashoffset: -40;
              }
            }
          `}</style>

          {/* Node dots */}
          <g>
            {Object.entries(NODES).map(([code, node]) => {
              const isSelected = selectedCountry === code;
              const isHotspot = activeHotspots.includes(code);
              
              let nodeColor = "rgba(113, 113, 122, 0.7)"; // Muted zinc
              let size = 3;
              
              if (isHotspot) {
                nodeColor = "var(--neon-red)";
                size = 5.5;
              } else if (isSelected) {
                nodeColor = "var(--neon-cyan)";
                size = 6;
              }

              return (
                <circle 
                  key={`node-${code}`}
                  cx={node.x} 
                  cy={node.y} 
                  r={size} 
                  fill={nodeColor}
                  className="transition-all duration-300"
                />
              );
            })}
          </g>

          {/* Event Pins for attacks with political context */}
          <g>
            {packets.filter(p => p.political_context).map((pkt, idx) => {
              const node = NODES[pkt.dest];
              if (!node) return null;
              
              const isSelectedEvent = selectedEvent === pkt;
              return (
                <g 
                  key={`event-pin-${pkt.timestamp}-${idx}`} 
                  transform={`translate(${node.x}, ${node.y - 12})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedEvent(isSelectedEvent ? null : pkt)}
                >
                  <circle cx="0" cy="0" r="14" fill="rgba(251, 191, 36, 0.2)" className="animate-ping" />
                  <path d="M0 4 L-5 -4 L0 -12 L5 -4 Z" fill="var(--neon-orange)" />
                  <circle cx="0" cy="-6" r="2" fill="#000" />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Event Pin Context Card Overlay */}
        {selectedEvent && (
          <div className="absolute z-20 bg-trans-black-40 border border-[var(--neon-orange)] pad-md rounded-lg shadow-[0_0_20px_rgba(251,191,36,0.15)]" style={{ top: '20px', right: '20px', width: '320px', backdropFilter: 'blur(8px)' }}>
            <div className="flex justify-between items-center margin-bottom-sm">
              <h3 className="text-small font-sans font-bold text-[var(--neon-orange)] uppercase flex items-center gap-xs">
                <span className="w-icon-xs rounded-full bg-[var(--neon-orange)] animate-pulse" style={{ width: '6px', height: '6px' }}></span>
                Intelligence Context
              </h3>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <div className="font-mono text-tiny text-slate-300 margin-bottom-xs">
              <span className="text-slate-500">ACTOR:</span> {selectedEvent.threat_actor}
            </div>
            <div className="font-mono text-tiny text-slate-300 margin-bottom-xs">
              <span className="text-slate-500">TARGET:</span> {selectedEvent.dest_name} ({selectedEvent.industry})
            </div>
            <div className="font-sans text-xs text-slate-200 margin-top-md" style={{ lineHeight: '1.4' }}>
              {selectedEvent.political_context}
            </div>
          </div>
        )}
      </div>

      {/* Legend & quick info */}
      <div className="pad-x-lg pad-y-sm border-t border-white-trans-5 bg-trans-black-25 flex justify-between items-center text-tiny font-mono text-slate-400 z-10">
        <div className="flex items-center gap-xs">
          <span className="flex items-center gap-xs"><span className="w-icon-xs rounded-full bg-[var(--neon-cyan)]" style={{ width: '6px', height: '6px' }}></span> Teal (Critical)</span>
          <span className="flex items-center gap-xs"><span className="w-icon-xs rounded-full bg-[var(--neon-red)]" style={{ width: '6px', height: '6px' }}></span> Magenta (High)</span>
          <span className="flex items-center gap-xs"><span className="w-icon-xs rounded-full bg-[var(--neon-orange)]" style={{ width: '6px', height: '6px' }}></span> Yellow (Medium)</span>
          <span className="flex items-center gap-xs"><span className="w-icon-xs rounded-full bg-[#38bdf8]" style={{ width: '6px', height: '6px' }}></span> Blue (Low)</span>
        </div>
        <div className="text-tiny uppercase tracking-wider text-slate-500">
          Red Border: Top Attacker | Orange Border: Top Target
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

const ThreatNews = React.memo(function ThreatNews({ articles, activeScenario }) {
  const regionNames = {
    standard: "Global Baselines",
    eastern_europe: "Eastern Europe",
    south_china_sea: "South China Sea",
    middle_east: "Middle East"
  };
  const regionName = regionNames[activeScenario] || activeScenario;

  return (
    <div className="cyber-panel pad-lg flex flex-col gap-md">
      <div className="flex justify-between items-center border-b border-white-trans-5 pad-bottom-sm">
        <h3 className="text-small font-extrabold text-slate-400 tracking-wider flex items-center gap-xs font-sans uppercase">
          <Globe className="w-icon-sm text-[var(--neon-cyan)] animate-pulse" />
          THREAT INTEL FEED: {regionName}
        </h3>
        <span className="flex items-center gap-xs text-tiny font-mono text-[var(--neon-cyan)] font-extrabold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-cyan)] animate-ping"></span>
          LIVE FEED
        </span>
      </div>

      <div className="flex flex-col gap-sm font-sans text-xs">
        {(!articles || articles.length === 0) ? (
          <span className="text-slate-500 italic text-caption">Awaiting GDELT geopolitical stream...</span>
        ) : (
          articles.map((item, idx) => (
            <div 
              key={`${item.title}-${idx}`} 
              className="flex flex-col gap-xs pad-bottom-sm border-b border-white-trans-5 last:border-b-0 last:pad-bottom-0"
            >
              <div className="flex justify-between items-start gap-xs">
                <a 
                  href={item.url && item.url !== "#" ? item.url : `https://news.google.com/search?q=${encodeURIComponent(item.title)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-200 hover:text-[var(--neon-cyan)] transition-colors font-sans text-xs leading-relaxed font-bold flex items-center gap-1"
                >
                  {item.title}
                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 text-slate-500" />
                </a>
              </div>
              <div className="flex justify-between text-tiny font-mono text-slate-500 uppercase">
                <span>{item.source || "Unknown Source"}</span>
                <span>{item.seendate ? new Date(item.seendate).toLocaleTimeString() : "Just Now"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default ThreatNews;

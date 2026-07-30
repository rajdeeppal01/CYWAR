import React, { useMemo, useRef, useEffect } from 'react';
import { Terminal, ShieldAlert } from 'lucide-react';

export default function ThreatStream({ packets, filterCountry }) {
  const containerRef = useRef(null);

  // Check if selected country has any active telemetry packets
  const isNodeActive = useMemo(() => {
    if (!filterCountry) return true;
    return packets.some(p => p.src === filterCountry || p.dest === filterCountry);
  }, [packets, filterCountry]);

  // Filter logs by selected country if it has active telemetry
  const filteredPackets = useMemo(() => {
    if (!filterCountry || !isNodeActive) return packets;
    return packets.filter(p => p.src === filterCountry || p.dest === filterCountry);
  }, [packets, filterCountry, isNodeActive]);

  // Keep terminal scrolled to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filteredPackets]);

  return (
    <div className="cyber-panel flex flex-col h-full bg-trans-black-45" style={{ padding: '20px 24px' }}>
      <div className="flex justify-between items-center border-b border-white-trans-5 pad-bottom-sm margin-bottom-md z-10">
        <h3 className="text-small font-extrabold text-slate-400 tracking-wider flex items-center gap-xs font-sans uppercase">
          <Terminal className="w-icon-sm text-[var(--neon-cyan)]" />
          ACTIVE CYBER THREAT FEED SYSLOGS
        </h3>
        <div className="flex items-center gap-xs">
          {filterCountry && (
            <span 
              className="text-tiny font-mono pad-x-xs pad-y-xs rounded font-bold"
              style={{ 
                backgroundColor: isNodeActive ? 'rgba(20, 184, 166, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                border: isNodeActive ? '1px solid rgba(20, 184, 166, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                color: isNodeActive ? 'var(--neon-cyan)' : 'var(--neon-red)'
              }}
            >
              FILTER: {filterCountry} {!isNodeActive && "(INACTIVE NODE - GLOBAL FEED)"}
            </span>
          )}
          <span className="text-caption text-slate-500 font-mono flex items-center gap-xs uppercase font-bold tracking-wider">
            <span className="rounded-full bg-[var(--neon-green)] animate-pulse" style={{ width: '6px', height: '6px' }}></span>
            FEED_OK
          </span>
        </div>
      </div>

      {/* Terminal logs list */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-small leading-relaxed flex flex-col gap-xs pad-right-sm custom-scrollbar text-slate-300 select-text selection:bg-[var(--neon-cyan)]/30"
      >
        {filteredPackets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-xs pad-lg">
            <ShieldAlert className="w-icon-md text-slate-600 animate-pulse" />
            Awaiting live telemetry packet events...
          </div>
        ) : (
          filteredPackets.map((pkt, idx) => (
            <div 
              key={`${pkt.timestamp}-${idx}`} 
              className="hover:bg-white/5 pad-y-xs pad-x-xs rounded-lg transition-colors duration-150 flex items-start gap-xs flex-wrap md:flex-nowrap"
            >
              <span className="text-slate-500">[{pkt.timestamp}]</span>
              <span className="text-slate-400">
                SRC: <strong className="text-slate-200">{pkt.src}</strong> ({pkt.src_name})
              </span>
              <span className="text-slate-500">&rarr;</span>
              <span className="text-slate-400">
                DEST: <strong className="text-slate-200">{pkt.dest}</strong> ({pkt.dest_name})
              </span>
              <span className="text-slate-600 font-bold">|</span>
              <span className="text-slate-400">
                PORT: <span className="text-[var(--neon-cyan)] font-bold">{pkt.port}</span>
              </span>
              <span className="text-slate-600 font-bold">|</span>
              <span className="text-slate-400 flex-1 truncate">{pkt.type}</span>
              <span className="text-slate-600 font-bold">|</span>
              <span 
                className="text-caption"
                style={{
                  color: pkt.severity === 'LOW' ? '#60a5fa' :
                         pkt.severity === 'MEDIUM' ? 'var(--neon-orange)' :
                         pkt.severity === 'HIGH' ? 'var(--neon-red)' :
                         'var(--neon-green)',
                  fontWeight: pkt.severity === 'CRITICAL' ? '800' : '700'
                }}
              >
                [{pkt.severity}]
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

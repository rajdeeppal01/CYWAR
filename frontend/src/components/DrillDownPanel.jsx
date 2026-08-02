import React, { useMemo } from 'react';
import { X, Crosshair, Server, Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function DrillDownPanel({ countryCode, countryName, packets, onClose }) {
  // Compute analytics specific to this country
  const analytics = useMemo(() => {
    if (!packets || packets.length === 0 || !countryCode) return null;

    const inbound = packets.filter(p => p.dest === countryCode);
    const outbound = packets.filter(p => p.src === countryCode);
    
    // Most targeted ports
    const portCounts = {};
    inbound.forEach(p => {
      portCounts[p.port] = (portCounts[p.port] || 0) + 1;
    });
    const topPorts = Object.entries(portCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Top attacker IPs (we don't have IPs, we have sources and industries)
    const attackerCounts = {};
    inbound.forEach(p => {
      attackerCounts[p.src] = (attackerCounts[p.src] || 0) + 1;
    });
    const topAttackers = Object.entries(attackerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
      
    // Critical inbound attacks
    const criticalAttacks = inbound.filter(p => p.severity === 'CRITICAL');

    return {
      inboundCount: inbound.length,
      outboundCount: outbound.length,
      topPorts,
      topAttackers,
      criticalAttacks
    };
  }, [packets, countryCode]);

  if (!countryCode) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-[#0a0a0f] border-l border-white-trans-10 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center pad-md border-b border-white-trans-5 bg-gradient-to-r from-transparent to-[#101015]">
        <div>
          <h2 className="text-sm font-extrabold text-[var(--neon-cyan)] tracking-wider font-mono flex items-center gap-2 uppercase">
            <Crosshair size={16} />
            Node: {countryCode}
          </h2>
          <p className="text-slate-400 text-xs mt-1">{countryName} - Regional Analytics</p>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pad-md flex flex-col gap-md custom-scrollbar">
        
        {/* Stats Row */}
        <div className="flex gap-sm">
          <div className="flex-1 bg-white-trans-5 rounded pad-sm border border-white-trans-5">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Inbound Vol</span>
            <span className="text-lg font-bold text-[var(--neon-orange)]">
              {analytics?.inboundCount || 0}
            </span>
          </div>
          <div className="flex-1 bg-white-trans-5 rounded pad-sm border border-white-trans-5">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Outbound Vol</span>
            <span className="text-lg font-bold text-[var(--neon-cyan)]">
              {analytics?.outboundCount || 0}
            </span>
          </div>
        </div>

        {/* Top Ports */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase mb-2 flex items-center gap-1 border-b border-white-trans-5 pb-1">
            <Server size={14} className="text-[var(--neon-cyan)]" />
            Vulnerable Ports
          </h3>
          <div className="flex flex-col gap-2">
            {analytics?.topPorts.length > 0 ? analytics.topPorts.map(([port, count], idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-mono text-[var(--neon-orange)]">Port {port}</span>
                <span className="text-slate-500">{count} hits</span>
              </div>
            )) : <span className="text-xs text-slate-600 italic">No inbound traffic detected</span>}
          </div>
        </div>

        {/* Top Attackers */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase mb-2 flex items-center gap-1 border-b border-white-trans-5 pb-1">
            <Activity size={14} className="text-[var(--neon-cyan)]" />
            Top Origin Nodes
          </h3>
          <div className="flex flex-col gap-2">
            {analytics?.topAttackers.length > 0 ? analytics.topAttackers.map(([src, count], idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-mono text-slate-300">{src}</span>
                <span className="text-slate-500">{count} packets</span>
              </div>
            )) : <span className="text-xs text-slate-600 italic">No hostile origins</span>}
          </div>
        </div>

        {/* Recent Critical Threats */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase mb-2 flex items-center gap-1 border-b border-white-trans-5 pb-1">
            <ShieldAlert size={14} className="text-[var(--neon-red)] animate-pulse" />
            Recent Critical Alerts
          </h3>
          <div className="flex flex-col gap-2">
            {analytics?.criticalAttacks.length > 0 ? analytics.criticalAttacks.slice(-4).reverse().map((pkt, idx) => (
              <div key={idx} className="bg-red-950/20 border border-red-500/20 rounded p-2 text-[10px] font-mono flex flex-col gap-1">
                <div className="flex justify-between text-[var(--neon-red)]">
                  <span>[{pkt.type}]</span>
                  <span>{pkt.timestamp}</span>
                </div>
                <div className="text-slate-400">
                  Target: {pkt.industry} (Port {pkt.port})
                </div>
              </div>
            )) : <span className="text-xs text-slate-600 italic">No critical anomalies.</span>}
          </div>
        </div>

      </div>
    </div>
  );
}

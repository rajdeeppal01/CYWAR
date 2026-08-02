import React, { useMemo } from 'react';
import { Target, Zap } from 'lucide-react';

export default function ThreatAnalytics({ packets, countries }) {
  const stats = useMemo(() => {
    if (!packets || packets.length === 0) {
      return { attackers: [], victims: [], actors: [] };
    }

    const srcCounts = {};
    const destCounts = {};
    const actorCounts = {};
    
    packets.forEach(p => {
      srcCounts[p.src] = (srcCounts[p.src] || 0) + 1;
      destCounts[p.dest] = (destCounts[p.dest] || 0) + 1;
      
      if (p.threat_actor && p.threat_actor !== "Unknown") {
        actorCounts[p.threat_actor] = (actorCounts[p.threat_actor] || 0) + 1;
      }
    });

    const sortedAttackers = Object.entries(srcCounts)
      .map(([code, count]) => ({
        code,
        name: (countries && countries[code]) || code,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const sortedVictims = Object.entries(destCounts)
      .map(([code, count]) => ({
        code,
        name: (countries && countries[code]) || code,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const sortedActors = Object.entries(actorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const maxAttacks = Math.max(...sortedAttackers.map(a => a.count), 1);
    const maxVictims = Math.max(...sortedVictims.map(v => v.count), 1);
    const maxActors = Math.max(...sortedActors.map(a => a.count), 1);

    return { 
      attackers: sortedAttackers, 
      victims: sortedVictims,
      actors: sortedActors,
      maxAttacks,
      maxVictims,
      maxActors
    };
  }, [packets, countries]);

  return (
    <div className="cyber-panel pad-lg flex flex-col gap-md">
      <div className="flex justify-between items-center border-b border-white-trans-5 pad-bottom-sm">
        <h3 className="text-small font-extrabold text-slate-400 tracking-wider flex items-center gap-xs font-sans uppercase">
          <Zap className="w-icon-sm text-[var(--neon-red)] animate-pulse" />
          REAL-TIME TRAFFIC ANALYTICS
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-md font-sans text-xs">
        {/* Originating Column */}
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-xs font-mono text-tiny text-slate-500 font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[var(--neon-red)]"></span>
            Top Attack Origins
          </div>
          <div className="flex flex-col gap-xs">
            {stats.attackers.length === 0 ? (
              <span className="text-slate-500 italic text-caption">Awaiting packet stream...</span>
            ) : (
              stats.attackers.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-slate-300 font-mono text-caption">
                    <span className="truncate max-w-[80px]">{item.name}</span>
                    <span className="text-[var(--neon-red)] font-bold">{item.count} pkts</span>
                  </div>
                  <div className="h-1.5 bg-[#020617] rounded-full overflow-hidden border border-white-trans-5">
                    <div 
                      className="h-full bg-[var(--neon-red)] rounded-full transition-all duration-500" 
                      style={{ width: `${(item.count / stats.maxAttacks) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Target Profile Column */}
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-xs font-mono text-tiny text-slate-500 font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[var(--neon-orange)]"></span>
            Top Target Profiles
          </div>
          <div className="flex flex-col gap-xs">
            {stats.victims.length === 0 ? (
              <span className="text-slate-500 italic text-caption">Awaiting packet stream...</span>
            ) : (
              stats.victims.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-slate-300 font-mono text-caption">
                    <span className="truncate max-w-[80px]">{item.name}</span>
                    <span className="text-[var(--neon-orange)] font-bold">{item.count} pkts</span>
                  </div>
                  <div className="h-1.5 bg-[#020617] rounded-full overflow-hidden border border-white-trans-5">
                    <div 
                      className="h-full bg-[var(--neon-orange)] rounded-full transition-all duration-500" 
                      style={{ width: `${(item.count / stats.maxVictims) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Threat Actor Attribution */}
      <div className="border-t border-white-trans-5 pt-md mt-sm">
        <div className="flex items-center gap-xs font-mono text-tiny text-slate-500 font-extrabold uppercase tracking-wider mb-sm">
          <Target className="w-3 h-3 text-[var(--neon-cyan)]" />
          Active Threat Actors (AI Attribution)
        </div>
        <div className="flex flex-col gap-xs">
          {stats.actors.length === 0 ? (
            <span className="text-slate-500 italic text-caption">No attributed actors in current window</span>
          ) : (
            stats.actors.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-trans-black-20 pad-sm rounded border border-white-trans-5">
                <span className="text-slate-300 font-mono text-caption truncate max-w-[200px]">{item.name}</span>
                <span className="text-[var(--neon-cyan)] font-bold text-xs">{item.count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { Cpu, Globe } from 'lucide-react';

const COUNTRY_OVERRIDES = {
  "US": {
    name: "United States",
    summary: "The United States is observing widespread scanning and database probing against critical defense and energy networks. Telemetry points to coordinated attempts by external APT groups to map perimeter vulnerabilities, specifically on ports 8080 and 4840. Intrusion detection systems are in high alert status.",
    actors: ["APT28 (Fancy Bear)", "Lazarus Group", "UNC2589"],
    sectors: ["Defense Systems", "Energy Infrastructure", "Financial Hubs"],
    tactical: "Enforce multi-factor authentication perimeters. Isolate database segments. Deploy firewall rules blocking foreign egress traffic on port 8080. Audit active proxy logs."
  },
  "UA": {
    name: "Ukraine",
    summary: "Ukraine remains a primary kinetic and cyber target, facing constant DDoS flood streams and industrial SCADA system scans. Attacks are highly coordinated, aiming to disrupt civil communication channels and power grid sectors. Outbound signals suggest active defense coordination.",
    actors: ["Sandworm (APT44)", "APT28 (Fancy Bear)"],
    sectors: ["Power Distribution", "State Mainframes", "Telecommunications"],
    tactical: "Establish DDoS shield redirects. Switch power grid switches to analog offline mode where feasible. Block Russian egress nodes. Verify SCADA port 4840 insulation."
  },
  "RU": {
    name: "Russia",
    summary: "Russian networks are serving as the dominant origin of aggressive cyber operations, specifically DDoS flood packets and SCADA network exploration. Outbound packets show targeting of Eastern European infrastructure. Internal logs indicate baseline scans on regional routing ports.",
    actors: ["Sandworm (APT44)", "APT28 (Fancy Bear)", "Fancy Cyber Force"],
    sectors: ["Government Portals", "Egress Proxy Nodes"],
    tactical: "Monitor regional routing nodes. Block unauthorized outbound DNS tunneling. Audit state proxy servers for external beacon routes."
  },
  "CN": {
    name: "China",
    summary: "China telemetry exhibits significant outbound activity targeting South China Sea neighbors and US assets. Heavy SCADA scanning anomalies on port 4840 have been traced back to state-sponsored proxies. Outbound packets aim to map telecommunication networks.",
    actors: ["APT41 (Double Dragon)", "Volt Typhoon"],
    sectors: ["Maritime Telecomm", "Satellite Ground Stations"],
    tactical: "Isolate SCADA networks. Block Volt Typhoon proxy routing nodes. Audit state-sponsored proxy tunnels. Patch port 8080 perimeters."
  },
  "IR": {
    name: "Iran",
    summary: "Iran context highlights regional scanning operations, focusing on SCADA systems and DDoS floods targeting Middle Eastern infrastructures. Hostile diplomatic sentiment correlates with anomalous scan spikes on port 443.",
    actors: ["MuddyWater (APT33)", "Charming Kitten"],
    sectors: ["Oil & Gas Distribution", "Civilian Infrastructure"],
    tactical: "Enable active firewall filters on regional ports. Block MuddyWater egress routes. Monitor database query anomalies."
  },
  "IL": {
    name: "Israel",
    summary: "Israel is monitoring elevated perimeter scanning volumes, specifically database query anomalies on ports 443 and 8080. Telemetry shows coordinated attacks from regional hostile networks seeking access to civilian infrastructure databases.",
    actors: ["MuddyWater (APT33)", "UNC2589"],
    sectors: ["Civil Water Supply", "Military Command Networks"],
    tactical: "Deploy database firewalls. Verify encrypted TLS tunnels. Block regional threat routing nodes. Deploy active honeytoken traps."
  },
  "DE": {
    name: "Germany",
    summary: "Germany is monitoring baseline scans and database probes targeting corporate and administrative networks. Outbound and inbound packets indicate threat groups are probing commercial infrastructure to establish entry nodes.",
    actors: ["APT28 (Fancy Bear)", "Generic scanning groups"],
    sectors: ["Industrial Logistics", "Government Operations"],
    tactical: "Audit access logs for port 8080. Update TLS configurations. Configure intrusion prevention rules for generic scans."
  },
  "PL": {
    name: "Poland",
    summary: "Poland is serving as a critical cybersecurity transit zone, absorbing high volumes of hostile scans originating from Russian networks. Telemetry indicates active cyber-espionage attempts targeting defense logistics.",
    actors: ["Sandworm (APT44)", "APT28 (Fancy Bear)"],
    sectors: ["Military Supply Chains", "Rail Transportation Systems"],
    tactical: "Deploy high-priority threat filters for Russian routing. Audit logistics software updates. Verify VPN tunnel integrity."
  },
  "GB": {
    name: "United Kingdom",
    summary: "The United Kingdom is observing baseline threat scanning targeting government portals and financial hubs. Scans suggest threat groups are mapping network perimeters to exploit unpatched legacy ports.",
    actors: ["APT28 (Fancy Bear)", "Volt Typhoon"],
    sectors: ["Financial Infrastructure", "Public Health Portals"],
    tactical: "Audit public-facing web servers. Update software perimeters. Verify firewall filters for port 443 routes."
  },
  "JP": {
    name: "Japan",
    summary: "Japan is monitoring anomalous database scans and port mapping campaigns. Telemetry suggests Volt Typhoon proxies are being used to scan telecommunication routers.",
    actors: ["Volt Typhoon", "Lazarus Group"],
    sectors: ["Maritime Shipping Systems", "Telecomm Routing Hubs"],
    tactical: "Deploy router patch firmware. Monitor maritime data streams. Audit proxy egress logs."
  },
  "AU": {
    name: "Australia",
    summary: "Australia is observing automated scanning targeting maritime and defense research systems. Telemetry indicates attempts to map SCADA networks and public infrastructure databases.",
    actors: ["Volt Typhoon"],
    sectors: ["Defense Research Networks", "Mining Logistics"],
    tactical: "Audit remote access VPNs. Verify SCADA system isolation. Block foreign proxy egress ports."
  }
};

export default function AIBriefing({ metrics, analysis, selectedCountry, packets }) {
  
  // Aggregate live syslog parameters to infer global state dynamically
  const syslogInferences = useMemo(() => {
    if (!packets || packets.length === 0) return null;
    
    // Count ports and attack types
    const portCounts = {};
    const typeCounts = {};
    const srcCounts = {};
    
    packets.forEach(p => {
      portCounts[p.port] = (portCounts[p.port] || 0) + 1;
      typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
      srcCounts[p.src] = (srcCounts[p.src] || 0) + 1;
    });
    
    // Find top targeted port
    const topPort = Object.entries(portCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "8080";
    // Find top targeted vector type
    const topType = Object.entries(typeCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "Telemetry Scan";
    // Find top source country
    const topSrc = Object.entries(srcCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "RU";
    
    return { topPort, topType, topSrc };
  }, [packets]);

  // Determine active hotspots based on scenario name
  const hotspotRegions = useMemo(() => {
    if (!metrics) return "Global Baselines";
    if (metrics.scenario_name.includes("Eastern Europe")) return "Eastern Europe (RU, UA, PL)";
    if (metrics.scenario_name.includes("South China Sea")) return "South China Sea (CN, VN, PH, US)";
    if (metrics.scenario_name.includes("Middle East")) return "Middle East (IR, IL, US)";
    return "Global Baselines";
  }, [metrics]);

  // Generate dynamic briefing content
  const activeContent = useMemo(() => {
    // A: COUNTRY SELECTED MODE
    if (selectedCountry) {
      const override = COUNTRY_OVERRIDES[selectedCountry];
      if (override) {
        return {
          title: `INTELLIGENCE BRIEFING: ${override.name.toUpperCase()} REGION`,
          summary: override.summary,
          actors: override.actors,
          sectors: override.sectors,
          tactical: override.tactical
        };
      }
      
      // Fallback if country details not predefined
      return {
        title: `INTELLIGENCE BRIEFING: REGION CODE ${selectedCountry}`,
        summary: `Analyzing active perimeter telemetry for region ${selectedCountry}. Live telemetry indicates standard baseline operational status. Threat mitigation filters are actively logging outbound and inbound scans.`,
        actors: ["Generic scan scripts", "External proxy routes"],
        sectors: ["Local Routing Infrastructure"],
        tactical: `Continue logging port connections from region ${selectedCountry}. Enforce standard perimeter firewall rulesets.`
      };
    }

    // B: GLOBAL MAP OVERVIEW MODE
    const globalSummary = analysis ? analysis.summary : "Analyzing global cyber anomaly signals...";
    const inferenceSummary = syslogInferences 
      ? `Real-time syslog aggregation indicates elevated threat telemetry originating from ${syslogInferences.topSrc} targeting key assets. The dominant attack pattern observed is ${syslogInferences.topType}, with high port scanning densities focused on Port ${syslogInferences.topPort}.`
      : "Awaiting live packet streams to synthesize syslog threat flow vectors.";

    return {
      title: "GLOBAL CYBER GEOPOLITICAL BREIFING & ANOMALY ANALYSIS",
      summary: `${globalSummary} ${inferenceSummary}`,
      actors: analysis ? analysis.primary_actors : ["Unknown"],
      sectors: analysis ? analysis.critical_sectors : ["None"],
      tactical: analysis ? analysis.tactical_assessment : "Establish connection to synchronize firewall metrics."
    };
  }, [selectedCountry, analysis, syslogInferences]);

  return (
    <div className="cyber-panel pad-lg flex flex-col gap-md">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white-trans-5 pad-bottom-sm">
        <h3 className="text-small font-extrabold text-slate-400 tracking-wider flex items-center gap-xs font-sans uppercase">
          <Cpu className="w-icon-sm text-[var(--neon-cyan)] animate-pulse" />
          {activeContent.title}
        </h3>
      </div>

      {/* Grid Layout: Wide-Pane 3 Column layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-md items-start">
        
        {/* Column 1: News Alert & Summary (Spans 5/12 cols) */}
        <div className="col-span-5 flex flex-col gap-sm">
          {/* News Alert Card */}
          <div className="bg-alert-pink-opaque border border-alert-pink-trans rounded-xl pad-sm">
            <div className="text-tiny text-[var(--neon-red)] font-extrabold margin-bottom-sm flex items-center gap-xs font-mono tracking-wider">
              <Globe className="w-icon-xs h-icon-xs animate-pulse" /> CURRENT GEOPOLITICAL EVENT:
            </div>
            <p className="text-slate-200 leading-relaxed italic font-sans text-xs">
              {selectedCountry 
                ? `Specific target profile query loaded for region: ${selectedCountry}.`
                : `"${metrics.news_headline}"`}
            </p>
          </div>

          <div className="flex flex-col gap-xs">
            <span className="text-tiny text-slate-500 font-mono font-extrabold uppercase tracking-wider">Geopolitical Analysis Summary</span>
            <p className="text-slate-300 leading-relaxed font-sans text-xs margin-top-xs">
              {activeContent.summary}
            </p>
          </div>
        </div>

        {/* Column 2: Suspected APT Actors & Targeted Sectors (Spans 4/12 cols) */}
        <div className="col-span-4 flex flex-col gap-md">
          {/* Suspected APT Actors */}
          <div className="flex flex-col gap-xs">
            <span className="text-tiny text-slate-500 font-mono font-extrabold uppercase tracking-wider">
              {selectedCountry ? "Regional Threat Actors" : "Suspected APT Actors"}
            </span>
            <div className="flex flex-wrap gap-xs margin-top-xs">
              {activeContent.actors.map((actor, idx) => (
                <span key={idx} className="cyber-badge cyber-badge-red text-tiny pad-x-xs pad-y-xs" style={{ borderRadius: '4px' }}>
                  {actor}
                </span>
              ))}
            </div>
          </div>

          {/* Critical Sectors */}
          <div className="flex flex-col gap-xs border-t border-white-trans-5 pad-top-sm">
            <span className="text-tiny text-slate-500 font-mono font-extrabold uppercase tracking-wider">
              {selectedCountry ? "Vulnerable Infrastructures" : "At-Risk Infrastructure Sectors"}
            </span>
            <div className="flex flex-wrap gap-xs margin-top-xs">
              {activeContent.sectors.map((sec, idx) => (
                <span key={idx} className="cyber-badge cyber-badge-orange text-tiny pad-x-xs pad-y-xs" style={{ borderRadius: '4px' }}>
                  {sec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Tactical Assessment / Orders (Spans 3/12 cols) */}
        <div className="col-span-3 flex flex-col gap-xs pad-left-lg border-l border-white-trans-5" style={{ minHeight: '120px' }}>
          <span className="text-tiny text-slate-500 font-mono font-extrabold uppercase tracking-wider">
            {selectedCountry ? "Tactical Defenses" : "Tactical Mitigation Orders"}
          </span>
          <p className="text-small text-[var(--neon-cyan)] font-mono leading-relaxed margin-top-xs font-bold">
            {activeContent.tactical}
          </p>
        </div>

      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { Cpu, Globe } from 'lucide-react';

const ACTOR_DEFINITIONS = {
  "Sandworm (APT44)": {
    alias: "APT44 / Voodoo Bear",
    origin: "Russia (GRU)",
    description: "A highly destructive state-sponsored group known for attacking industrial control systems. They famously caused the Ukrainian power grid blackouts of 2015 and 2016, and deployed the NotPetya wiper malware."
  },
  "Sandworm": {
    alias: "APT44 / Voodoo Bear",
    origin: "Russia (GRU)",
    description: "A highly destructive state-sponsored group known for attacking industrial control systems. They famously caused the Ukrainian power grid blackouts of 2015 and 2016, and deployed the NotPetya wiper malware."
  },
  "APT28 (Fancy Bear)": {
    alias: "Fancy Bear / GRU Unit 26165",
    origin: "Russia (GRU)",
    description: "A highly active cyber espionage group. They specialize in spear-phishing campaigns targeting government ministries, military attachés, and political institutions worldwide."
  },
  "Fancy Bear": {
    alias: "Fancy Bear / GRU Unit 26165",
    origin: "Russia (GRU)",
    description: "A highly active cyber espionage group. They specialize in spear-phishing campaigns targeting government ministries, military attachés, and political institutions worldwide."
  },
  "APT41 (Double Dragon)": {
    alias: "Double Dragon / BARIUM",
    origin: "China",
    description: "A prolific group that conducts state-directed cyber espionage alongside financially motivated operations. They target software supply chains, telecommunications, and healthcare providers."
  },
  "APT41": {
    alias: "Double Dragon / BARIUM",
    origin: "China",
    description: "A prolific group that conducts state-directed cyber espionage alongside financially motivated operations. They target software supply chains, telecommunications, and healthcare providers."
  },
  "Volt Typhoon": {
    alias: "Vanguard Panda",
    origin: "China",
    description: "A state-sponsored actor focused on pre-positioning inside critical infrastructure (such as communications, energy, and water systems). They use living-off-the-land techniques to remain stealthy."
  },
  "Lazarus Group": {
    alias: "APT38 / Hidden Cobra",
    origin: "North Korea",
    description: "A state-sponsored group responsible for high-profile cyberattacks, including the 2014 Sony Pictures hack, the WannaCry ransomware outbreak, and major cryptocurrency thefts globally."
  },
  "MuddyWater (APT33)": {
    alias: "APT33 / Elfin",
    origin: "Iran",
    description: "An espionage group active in the Middle East, targeting government entities, aviation, and energy sectors using custom backdoors and credential harvesting."
  },
  "MuddyWater": {
    alias: "APT33 / Elfin",
    origin: "Iran",
    description: "An espionage group active in the Middle East, targeting government entities, aviation, and energy sectors using custom backdoors and credential harvesting."
  },
  "Charming Kitten": {
    alias: "APT35 / Phosphorus",
    origin: "Iran",
    description: "An Iranian cyber espionage group that heavily targets journalists, activists, and geopolitical scholars through sophisticated social engineering and spear-phishing."
  },
  "UNC2589": {
    alias: "UNC2589 / TEMP.Hermit",
    origin: "Russia (SVR)",
    description: "A cyber espionage group targeting government and diplomatic channels to collect strategic geopolitical intelligence. They utilize custom malware and cloud service compromises."
  },
  "Distributed Botnets": {
    alias: "Mirai / IoT Botnets",
    origin: "Global / Decentralized",
    description: "Decentralized networks of compromised internet-connected devices (like routers and webcams) used to launch high-volume distributed denial-of-service (DDoS) flood attacks."
  },
  "Automated Scanners": {
    alias: "Vulnerability Scanning Bots",
    origin: "Global / Automated",
    description: "Software scripts and crawlers that continuously sweep the internet to discover unpatched servers or exposed databases, often mapping vulnerabilities for future exploitation."
  },
  "Generic scanning groups": {
    alias: "Internet Search Probes",
    origin: "Global",
    description: "Non-attributed scanning crawlers that sweep public ports looking for configuration leaks, weak security certificates, or unpatched legacy protocols."
  }
};

const getActorDef = (actorName) => {
  const cleaned = actorName.trim();
  const match = ACTOR_DEFINITIONS[cleaned];
  if (match) return match;
  for (const key of Object.keys(ACTOR_DEFINITIONS)) {
    if (cleaned.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleaned.toLowerCase())) {
      return ACTOR_DEFINITIONS[key];
    }
  }
  return {
    alias: "Active Threat Cluster",
    origin: "Unattributed / Proxy",
    description: "An active cyber threat campaign targeting infrastructure portals to perform reconnaissance, espionage, or disruptive operations."
  };
};

const INFRASTRUCTURE_DEFINITIONS = {
  "Defense Systems": {
    alias: "Military & Tactical Command Systems",
    vector: "Credential Harvesting & Malware Pre-Positioning",
    description: "Threat actors sweep defense gateways to compromise strategic planning routes, mirror communications, or extract intelligence regarding tactical maneuvers."
  },
  "Energy Infrastructure": {
    alias: "Power Generation & Grid Distribution Controls",
    vector: "ICS/SCADA Modbus Hijacking & Firmware Rewriting",
    description: "Substations are scanned using industrial control protocols. Compromises allow attackers to force grid relays open, causing physical circuit damage or blackout shutdowns."
  },
  "Financial Hubs": {
    alias: "Core Clearing, Banking & Transaction Networks",
    vector: "SQL Database Injection & Ledger Tampering",
    description: "Espionage groups target bank databases and global routing gateways to siphon transactions, compromise wire records, or lock routing switches with ransomware."
  },
  "Power Distribution": {
    alias: "Civic Grid Distribution Mainframes",
    vector: "SCADA Protocol Overrides & Substation Trip Scans",
    description: "Hackers target distribution substations to trigger safety shutdowns, blocking power to civic zones to generate local panic or mask ground physical movements."
  },
  "State Mainframes": {
    alias: "Government Administration & Registry Services",
    vector: "Directory Traversal & Core Document Exfiltration",
    description: "Administrative registries are compromised to leak civil IDs, encrypt governmental databases, or shut down public service portals."
  },
  "Telecommunications": {
    alias: "Fiber, Routing & Network Switching Centers",
    vector: "Border Gateway Protocol Hijacks & Traffic Mirroring",
    description: "State actors attempt to intercept switching routers to tap into communications lines, redirect DNS pathways, or sever international cable routes."
  },
  "Government Portals": {
    alias: "Civil Administrative Web Perimeters",
    vector: "DDoS Flood Streams & Web Portal Defacements",
    description: "Hackers target government front-ends with high-volume request streams, disabling civic portals to disrupt standard public affairs operations."
  },
  "Egress Proxy Nodes": {
    alias: "Bounced Routing & Concealed Proxy Nets",
    vector: "Command & Control Redirection Beacons",
    description: "Threat collectives hijack local servers to establish secure proxy pipelines, masking their geographical origins when running offensive cyber sweeps."
  },
  "Maritime Telecomm": {
    alias: "Maritime Vessel SATCOM & High-Frequency Radio",
    vector: "GPS Spoofing & Signal Interception Probes",
    description: "Ship-to-shore communications are probed to mirror cargo files, intercept operational schedules, or jam regional distress signaling."
  },
  "Satellite Ground Stations": {
    alias: "SATCOM Orbital Ground Control Hubs",
    vector: "Firmware Overwrite & Telemetry Command Hijacks",
    description: "Ground stations are scanned to intercept signal tracking feeds or inject unauthorized telemetry, potentially locking satellite communication paths."
  },
  "Oil & Gas Distribution": {
    alias: "Pipeline Pumping & Flow Rate Valve Monitors",
    vector: "Modbus/SCADA Flow Override Scans",
    description: "Refineries are probed to bypass threshold sensors. Hackers seek to force pressure surges or close key valves to damage pipeline lines."
  },
  "Civilian Infrastructure": {
    alias: "Municipal Power, Transport & Water Services",
    vector: "Ransomware Encryptions & Remote Access Probes",
    description: "General civic systems are swept for unpatched remote gateways, allowing attackers to lock administration screens and demand payouts."
  },
  "Civil Water Supply": {
    alias: "Water Filtration, Chemical Feed & Treatment SCADA",
    vector: "SCADA PLC Mixing Ratio Tampering",
    description: "Water treatment plants are scanned to target remote chemical mixers or pump controls, posing chemical contamination threats to cities."
  },
  "Military Command Networks": {
    alias: "Tactical Defense Communications Mainframes",
    vector: "BGP Redirection & Target Data Interceptions",
    description: "Command nets are swept to intercept telemetry data, spoof orders, or mirror tactical coordinate lines."
  },
  "Industrial Logistics": {
    alias: "Manufacturing Supply Chains & Inventory Databases",
    vector: "Database SQL Injections & API Session Hijacks",
    description: "Logistics platforms are targeted to disrupt warehouse database logs, delay shipping schedules, or inject forged shipping manifests."
  },
  "Government Operations": {
    alias: "Public Sector Administration Databases",
    vector: "Directory Traversal & SQL Access Scans",
    description: "Espionage actors sweep governmental services to exfiltrate strategic archives or compromise identity registries."
  },
  "Military Supply Chains": {
    alias: "Logistics Tracking & Transport Distribution Centers",
    vector: "Database Scans & Fleet Dispatch Interceptions",
    description: "Transportation networks are targeted to track material deliveries, delay supply lines, or disrupt cargo timetables."
  },
  "Rail Transportation Systems": {
    alias: "Switching Grid & Rail Signaling Computers",
    vector: "Signaling Firmware Hijacking Scans",
    description: "Hackers probe rail control systems to disrupt schedules, manipulate track signals, or block central dispatch lines."
  },
  "Financial Infrastructure": {
    alias: "Transaction Routing & Central Ledger Mainframes",
    vector: "Database Probing & Payment Egress Hijacks",
    description: "Bank transaction networks are swept for credential vulnerabilities to compromise asset transfers or interrupt wire clearance."
  },
  "Public Health Portals": {
    alias: "Healthcare registries & Hospital Databases",
    vector: "Ransomware Encryption & API Data Siphons",
    description: "Hospital databases are scanned for unpatched gateways. Attackers encrypt patient records to force immediate de-escalation payments."
  },
  "Maritime Shipping Systems": {
    alias: "Port Container Cargo & Terminal Dispatch Logs",
    vector: "Terminal Crane database & SCADA Spikes",
    description: "Terminal databases are compromised to lock down loading cranes, alter cargo schedules, or freeze shipping lanes."
  },
  "Telecomm Routing Hubs": {
    alias: "High-Speed Backbone Switching Terminals",
    vector: "Border Gateway Protocol (BGP) Redirection Scans",
    description: "Internet switches are scanned to route public web traffic through compromised state-sponsored nodes for monitoring."
  },
  "Defense Research Networks": {
    alias: "Defense R&D Science & Technology Archives",
    vector: "Espionage Spear-Phishing & Data Siphoning",
    description: "Research systems are targeted to steal aerospace designs, military tech patents, or strategic defense blueprints."
  },
  "Mining Logistics": {
    alias: "Industrial Resource Extraction & Freight Logs",
    vector: "Ransomware Loops & SQL Database Tampering",
    description: "Resource shipping systems are scanned to disrupt supply streams of critical raw materials."
  },
  "Maritime Navigation": {
    alias: "Navigational GPS & Ship Transit Feeds",
    vector: "GPS Signal Spoofing & Route Mapping Scans",
    description: "Navigation databases are scanned to introduce location deviations, manipulate route logs, or jam GPS telemetry."
  },
  "Satellite Uplinks": {
    alias: "SATCOM Communication Ground Links",
    vector: "Uplink Command Overrides & Signal Noise Spikes",
    description: "Ground uplink dishes are scanned to intercept raw communications or inject override payloads."
  },
  "Telecom Switching Centers": {
    alias: "Regional switching Mainframes",
    vector: "Router compromise & Mirroring beacons",
    description: "Switching centers are targeted to intercept calling records or disable telecommunication links."
  },
  "Public Health Systems": {
    alias: "Civic Health Registry Databases",
    vector: "API Data Siphons & Ransomware Locks",
    description: "Public health networks are targeted to harvest medical records or disrupt emergency medical services."
  },
  "Defense Research Mainframes": {
    alias: "Defense R&D Prototype blueprins Archives",
    vector: "Spear-Phishing & Espionage file siphons",
    description: "R&D systems are targeted to steal files on advanced military tech prototypes."
  },
  "SATCOM Research Networks": {
    alias: "Scientific SATCOM Ground research stations",
    vector: "Ground dish control overrides",
    description: "SATCOM systems are probed to compromise research data or hijack communication feeds."
  },
  "Financial Routing Perimeters": {
    alias: "Bank Clearing Gateway Firewalls",
    vector: "SQL injection & API session sweeps",
    description: "Financial perimeters are scanned to locate vulnerabilities in transaction APIs."
  },
  "Industrial Ports": {
    alias: "Commercial cargo Terminal Mainframes",
    vector: "SCADA crane controls & scheduling overrides",
    description: "Terminal systems are scanned to manipulate cargo schedules or lock container cranes."
  },
  "Logistics Supply Networks": {
    alias: "Commercial distribution Logistics databases",
    vector: "Database scans & routing switches",
    description: "Supply networks are probed to disrupt cargo distribution or delay shipments."
  },
  "Local Utilities": {
    alias: "Civic power, gas, and water SCADA",
    vector: "OT control scans & emergency trips",
    description: "Civic SCADA systems are scanned to probe emergency valves or power line relays."
  },
  "Local Routing Infrastructure": {
    alias: "Regional network Routing switches",
    vector: "Edge router firmware scans",
    description: "Local switches are scanned to identify outdated firmware for BGP injection."
  },
  "Agricultural Logistics Databases": {
    alias: "Food supply & shipping Logistics logs",
    vector: "Database SQL injection & schedule tampering",
    description: "Food supply databases are probed to disrupt transport logistics schedules."
  },
  "Maritime Ports": {
    alias: "Container Terminal control databases",
    vector: "SCADA crane & cargo logs hijacking",
    description: "Port systems are scanned to alter cargo files or lock container loading cranes."
  },
  "Civilian Electricity Grids": {
    alias: "Civic power grid control centers",
    vector: "OT grid relay scans & emergency trips",
    description: "Power grids are targeted to disable civic electricity and cause widespread civilian blackouts."
  },
  "Logistics Channels": {
    alias: "Supply chain & cargo routing platforms",
    vector: "Database sweeps & dispatch lockouts",
    description: "Logistics platforms are targeted to disrupt warehouse records and delay transport schedules."
  },
  "Border Communications": {
    alias: "Security & customs telecommunication nets",
    vector: "Switching station sweeps & signal noise",
    description: "Border communication systems are targeted to disable customs tracking or disrupt security forces."
  },
  "Cargo Shipping Routes": {
    alias: "Navigational route mapping systems",
    vector: "GPS signal spoofing & database overrides",
    description: "Shipping routes are scanned to introduce coordinates drift or compromise navigational aids."
  },
  "Port Command Systems": {
    alias: "Central Port Dispatch & scheduling databases",
    vector: "Cargo dispatch DB scans & session hijacking",
    description: "Port command is targeted to freeze terminal shipping schedules or lock container storage databases."
  },
  "Civil Air Traffic Command": {
    alias: "Aviation navigation & radar switching",
    vector: "Radar feed mirror scans & signal spoofing",
    description: "Aviation command is scanned to target radar databases and introduce traffic tracking delays."
  },
  "Public Water Distribution": {
    alias: "Municipal water filtration & pump SCADA",
    vector: "PLC chemical mix & valve overrides",
    description: "Water SCADA is scanned to manipulate filtration systems, posing safety risks to cities."
  },
  "Oil Refineries": {
    alias: "Petrochemical flow valve control grids",
    vector: "Valve pressure spikes & emergency trips",
    description: "Refinery controls are scanned to alter valve states or force pressure thresholds."
  },
  "Air Defense Systems": {
    alias: "Tactical airspace defense radar feeds",
    vector: "Radar signal mirror & coordinate sweeps",
    description: "Defense radars are scanned to tap target tracking lines or mirror coordinates."
  },
  "Water Command": {
    alias: "Municipal water filtration SCADA",
    vector: "SCADA valve & treatment overrides",
    description: "Water command SCADA is scanned to locate valve vulnerabilities and manipulate filtration."
  },
  "Defense": {
    alias: "Military command communications",
    vector: "BGP routing & database sweeps",
    description: "Defense systems are scanned to mirror communications or compromise strategic registries."
  },
  "Petrochemicals": {
    alias: "Refinery petrochemical valve grids",
    vector: "Pressure sensors overrides & emergency trips",
    description: "Refinery SCADA is scanned to tamper with valve pressures or trigger shutdowns."
  },
  "Nuclear Facility": {
    alias: "Nuclear turbine & centrifuge SCADA",
    vector: "Spindle speed manipulate & safety trips",
    description: "Centrifuges are targeted to override safety limits and trigger turbine shutdowns."
  },
  "Energy Grid": {
    alias: "Civic power transmission mainframes",
    vector: "OT relay overrides & substation trips",
    description: "Energy grids are scanned to compromise transmission relays and force blackouts."
  },
  "Water Control (PLC)": {
    alias: "Municipal water treatment PLC valves",
    vector: "SCADA mixing & valve state overrides",
    description: "Water treatment PLCs are scanned to target remote chemical mixers or valve configurations."
  },
  "Oil/Centrifuge Refineries": {
    alias: "Refinery fuel flow & centrifuge SCADA",
    vector: "OT flow override & spindle speed sweeps",
    description: "Refineries are scanned to override pressure controls or tamper with safety thresholds."
  },
  "Aviation Routing": {
    alias: "Aviation target & coordinate databases",
    vector: "Signal mirroring & radar feed scans",
    description: "Aviation routing systems are scanned to mirror flight coordinates or delay tracking feeds."
  },
  "Port Management Logs": {
    alias: "Port cargo terminal dispatch logs",
    vector: "Database SQL injection & schedule overrides",
    description: "Cargo databases are scanned to manipulate shipping logs or freeze schedules."
  },
  "Vulnerable Infrastructures": {
    alias: "Vulnerable Civic Infrastructure Channels",
    vector: "Database queries & scanning probes",
    description: "Civic networks are scanned for unpatched perimeters to map potential access paths."
  },
  "At-Risk Infrastructure Sectors": {
    alias: "At-Risk Infrastructure Sectors",
    vector: "Database queries & scanning probes",
    description: "Civic networks are scanned for unpatched perimeters to map potential access paths."
  },
  "Retail Portals": {
    alias: "Commercial E-Commerce transactions",
    vector: "Database credential stuffing sweeps",
    description: "Retail databases are probed to compromise user profiles or transaction histories."
  },
  "Personal Finance Sites": {
    alias: "Online banking & asset management portals",
    vector: "Credential stuffing & session sweeps",
    description: "Financial portals are scanned to harvest logins or siphon asset logs."
  }
};

const getInfraDef = (infraName) => {
  const cleaned = infraName.trim();
  const match = INFRASTRUCTURE_DEFINITIONS[cleaned];
  if (match) return match;
  for (const key of Object.keys(INFRASTRUCTURE_DEFINITIONS)) {
    if (cleaned.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleaned.toLowerCase())) {
      return INFRASTRUCTURE_DEFINITIONS[key];
    }
  }
  return {
    alias: "Critical Infrastructure Sector",
    vector: "Network Vulnerability Scanner Probe",
    description: "This civic or military infrastructure is targeted by background port scanning to map pathways and locate unpatched perimeter gateways."
  };
};

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
  },
  "IN": {
    name: "India",
    summary: "India is observing increased port mapping and credential targeting campaigns against satellite networks and telecommunication hubs. Telemetry shows coordinated scans from regional proxy groups seeking access to logistics databases and maritime transport tracking services.",
    actors: ["Volt Typhoon", "APT41", "Lazarus Group"],
    sectors: ["Maritime Navigation", "Satellite Uplinks", "Telecom Switching Centers"],
    tactical: "Isolate SATCOM access routes. Block regional proxy IP segments. Audit logs for SQL injection beacons. Configure honeytoken traps on logistics databases."
  },
  "CA": {
    name: "Canada",
    summary: "Canada is detecting persistent attempts targeting public health data portals and defense research systems. Telemetry indicates automated brute-force scans seeking access to municipal grid services.",
    actors: ["Volt Typhoon", "APT28 (Fancy Bear)"],
    sectors: ["Public Health Systems", "Defense Research Mainframes"],
    tactical: "Enforce multi-factor authentication perimeters. Update software access logs. Isolate remote login networks."
  },
  "GL": {
    name: "Greenland",
    summary: "Greenland communication stations are observing automated scanning probing arctic research SATCOM uplinks.",
    actors: ["Volt Typhoon"],
    sectors: ["SATCOM Research Networks"],
    tactical: "Audit remote access credentials. Encrypt satellite log feeds. Configure strict traffic log limits."
  },
  "BR": {
    name: "Brazil",
    summary: "Brazil is monitoring elevated brute-force scanning volumes against financial transactions and logistics networks.",
    actors: ["Sandworm (APT44)", "MuddyWater"],
    sectors: ["Financial Routing Perimeters", "Industrial Ports"],
    tactical: "Deploy threat intelligence blocklists. Audit access query logs. Enable strict rate limits on financial APIs."
  },
  "AF": {
    name: "South Africa",
    summary: "South Africa is observing anomalous directory traversal scans targeting municipal routing infrastructures.",
    actors: ["Lazarus Group", "Charming Kitten"],
    sectors: ["Logistics Supply Networks", "Local Utilities"],
    tactical: "Isolate SCADA endpoints. Review egress proxy tunnels. Establish firewalls blocking scanning IPs."
  },
  "MG": {
    name: "Madagascar",
    summary: "Madagascar communications network reports baseline telemetry scanning on routing perimeters.",
    actors: ["Generic scanning groups"],
    sectors: ["Local Routing Infrastructure"],
    tactical: "Verify firewall log filters. Audit local connection rules. Enforce standard security patch schedules."
  },
  "NZ": {
    name: "New Zealand",
    summary: "New Zealand is monitoring baseline port mapping scans targeting agricultural logistics databases and maritime transport perimeters.",
    actors: ["Volt Typhoon"],
    sectors: ["Agricultural Logistics Databases", "Maritime Ports"],
    tactical: "Deploy high-priority IP blocklists. Update VPN tunnel configurations. Monitor database transactions."
  }
};

const AIBriefing = React.memo(function AIBriefing({ metrics, analysis, selectedCountry, packets = [] }) {
  
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

    return {
      title: "GLOBAL CYBER GEOPOLITICAL BREIFING & ANOMALY ANALYSIS",
      summary: globalSummary,
      actors: analysis ? analysis.primary_actors : ["Unknown"],
      sectors: analysis ? analysis.critical_sectors : ["None"],
      tactical: analysis ? analysis.tactical_assessment : "Establish connection to synchronize firewall metrics."
    };
  }, [selectedCountry, analysis]);

  // Compute country-specific analytics if selected
  const analytics = useMemo(() => {
    if (!packets || packets.length === 0 || !selectedCountry) return null;
    const inbound = packets.filter(p => p.dest === selectedCountry);
    const outbound = packets.filter(p => p.src === selectedCountry);
    const portCounts = {};
    inbound.forEach(p => { portCounts[p.port] = (portCounts[p.port] || 0) + 1; });
    const topPorts = Object.entries(portCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const attackerCounts = {};
    inbound.forEach(p => { attackerCounts[p.src] = (attackerCounts[p.src] || 0) + 1; });
    const topAttackers = Object.entries(attackerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return { inboundCount: inbound.length, outboundCount: outbound.length, topPorts, topAttackers };
  }, [packets, selectedCountry]);

  return (
    <div className="bg-[#0a0a0f] border border-white-trans-10 rounded-xl pad-md shadow-2xl relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--neon-purple)] opacity-[0.02] rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white-trans-5 pad-bottom-sm">
        <h3 className="text-small font-extrabold text-slate-400 tracking-wider flex items-center gap-xs font-sans uppercase">
          <Cpu className="w-icon-sm text-[var(--neon-cyan)] animate-pulse" />
          {activeContent.title || (selectedCountry ? `INTELLIGENCE BRIEFING: ${selectedCountry} REGION` : "GLOBAL CYBER GEOPOLITICAL BREIFING & ANOMALY ANALYSIS")}
        </h3>
      </div>

      {/* Analytics Row for Selected Country */}
      {selectedCountry && analytics && (
        <div className="flex gap-md mt-4 mb-2 border-b border-white-trans-5 pb-4">
          <div className="flex-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Inbound Vol</span>
            <span className="text-lg font-bold text-[var(--neon-orange)]">{analytics.inboundCount}</span>
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Outbound Vol</span>
            <span className="text-lg font-bold text-[var(--neon-cyan)]">{analytics.outboundCount}</span>
          </div>
          <div className="flex-2 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Vulnerable Ports</span>
            {analytics.topPorts.length > 0 ? analytics.topPorts.map(([p, c], i) => (
              <div key={i} className="text-xs flex justify-between"><span className="text-[var(--neon-orange)]">Port {p}</span><span className="text-slate-500">{c} hits</span></div>
            )) : <span className="text-xs text-slate-600 italic">None</span>}
          </div>
          <div className="flex-2 flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Top Origins</span>
            {analytics.topAttackers.length > 0 ? analytics.topAttackers.map(([s, c], i) => (
              <div key={i} className="text-xs flex justify-between"><span className="text-slate-300">{s}</span><span className="text-slate-500">{c} pkts</span></div>
            )) : <span className="text-xs text-slate-600 italic">None</span>}
          </div>
        </div>
      )}

      {/* Grid Layout: Wide-Pane 3 Column layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-md items-start mt-4">
        
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
              {activeContent.actors.map((actor, idx) => {
                const def = getActorDef(actor);
                return (
                  <div key={idx} className="actor-badge-container">
                    <span className="cyber-badge cyber-badge-red text-tiny pad-x-xs pad-y-xs cursor-help" style={{ borderRadius: '4px' }}>
                      {actor}
                    </span>
                    <div className="actor-tooltip">
                      <div className="actor-tooltip-title">{def.alias}</div>
                      <div className="actor-tooltip-origin">ORIGIN: <span style={{ color: '#fff' }}>{def.origin}</span></div>
                      <p className="actor-tooltip-desc">{def.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Sectors */}
          <div className="flex flex-col gap-xs border-t border-white-trans-5 pad-top-sm">
            <span className="text-tiny text-slate-500 font-mono font-extrabold uppercase tracking-wider">
              {selectedCountry ? "Vulnerable Infrastructures" : "At-Risk Infrastructure Sectors"}
            </span>
            <div className="flex flex-wrap gap-xs margin-top-xs">
              {activeContent.sectors.map((sec, idx) => {
                const def = getInfraDef(sec);
                return (
                  <div key={idx} className="infra-badge-container">
                    <span className="cyber-badge cyber-badge-orange text-tiny pad-x-xs pad-y-xs cursor-help" style={{ borderRadius: '4px' }}>
                      {sec}
                    </span>
                    <div className="infra-tooltip">
                      <div className="infra-tooltip-title">{def.alias}</div>
                      <div className="infra-tooltip-vector">VECTOR: <span style={{ color: '#fff' }}>{def.vector}</span></div>
                      <p className="infra-tooltip-desc">{def.description}</p>
                    </div>
                  </div>
                );
              })}
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
})

export default AIBriefing;

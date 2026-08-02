import random
import time
import requests
from datetime import datetime
from typing import Dict, List, Any

# ISO Codes mapping for display
COUNTRIES = {
    "US": "United States",
    "RU": "Russia",
    "CN": "China",
    "UA": "Ukraine",
    "IL": "Israel",
    "IR": "Iran",
    "PH": "Philippines",
    "VN": "Vietnam",
    "TW": "Taiwan",
    "PL": "Poland",
    "GB": "United Kingdom",
    "DE": "Germany",
    "KP": "North Korea",
    "KR": "South Korea",
    "IN": "India",
    "CA": "Canada",
    "GL": "Greenland",
    "BR": "Brazil",
    "AF": "South Africa",
    "MG": "Madagascar",
    "NZ": "New Zealand",
}

# Country mappings for GDELT news title parsing
KEYWORD_MAPPINGS = {
    "us": "US", "usa": "US", "america": "US", "washington": "US",
    "russia": "RU", "russian": "RU", "moscow": "RU",
    "china": "CN", "chinese": "CN", "beijing": "CN",
    "ukraine": "UA", "ukrainian": "UA", "kyiv": "UA",
    "israel": "IL", "israeli": "IL", "tel aviv": "IL",
    "iran": "IR", "iranian": "IR", "tehran": "IR",
    "india": "IN", "indian": "IN", "delhi": "IN",
    "philippines": "PH", "filipino": "PH", "manila": "PH",
    "vietnam": "VN", "vietnamese": "VN", "hanoi": "VN",
    "taiwan": "TW", "taipei": "TW",
    "poland": "PL", "polish": "PL", "warsaw": "PL",
    "united kingdom": "GB", "uk": "GB", "british": "GB", "london": "GB",
    "germany": "DE", "german": "DE", "berlin": "DE",
    "north korea": "KP", "pyongyang": "KP", "dprk": "KP",
    "south korea": "KR", "seoul": "KR",
    "canada": "CA", "canadian": "CA",
    "greenland": "GL",
    "brazil": "BR", "brazilian": "BR",
    "south africa": "AF",
    "madagascar": "MG",
    "new zealand": "NZ"
}

SCENARIOS = {
    "standard": {
        "name": "Standard Background Noise",
        "description": "Routine automated global scanning, low-level malware and botnets.",
        "attacks": [
            {"src": "US", "dest": "CN", "ports": [22, 443], "industries": ["E-Commerce", "Finance"], "types": ["Credential Stuffing", "SQL Injection"]},
            {"src": "RU", "dest": "DE", "ports": [80, 8080], "industries": ["Education", "Logistics"], "types": ["Automated SCADA scan probe", "Directory traversal exploit check"]}
        ],
        "headlines": ["Global threat landscape within baseline margins."]
    },
    "eastern_europe": {
        "name": "Eastern Europe Escalation",
        "description": "State-sponsored cyber offensive targeting infrastructure in Ukraine, Poland, and Baltic states.",
        "attacks": [
            {"src": "RU", "dest": "UA", "ports": [502, 102], "industries": ["Energy Grid", "Telecom"], "types": ["Wiper Payload", "OT Port Scan"]},
            {"src": "RU", "dest": "PL", "ports": [22, 443], "industries": ["Government", "Logistics"], "types": ["Spear Phishing", "DDoS volumetric flood stream"]},
            {"src": "RU", "dest": "US", "ports": [80, 8080], "industries": ["Defense", "Finance"], "types": ["Credential Stuffing", "Database SQL injection attempt"]}
        ],
        "headlines": [
            "Energy ministry reports critical infrastructure cyber-intrusions",
            "Sovereign data networks target of persistent state-backed wiper threat"
        ]
    },
    "south_china_sea": {
        "name": "South China Sea Conflict",
        "description": "Cyber reconnaissance and infrastructure scans in maritime zones.",
        "attacks": [
            {"src": "CN", "dest": "PH", "ports": [4840, 102], "industries": ["Maritime Ports", "Telecom"], "types": ["Automated SCADA scan probe", "Encrypted command-and-control beacon"]},
            {"src": "CN", "dest": "VN", "ports": [443, 8080], "industries": ["Defense", "Government"], "types": ["Database SQL injection attempt", "Automated SCADA scan probe"]},
            {"src": "CN", "dest": "IN", "ports": [4840, 8080], "industries": ["Maritime Ports", "Telecom"], "types": ["Automated SCADA scan probe", "Encrypted command-and-control beacon"]},
            {"src": "CN", "dest": "US", "ports": [22, 3389], "industries": ["Naval Systems", "Aviation"], "types": ["Spear Phishing", "Database SQL injection attempt"]}
        ],
        "headlines": [
            "Defense agencies warn of systemic attacks against port logistics systems",
            "Naval communication infrastructure hit by sophisticated malware"
        ]
    },
    "middle_east": {
        "name": "Middle East Offensive",
        "description": "High-intensity cyber exchange targeting oil refineries and defense command units.",
        "attacks": [
            {"src": "IR", "dest": "IL", "ports": [502, 22], "industries": ["Water Command", "Defense"], "types": ["DDoS volumetric flood stream", "Automated SCADA scan probe"]},
            {"src": "IL", "dest": "IR", "ports": [4840, 80], "industries": ["Petrochemicals", "Nuclear Facility"], "types": ["Database SQL injection attempt", "Directory traversal exploit check"]},
            {"src": "IR", "dest": "US", "ports": [443, 8080], "industries": ["Defense", "Energy Grid"], "types": ["DDoS volumetric flood stream", "Spear Phishing"]}
        ],
        "headlines": [
            "Petrochemical facilities report emergency system shut-downs",
            "Cyber command issues red alert over regional supervisory control networks"
        ]
    },
    "enterprise": {
        "name": "Enterprise (Real Logs)",
        "description": "Live ingestion of external security logs via API.",
        "attacks": [],
        "headlines": [
            "Enterprise logging mode activated",
            "Awaiting external SIEM payload injection"
        ]
    }
}

ATTACK_TYPES = ["DDoS volumetric flood stream", "Credential Stuffing", "Database SQL injection attempt", "Wiper Payload", "Automated SCADA scan probe", "Spear Phishing", "Encrypted command-and-control beacon"]
INDUSTRIES = ["Finance", "Healthcare", "E-Commerce", "Government", "Logistics", "Energy Grid", "Defense", "Education"]
PORTS = [80, 443, 22, 8080, 3389, 502, 102, 4840]

class CYWARSimulator:
    def __init__(self):
        self.current_scenario = "standard"
        self.attack_history = []
        self.max_history_len = 1000
        self.ingestion_queue = []
        self.live_articles = []
        self.last_gdelt_fetch_time = 0
        self.current_headline = "Awaiting first live GDELT stream handshake..."
        self.current_sentiment = 0.05
        self.fetch_gdelt_feed()

    def set_scenario(self, scenario_id: str):
        if scenario_id in SCENARIOS:
            self.current_scenario = scenario_id
            self.fetch_gdelt_feed()
            return True
        return False

    def fetch_gdelt_feed(self):
        """Fetches real-time geopolitical and cyber news from Google News RSS to avoid GDELT rate limits"""
        query_map = {
            "standard": 'cyberattack OR cybersecurity',
            "eastern_europe": '(russia OR ukraine OR poland) AND (cyberattack OR cyberwarfare OR hacker OR military)',
            "south_china_sea": '(china OR philippines OR vietnam OR taiwan) AND (cyberattack OR cyberwarfare OR hacker OR military)',
            "middle_east": '(iran OR israel) AND (cyberattack OR cyberwarfare OR hacker OR military)',
            "enterprise": 'cyberattack OR cybersecurity'
        }
        
        query = query_map.get(self.current_scenario, query_map["standard"])
        try:
            import urllib.parse
            import xml.etree.ElementTree as ET
            url = f'https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=en-US&gl=US&ceid=US:en'
            res = requests.get(url, timeout=6)
            if res.ok:
                root = ET.fromstring(res.text)
                items = root.findall('.//item')
                articles = []
                for item in items:
                    title_full = item.find('title').text if item.find('title') is not None else ""
                    if ' - ' in title_full:
                        title = ' - '.join(title_full.split(' - ')[:-1])
                        source = title_full.split(' - ')[-1]
                    else:
                        title = title_full
                        source = "Google News"
                    link = item.find('link').text if item.find('link') is not None else "#"
                    
                    articles.append({
                        "title": title,
                        "source": source,
                        "url": link
                    })
                    if len(articles) >= 15:
                        break
                
                if articles:
                    self.live_articles = articles
                    self.last_gdelt_fetch_time = time.time()
                    print(f"[News Engine] Fetched {len(articles)} real articles for scenario: {self.current_scenario}")
                    return
        except Exception as e:
            print(f"[News Engine Warning] Failed to reach Google News RSS API: {e}. Utilizing internal mock data feeds.")
        
        # Local mock articles if API is down
        mocks = {
            "standard": [
                {"title": "Global cyber telemetry reports low-intensity baseline scanning across corporate networks.", "source": "Cyber Sentinel Feed", "url": "https://news.google.com/search?q=corporate+network+cyberattack+breach"},
                {"title": "Security analysts identify new automated botnet targeting vulnerable IoT routers.", "source": "Infosec Wire", "url": "https://news.google.com/search?q=IoT+botnet+router+malware+cyberattack"},
                {"title": "Ransomware groups target corporate software supply chains with phishing campaigns.", "source": "Threat Ledger", "url": "https://news.google.com/search?q=software+supply+chain+ransomware+phishing"},
                {"title": "Global cloud hosting providers implement updated volumetric DDoS defenses.", "source": "NetSec Global", "url": "https://news.google.com/search?q=cloud+hosting+DDoS+attack"},
                {"title": "Threat intelligence networks report routine port scanning on enterprise gateway firewalls.", "source": "Security Brief", "url": "https://news.google.com/search?q=enterprise+firewall+cyberattack+port+scanning"}
            ],
            "eastern_europe": [
                {"title": "Cybersecurity alerts issued as critical energy routers in Ukraine report wiper malware probes.", "source": "Kiev Intel Dispatch", "url": "https://news.google.com/search?q=Ukraine+energy+cyberattack+wiper+malware"},
                {"title": "Security agencies warn of advanced phishing vectors targeting logistic nodes in Poland.", "source": "Warsaw Security Journal", "url": "https://news.google.com/search?q=Poland+logistics+cyberattack+phishing"},
                {"title": "State-backed threat groups coordinate volumetric DDoS floods against Baltic defense mainframes.", "source": "EuroDef Observer", "url": "https://news.google.com/search?q=Baltic+states+DDoS+cyberattack"},
                {"title": "Energy grids in Eastern Europe configure OT ports to counter malicious firmware scans.", "source": "GridSec Weekly", "url": "https://news.google.com/search?q=Eastern+Europe+energy+grid+cyberattack+OT"},
                {"title": "Defense officials track massive coordinated reconnaissance campaigns on tactical servers.", "source": "Tactical Intel", "url": "https://news.google.com/search?q=military+tactical+server+cyberattack+reconnaissance"}
            ],
            "south_china_sea": [
                {"title": "Maritime logistics hubs in the Philippines report automated SCADA scans on routing perimeters.", "source": "Manila Tech Gazette", "url": "https://news.google.com/search?q=Philippines+maritime+SCADA+cyberattack"},
                {"title": "Naval command servers identify beacon attempts communicating with contested IP blocks.", "source": "Maritime Signal", "url": "https://news.google.com/search?q=naval+command+cyberattack"},
                {"title": "Port authorities in South China Sea detect critical satellite link intrusions.", "source": "Pacific Threat Map", "url": "https://news.google.com/search?q=South+China+Sea+cyberattack+satellite"},
                {"title": "Geopolitical tensions increase as deep-sea telemetry networks observe coordinated port sweeps.", "source": "Aviation & Ocean Intel", "url": "https://news.google.com/search?q=deep+sea+cable+cyberattack"},
                {"title": "Military communications grids enhance logging to segment persistent cyber probes.", "source": "Defense Perimeter Daily", "url": "https://news.google.com/search?q=military+communications+cyberattack"}
            ],
            "middle_east": [
                {"title": "Water command systems in Israel detect volumetric port floods originating from proxy nodes.", "source": "Tel Aviv Cyber News", "url": "https://news.google.com/search?q=Israel+water+infrastructure+cyberattack"},
                {"title": "Petrochemical mainframes in Iran experience automatic emergency failsafes after port sweeps.", "source": "Tehran Technology Review", "url": "https://news.google.com/search?q=Iran+petrochemical+cyberattack"},
                {"title": "Regional cyber alert issued over database perimeter intrusions in Levant region.", "source": "Levant Threat Desk", "url": "https://news.google.com/search?q=Middle+East+database+cyberattack"},
                {"title": "Tactical mainframes filter targeted SQL commands on critical defense servers.", "source": "Military NetSec", "url": "https://news.google.com/search?q=military+defense+server+cyberattack+SQL"},
                {"title": "Geopolitical threat intelligence teams warn of retaliatory wiper activity in the region.", "source": "Mideast Analyst Group", "url": "https://news.google.com/search?q=Middle+East+wiper+malware+cyberattack"}
            ]
        }
        self.live_articles = mocks.get(self.current_scenario, mocks["standard"])
        self.last_gdelt_fetch_time = time.time()

    def extract_countries(self, title: str) -> List[str]:
        """Parses article titles to identify which countries are named"""
        title_lower = title.lower()
        matched = []
        for kw, code in KEYWORD_MAPPINGS.items():
            if kw in title_lower:
                if code not in matched:
                    matched.append(code)
        return matched

    def generate_event(self) -> Dict[str, Any]:
        scenario = SCENARIOS[self.current_scenario]
        
        # In Enterprise mode, we consume from the ingestion queue instead of synthesizing
        if self.current_scenario == "enterprise":
            if len(self.ingestion_queue) > 0:
                event = self.ingestion_queue.pop(0)
                self.attack_history.append(event)
                if len(self.attack_history) > self.max_history_len:
                    self.attack_history = self.attack_history[-self.max_history_len:]
                return event
            return None

        # Re-fetch news every 120 seconds
        if not self.live_articles or (time.time() - self.last_gdelt_fetch_time > 120):
            self.fetch_gdelt_feed()

        # Try to pull headline from GDELT article feed
        headline = None
        src = None
        dest = None
        
        if self.live_articles:
            article = random.choice(self.live_articles)
            headline = article.get("title", "")
            self.current_headline = headline
            
            # Try to map packet flow endpoints dynamically from the headline text
            matched = self.extract_countries(headline)
            if len(matched) >= 2:
                src = matched[0]
                dest = matched[1]
            elif len(matched) == 1:
                src = matched[0]
                # Pick a random other target node
                active_codes = list(COUNTRIES.keys())
                dest = random.choice(active_codes)
                while dest == src:
                    dest = random.choice(active_codes)
        
        # Fallback to templates if GDELT returned nothing or no country could be parsed
        if not src or not dest:
            is_scenario_attack = self.current_scenario != "standard" and random.random() < 0.7
            if is_scenario_attack:
                campaign = random.choice(scenario["attacks"])
                src = campaign["src"]
                dest = campaign["dest"]
            else:
                src = random.choice(list(COUNTRIES.keys()))
                dest = random.choice(list(COUNTRIES.keys()))
                while dest == src:
                    dest = random.choice(list(COUNTRIES.keys()))

        # If GDELT API is down, use template headline fallbacks
        if not headline:
            headline = random.choice(scenario["headlines"])
            self.current_headline = headline

        # Set packet parameters
        port = random.choice(PORTS)
        industry = random.choice(INDUSTRIES)
        attack_type = random.choice(ATTACK_TYPES)
        severity = random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        
        event = {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "src": src,
            "src_name": COUNTRIES.get(src, "Unknown"),
            "dest": dest,
            "dest_name": COUNTRIES.get(dest, "Unknown"),
            "port": port,
            "industry": industry,
            "type": attack_type,
            "severity": severity,
            "scenario": self.current_scenario
        }
        
        self.attack_history.append(event)
        if len(self.attack_history) > self.max_history_len:
            self.attack_history.pop(0)
            
        return event

    def get_anomaly_metrics(self) -> Dict[str, Any]:
        """Calculates volume metrics and includes the live GDELT news feed headline"""
        scenario = SCENARIOS[self.current_scenario]
        
        # Determine anomaly Z-scores based on scenario type
        if self.current_scenario == "standard":
            z_score = random.uniform(0.1, 1.4)
            anomaly_detected = False
            sentiment = 0.05
        else:
            z_score = random.uniform(2.8, 4.5)
            anomaly_detected = True
            sentiment = random.uniform(-0.85, -0.55)
            
        risk_score = 15 if not anomaly_detected else int(z_score * 20 + abs(sentiment) * 10)
        risk_score = min(98, max(5, risk_score))
        
        return {
            "scenario_name": scenario["name"],
            "scenario_desc": scenario["description"],
            "z_score": round(z_score, 2),
            "anomaly_detected": anomaly_detected,
            "news_headline": self.current_headline,
            "sentiment_score": round(sentiment, 2),
            "risk_score": risk_score
        }

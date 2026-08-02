import time
import requests
from datetime import datetime
from typing import Dict, List, Any
from osint_feed import OSINTFeed
from llm_extractor import LLMExtractor

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
            ]
    }
}

ATTACK_TYPES = ["DDoS volumetric flood stream", "Credential Stuffing", "Database SQL injection attempt", "Wiper Payload", "Automated SCADA scan probe", "Spear Phishing", "Encrypted command-and-control beacon"]
INDUSTRIES = ["Finance", "Healthcare", "E-Commerce", "Government", "Logistics", "Energy Grid", "Defense", "Education"]
PORTS = [80, 443, 22, 8080, 3389, 502, 102, 4840]

class CYWARSimulator:
    def __init__(self):
        self.attack_history = []
        self.max_history_len = 1000
        self.current_scenario = "standard"
        self.live_articles = []
        self.last_gdelt_fetch_time = 0
        self.current_headline = "Awaiting live telemetry..."
        self.dynamic_hotspots = []
        
        self.osint_feed = OSINTFeed()
        self.llm_extractor = LLMExtractor()
        self.fetch_gdelt_feed()

    def set_scenario(self, scenario_id: str):
        self.current_scenario = scenario_id
        return True

    def fetch_gdelt_feed(self):
        """Fetches real-time world news from Google News RSS and discovers hotspots"""
        query = 'cyberattack OR cybersecurity OR geopolitics OR cyberwarfare'
        
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
                    if len(articles) >= 40:
                        break
                
                if articles:
                    self.live_articles = articles
                    self.last_gdelt_fetch_time = time.time()
                    print(f"[News Engine] Fetched {len(articles)} real world articles.")
                    
                    # Discover hotspots
                    hotspots = self.llm_extractor.discover_hotspots([a["title"] for a in articles])
                    if hotspots:
                        self.dynamic_hotspots = hotspots
                        print(f"[News Engine] Discovered hotspots: {hotspots}")
                    return
        except Exception as e:
            print(f"[News Engine Warning] Failed to reach Google News RSS API: {e}. Operating with no live news data.")
        
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
        
        # Re-fetch news every 120 seconds
        if not self.live_articles or (time.time() - self.last_gdelt_fetch_time > 120):
            self.fetch_gdelt_feed()

        # In standard mode, rely purely on DShield real-time OSINT
        if self.current_scenario == "standard":
            event = self.osint_feed.get_real_background_event(list(COUNTRIES.keys()))
            if event:
                event["src_name"] = COUNTRIES.get(event["src"], "Unknown")
                event["dest_name"] = COUNTRIES.get(event["dest"], "Unknown")
                
                self.attack_history.append(event)
                if len(self.attack_history) > self.max_history_len:
                    self.attack_history = self.attack_history[-self.max_history_len:]
                
                if self.live_articles:
                    article = self.live_articles.pop(0)
                    self.live_articles.append(article)
                    self.current_headline = article.get("title", "")
                
                return event
            else:
                # If OSINT fails or rate limits, don't generate fake packets
                return None
                
        # In Geopolitical mode, rely purely on LLM extracting from real news
        if self.live_articles:
            # We don't want purely random, we'll iterate or pop
            article = self.live_articles.pop(0)
            self.live_articles.append(article) # Rotate
            headline = article.get("title", "")
            self.current_headline = headline
            
            # Get the current hotspot name
            hotspot_name = None
            for hs in self.dynamic_hotspots:
                if hs.get("id") == self.current_scenario:
                    hotspot_name = hs.get("name")
                    break
            
            # Extract exact attack from news
            extracted = self.llm_extractor.extract_attack_from_news(headline, COUNTRIES, hotspot_name)
            if extracted:
                event = {
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                    "src": extracted["src"],
                    "src_name": COUNTRIES.get(extracted["src"], "Unknown"),
                    "dest": extracted["dest"],
                    "dest_name": COUNTRIES.get(extracted["dest"], "Unknown"),
                    "port": int(extracted.get("port", 443)),
                    "industry": extracted.get("industry", "Infrastructure"),
                    "type": extracted.get("type", "Advanced Persistent Threat"),
                    "severity": extracted.get("severity", "HIGH"),
                    "political_context": extracted.get("political_context", ""),
                    "threat_actor": extracted.get("threat_actor", "Unknown State Actor"),
                    "scenario": self.current_scenario
                }
                
                self.attack_history.append(event)
                if len(self.attack_history) > self.max_history_len:
                    self.attack_history = self.attack_history[-self.max_history_len:]
                
                return event
                
        # If no LLM output or no news, we DO NOT generate fake attacks.
        return None

    def get_anomaly_metrics(self) -> Dict[str, Any]:
        """Calculates deterministic volume metrics based on live attack history and hotspots."""
        scenario_name = "Global Monitor"
        scenario_desc = "Baseline telemetry active."
        
        for hs in self.dynamic_hotspots:
            if hs.get("id") == self.current_scenario:
                scenario_name = hs.get("name")
                scenario_desc = f"Tracking intelligence on {scenario_name}"
                break
                
        # Deterministic Z-score based on volume of history
        # Base expected attacks ~5 per tick. If we have more in history, anomaly rises.
        current_volume = len(self.attack_history)
        
        if current_volume < 10:
            z_score = 0.5 + (current_volume / 20.0)
            anomaly_detected = False
            sentiment = 0.05
        else:
            z_score = 2.5 + min(2.0, (current_volume - 10) / 40.0)
            anomaly_detected = True
            sentiment = max(-1.0, -0.5 - ((current_volume - 10) / 100.0))
            
        risk_score = 15 if not anomaly_detected else int(z_score * 20 + abs(sentiment) * 10)
        risk_score = min(98, max(5, risk_score))
        
        return {
            "scenario_name": scenario_name,
            "scenario_desc": scenario_desc,
            "z_score": round(z_score, 2),
            "anomaly_detected": anomaly_detected,
            "news_headline": self.current_headline,
            "sentiment_score": round(sentiment, 2),
            "risk_score": risk_score
        }

import random
import time
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

SCENARIOS = {
    "standard": {
        "name": "Standard Background Noise",
        "description": "Routine automated global scanning, low-level malware and botnets.",
        "targets": []
    },
    "eastern_europe": {
        "name": "Eastern Europe Escalation",
        "description": "State-sponsored cyber offensive targeting infrastructure in Ukraine, Poland, and Baltic states.",
        "attacks": [
            {"src": "RU", "dest": "UA", "ports": [502, 102], "industries": ["Energy Grid", "Telecom"], "types": ["Wiper Malware", "OT Port Scan"]},
            {"src": "RU", "dest": "PL", "ports": [22, 443], "industries": ["Government", "Logistics"], "types": ["Spear Phishing", "DDoS"]},
            {"src": "RU", "dest": "US", "ports": [80, 8080], "industries": ["Defense", "Finance"], "types": ["Credential Stuffing", "APT Penetration"]}
        ],
        "headlines": [
            "Tensions flare along the border as diplomatic talks break down",
            "Energy ministry reports critical infrastructure cyber-intrusions",
            "Joint military exercises initiated in eastern corridors",
            "Sovereign data networks target of persistent state-backed wiper threat"
        ]
    },
    "south_china_sea": {
        "name": "South China Sea Conflict",
        "description": "Cyber reconnaissance and infrastructure scans in maritime zones.",
        "attacks": [
            {"src": "CN", "dest": "PH", "ports": [4840, 102], "industries": ["Maritime Ports", "Telecom"], "types": ["ICS/SCADA Scan", "C2 Beaconing"]},
            {"src": "CN", "dest": "VN", "ports": [443, 8080], "industries": ["Defense", "Government"], "types": ["Database Exploitation", "Espionage Scan"]},
            {"src": "CN", "dest": "IN", "ports": [4840, 8080], "industries": ["Maritime Ports", "Telecom"], "types": ["ICS/SCADA Scan", "C2 Beaconing"]},
            {"src": "CN", "dest": "US", "ports": [22, 3389], "industries": ["Naval Systems", "Aviation"], "types": ["Phishing", "Active Penetration"]}
        ],
        "headlines": [
            "Maritime surveillance ships report standoff over contested reef",
            "Defense agencies warn of systemic attacks against port logistics systems",
            "Bilateral maritime treaty negotiations suspended indefinitely",
            "Naval communication infrastructure hit by sophisticated malware"
        ]
    },
    "middle_east": {
        "name": "Middle East Offensive",
        "description": "High-intensity cyber exchange targeting oil refineries and defense command units.",
        "attacks": [
            {"src": "IR", "dest": "IL", "ports": [502, 22], "industries": ["Water Command", "Defense"], "types": ["PLC Exploitation", "DDoS"]},
            {"src": "IL", "dest": "IR", "ports": [4840, 80], "industries": ["Petrochemicals", "Nuclear Facility"], "types": ["Industrial Sabotage", "Zero-day Payload"]},
            {"src": "IR", "dest": "US", "ports": [443, 8080], "industries": ["Defense", "Energy Grid"], "types": ["Ransomware Injection", "Spear Phishing"]}
        ],
        "headlines": [
            "Petrochemical facilities report emergency system shut-downs",
            "Air defense installations undergo simulated cyber-readiness drilling",
            "Cyber command issues red alert over regional supervisory control networks",
            "Bilateral threats exchanged after central centrifuge command facility anomaly"
        ]
    }
}

ATTACK_TYPES = ["DDoS Stream", "Credential Stuffing", "SQL Injection", "Wiper Payload", "ICS/SCADA Scan", "Spear Phishing", "Ransomware"]
INDUSTRIES = ["Finance", "Healthcare", "E-Commerce", "Government", "Logistics", "Energy Grid", "Defense", "Education"]
PORTS = [80, 443, 22, 8080, 3389, 502, 102, 4840]

class CYWARSimulator:
    def __init__(self):
        self.current_scenario = "standard"
        self.attack_history = []
        self.max_history_len = 1000
        
    def set_scenario(self, scenario_id: str):
        if scenario_id in SCENARIOS:
            self.current_scenario = scenario_id
            return True
        return False
        
    def generate_event(self) -> Dict[str, Any]:
        scenario = SCENARIOS[self.current_scenario]
        
        # Determine if attack comes from scenario or background noise
        is_scenario_attack = self.current_scenario != "standard" and random.random() < 0.7
        
        if is_scenario_attack:
            # Generate coordinated campaign attack
            campaign = random.choice(scenario["attacks"])
            src = campaign["src"]
            dest = campaign["dest"]
            port = random.choice(campaign["ports"])
            industry = random.choice(campaign["industries"])
            attack_type = random.choice(campaign["types"])
            severity = random.choice(["HIGH", "CRITICAL"])
        else:
            # Generate random background noise
            src = random.choice(list(COUNTRIES.keys()))
            dest = random.choice(list(COUNTRIES.keys()))
            while dest == src:
                dest = random.choice(list(COUNTRIES.keys()))
            port = random.choice(PORTS)
            industry = random.choice(INDUSTRIES)
            attack_type = random.choice(ATTACK_TYPES)
            severity = random.choice(["LOW", "MEDIUM", "HIGH"])
            
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
        """Calculates volume and computes a mock anomaly Z-score based on scenario"""
        scenario = SCENARIOS[self.current_scenario]
        
        # Calculate recent volume spikes
        if self.current_scenario == "standard":
            z_score = random.uniform(0.1, 1.4)
            anomaly_detected = False
            news_headline = "Global cyber threats remain within standard seasonal baselines."
            sentiment = 0.05 # neutral
        else:
            z_score = random.uniform(2.8, 4.5)
            anomaly_detected = True
            news_headline = random.choice(scenario["headlines"])
            sentiment = random.uniform(-0.9, -0.65) # highly negative
            
        risk_score = 15 if not anomaly_detected else int(z_score * 20 + abs(sentiment) * 10)
        risk_score = min(98, max(5, risk_score)) # Keep within 5-98 range
        
        return {
            "scenario_name": scenario["name"],
            "scenario_desc": scenario["description"],
            "z_score": round(z_score, 2),
            "anomaly_detected": anomaly_detected,
            "news_headline": news_headline,
            "sentiment_score": round(sentiment, 2),
            "risk_score": risk_score
        }

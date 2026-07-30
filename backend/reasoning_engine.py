import os
import json
import random
from typing import Dict, Any, List

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except (ImportError, TypeError) as e:
    GENAI_AVAILABLE = False
    print(f"[REASONER WARNING] Google Generative AI library is unavailable: {e}. Running in high-fidelity offline briefing mode.")

# Default local/offline templates if Gemini API Key is missing or invalid
LOCAL_BRIEFINGS = {
    "standard": {
        "summary": "Global threat landscape is operating within normal parameters. Low-level scanning is predominantly automated, relating to botnets and search engine crawlers. No significant nation-state targeting shifts detected.",
        "primary_actors": ["Distributed Botnets", "Script Kiddies"],
        "critical_sectors": ["Retail", "Personal Finance"],
        "tactical_assessment": "Standard patch management and hygiene controls are sufficient to mitigate current activities."
    },
    "eastern_europe": {
        "summary": "CRITICAL RISK: Cyber operations indicate an imminent kinetic coordination window. Industrial control system scanning targeting Ukrainian power transmission grids (ports 502/102) has spiked by 340%. Auxiliary spear-phishing campaigns are active against Polish logistics networks, suggesting cyber disruption of supply paths prior to physical military mobilization.",
        "primary_actors": ["APT28 (Fancy Bear / GRU)", "Sandworm Group"],
        "critical_sectors": ["Electrical Transmission", "Military Logistics", "Border Control Systems"],
        "tactical_assessment": "Deploy endpoint isolation protocols. Block external traffic on SCADA ports 502/102. Initiate backup communication protocols for logistics coordinators."
    },
    "south_china_sea": {
        "summary": "ELEVATED RISK: Active maritime cyber reconnaissance campaign detected. Target systems are predominantly SCADA and port management logs in the Philippines and naval communication routes in the Pacific. Increased control-and-command beaconing implies pre-positioning activities inside shipping logistics mainframes.",
        "primary_actors": ["APT41 (Double Dragon)", "Volt Typhoon"],
        "critical_sectors": ["Maritime Shipping", "Port Command Systems", "Aviation Routing"],
        "tactical_assessment": "Audit maritime database access logs. Quarantine suspicious beaconing IPs routing through proxy routers. Verify security postures of regional shipping suppliers."
    },
    "middle_east": {
        "summary": "CRITICAL RISK: Direct nation-state cyber warfare exchange active. Severe PLC/SCADA scans against water distribution nodes in Israel combined with retaliatory OT disruption codes targeting Iranian petrochemical centrifuges. High probability of physical retaliation if operations result in environmental or public health impacts.",
        "primary_actors": ["APT34 (Helix Kitten)", "MuddyWater", "Mossad Cyber Unit (Implied)"],
        "critical_sectors": ["Water Control (PLC)", "Oil/Centrifuge Refineries", "Air Defense Systems"],
        "tactical_assessment": "Sever connection between external internet networks and public SCADA systems. Validate integrity of firmware versions on regional PLCs."
    }
}

class CYWARReasoner:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key and GENAI_AVAILABLE:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                self.api_active = True
            except Exception as e:
                print(f"[REASONER WARNING] Gemini initialization failed: {e}")
                self.api_active = False
        else:
            self.api_active = False

    def analyze(self, scenario_id: str, metrics: Dict[str, Any], recent_attacks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Provides geopolitical briefing and risk breakdown for the UI"""
        # Attempt to use Gemini if API Key is configured and available
        if self.api_active and GENAI_AVAILABLE:
            try:
                # Prepare a structured prompt for JSON output
                prompt = f"""
                You are a Senior Cyber-Geopolitical Analyst at a defense command cell.
                You are analyzing a sudden anomaly in cyber attack patterns.
                
                Scenario Context: {metrics['scenario_name']} - {metrics['scenario_desc']}
                Z-Score Cyber Anomaly Metric: {metrics['z_score']} (Anything > 2.5 is high risk)
                Latest News Headline: "{metrics['news_headline']}"
                Bilateral News Sentiment: {metrics['sentiment_score']} (Scale -1.0 very hostile, 1.0 very friendly)
                Recent Cyber Telemetry Sample: {json.dumps(recent_attacks[:15])}
                
                Provide a structured JSON output with the following fields:
                1. "summary": A concise 3-4 sentence professional briefing outlining what this cyber surge implies about upcoming physical/geopolitical conflicts. Connect the cyber targeting to the news events.
                2. "primary_actors": List of 2-3 suspected state-sponsored threat actors (APTs) or collectives associated with these signatures.
                3. "critical_sectors": Top 3 sectors under immediate threat.
                4. "tactical_assessment": 1-2 actionable defense countermeasures to recommend.
                
                Format the response strictly as valid JSON, with no markdown wrappers or formatting besides the raw JSON.
                """
                
                response = self.model.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                
                result = json.loads(response.text)
                return result
            except Exception as e:
                # Fallback to local briefing on API failure
                print(f"[REASONER WARNING] Gemini API call failed: {e}. Falling back to ruleset.")
                pass
                
        # Return pre-written local briefs matching scenarios
        return LOCAL_BRIEFINGS.get(scenario_id, LOCAL_BRIEFINGS["standard"])

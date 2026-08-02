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

# Plain-English briefings for non-technical audiences
LOCAL_BRIEFINGS = {
    "standard": {
        "summary": "The global internet is currently experiencing normal, everyday background noise. This is comparable to a burglar checking if windows on a house are locked, mostly carried out by automated computers looking for minor entry points. There is no evidence of coordinated nation-state campaigns or physical threat spikes. No emergency measures are required.",
        "primary_actors": ["Distributed Botnets", "Automated Scanners"],
        "critical_sectors": ["Retail Portals", "Personal Finance Sites"],
        "tactical_assessment": "Maintain standard password updates and regular software security patches."
    },
    "eastern_europe": {
        "summary": "CRITICAL ALERT: Coordinated cyber attacks are targeting public infrastructure in Ukraine, likely in preparation for physical military moves. State-sponsored hackers are probing electrical grids to trigger civilian blackouts and disable public communication channels. We strongly advise energy suppliers to disconnect grid control mainframes from the internet to isolate operations and prevent power outages.",
        "primary_actors": ["Sandworm (APT44)", "APT28 (Fancy Bear)"],
        "critical_sectors": ["Civilian Electricity Grids", "Logistics Channels", "Border Communications"],
        "tactical_assessment": "Disconnect power grid controls from public internet servers and verify backup generator readiness."
    },
    "south_china_sea": {
        "summary": "ELEVATED RISK: Hacking groups are conducting virtual scouting operations targeting maritime shipping routes and port logistics databases in the Philippines and Pacific region. They are secretly positioning access routes to monitor cargo manifests. This digital pre-positioning suggests attempts to disrupt trade supply chains during diplomatic standoffs.",
        "primary_actors": ["Volt Typhoon", "APT41 (Double Dragon)"],
        "critical_sectors": ["Cargo Shipping Routes", "Port Management Logs", "Civil Air Traffic Command"],
        "tactical_assessment": "Audit cargo logistics databases for unauthorized login attempts and block suspicious foreign proxy IP networks."
    },
    "middle_east": {
        "summary": "CRITICAL ALERT: Active cyber exchanges are occurring between regional military command networks, directly targeting civilian water supplies and oil production facilities. Hackers are trying to hijack digital valves to disrupt services. Because these systems control physical resources, these cyber operations carry a high risk of triggering physical military responses.",
        "primary_actors": ["MuddyWater (APT33)", "Regional Cyber Units"],
        "critical_sectors": ["Public Water Distribution", "Oil Refineries", "Air Defense Systems"],
        "tactical_assessment": "Isolate public water valve controls from external web access and verify local backup valves."
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
        """Provides a plain-English geopolitical briefing and risk breakdown for the UI"""
        # Attempt to use Gemini if API Key is configured and available
        if self.api_active and GENAI_AVAILABLE:
            try:
                # Prepare a structured prompt for JSON output targeting a non-technical audience
                prompt = f"""
                You are a Senior Cyber-Geopolitical Analyst at a defense command cell.
                You are writing an intelligence summary for a non-technical audience (such as government officials or business leaders).
                Translate the raw cyber metrics, ports, and syslog data into a clear, plain-English narrative.
                
                Scenario Context: {metrics['scenario_name']} - {metrics['scenario_desc']}
                Z-Score Cyber Anomaly Metric: {metrics['z_score']} (Anything > 2.5 is high risk)
                Latest News Headline: "{metrics['news_headline']}"
                Bilateral News Sentiment: {metrics['sentiment_score']} (Scale -1.0 very hostile, 1.0 very friendly)
                Recent Cyber Telemetry Sample: {json.dumps(recent_attacks[:15])}
                
                Provide a structured JSON output with the following fields:
                1. "summary": A concise 3-4 sentence professional briefing in simple, non-technical English explaining what this cyber surge implies about upcoming physical/geopolitical conflicts. Connect the cyber targeting to the news events, using simple real-world analogies (e.g. explaining that port scanning is like checking if doors on a street are locked) and explaining the physical impact on cities, utilities, and citizens rather than using technical code jargon.
                2. "primary_actors": List of 2-3 suspected threat actors (APTs) or collectives.
                3. "critical_sectors": Top 3 sectors under immediate threat expressed in simple terms (e.g. "Public Power Grids", "Logistics Chains" instead of network terms).
                4. "tactical_assessment": 1-2 actionable, easy-to-understand defense recommendations.
                
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

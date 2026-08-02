import os
import json
from typing import Dict, Any, List

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except (ImportError, TypeError) as e:
    GENAI_AVAILABLE = False
    print(f"[REASONER WARNING] Google Generative AI library is unavailable: {e}. Running in high-fidelity offline briefing mode.")

# Offline deterministic fallback if AI is unreachable
LOCAL_BRIEFINGS = {
    "standard": {
        "summary": "System Offline or Insufficient Data. Awaiting live telemetry to generate geopolitical cyber assessment.",
        "primary_actors": ["Unknown"],
        "critical_sectors": ["Pending Data"],
        "tactical_assessment": "Ensure backend data streams and API connectivity are restored."
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
                Recent Cyber Telemetry Sample: {json.dumps(recent_attacks[:15]) if recent_attacks else "None - Awaiting new attack data."}
                
                Provide a structured JSON output with the following fields:
                1. "summary": A concise 3-4 sentence professional briefing in simple, non-technical English. If there are no recent attacks in the telemetry, provide a general AI summary of the region and what is happening based on the cyber threats and news headlines alone. Otherwise, connect the cyber targeting to the news events, explaining the physical impact on utilities and citizens.
                2. "primary_actors": List of 2-3 suspected threat actors (APTs) or collectives.
                3. "critical_sectors": Top 3 sectors under immediate threat expressed in simple terms.
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

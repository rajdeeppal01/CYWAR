import os
import json
import random

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except (ImportError, TypeError):
    GENAI_AVAILABLE = False

class LLMExtractor:
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if self.api_key and GENAI_AVAILABLE:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                self.api_active = True
            except Exception:
                self.api_active = False
        else:
            self.api_active = False

    def extract_attack_from_news(self, headline: str, valid_countries: dict) -> dict:
        """Uses Gemini to extract cyber attack parameters directly from a real news headline"""
        if not self.api_active or not GENAI_AVAILABLE:
            return None
            
        try:
            prompt = f"""
            You are a cyber threat intelligence extractor. 
            Analyze the following real-world news headline and extract the cyber attack indicators.
            
            Headline: "{headline}"
            
            Map the countries involved to their ISO-2 codes. Here are the valid ISO-2 codes you can use:
            {json.dumps(list(valid_countries.keys()))}
            
            Provide a strictly valid JSON response with these exact keys:
            - "src": The ISO-2 code of the attacking country (if unknown, guess based on context, or use "RU", "CN", "IR" for common state actors).
            - "dest": The ISO-2 code of the targeted country.
            - "type": A 3-5 word technical description of the attack vector mentioned (e.g., "Volumetric DDoS Flood", "Wiper Malware", "Spear Phishing").
            - "industry": The target industry (e.g., "Energy Grid", "Defense", "Telecom").
            - "port": A likely targeted port number based on the attack type (e.g., 80 for web, 22 for SSH, 502 for ICS/SCADA).
            - "severity": "MEDIUM", "HIGH", or "CRITICAL" based on the headline's urgency.
            
            Output MUST be just the JSON object.
            """
            
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            data = json.loads(response.text)
            
            # Validate output
            if data.get("src") not in valid_countries or data.get("dest") not in valid_countries:
                return None
                
            return data
            
        except Exception as e:
            print(f"[LLM Extractor] Failed to extract from news: {e}")
            return None

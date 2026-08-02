import requests
import random
import time
from datetime import datetime

# No longer mapping random ports, we will report unknown or general scanning if port is not provided.

class OSINTFeed:
    def __init__(self):
        self.dshield_ips = []
        self.last_fetch = 0
        self.ip_cache = {}

    def fetch_dshield_attackers(self):
        """Fetches top 100 attacking IPs from SANS ISC DShield API"""
        try:
            resp = requests.get('https://isc.sans.edu/api/sources/attacks/100?json', timeout=5)
            if resp.status_code == 200:
                self.dshield_ips = resp.json()
                self.last_fetch = time.time()
        except Exception as e:
            print(f"[OSINT] Failed to fetch DShield API: {e}")

    def geolocate_ip(self, ip: str) -> str:
        """Resolves IP to country code (ISO-2) using ip-api.com"""
        if ip in self.ip_cache:
            return self.ip_cache[ip]
            
        try:
            resp = requests.get(f'http://ip-api.com/json/{ip}?fields=countryCode', timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                cc = data.get("countryCode")
                if cc:
                    self.ip_cache[ip] = cc
                    return cc
        except Exception as e:
            pass
        return None

    def get_real_background_event(self, valid_countries: list) -> dict:
        """Pops a real attacker IP, geolocates it, and returns a verified packet"""
        if not self.dshield_ips or (time.time() - self.last_fetch > 3600):
            self.fetch_dshield_attackers()

        if not self.dshield_ips:
            return None

        # Pop an IP sequentially (or pick first and rotate) to avoid purely random selection
        # But random.choice from a deterministic list of 100 REAL active attackers is acceptable for sampling.
        # To completely remove random:
        attacker = self.dshield_ips.pop(0)
        self.dshield_ips.append(attacker) # Rotate it to the back
        ip = attacker.get("ip")
        attacks_count = attacker.get("attacks", 0)
        
        # Geolocate the real IP
        src_cc = self.geolocate_ip(ip)
        
        if not src_cc or src_cc not in valid_countries:
            return None

        # DShield doesn't provide the target for specific IPs in this endpoint.
        # User requested self-loops (pulsating on the source country) instead of fake destinations.
        dest_cc = src_cc

        port = "Unknown"
        attack_type = "Honeypot Network Scanning"
        
        severity = "CRITICAL" if attacks_count > 10000 else "HIGH" if attacks_count > 5000 else "MEDIUM" if attacks_count > 1000 else "LOW"

        return {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "src": src_cc,
            "dest": dest_cc,
            "port": port,
            "industry": "Global Honeypot Sensor",
            "type": f"Real IP: {ip} - {attack_type}",
            "severity": severity,
            "scenario": "standard"
        }

from simulator import CYWARSimulator
import time

def test_simulator():
    sim = CYWARSimulator()
    print("Testing standard mode (DShield)...")
    event1 = sim.generate_event()
    print("Standard event:", event1)
    
    print("\nTesting Eastern Europe mode (Gemini LLM)...")
    sim.set_scenario("eastern_europe")
    
    # Wait for the scenario to fetch news if it hasn't
    time.sleep(1)
    
    event2 = sim.generate_event()
    print("Eastern Europe event:", event2)
    
    print("\nTesting Enterprise mode...")
    sim.set_scenario("enterprise")
    sim.ingestion_queue.append({"src": "US", "dest": "RU", "type": "TEST", "severity": "HIGH", "port": 443, "industry": "Test", "timestamp": "12:00:00", "scenario": "enterprise"})
    event3 = sim.generate_event()
    print("Enterprise event:", event3)

if __name__ == "__main__":
    test_simulator()

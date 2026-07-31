import pytest
from simulator import CYWARSimulator, SCENARIOS, COUNTRIES

def test_simulator_init():
    sim = CYWARSimulator()
    assert sim.current_scenario == "standard"
    assert len(sim.attack_history) == 0

def test_set_scenario():
    sim = CYWARSimulator()
    
    # Check valid transition
    assert sim.set_scenario("eastern_europe") is True
    assert sim.current_scenario == "eastern_europe"
    
    # Check invalid transition
    assert sim.set_scenario("non_existent_scenario") is False
    assert sim.current_scenario == "eastern_europe"

def test_generate_event():
    sim = CYWARSimulator()
    
    # Generate background event
    event = sim.generate_event()
    
    assert isinstance(event, dict)
    assert "src" in event
    assert "dest" in event
    assert "port" in event
    assert "type" in event
    assert "severity" in event
    assert "timestamp" in event
    
    assert event["src"] in COUNTRIES
    assert event["dest"] in COUNTRIES
    assert event["src"] != event["dest"]

def test_anomaly_metrics():
    sim = CYWARSimulator()
    
    # Standard metrics
    sim.set_scenario("standard")
    metrics = sim.get_anomaly_metrics()
    assert metrics["anomaly_detected"] is False
    assert metrics["risk_score"] < 30
    
    # Escalated metrics
    sim.set_scenario("middle_east")
    metrics_esc = sim.get_anomaly_metrics()
    assert metrics_esc["anomaly_detected"] is True
    assert metrics_esc["risk_score"] > 50

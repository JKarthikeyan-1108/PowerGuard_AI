import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "powerguard" in data["service"]

def test_theft_prediction_normal(client):
    payload = {
        "meter_id": "MTR-NORM-01",
        "voltage": 230.0,
        "current": 10.0,
        "power": 2300.0,
        "energy": 500.0,
        "frequency": 50.0,
        "power_factor": 0.95,
        "timestamp": "2026-10-17T12:00:00Z"
    }
    response = client.post("/api/ai/theft", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["meter_id"] == "MTR-NORM-01"
    assert data["risk_level"] == "Normal"
    assert "confidence" in data
    assert "feature_importance" in data

def test_theft_prediction_tamper_anomaly(client):
    payload = {
        "meter_id": "MTR-ANOM-01",
        "voltage": 160.0,
        "current": 45.0,
        "power": 300.0,
        "energy": 10.0,
        "frequency": 47.0,
        "power_factor": 0.40,
        "timestamp": "2026-10-17T12:00:00Z"
    }
    response = client.post("/api/ai/theft", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["meter_id"] == "MTR-ANOM-01"
    assert data["risk_level"] in ["High Risk", "Suspicious", "CRITICAL"]
    assert data["risk_score"] < 0 or data["probability"] > 0.5
    assert "explanation" in data

def test_predict_endpoint_alias(client):
    payload = {
        "meter_id": "MTR-PRED-01",
        "voltage": 230.0,
        "current": 8.0,
        "power": 1840.0,
        "energy": 320.0,
        "frequency": 50.0,
        "power_factor": 0.94,
        "timestamp": "2026-10-17T12:00:00Z"
    }
    response = client.post("/api/ai/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["meter_id"] == "MTR-PRED-01"
    assert "anomaly_score" in data
    assert "is_anomaly" in data
    assert data["is_anomaly"] is False

def test_bill_prediction(client):
    payload = {
        "consumer_id": "CON-1001",
        "historical_usage": [250.0, 260.0, 245.0, 270.0],
        "tariff_rate": 5.5,
        "avg_temp": 28.0
    }
    response = client.post("/api/ai/bill", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["consumer_id"] == "CON-1001"
    assert data["current_bill"] > 0
    assert data["next_month_bill"] > 0

def test_demand_forecast(client):
    payload = {
        "area_id": "AREA-NORTH",
        "historical_demand": [1200.0, 1350.0, 1400.0, 1300.0, 1500.0]
    }
    response = client.post("/api/ai/forecast", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["area_id"] == "AREA-NORTH"
    assert "tomorrow" in data
    assert "peak_demand" in data

def test_consumer_clustering(client):
    payload = {
        "consumer_id": "CON-2002",
        "avg_daily_usage": 18.5,
        "peak_ratio": 0.35,
        "night_ratio": 0.20
    }
    response = client.post("/api/ai/cluster", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["consumer_id"] == "CON-2002"
    assert "cluster_name" in data
    assert "confidence" in data

def test_consumer_recommendations(client):
    response = client.get("/api/ai/recommendations/CON-3003?avg_daily_usage=22.0&peak_ratio=0.45&night_ratio=0.15")
    assert response.status_code == 200
    data = response.json()
    assert data["consumer_id"] == "CON-3003"
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) > 0

def test_model_inventory(client):
    response = client.get("/api/ai/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) >= 4

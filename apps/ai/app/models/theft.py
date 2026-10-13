import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os
import json
from datetime import datetime

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'trained_models'))
os.makedirs(MODEL_DIR, exist_ok=True)

class TheftModelSuite:
    def __init__(self, version="v1.0"):
        self.version = version
        self.if_model = None
        self.scaler = None
        self.metadata = None
        self._load_models()

    def _load_models(self):
        if_path = os.path.join(MODEL_DIR, f'isolation_forest_{self.version}.joblib')
        scaler_path = os.path.join(MODEL_DIR, f'scaler_{self.version}.joblib')
        meta_path = os.path.join(MODEL_DIR, 'model_metadata.json')

        if os.path.exists(if_path):
            try:
                self.if_model = joblib.load(if_path)
            except Exception as e:
                print(f"[TheftModelSuite] Could not load Isolation Forest: {e}")

        if os.path.exists(scaler_path):
            try:
                self.scaler = joblib.load(scaler_path)
            except Exception as e:
                print(f"[TheftModelSuite] Could not load Scaler: {e}")

        if os.path.exists(meta_path):
            try:
                with open(meta_path, 'r') as f:
                    self.metadata = json.load(f)
            except Exception as e:
                print(f"[TheftModelSuite] Could not load metadata: {e}")

    def predict(self, data: dict):
        voltage = float(data.get('voltage', 230.0))
        current = float(data.get('current', 10.0))
        power = float(data.get('power', voltage * current * 0.9))
        power_factor = float(data.get('power_factor', 0.92))
        frequency = float(data.get('frequency', 50.0))
        apparent_power = (voltage * current) / 1000.0

        now = datetime.utcnow()
        hour = now.hour + now.minute / 60.0
        hour_sin = np.sin(2 * np.pi * hour / 24.0)
        hour_cos = np.cos(2 * np.pi * hour / 24.0)

        feature_names = ['voltage', 'current', 'power', 'power_factor', 'frequency', 'apparent_power', 'hour_sin', 'hour_cos']
        X = np.array([[voltage, current, power, power_factor, frequency, apparent_power, hour_sin, hour_cos]])

        if self.scaler:
            X_scaled = self.scaler.transform(X)
        else:
            X_scaled = X

        if self.if_model:
            score = float(self.if_model.decision_function(X_scaled)[0])
        else:
            # Fallback distance scoring
            zI = abs(current - 10.0) / 6.0
            zV = abs(voltage - 230.0) / 10.0
            score = float(0.05 - (zI * 0.03 + zV * 0.02))

        # Risk level determination based on model threshold
        threshold = self.metadata.get('threshold', -0.015) if self.metadata else -0.015
        is_anomaly = score < threshold

        risk_level = "Normal"
        if score < -0.06:
            risk_level = "High Risk"
        elif score < threshold:
            risk_level = "Suspicious"

        # Diagnostic Explanation (Treating anomalies as investigation alerts, not proof of theft)
        if current < 0.25 and voltage >= 200:
            explanation = "Investigation Alert: Near-zero current recorded during active hours with nominal grid voltage. Potential meter shunt bypass or neutral tamper."
        elif power_factor < 0.65 and current > 1.0:
            explanation = "Investigation Alert: Abnormal power factor detected under active load. Potential unmetered inductive draw or phase displacement."
        elif current > 45.0:
            explanation = "Investigation Alert: Domestic service current limit exceeded. Potential unmetered load tapping or heavy industrial appliance fault."
        elif is_anomaly:
            explanation = "Investigation Alert: Multi-parameter reading diverged significantly from typical consumption baseline."
        else:
            explanation = "Consumption profile is within standard expected bounds."

        # Compute feature importance proxies from standard deviation
        feature_importance = {
            "current": round(float(abs(current - 10.0) / 20.0), 3),
            "apparent_power": round(float(apparent_power / 10.0), 3),
            "power_factor": round(float(abs(power_factor - 0.92) / 0.5), 3),
            "voltage": round(float(abs(voltage - 230.0) / 30.0), 3),
            "frequency": round(float(abs(frequency - 50.0) / 1.0), 3),
        }

        confidence = round(float(min(0.99, max(0.70, abs(score) * 4 + 0.75))), 3)

        return {
            "risk_score": round(score, 4),
            "risk_level": risk_level,
            "confidence": confidence,
            "probability": confidence if is_anomaly else round(1.0 - confidence, 3),
            "explanation": explanation,
            "feature_importance": feature_importance,
            "is_anomaly": is_anomaly,
            "model_version": self.version
        }

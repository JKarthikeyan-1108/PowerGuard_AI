import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'trained_models')
os.makedirs(MODEL_DIR, exist_ok=True)

class ConsumerClusteringModel:
    def __init__(self, version="v1.0"):
        self.version = version
        self.model = None
        self.scaler = None
        self._load_models()

    def _get_paths(self):
        return {
            'model': os.path.join(MODEL_DIR, f'model6_kmeans_{self.version}.joblib'),
            'scaler': os.path.join(MODEL_DIR, f'model6_scaler_{self.version}.joblib')
        }

    def _load_models(self):
        paths = self._get_paths()
        if os.path.exists(paths['model']):
            self.model = joblib.load(paths['model'])
            self.scaler = joblib.load(paths['scaler'])

    def train(self, df: pd.DataFrame):
        features = ['avg_daily_usage', 'peak_ratio', 'night_ratio']
        X = df[features]

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = KMeans(n_clusters=4, random_state=42, n_init=10)
        self.model.fit(X_scaled)

        paths = self._get_paths()
        joblib.dump(self.model, paths['model'])
        joblib.dump(self.scaler, paths['scaler'])
        print(f"Consumer Clustering Model (KMeans) version {self.version} trained and saved.")

    def predict(self, data: dict):
        if not self.model:
            raise ValueError("Model not loaded.")
        
        X = np.array([[
            data['avg_daily_usage'], data['peak_ratio'], data['night_ratio']
        ]])
        
        X_scaled = self.scaler.transform(X)
        cluster_id = int(self.model.predict(X_scaled)[0])
        
        # Mappings: 0=Efficient, 1=Normal, 2=Heavy, 3=Suspicious
        labels = {
            0: "Efficient Users",
            1: "Normal Users",
            2: "Heavy Users",
            3: "Suspicious Users"
        }
        
        distances = self.model.transform(X_scaled)
        distance = float(distances[0][cluster_id])
        confidence = max(0.0, 1.0 - (distance / 10.0)) # heuristic confidence

        return {
            "cluster_id": cluster_id,
            "cluster_name": labels.get(cluster_id, "Unknown"),
            "confidence": confidence
        }

class RecommendationEngine:
    def __init__(self):
        # Base recommendations tied to clusters
        self.rules = {
            0: [ # Efficient
                {"title": "Maintain Efficiency", "content": "You're doing great! Keep your current usage patterns.", "priority": 3, "expected_monthly_savings": 0.0, "co2_reduction": 0.0},
                {"title": "Go Solar", "content": "Eliminate your remaining bill by going solar.", "priority": 2, "expected_monthly_savings": 50.0, "co2_reduction": 100.0}
            ],
            1: [ # Normal
                {"title": "Peak Hour Optimization", "content": "Shift non-essential appliance use out of peak hours (6 PM - 9 PM).", "priority": 2, "expected_monthly_savings": 15.0, "co2_reduction": 20.0},
            ],
            2: [ # Heavy
                {"title": "Reduce AC Usage", "content": "Set your AC thermostat 2 degrees higher.", "priority": 1, "expected_monthly_savings": 45.0, "co2_reduction": 80.0},
                {"title": "Appliance Audit", "content": "Identify and replace old, energy-hungry appliances.", "priority": 2, "expected_monthly_savings": 30.0, "co2_reduction": 50.0}
            ],
            3: [ # Suspicious
                {"title": "Schedule Inspection", "content": "We noticed unusual patterns. Please schedule a meter inspection to ensure accurate billing.", "priority": 1, "expected_monthly_savings": 0.0, "co2_reduction": 0.0},
            ]
        }

    def generate(self, cluster_id: int):
        return self.rules.get(cluster_id, [])

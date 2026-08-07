import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(MODEL_DIR, exist_ok=True)

class ClusteringModel:
    def __init__(self, version="v1.0"):
        self.version = version
        self.model = None
        self.scaler = None
        self._load_models()

    def _get_model_paths(self):
        return {
            'model': os.path.join(MODEL_DIR, f'cluster_kmeans_{self.version}.joblib'),
            'scaler': os.path.join(MODEL_DIR, f'cluster_scaler_{self.version}.joblib')
        }

    def _load_models(self):
        paths = self._get_model_paths()
        if os.path.exists(paths['model']) and os.path.exists(paths['scaler']):
            self.model = joblib.load(paths['model'])
            self.scaler = joblib.load(paths['scaler'])
        else:
            print(f"Clustering Model version {self.version} not found. Please train first.")

    def train(self, df: pd.DataFrame, n_clusters=4):
        """
        Expects df with columns: ['avg_daily_usage', 'peak_usage_ratio', 'night_usage_ratio', 'weekend_usage_ratio']
        """
        features = ['avg_daily_usage', 'peak_usage_ratio', 'night_usage_ratio', 'weekend_usage_ratio']
        df = df.dropna(subset=features)
        X = df[features]

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
        self.model.fit(X_scaled)

        paths = self._get_model_paths()
        joblib.dump(self.model, paths['model'])
        joblib.dump(self.scaler, paths['scaler'])
        print(f"Clustering Model version {self.version} trained and saved.")

    def predict(self, features_dict: dict):
        if not self.model or not self.scaler:
            raise ValueError("Models are not loaded.")

        X = np.array([[
            features_dict.get('avg_daily_usage', 15.0),
            features_dict.get('peak_usage_ratio', 0.4),
            features_dict.get('night_usage_ratio', 0.2),
            features_dict.get('weekend_usage_ratio', 0.3)
        ]])

        X_scaled = self.scaler.transform(X)
        cluster = int(self.model.predict(X_scaled)[0])
        
        # Calculate distance to centroid as a proxy for confidence (lower distance = higher confidence)
        distances = self.model.transform(X_scaled)
        distance_to_centroid = float(distances[0][cluster])

        return {
            "cluster_id": cluster,
            "distance": round(distance_to_centroid, 4),
            "model_version": self.version
        }

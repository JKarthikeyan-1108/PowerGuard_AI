import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'trained_models')
os.makedirs(MODEL_DIR, exist_ok=True)

class BillPredictionModel:
    def __init__(self, version="v1.0"):
        self.version = version
        self.model = None
        self.scaler = None
        self._load_models()

    def _get_paths(self):
        return {
            'model': os.path.join(MODEL_DIR, f'model4_lr_{self.version}.joblib'),
            'scaler': os.path.join(MODEL_DIR, f'model4_scaler_{self.version}.joblib')
        }

    def _load_models(self):
        paths = self._get_paths()
        if os.path.exists(paths['model']):
            self.model = joblib.load(paths['model'])
            self.scaler = joblib.load(paths['scaler'])

    def train(self, df: pd.DataFrame):
        features = ['usage_m1', 'usage_m2', 'usage_m3', 'tariff_rate', 'avg_temp']
        X = df[features]
        # Targets: current_bill, next_month_bill, next_quarter_bill, annual_cost
        y = df[['current_bill', 'next_month', 'next_quarter', 'annual_cost']]

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = LinearRegression()
        self.model.fit(X_scaled, y)

        paths = self._get_paths()
        joblib.dump(self.model, paths['model'])
        joblib.dump(self.scaler, paths['scaler'])
        print(f"Bill Prediction Model (LR) version {self.version} trained and saved.")

    def predict(self, data: dict):
        if not self.model:
            raise ValueError("Model not loaded.")
        
        hist = data['historical_usage']
        # Pad or truncate historical to 3 months
        while len(hist) < 3:
            hist.insert(0, np.mean(hist) if hist else 100.0)
        hist = hist[-3:]

        X = np.array([[
            hist[0], hist[1], hist[2], 
            data['tariff_rate'], data['avg_temp']
        ]])
        
        X_scaled = self.scaler.transform(X)
        preds = self.model.predict(X_scaled)[0]

        return {
            "current_bill": max(0.0, float(preds[0])),
            "next_month_bill": max(0.0, float(preds[1])),
            "next_quarter_bill": max(0.0, float(preds[2])),
            "annual_cost": max(0.0, float(preds[3]))
        }

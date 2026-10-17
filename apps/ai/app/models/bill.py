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
        if os.path.exists(paths['model']) and os.path.exists(paths['scaler']):
            try:
                self.model = joblib.load(paths['model'])
                self.scaler = joblib.load(paths['scaler'])
                return
            except Exception as e:
                print(f"[BillPredictionModel] Could not load saved model: {e}")
        self._train_default()

    def _train_default(self):
        np.random.seed(42)
        n = 1000
        u1 = np.random.normal(280, 45, n).clip(50, 1000)
        u2 = np.random.normal(290, 50, n).clip(50, 1000)
        u3 = np.random.normal(300, 55, n).clip(50, 1000)
        tariff = np.random.uniform(4.0, 7.0, n)
        temp = np.random.normal(27, 4, n).clip(15, 45)

        cur_bill = u3 * tariff + (temp - 25).clip(0, None) * 20
        next_m = (u3 * 1.03) * tariff + (temp - 25).clip(0, None) * 22
        next_q = (u3 * 3.1) * tariff + (temp - 25).clip(0, None) * 60
        annual = (u3 * 12.2) * tariff

        df = pd.DataFrame({
            'usage_m1': u1, 'usage_m2': u2, 'usage_m3': u3,
            'tariff_rate': tariff, 'avg_temp': temp,
            'current_bill': cur_bill, 'next_month': next_m,
            'next_quarter': next_q, 'annual_cost': annual
        })
        self.train(df)

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

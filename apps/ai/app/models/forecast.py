import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'trained_models')
os.makedirs(MODEL_DIR, exist_ok=True)

class DemandForecastModel:
    def __init__(self, version="v1.0"):
        self.version = version
        self.model = None
        self.scaler = None
        self._load_models()

    def _get_paths(self):
        return {
            'model': os.path.join(MODEL_DIR, f'model5_forecast_{self.version}.joblib'),
            'scaler': os.path.join(MODEL_DIR, f'model5_scaler_{self.version}.joblib')
        }

    def _load_models(self):
        paths = self._get_paths()
        if os.path.exists(paths['model']) and os.path.exists(paths['scaler']):
            try:
                self.model = joblib.load(paths['model'])
                self.scaler = joblib.load(paths['scaler'])
                return
            except Exception as e:
                print(f"[DemandForecastModel] Could not load saved model: {e}")
        self._train_default()

    def _train_default(self):
        np.random.seed(42)
        n = 1000
        demand = np.sin(np.linspace(0, 50, n)) * 400 + 1500 + np.random.normal(0, 40, n)
        df = pd.DataFrame({'demand': demand})
        self.train(df)

    def train(self, df: pd.DataFrame):
        data = df['demand'].values
        window = 30
        horizon = 30
        X, y = [], []
        for i in range(len(data) - window - horizon):
            X.append(data[i:i+window])
            y.append(data[i+window:i+window+horizon])

        X = np.array(X)
        y = np.array(y)

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        self.model = Ridge(alpha=1.0)
        self.model.fit(X_scaled, y)

        paths = self._get_paths()
        joblib.dump(self.model, paths['model'])
        joblib.dump(self.scaler, paths['scaler'])
        print(f"Forecast Model (Ridge Autoregression) version {self.version} trained and saved.")

    def predict(self, data: dict):
        if not self.model:
            self._train_default()

        hist = list(data.get('historical_demand', []))
        window = 30
        while len(hist) < window:
            hist.insert(0, float(np.mean(hist)) if hist else 1000.0)
        hist = hist[-window:]

        X = np.array([hist])
        X_scaled = self.scaler.transform(X)
        preds = self.model.predict(X_scaled)[0]

        tomorrow = float(max(0.0, preds[0]))
        next_week = float(max(0.0, np.sum(preds[:7])))
        next_month = float(max(0.0, np.sum(preds[:30])))
        peak_demand = float(max(0.0, np.max(preds[:30])))

        recent_sum = float(np.sum(hist[-30:]))
        seasonal = "Upward Trend" if next_month > (recent_sum * 1.05) else ("Downward Trend" if next_month < (recent_sum * 0.95) else "Stable")

        return {
            "tomorrow": tomorrow,
            "next_week": next_week,
            "next_month": next_month,
            "peak_demand": peak_demand,
            "seasonal_trends": seasonal
        }

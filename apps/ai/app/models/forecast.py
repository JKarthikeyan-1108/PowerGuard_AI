import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
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
            'model': os.path.join(MODEL_DIR, f'model5_lstm_{self.version}.keras'),
            'scaler': os.path.join(MODEL_DIR, f'model5_scaler_{self.version}.joblib')
        }

    def _load_models(self):
        paths = self._get_paths()
        if os.path.exists(paths['model']):
            from tensorflow.keras.models import load_model
            import joblib
            self.model = load_model(paths['model'])
            self.scaler = joblib.load(paths['scaler'])

    def train(self, df: pd.DataFrame):
        import joblib
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense
        
        # Expecting a single continuous time series of daily demand
        data = df['demand'].values.reshape(-1, 1)
        self.scaler = MinMaxScaler()
        scaled_data = self.scaler.fit_transform(data)

        # Create sequences (e.g., past 30 days)
        window = 30
        X, y = [], []
        for i in range(len(scaled_data) - window - 30):
            X.append(scaled_data[i:i+window])
            # Predict next 30 days (for Tomorrow, Next Week, Next Month)
            y.append(scaled_data[i+window:i+window+30].flatten())
            
        X = np.array(X)
        y = np.array(y)

        self.model = Sequential([
            LSTM(50, activation='relu', input_shape=(window, 1)),
            Dense(30)
        ])
        self.model.compile(optimizer='adam', loss='mse')
        self.model.fit(X, y, epochs=10, batch_size=32, verbose=0)

        paths = self._get_paths()
        self.model.save(paths['model'])
        joblib.dump(self.scaler, paths['scaler'])
        print(f"Forecast Model (LSTM) version {self.version} trained and saved.")

    def predict(self, data: dict):
        if not self.model:
            raise ValueError("Model not loaded.")
        
        hist = data['historical_demand']
        window = 30
        while len(hist) < window:
            hist.insert(0, np.mean(hist) if hist else 1000.0)
        hist = hist[-window:]

        X = self.scaler.transform(np.array(hist).reshape(-1, 1))
        X = X.reshape(1, window, 1)

        preds_scaled = self.model.predict(X, verbose=0)
        preds = self.scaler.inverse_transform(preds_scaled)[0]

        tomorrow = float(preds[0])
        next_week = float(np.sum(preds[:7]))
        next_month = float(np.sum(preds[:30]))
        peak_demand = float(np.max(preds[:30]))
        
        seasonal = "Upward Trend" if next_month > (np.sum(hist) * 1.05) else "Stable"

        return {
            "tomorrow": tomorrow,
            "next_week": next_week,
            "next_month": next_month,
            "peak_demand": peak_demand,
            "seasonal_trends": seasonal
        }

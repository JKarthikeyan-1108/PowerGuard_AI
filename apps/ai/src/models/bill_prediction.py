import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(MODEL_DIR, exist_ok=True)

class BillPredictionModel:
    def __init__(self, version="v1.0"):
        self.version = version
        self.lr_model = None
        self.rf_model = None
        self.xgb_model = None
        self.scaler = None
        self._load_models()

    def _get_model_paths(self):
        return {
            'lr': os.path.join(MODEL_DIR, f'bill_lr_{self.version}.joblib'),
            'rf': os.path.join(MODEL_DIR, f'bill_rf_{self.version}.joblib'),
            'xgb': os.path.join(MODEL_DIR, f'bill_xgb_{self.version}.joblib'),
            'scaler': os.path.join(MODEL_DIR, f'bill_scaler_{self.version}.joblib')
        }

    def _load_models(self):
        paths = self._get_model_paths()
        if os.path.exists(paths['lr']) and os.path.exists(paths['rf']) and os.path.exists(paths['xgb']) and os.path.exists(paths['scaler']):
            self.lr_model = joblib.load(paths['lr'])
            self.rf_model = joblib.load(paths['rf'])
            self.xgb_model = xgb.XGBRegressor()
            self.xgb_model.load_model(paths['xgb'])
            self.scaler = joblib.load(paths['scaler'])
        else:
            print(f"Bill Prediction Models version {self.version} not found. Please train first.")

    def train(self, df: pd.DataFrame):
        """
        Expects df with columns: ['historical_usage', 'avg_temp', 'days_in_month', 'tariff_rate', 'actual_bill']
        """
        features = ['historical_usage', 'avg_temp', 'days_in_month', 'tariff_rate']
        
        df = df.dropna(subset=features + ['actual_bill'])
        X = df[features]
        y = df['actual_bill']

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Baseline Linear Regression
        self.lr_model = LinearRegression()
        self.lr_model.fit(X_scaled, y)

        # Random Forest Regressor
        self.rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.rf_model.fit(X_scaled, y)

        # Advanced XGBoost Regressor
        self.xgb_model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
        self.xgb_model.fit(X_scaled, y)

        # Save models
        paths = self._get_model_paths()
        joblib.dump(self.lr_model, paths['lr'])
        joblib.dump(self.rf_model, paths['rf'])
        self.xgb_model.save_model(paths['xgb'])
        joblib.dump(self.scaler, paths['scaler'])
        
        print(f"Bill Prediction Models version {self.version} trained and saved.")

    def predict(self, features_dict: dict):
        if not self.xgb_model or not self.scaler:
            raise ValueError("Models are not loaded.")

        X = np.array([[
            features_dict.get('historical_usage', 300.0),
            features_dict.get('avg_temp', 25.0),
            features_dict.get('days_in_month', 30),
            features_dict.get('tariff_rate', 5.0)
        ]])

        X_scaled = self.scaler.transform(X)
        
        predicted_bill_lr = float(self.lr_model.predict(X_scaled)[0])
        predicted_bill_rf = float(self.rf_model.predict(X_scaled)[0])
        predicted_bill_xgb = float(self.xgb_model.predict(X_scaled)[0])
        
        # Ensembling: weighting XGB and RF more
        final_prediction = (predicted_bill_lr * 0.1) + (predicted_bill_rf * 0.3) + (predicted_bill_xgb * 0.6)

        # Dummy confidence based on model variance (just for illustration)
        variance = abs(predicted_bill_lr - predicted_bill_xgb)
        confidence = max(0.0, 1.0 - (variance / max(1.0, final_prediction)))

        return {
            "predicted_amount": round(final_prediction, 2),
            "predicted_usage": round(final_prediction / max(0.1, features_dict.get('tariff_rate', 5.0)), 2),
            "confidence": round(confidence, 4),
            "model_version": self.version
        }

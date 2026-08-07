import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import shap
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'saved_models')
os.makedirs(MODEL_DIR, exist_ok=True)

class TheftDetectionModel:
    def __init__(self, version="v1.0"):
        self.version = version
        self.if_model = None
        self.rf_model = None
        self.scaler = None
        self.explainer = None
        self._load_models()

    def _get_model_paths(self):
        return {
            'if': os.path.join(MODEL_DIR, f'theft_if_{self.version}.joblib'),
            'rf': os.path.join(MODEL_DIR, f'theft_rf_{self.version}.joblib'),
            'scaler': os.path.join(MODEL_DIR, f'theft_scaler_{self.version}.joblib')
        }

    def _load_models(self):
        paths = self._get_model_paths()
        if os.path.exists(paths['if']) and os.path.exists(paths['rf']) and os.path.exists(paths['scaler']):
            self.if_model = joblib.load(paths['if'])
            self.rf_model = joblib.load(paths['rf'])
            self.scaler = joblib.load(paths['scaler'])
            
            # Setup SHAP explainer for Random Forest
            self.explainer = shap.TreeExplainer(self.rf_model)
        else:
            print(f"Models for version {self.version} not found. Please train first.")

    def train(self, df: pd.DataFrame):
        """
        Expects df with columns: ['voltage', 'current', 'power_factor', 'frequency', 'value', 'is_theft']
        """
        features = ['voltage', 'current', 'power_factor', 'frequency', 'value']
        
        # Drop missing
        df = df.dropna(subset=features)
        
        X = df[features]
        y = df['is_theft'] if 'is_theft' in df.columns else np.zeros(len(df))

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # 1. Isolation Forest for unsupervised anomaly detection
        self.if_model = IsolationForest(contamination=0.05, random_state=42)
        self.if_model.fit(X_scaled)

        # 2. Random Forest for supervised/semi-supervised theft classification
        self.rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
        # If no actual labels exist, we could train RF on IF's predictions for explainability
        if y.sum() == 0:
            y_pseudo = (self.if_model.predict(X_scaled) == -1).astype(int)
            self.rf_model.fit(X_scaled, y_pseudo)
        else:
            self.rf_model.fit(X_scaled, y)

        self.explainer = shap.TreeExplainer(self.rf_model)

        # Save models
        paths = self._get_model_paths()
        joblib.dump(self.if_model, paths['if'])
        joblib.dump(self.rf_model, paths['rf'])
        joblib.dump(self.scaler, paths['scaler'])
        
        print(f"Theft Detection Models version {self.version} trained and saved.")

    def predict(self, features_dict: dict):
        if not self.rf_model or not self.scaler:
            raise ValueError("Models are not loaded.")

        feature_names = ['voltage', 'current', 'power_factor', 'frequency', 'value']
        # Fill defaults if missing
        X = np.array([[
            features_dict.get('voltage', 230.0),
            features_dict.get('current', 10.0),
            features_dict.get('power_factor', 0.95),
            features_dict.get('frequency', 50.0),
            features_dict.get('value', 2.0)
        ]])

        X_scaled = self.scaler.transform(X)
        
        # Random forest probability
        prob = self.rf_model.predict_proba(X_scaled)[0][1]
        is_anomaly = self.if_model.predict(X_scaled)[0] == -1

        # SHAP Explainability
        shap_values = self.explainer.shap_values(X_scaled)
        
        # Handle SHAP output for binary classification
        if isinstance(shap_values, list):
            sv = shap_values[1][0]  # Values for the positive class
        else:
            if len(shap_values.shape) == 3:
                sv = shap_values[0, :, 1]
            else:
                sv = shap_values[0]

        feature_importance = {name: float(val) for name, val in zip(feature_names, sv)}

        risk_level = "LOW"
        if prob > 0.8: risk_level = "CRITICAL"
        elif prob > 0.6: risk_level = "HIGH"
        elif prob > 0.4: risk_level = "MODERATE"

        return {
            "probability": float(prob),
            "is_anomaly": bool(is_anomaly),
            "risk_level": risk_level,
            "confidence_score": float(np.max(self.rf_model.predict_proba(X_scaled))),
            "feature_importance": feature_importance,
            "model_version": self.version
        }

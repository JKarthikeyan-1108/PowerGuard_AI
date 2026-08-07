import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
import xgboost as xgb
import shap
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'trained_models')
os.makedirs(MODEL_DIR, exist_ok=True)

class TheftModelSuite:
    def __init__(self, version="v1.0"):
        self.version = version
        self.if_model = None
        self.rf_model = None
        self.xgb_model = None
        self.explainer = None
        self._load_models()

    def _get_paths(self):
        return {
            'if': os.path.join(MODEL_DIR, f'model1_if_{self.version}.joblib'),
            'rf': os.path.join(MODEL_DIR, f'model2_rf_{self.version}.joblib'),
            'xgb': os.path.join(MODEL_DIR, f'model3_xgb_{self.version}.json')
        }

    def _load_models(self):
        paths = self._get_paths()
        if os.path.exists(paths['if']):
            self.if_model = joblib.load(paths['if'])
        if os.path.exists(paths['rf']):
            self.rf_model = joblib.load(paths['rf'])
        if os.path.exists(paths['xgb']):
            self.xgb_model = xgb.XGBClassifier()
            self.xgb_model.load_model(paths['xgb'])
            # Create SHAP explainer for XGBoost
            self.explainer = shap.TreeExplainer(self.xgb_model)

    def train(self, df: pd.DataFrame):
        """
        Features: Voltage, Current, Power, Energy, Frequency, Power Factor
        Labels for RF/XGB: 0=Normal, 1=Meter Fault, 2=Meter Tampering, 3=Electricity Theft, 4=Temporary Overload
        """
        features = ['voltage', 'current', 'power', 'energy', 'frequency', 'power_factor']
        X = df[features]
        
        # Model 1: Isolation Forest (Unsupervised)
        self.if_model = IsolationForest(contamination=0.05, random_state=42)
        self.if_model.fit(X)

        # Generate pseudo-labels if actual labels are missing
        y = df['label'] if 'label' in df.columns else np.random.choice([0,1,2,3,4], size=len(df), p=[0.8, 0.05, 0.05, 0.05, 0.05])
        
        # Model 2: Random Forest
        self.rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.rf_model.fit(X, y)

        # Model 3: XGBoost
        self.xgb_model = xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
        self.xgb_model.fit(X, y)

        self.explainer = shap.TreeExplainer(self.xgb_model)

        paths = self._get_paths()
        joblib.dump(self.if_model, paths['if'])
        joblib.dump(self.rf_model, paths['rf'])
        self.xgb_model.save_model(paths['xgb'])
        print(f"Theft Models (IF, RF, XGB) version {self.version} trained and saved.")

    def predict(self, data: dict):
        if not self.if_model or not self.xgb_model:
            raise ValueError("Models not loaded.")
        
        X = np.array([[
            data['voltage'], data['current'], data['power'], 
            data['energy'], data['frequency'], data['power_factor']
        ]])
        
        # Model 1: IF Risk Score
        if_score = float(self.if_model.decision_function(X)[0])
        risk_level = "Normal"
        if if_score < -0.1: risk_level = "High Risk"
        elif if_score < 0: risk_level = "Suspicious"

        # Model 3: XGBoost Prediction (improves on RF)
        xgb_probs = self.xgb_model.predict_proba(X)[0]
        class_idx = int(np.argmax(xgb_probs))
        confidence = float(xgb_probs[class_idx])
        
        classes = ["Normal", "Meter Fault", "Meter Tampering", "Electricity Theft", "Temporary Overload"]
        explanation = classes[class_idx]
        
        # SHAP Feature Importance
        feature_names = ['voltage', 'current', 'power', 'energy', 'frequency', 'power_factor']
        shap_values = self.explainer.shap_values(X)
        
        if isinstance(shap_values, list):
            sv = shap_values[class_idx][0]
        else:
            if len(shap_values.shape) == 3:
                sv = shap_values[0, :, class_idx]
            else:
                sv = shap_values[0]

        feature_importance = {name: float(val) for name, val in zip(feature_names, sv)}

        return {
            "risk_score": if_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "probability": confidence,
            "explanation": explanation,
            "feature_importance": feature_importance
        }

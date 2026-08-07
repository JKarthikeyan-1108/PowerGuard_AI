"""Theft Detection Service — Hybrid Isolation Forest + Random Forest pipeline."""

import numpy as np
import logging
from app.services.model_manager import model_manager

logger = logging.getLogger("powerguard-ai")


def detect_theft(readings: list[float], historical_avg: float = 0, meter_type: str = "RESIDENTIAL") -> dict:
    """
    Run hybrid theft detection pipeline:
    1. Feature engineering from raw readings
    2. Isolation Forest anomaly scoring
    3. Random Forest classification
    4. Combined risk assessment
    """
    readings_arr = np.array(readings)

    # ── Feature Engineering ───────────────────────
    mean_consumption = float(np.mean(readings_arr))
    std_consumption = float(np.std(readings_arr))
    max_consumption = float(np.max(readings_arr))
    min_consumption = float(np.min(readings_arr))
    
    # Ratio features
    if historical_avg > 0:
        consumption_ratio = mean_consumption / historical_avg
    else:
        # Use type-based defaults
        defaults = {"RESIDENTIAL": 2.0, "COMMERCIAL": 12.0, "INDUSTRIAL": 50.0}
        consumption_ratio = mean_consumption / defaults.get(meter_type, 2.0)
    
    # Pattern features
    diff = np.diff(readings_arr)
    volatility = float(np.std(diff)) if len(diff) > 0 else 0
    
    features = np.array([[
        mean_consumption, std_consumption, max_consumption,
        min_consumption, consumption_ratio, volatility
    ]])

    # ── Isolation Forest — Anomaly Detection ──────
    iso_model = model_manager.get("isolation_forest")
    anomaly_label = iso_model.predict(features)[0]  # -1 = anomaly, 1 = normal
    anomaly_score = float(-iso_model.score_samples(features)[0])  # Higher = more anomalous

    # ── Random Forest — Classification ────────────
    rf_model = model_manager.get("random_forest")
    # Extend features for RF (needs 8 features)
    rf_features = np.array([[
        mean_consumption, std_consumption, max_consumption, min_consumption,
        consumption_ratio, volatility, 
        float(np.median(readings_arr)),
        float(np.percentile(readings_arr, 25))
    ]])
    rf_proba = float(rf_model.predict_proba(rf_features)[0][1])

    # ── XGBoost — Classification ──────────────────
    xgb_model = model_manager.get("xgboost")
    xgb_proba = float(xgb_model.predict_proba(rf_features)[0][1])

    # ── Combined Risk Score ───────────────────────
    # Weighted combination: 30% IF anomaly score + 35% RF probability + 35% XGB probability
    combined_score = 0.3 * min(anomaly_score / 0.5, 1.0) + 0.35 * rf_proba + 0.35 * xgb_proba
    combined_score = min(max(combined_score, 0.0), 1.0)

    # Determine risk level
    if combined_score >= 0.8:
        risk_level = "CRITICAL"
    elif combined_score >= 0.6:
        risk_level = "HIGH"
    elif combined_score >= 0.3:
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"

    # Generate flags
    flags = {}
    if consumption_ratio < 0.4:
        flags["sudden_drop"] = True
    if volatility > 2.0:
        flags["high_volatility"] = True
    if anomaly_label == -1:
        flags["isolation_forest_anomaly"] = True
    if rf_proba > 0.7:
        flags["rf_high_confidence"] = True
    if xgb_proba > 0.7:
        flags["xgboost_high_confidence"] = True
    if std_consumption < 0.1 and mean_consumption > 0.5:
        flags["suspiciously_constant"] = True

    return {
        "theft_probability": round(combined_score, 4),
        "risk_level": risk_level,
        "anomaly_score": round(anomaly_score, 4),
        "rf_probability": round(rf_proba, 4),
        "xgb_probability": round(xgb_proba, 4),
        "is_anomaly": anomaly_label == -1,
        "flags": flags,
        "model_version": "v2.2.0",
        "confidence": round(1.0 - abs(combined_score - 0.5) * 0.3, 4),
        "features": {
            "mean": round(mean_consumption, 3),
            "std": round(std_consumption, 3),
            "ratio": round(consumption_ratio, 3),
            "volatility": round(volatility, 3),
        }
    }

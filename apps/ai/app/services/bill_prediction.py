"""Bill Prediction Service — Linear Regression with seasonal features."""

import numpy as np
from app.services.model_manager import model_manager


def predict_bill(historical_usage: list[float], tariff_rate: float = 5.0, connection_type: str = "RESIDENTIAL") -> dict:
    """Predict next month's bill based on historical usage patterns."""
    usage_arr = np.array(historical_usage)
    
    # Feature engineering
    n = len(usage_arr)
    trend = np.polyfit(range(n), usage_arr, 1)[0]  # Linear trend
    seasonal_idx = n % 12  # Month position
    mean_usage = float(np.mean(usage_arr))
    recent_avg = float(np.mean(usage_arr[-3:])) if n >= 3 else mean_usage

    # Use model for prediction
    model = model_manager.get("linear_regression")
    features = np.array([[recent_avg, trend, seasonal_idx, mean_usage]])
    predicted_raw = float(model.predict(features)[0])
    
    # Adjust to be realistic (based on recent usage pattern)
    predicted_usage = max(predicted_raw * (recent_avg / 50.0), recent_avg * 0.85)
    predicted_usage = min(predicted_usage, recent_avg * 1.3)  # Cap at 30% increase

    # Calculate bill
    predicted_amount = predicted_usage * tariff_rate

    # Breakdown by time-of-use (simulated)
    breakdown = {
        "base_charge": round(tariff_rate * 2, 2),
        "peak_usage": round(predicted_amount * 0.35, 2),
        "off_peak_usage": round(predicted_amount * 0.45, 2),
        "mid_peak_usage": round(predicted_amount * 0.15, 2),
        "taxes_fees": round(predicted_amount * 0.05, 2),
    }

    return {
        "predicted_usage": round(predicted_usage, 2),
        "predicted_amount": round(predicted_amount, 2),
        "confidence": round(min(0.65 + n * 0.025, 0.95), 4),
        "breakdown": breakdown,
        "model_version": "v1.3.0",
        "trend": "increasing" if trend > 0.5 else "decreasing" if trend < -0.5 else "stable",
    }

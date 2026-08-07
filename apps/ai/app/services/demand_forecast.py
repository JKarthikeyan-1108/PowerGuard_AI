"""Demand Forecasting Service — Statistical forecasting with trend decomposition."""

import numpy as np
from datetime import datetime, timedelta


def forecast_demand(historical_demand: list[float], forecast_days: int = 7, area_id: str = "") -> dict:
    """Forecast future energy demand using statistical methods."""
    demand_arr = np.array(historical_demand)
    n = len(demand_arr)
    
    # Trend component (linear)
    x = np.arange(n)
    coeffs = np.polyfit(x, demand_arr, 1)
    trend_slope = coeffs[0]
    
    # Seasonality (weekly pattern if enough data)
    seasonal = np.zeros(7)
    if n >= 14:
        for i in range(n):
            seasonal[i % 7] += demand_arr[i]
        seasonal = seasonal / (n / 7)
        seasonal = seasonal / np.mean(seasonal)  # Normalize
    else:
        seasonal = np.ones(7)
    
    # Noise estimation
    residuals = demand_arr - (coeffs[0] * x + coeffs[1])
    noise_std = float(np.std(residuals))
    
    # Generate forecasts
    forecasts = []
    base_date = datetime.now()
    
    for d in range(forecast_days):
        future_x = n + d
        trend_val = coeffs[0] * future_x + coeffs[1]
        season_factor = seasonal[d % 7]
        predicted = max(0, trend_val * season_factor)
        
        # Confidence interval
        ci_margin = noise_std * 1.96 * (1 + d * 0.05)  # Wider CI for further days
        
        forecast_date = base_date + timedelta(days=d)
        forecasts.append({
            "date": forecast_date.strftime("%Y-%m-%d"),
            "predicted_demand": round(predicted, 2),
            "lower_bound": round(max(0, predicted - ci_margin), 2),
            "upper_bound": round(predicted + ci_margin, 2),
            "day_of_week": forecast_date.strftime("%A"),
        })
    
    # Find peak
    peak_forecast = max(forecasts, key=lambda x: x["predicted_demand"])
    
    return {
        "area_id": area_id,
        "forecasts": forecasts,
        "peak_day": peak_forecast["date"],
        "peak_demand": peak_forecast["predicted_demand"],
        "model_version": "stat-v1.0",
        "confidence": round(min(0.7 + n * 0.005, 0.92), 4),
        "trend": "increasing" if trend_slope > 10 else "decreasing" if trend_slope < -10 else "stable",
    }

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.models import model_manager

router = APIRouter()

class ReadingFeatures(BaseModel):
    value: float
    voltage: Optional[float] = 230.0
    current: Optional[float] = 0.0
    powerFactor: Optional[float] = 0.95

class SequenceFeatures(BaseModel):
    readings: List[ReadingFeatures]

class ForecastRequest(BaseModel):
    historical_usage: List[float]
    days_ahead: int = 30


@router.post("/anomaly/single")
def predict_single_anomaly(features: ReadingFeatures):
    """
    Evaluates a single reading across the ensemble model (Isolation Forest, RF, XGBoost)
    to detect instantaneous anomalies/theft.
    """
    try:
        data = features.model_dump()
        result = model_manager.ensemble_anomaly_score(data)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/anomaly/sequence")
def predict_sequence_anomaly(features: SequenceFeatures):
    """
    Evaluates a sequence of readings using LSTM to detect temporal anomalies.
    """
    try:
        data = [r.model_dump() for r in features.readings]
        lstm_score = model_manager.lstm.predict_sequence(data)
        
        return {
            "success": True,
            "data": {
                "is_anomaly": lstm_score > 0.7,
                "confidence": round(lstm_score * 100, 2),
                "model": "LSTM"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/forecast")
def predict_forecast(request: ForecastRequest):
    """
    Predicts future demand using Linear Regression.
    """
    try:
        predicted_value = model_manager.linear_regression.forecast(
            request.historical_usage, 
            request.days_ahead
        )
        return {
            "success": True,
            "data": {
                "predicted_usage": round(predicted_value, 2),
                "days_ahead": request.days_ahead
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

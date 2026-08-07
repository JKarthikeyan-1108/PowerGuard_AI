"""Theft Detection API routes."""

from fastapi import APIRouter
from app.schemas.models import TheftDetectionRequest, TheftDetectionResponse, LSTMDetectionRequest
from app.services.theft_detection import detect_theft
from app.services.model_manager import model_manager

router = APIRouter()


@router.post("/detect-theft", response_model=TheftDetectionResponse)
async def detect_theft_endpoint(request: TheftDetectionRequest):
    """Run hybrid theft detection pipeline on meter readings."""
    result = detect_theft(
        readings=request.readings,
        historical_avg=request.historical_avg,
        meter_type=request.meter_type,
    )
    return TheftDetectionResponse(meter_id=request.meter_id, **result)


@router.post("/detect-theft/batch")
async def detect_theft_batch(requests: list[TheftDetectionRequest]):
    """Batch theft detection for multiple meters."""
    results = []
    for req in requests:
        result = detect_theft(
            readings=req.readings,
            historical_avg=req.historical_avg,
            meter_type=req.meter_type,
        )
        results.append({"meter_id": req.meter_id, **result})
    return {"success": True, "data": results}

@router.post("/detect-theft/lstm")
async def detect_theft_lstm(request: LSTMDetectionRequest):
    """LSTM temporal anomaly detection on sequential readings."""
    lstm_model = model_manager.get("lstm")
    
    # Extract sequence features (just using values for simplicity)
    sequence = [r for r in request.readings]
    
    # Predict using mock LSTM
    lstm_prob = float(lstm_model.predict([sequence])[0][0])
    
    return {
        "meter_id": request.meter_id,
        "is_anomaly": lstm_prob > 0.7,
        "lstm_probability": round(lstm_prob, 4),
        "risk_level": "CRITICAL" if lstm_prob > 0.8 else "HIGH" if lstm_prob > 0.6 else "LOW",
        "model_version": "v1.0.0"
    }

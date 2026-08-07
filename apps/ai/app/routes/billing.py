"""Bill Prediction API routes."""

from fastapi import APIRouter
from app.schemas.models import BillPredictionRequest, BillPredictionResponse
from app.services.bill_prediction import predict_bill

router = APIRouter()


@router.post("/predict-bill", response_model=BillPredictionResponse)
async def predict_bill_endpoint(request: BillPredictionRequest):
    """Predict monthly electricity bill."""
    result = predict_bill(
        historical_usage=request.historical_usage,
        tariff_rate=request.tariff_rate,
        connection_type=request.connection_type,
    )
    return BillPredictionResponse(consumer_id=request.consumer_id, **result)

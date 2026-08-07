"""Demand Forecasting API routes."""

from fastapi import APIRouter
from app.schemas.models import DemandForecastRequest, DemandForecastResponse
from app.services.demand_forecast import forecast_demand

router = APIRouter()


@router.post("/forecast-demand", response_model=DemandForecastResponse)
async def forecast_demand_endpoint(request: DemandForecastRequest):
    """Forecast area energy demand."""
    result = forecast_demand(
        historical_demand=request.historical_demand,
        forecast_days=request.forecast_days,
        area_id=request.area_id,
    )
    return DemandForecastResponse(**result)

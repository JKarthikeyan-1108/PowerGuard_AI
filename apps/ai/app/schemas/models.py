"""Pydantic schemas for AI service request/response models."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MeterReadingInput(BaseModel):
    meter_id: str
    readings: list[float] = Field(..., min_length=1, description="Array of consumption values")
    timestamps: list[str] = Field(default=[], description="Corresponding timestamps")
    voltage: list[float] = Field(default=[], description="Voltage readings")
    current: list[float] = Field(default=[], description="Current readings")


class TheftDetectionRequest(BaseModel):
    meter_id: str
    readings: list[float] = Field(..., min_length=24, description="At least 24 hourly readings")
    historical_avg: float = Field(default=0, description="Historical average consumption")
    meter_type: str = Field(default="RESIDENTIAL")


class LSTMDetectionRequest(BaseModel):
    meter_id: str
    readings: list[float] = Field(..., min_length=5, description="Sequential readings")

class TheftDetectionResponse(BaseModel):
    meter_id: str
    theft_probability: float
    risk_level: str
    anomaly_score: float
    rf_probability: Optional[float] = None
    xgb_probability: Optional[float] = None
    is_anomaly: bool
    flags: dict
    model_version: str
    confidence: float


class BillPredictionRequest(BaseModel):
    consumer_id: str
    historical_usage: list[float] = Field(..., min_length=3, description="Monthly usage for past months")
    tariff_rate: float = Field(default=5.0)
    connection_type: str = Field(default="RESIDENTIAL")


class BillPredictionResponse(BaseModel):
    consumer_id: str
    predicted_usage: float
    predicted_amount: float
    confidence: float
    breakdown: dict
    model_version: str


class DemandForecastRequest(BaseModel):
    area_id: str
    historical_demand: list[float] = Field(..., min_length=7, description="Daily demand values")
    forecast_days: int = Field(default=7, ge=1, le=90)


class DemandForecastResponse(BaseModel):
    area_id: str
    forecasts: list[dict]
    peak_day: str
    peak_demand: float
    model_version: str
    confidence: float


class ClusteringRequest(BaseModel):
    consumer_data: list[dict] = Field(..., description="List of consumer feature vectors")
    n_clusters: int = Field(default=5, ge=2, le=10)


class ClusteringResponse(BaseModel):
    clusters: list[dict]
    silhouette_score: float
    model_version: str


class ModelInfo(BaseModel):
    name: str
    version: str
    type: str
    accuracy: Optional[float] = None
    last_trained: Optional[str] = None
    status: str

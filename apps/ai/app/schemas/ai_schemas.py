from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class TheftRequest(BaseModel):
    meter_id: str
    voltage: float
    current: float
    power: float
    energy: float
    frequency: float
    power_factor: float
    timestamp: str

class TheftResponse(BaseModel):
    meter_id: str
    risk_score: float
    risk_level: str
    confidence: float
    probability: float
    explanation: str
    feature_importance: Dict[str, float]

class BillRequest(BaseModel):
    consumer_id: str
    historical_usage: List[float]
    tariff_rate: float
    avg_temp: float

class BillResponse(BaseModel):
    consumer_id: str
    current_bill: float
    next_month_bill: float
    next_quarter_bill: float
    annual_cost: float

class ForecastRequest(BaseModel):
    area_id: str
    historical_demand: List[float]

class ForecastResponse(BaseModel):
    area_id: str
    tomorrow: float
    next_week: float
    next_month: float
    peak_demand: float
    seasonal_trends: str

class ClusterRequest(BaseModel):
    consumer_id: str
    avg_daily_usage: float
    peak_ratio: float
    night_ratio: float

class ClusterResponse(BaseModel):
    consumer_id: str
    cluster_name: str
    confidence: float

class RecommendationResponse(BaseModel):
    consumer_id: str
    recommendations: List[Dict[str, Any]]

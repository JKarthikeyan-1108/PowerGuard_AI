from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from ..models.theft_detection import TheftDetectionModel
from ..models.bill_prediction import BillPredictionModel
from ..models.demand_forecast import DemandForecastModel
from ..models.clustering import ClusteringModel
from ..models.recommendation import RecommendationEngine
from ..services.feature_engineering import feature_engineering

api_router = APIRouter()

# Initialize models (these will attempt to load saved models)
try:
    theft_model = TheftDetectionModel(version="v1.0")
except Exception as e:
    print(f"Failed to load theft model: {e}")

try:
    bill_model = BillPredictionModel(version="v1.0")
except Exception as e:
    print(f"Failed to load bill model: {e}")

try:
    forecast_model = DemandForecastModel(version="v1.0")
except Exception as e:
    print(f"Failed to load forecast model: {e}")

try:
    clustering_model = ClusteringModel(version="v1.0")
    recommendation_engine = RecommendationEngine()
except Exception as e:
    print(f"Failed to load clustering model: {e}")

# Pydantic Schemas
class TheftRequest(BaseModel):
    meter_id: str
    voltage: float
    current: float
    power_factor: float
    frequency: float
    value: float

class BillRequest(BaseModel):
    consumer_id: str
    historical_usage: float
    avg_temp: float
    days_in_month: int
    tariff_rate: float

class ForecastRequest(BaseModel):
    area_id: str
    recent_history: List[float]

class ClusteringRequest(BaseModel):
    consumer_id: str
    avg_daily_usage: float
    peak_usage_ratio: float
    night_usage_ratio: float
    weekend_usage_ratio: float

class RawClusteringRequest(BaseModel):
    consumer_id: str
    raw_readings: List[Dict[str, Any]]


@api_router.post("/predict/theft")
async def predict_theft(req: TheftRequest):
    try:
        result = theft_model.predict(req.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/predict/bill")
async def predict_bill(req: BillRequest):
    try:
        result = bill_model.predict(req.dict())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/predict/forecast")
async def predict_forecast(req: ForecastRequest):
    try:
        result = forecast_model.predict(req.recent_history)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/predict/cluster")
async def predict_cluster(req: ClusteringRequest):
    try:
        cluster_result = clustering_model.predict(req.dict())
        recommendations = recommendation_engine.generate_recommendations(cluster_result['cluster_id'])
        return {
            "success": True, 
            "data": {
                **cluster_result,
                "recommendations": recommendations
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/predict/cluster/raw")
async def predict_cluster_raw(req: RawClusteringRequest):
    try:
        # Extract features
        features = feature_engineering.derive_features(req.raw_readings)
        
        # Merge for model
        features['consumer_id'] = req.consumer_id
        
        cluster_result = clustering_model.predict(features)
        recommendations = recommendation_engine.generate_recommendations(cluster_result['cluster_id'])
        return {
            "success": True, 
            "data": {
                **cluster_result,
                "features_extracted": features,
                "recommendations": recommendations
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoints to mock training for the sake of setting up files without a real large DB attached yet
@api_router.post("/train/theft")
async def train_theft():
    import pandas as pd
    import numpy as np
    # Generate dummy data to allow training without DB
    df = pd.DataFrame({
        'voltage': np.random.normal(230, 5, 1000),
        'current': np.random.normal(10, 2, 1000),
        'power_factor': np.random.normal(0.95, 0.02, 1000),
        'frequency': np.random.normal(50, 0.1, 1000),
        'value': np.random.normal(2.0, 0.5, 1000),
        'is_theft': np.random.choice([0, 1], p=[0.95, 0.05], size=1000)
    })
    theft_model.train(df)
    return {"success": True, "message": "Theft model trained successfully"}

@api_router.post("/train/bill")
async def train_bill():
    import pandas as pd
    import numpy as np
    df = pd.DataFrame({
        'historical_usage': np.random.normal(300, 50, 1000),
        'avg_temp': np.random.normal(25, 5, 1000),
        'days_in_month': np.random.choice([28, 30, 31], size=1000),
        'tariff_rate': np.random.choice([4.5, 5.0, 5.5], size=1000),
        'actual_bill': np.random.normal(1500, 200, 1000)
    })
    bill_model.train(df)
    return {"success": True, "message": "Bill model trained successfully"}

@api_router.post("/train/forecast")
async def train_forecast():
    import pandas as pd
    import numpy as np
    df = pd.DataFrame({
        'demand': np.sin(np.linspace(0, 100, 1000)) * 500 + 1000 + np.random.normal(0, 50, 1000)
    })
    forecast_model.train(df, epochs=5)
    return {"success": True, "message": "Forecast model trained successfully"}

@api_router.post("/train/cluster")
async def train_cluster():
    import pandas as pd
    import numpy as np
    df = pd.DataFrame({
        'avg_daily_usage': np.random.normal(15, 5, 1000),
        'peak_usage_ratio': np.random.uniform(0.1, 0.6, 1000),
        'night_usage_ratio': np.random.uniform(0.1, 0.4, 1000),
        'weekend_usage_ratio': np.random.uniform(0.2, 0.5, 1000)
    })
    clustering_model.train(df)
    return {"success": True, "message": "Clustering model trained successfully"}

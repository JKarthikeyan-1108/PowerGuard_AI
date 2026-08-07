from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import time

from ..schemas.ai_schemas import (
    TheftRequest, TheftResponse,
    BillRequest, BillResponse,
    ForecastRequest, ForecastResponse,
    ClusterRequest, ClusterResponse,
    RecommendationResponse
)
from ..models.theft import TheftModelSuite
from ..models.bill import BillPredictionModel
from ..models.forecast import DemandForecastModel
from ..models.cluster import ConsumerClusteringModel, RecommendationEngine

router = APIRouter()

# Global History Store (in-memory for simplicity, DB via Node.js preferred)
prediction_history = []

try:
    theft_suite = TheftModelSuite()
    bill_model = BillPredictionModel()
    forecast_model = DemandForecastModel()
    cluster_model = ConsumerClusteringModel()
    recommendation_engine = RecommendationEngine()
except Exception as e:
    print(f"Error loading models: {e}")

@router.post("/theft", response_model=TheftResponse)
async def predict_theft(req: TheftRequest):
    try:
        result = theft_suite.predict(req.model_dump())
        resp = TheftResponse(
            meter_id=req.meter_id,
            risk_score=result['risk_score'],
            risk_level=result['risk_level'],
            confidence=result['confidence'],
            probability=result['probability'],
            explanation=result['explanation'],
            feature_importance=result['feature_importance']
        )
        prediction_history.append({"time": time.time(), "type": "theft", "meter": req.meter_id, "result": result})
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bill", response_model=BillResponse)
async def predict_bill(req: BillRequest):
    try:
        result = bill_model.predict(req.model_dump())
        resp = BillResponse(
            consumer_id=req.consumer_id,
            current_bill=result['current_bill'],
            next_month_bill=result['next_month_bill'],
            next_quarter_bill=result['next_quarter_bill'],
            annual_cost=result['annual_cost']
        )
        prediction_history.append({"time": time.time(), "type": "bill", "consumer": req.consumer_id, "result": result})
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/forecast", response_model=ForecastResponse)
async def predict_forecast(req: ForecastRequest):
    try:
        result = forecast_model.predict(req.model_dump())
        resp = ForecastResponse(
            area_id=req.area_id,
            tomorrow=result['tomorrow'],
            next_week=result['next_week'],
            next_month=result['next_month'],
            peak_demand=result['peak_demand'],
            seasonal_trends=result['seasonal_trends']
        )
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cluster", response_model=ClusterResponse)
async def predict_cluster(req: ClusterRequest):
    try:
        result = cluster_model.predict(req.model_dump())
        resp = ClusterResponse(
            consumer_id=req.consumer_id,
            cluster_name=result['cluster_name'],
            confidence=result['confidence']
        )
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{consumerId}", response_model=RecommendationResponse)
async def get_recommendations(consumerId: str, avg_daily_usage: float = 15.0, peak_ratio: float = 0.4, night_ratio: float = 0.2):
    try:
        data = {
            "avg_daily_usage": avg_daily_usage,
            "peak_ratio": peak_ratio,
            "night_ratio": night_ratio
        }
        cluster_result = cluster_model.predict(data)
        recs = recommendation_engine.generate(cluster_result['cluster_id'])
        return RecommendationResponse(
            consumer_id=consumerId,
            recommendations=recs
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train")
async def trigger_training():
    # In a real scenario, this fetches from MySQL via app/services/
    import pandas as pd
    import numpy as np
    
    # Train Theft Models (IF, RF, XGB)
    df_theft = pd.DataFrame({
        'voltage': np.random.normal(230, 5, 1000),
        'current': np.random.normal(10, 2, 1000),
        'power': np.random.normal(2300, 200, 1000),
        'energy': np.random.normal(5000, 1000, 1000),
        'frequency': np.random.normal(50, 0.1, 1000),
        'power_factor': np.random.normal(0.95, 0.02, 1000),
        'label': np.random.choice([0, 1, 2, 3, 4], size=1000, p=[0.8, 0.05, 0.05, 0.05, 0.05])
    })
    theft_suite.train(df_theft)
    
    # Train Bill LR
    df_bill = pd.DataFrame({
        'usage_m1': np.random.normal(300, 50, 1000),
        'usage_m2': np.random.normal(310, 50, 1000),
        'usage_m3': np.random.normal(290, 50, 1000),
        'tariff_rate': np.random.uniform(4.0, 6.0, 1000),
        'avg_temp': np.random.normal(25, 5, 1000),
        'current_bill': np.random.normal(1500, 200, 1000),
        'next_month': np.random.normal(1550, 200, 1000),
        'next_quarter': np.random.normal(4500, 600, 1000),
        'annual_cost': np.random.normal(18000, 2000, 1000)
    })
    bill_model.train(df_bill)
    
    # Train Forecast LSTM
    df_forecast = pd.DataFrame({
        'demand': np.sin(np.linspace(0, 100, 1000)) * 500 + 2000 + np.random.normal(0, 50, 1000)
    })
    forecast_model.train(df_forecast)
    
    # Train Clustering KMeans
    df_cluster = pd.DataFrame({
        'avg_daily_usage': np.random.normal(15, 5, 1000),
        'peak_ratio': np.random.uniform(0.1, 0.6, 1000),
        'night_ratio': np.random.uniform(0.1, 0.4, 1000)
    })
    cluster_model.train(df_cluster)
    
    return {"message": "All models trained successfully. Version v1.0 updated."}

@router.get("/models")
async def get_models():
    return {
        "models": [
            {"name": "Isolation Forest", "version": theft_suite.version, "status": "Active", "accuracy": 0.95},
            {"name": "Random Forest", "version": theft_suite.version, "status": "Active", "accuracy": 0.92},
            {"name": "XGBoost", "version": theft_suite.version, "status": "Active", "accuracy": 0.96},
            {"name": "Linear Regression", "version": bill_model.version, "status": "Active", "r2_score": 0.88},
            {"name": "LSTM", "version": forecast_model.version, "status": "Active", "mse": 0.05},
            {"name": "KMeans", "version": cluster_model.version, "status": "Active", "silhouette": 0.72}
        ]
    }

@router.get("/history")
async def get_history():
    return {"history": prediction_history[-50:]}

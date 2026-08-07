from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.models import model_manager

router = APIRouter()

class ConsumerProfile(BaseModel):
    consumer_id: str
    monthly_avg: float
    connection_type: str

@router.post("/consumer")
def analyze_consumer(profile: ConsumerProfile):
    """
    Analyzes a consumer's usage profile using KMeans to determine their cluster,
    and uses the Recommendation Engine to generate personalized tips.
    """
    try:
        data = profile.model_dump()
        
        # 1. Get cluster from KMeans
        cluster_info = model_manager.kmeans.predict_cluster(data)
        
        # 2. Get recommendations based on cluster
        recommendations = model_manager.recommendation_engine.get_recommendations(
            cluster_info["cluster_id"]
        )
        
        return {
            "success": True,
            "data": {
                "consumer_id": profile.consumer_id,
                "cluster": cluster_info,
                "recommendations": recommendations
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

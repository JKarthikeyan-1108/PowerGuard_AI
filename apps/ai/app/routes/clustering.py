"""Consumer Clustering API routes."""

import numpy as np
from fastapi import APIRouter
from app.schemas.models import ClusteringRequest, ClusteringResponse
from app.services.model_manager import model_manager
from sklearn.metrics import silhouette_score

router = APIRouter()


@router.post("/cluster-consumers", response_model=ClusteringResponse)
async def cluster_consumers(request: ClusteringRequest):
    """Cluster consumers by usage patterns."""
    kmeans = model_manager.get("kmeans")
    
    # Extract features from consumer data
    features = []
    for consumer in request.consumer_data:
        features.append([
            consumer.get("avg_consumption", 0),
            consumer.get("peak_usage", 0),
            consumer.get("off_peak_ratio", 0.5),
            consumer.get("usage_variance", 0),
        ])
    
    X = np.array(features)
    labels = kmeans.predict(X)
    
    # Calculate silhouette score
    score = float(silhouette_score(X, labels)) if len(set(labels)) > 1 else 0.0
    
    # Build cluster summaries
    clusters = []
    for i in range(request.n_clusters):
        mask = labels == i
        if mask.any():
            # Get recommendations for this cluster
            rec_engine = model_manager.get("recommendation_engine")
            recommendations = rec_engine.get_recommendations(i)

            clusters.append({
                "cluster_id": i,
                "label": f"Cluster {i+1}",
                "member_count": int(mask.sum()),
                "avg_consumption": round(float(np.mean(cluster_data[:, 0])), 2),
                "centroid": kmeans.cluster_centers_[i].tolist(),
                "recommendations": recommendations,
            })
    
    return ClusteringResponse(
        clusters=clusters,
        silhouette_score=round(score, 4),
        model_version="v1.0.0",
    )

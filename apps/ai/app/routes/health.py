"""Health check routes."""

from fastapi import APIRouter
from app.services.model_manager import model_manager

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "powerguard-ai",
        "models_loaded": len(model_manager.models),
    }


@router.get("/ai/models")
async def list_models():
    return {
        "success": True,
        "data": model_manager.list_models(),
    }

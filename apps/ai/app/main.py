from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ai
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="PowerGuard AI Engine",
    description="Complete AI Platform for PowerGuard",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router, prefix="/api/ai")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "powerguard-ai-platform"}

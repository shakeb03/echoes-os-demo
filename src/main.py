# 📁 /app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from app.routes import upload, ask, analyze, echoes_process

load_dotenv()

app = FastAPI(
    title="Echoes OS API",
    description="AI-powered memory and workflow reconstruction API",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "Echoes OS API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Include route modules
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(ask.router, prefix="/api", tags=["memory"])
app.include_router(analyze.router, prefix="/api", tags=["blueprint"])
app.include_router(echoes_process.router, prefix="/api", tags=["unified"])

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )


import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,  # Set the logging level (INFO, DEBUG, WARNING, ERROR, CRITICAL)
    format="%(asctime)s - %(levelname)s - %(message)s",  # Log format
    handlers=[
        logging.StreamHandler()  # Output logs to the terminal
    ]
)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
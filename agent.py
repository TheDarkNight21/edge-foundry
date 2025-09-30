#!/usr/bin/env python3
"""
FastAPI agent for running TinyLlama model locally.
Exposes POST /inference endpoint for model inference.
"""

import time
import logging
import yaml
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from llama_cpp import Llama

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load configuration
def load_config() -> Dict[str, Any]:
    """Load configuration from edgefoundry.yaml"""
    try:
        with open("edgefoundry.yaml", "r") as f:
            config = yaml.safe_load(f)
        return config
    except FileNotFoundError:
        logger.error("Configuration file edgefoundry.yaml not found")
        raise
    except yaml.YAMLError as e:
        logger.error(f"Error parsing configuration file: {e}")
        raise

# Load configuration
config = load_config()

# Initialize FastAPI app
app = FastAPI(
    title="Edge Foundry Agent",
    description="Local TinyLlama model inference API",
    version="1.0.0"
)

# Global model instance
model = None

class InferenceRequest(BaseModel):
    prompt: str
    max_tokens: int = 64
    temperature: float = 0.7

class InferenceResponse(BaseModel):
    response: str
    processing_time: float
    model_info: Dict[str, Any]

def load_model():
    """Load the model based on configuration"""
    global model
    if model is None:
        logger.info("Loading model...")
        start_time = time.time()
        
        # For now, use the existing load_model function
        # In a production setup, you'd load from the config path
        from load_model import load_model as load_tinyllama
        model = load_tinyllama()
        
        load_time = time.time() - start_time
        logger.info(f"Model loaded in {load_time:.2f} seconds")
    
    return model

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Edge Foundry Agent is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "config": config
    }

@app.post("/inference", response_model=InferenceResponse)
async def inference(request: InferenceRequest):
    """
    Run inference on the loaded model with the provided prompt.
    """
    try:
        # Ensure model is loaded
        if model is None:
            model = load_model()
        
        # Log the incoming request
        logger.info(f"Received inference request: {request.prompt[:100]}...")
        
        # Start timing
        start_time = time.time()
        
        # Format the prompt for better responses (using existing logic)
        formatted_prompt = f"Human: {request.prompt}\nAssistant:"
        
        # Run inference
        result = model(
            formatted_prompt,
            max_tokens=request.max_tokens,
            stop=["Human:", "User:", "Student:", "\n\n", "Assistant:"],
            echo=False,
            temperature=request.temperature
        )
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Extract response text
        response_text = result["choices"][0]["text"]
        
        # Log the response and timing
        logger.info(f"Generated response in {processing_time:.2f}s: {response_text[:100]}...")
        
        return InferenceResponse(
            response=response_text,
            processing_time=processing_time,
            model_info={
                "model_path": config.get("model_path", "unknown"),
                "runtime": config.get("runtime", "unknown"),
                "device": config.get("device", "unknown"),
                "max_tokens": request.max_tokens,
                "temperature": request.temperature
            }
        )
        
    except Exception as e:
        logger.error(f"Error during inference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

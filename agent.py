#!/usr/bin/env python3
"""
FastAPI agent for running TinyLlama model locally.
Exposes POST /inference endpoint for model inference.
"""

import os
import time
import logging
import yaml
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from llama_cpp import Llama
from telemetry import telemetry_db, get_memory_usage, count_tokens

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load configuration
def load_config() -> Dict[str, Any]:
    """Load configuration from edgefoundry.yaml"""
    # Try working directory first, then current directory
    config_paths = ["./.edgefoundry/edgefoundry.yaml", "edgefoundry.yaml"]
    
    for config_path in config_paths:
        if os.path.exists(config_path):
            try:
                with open(config_path, "r") as f:
                    config = yaml.safe_load(f)
                logger.info(f"Loaded configuration from {config_path}")
                return config
            except yaml.YAMLError as e:
                logger.error(f"Error parsing configuration file {config_path}: {e}")
                continue
    
    logger.error("Configuration file edgefoundry.yaml not found in any expected location")
    raise FileNotFoundError("Configuration file not found")

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
        
        # Get model path from config
        model_path = config.get("model_path", "./models/tinyllama.gguf")
        
        # If it's a relative path, try working directory first
        if not os.path.isabs(model_path):
            working_model_path = f"./.edgefoundry/{model_path}"
            if os.path.exists(working_model_path):
                model_path = working_model_path
        
        logger.info(f"Loading model from: {model_path}")
        
        # Load model using llama_cpp
        model = Llama(
            model_path=model_path,
            n_ctx=2048,
            n_gpu_layers=-1,
            seed=1337,
        )
        
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
    global model
    try:
        # Ensure model is loaded
        if model is None:
            model = load_model()
        
        # Log the incoming request
        logger.info(f"Received inference request: {request.prompt[:100]}...")
        
        # Get initial memory usage
        initial_memory = get_memory_usage()
        
        # Start timing
        start_time = time.time()
        
        # Format the prompt for better responses (using existing logic)
        formatted_prompt = f"Human: {request.prompt}\nAssistant:"
        
        # Count prompt tokens (approximate)
        prompt_tokens = count_tokens(formatted_prompt)
        
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
        latency_ms = processing_time * 1000
        
        # Extract response text
        response_text = result["choices"][0]["text"]
        
        # Count generated tokens (approximate)
        generated_tokens = count_tokens(response_text)
        
        # Get final memory usage
        final_memory = get_memory_usage()
        memory_used = final_memory - initial_memory
        
        # Record telemetry data
        try:
            telemetry_db.record_inference(
                prompt_length=prompt_tokens,
                latency_ms=latency_ms,
                tokens_generated=generated_tokens,
                memory_mb=memory_used,
                model_path=config.get("model_path", "unknown"),
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )
            logger.info(f"Telemetry recorded: {latency_ms:.2f}ms, {generated_tokens} tokens, {memory_used:.2f}MB")
        except Exception as te:
            logger.error(f"Failed to record telemetry: {te}")
        
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

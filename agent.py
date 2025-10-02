#!/usr/bin/env python3
"""
FastAPI agent for running multiple demo models locally.
Exposes POST /inference endpoint for model inference with model switching support.
"""

import os
import time
import logging
import yaml
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_cpp import Llama
from telemetry import telemetry_db, get_memory_usage, count_tokens
from model_manager import model_manager

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
    description="Local multi-model inference API with demo models support",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Global model instance (for backward compatibility)
model = None


class InferenceRequest(BaseModel):
    prompt: str
    max_tokens: int = 64
    temperature: float = 0.7
    model_id: Optional[str] = None


class InferenceResponse(BaseModel):
    response: str
    processing_time: float
    model_info: Dict[str, Any]


class ModelSwitchRequest(BaseModel):
    model_id: str


class ModelInfo(BaseModel):
    id: str
    name: str
    description: str
    parameters: str
    quantization: str
    context_length: int
    model_type: str
    sample_prompts: List[str]


def load_model():
    """Load the default model based on configuration (backward compatibility)"""
    global model
    if model is None:
        # Try to load the default demo model first
        default_model = model_manager.default_model
        if default_model and model_manager.load_model(default_model):
            logger.info(f"Loaded default demo model: {default_model}")
            return model_manager.current_wrapper.model if model_manager.current_wrapper else None
        
        # Fallback to old method
        logger.info("Loading model using legacy method...")
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


@app.get("/model-info")
async def model_info():
    """Get current model information"""
    current_info = model_manager.get_current_model_info()
    if current_info.get("loaded"):
        return {
            "model_path": config.get("model_path", "unknown"),
            "runtime": config.get("runtime", "unknown"),
            "device": config.get("device", "unknown"),
            "model_loaded": True,
            "current_model": current_info,
            "config": config
        }
    else:
        return {
            "model_path": config.get("model_path", "unknown"),
            "runtime": config.get("runtime", "unknown"),
            "device": config.get("device", "unknown"),
            "model_loaded": model is not None,
            "current_model": current_info,
            "config": config
        }


@app.get("/demo-models", response_model=List[ModelInfo])
async def get_demo_models():
    """Get list of available demo models"""
    models = model_manager.get_available_models()
    return [ModelInfo(**model) for model in models]


@app.get("/demo-models/{model_id}/sample-prompts")
async def get_sample_prompts(model_id: str):
    """Get sample prompts for a specific demo model"""
    prompts = model_manager.get_sample_prompts(model_id)
    return {"model_id": model_id, "sample_prompts": prompts}


@app.post("/demo-models/switch")
async def switch_model(request: ModelSwitchRequest):
    """Switch to a different demo model"""
    try:
        success = model_manager.switch_model(request.model_id)
        if success:
            return {
                "message": f"Successfully switched to model: {request.model_id}",
                "current_model": model_manager.get_current_model_info()
            }
        else:
            raise HTTPException(status_code=400, detail=f"Failed to switch to model: {request.model_id}")
    except Exception as e:
        logger.error(f"Error switching model: {e}")
        raise HTTPException(status_code=500, detail=f"Error switching model: {str(e)}")


@app.get("/demo-models/current")
async def get_current_model():
    """Get information about the currently loaded model"""
    return model_manager.get_current_model_info()


@app.get("/metrics")
async def get_metrics():
    """Get telemetry metrics"""
    try:
        db = telemetry_db
        metrics_data = db.get_metrics_summary(20)
        return metrics_data
    except Exception as e:
        logger.error(f"Error getting metrics: {e}")
        return {"error": "Failed to retrieve metrics"}


@app.post("/inference", response_model=InferenceResponse)
async def inference(request: InferenceRequest):
    """
    Run inference on the loaded model with the provided prompt.
    Supports model switching via model_id parameter.
    """
    global model
    try:
        # Handle model switching if requested
        if request.model_id and request.model_id != model_manager.current_model:
            logger.info(f"Switching to model: {request.model_id}")
            if not model_manager.switch_model(request.model_id):
                raise HTTPException(status_code=400, detail=f"Failed to switch to model: {request.model_id}")

        # Use model manager if available, otherwise fall back to legacy
        if model_manager.current_wrapper:
            # Use new model manager
            logger.info(f"Using model manager with model: {model_manager.current_model}")
            
            # Log the incoming request
            logger.info(f"Received inference request: {request.prompt[:100]}...")

            # Get initial memory usage
            initial_memory = get_memory_usage()

            # Start timing
            start_time = time.time()

            # Count prompt tokens (approximate)
            prompt_tokens = count_tokens(request.prompt)

            # Run inference using model manager
            result = model_manager.run_inference(
                request.prompt,
                max_tokens=request.max_tokens,
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

            # Get current model info
            current_model_info = model_manager.get_current_model_info()
            model_path = current_model_info.get("name", "unknown")

            # Record telemetry data
            try:
                telemetry_db.record_inference(
                    prompt_length=prompt_tokens,
                    latency_ms=latency_ms,
                    tokens_generated=generated_tokens,
                    memory_mb=memory_used,
                    model_path=model_path,
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
                    "model_id": model_manager.current_model,
                    "model_name": current_model_info.get("name", "unknown"),
                    "model_path": model_path,
                    "runtime": current_model_info.get("runtime", "unknown"),
                    "device": config.get("device", "unknown"),
                    "max_tokens": request.max_tokens,
                    "temperature": request.temperature
                }
            )
        else:
            # Fallback to legacy method
            # Ensure model is loaded
            if model is None:
                model = load_model()

            # Log the incoming request
            logger.info(f"Received inference request (legacy): {request.prompt[:100]}...")

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

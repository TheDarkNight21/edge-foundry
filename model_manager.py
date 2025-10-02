#!/usr/bin/env python3
"""
Model Manager for Edge Foundry
Handles loading and switching between different demo models.
"""

import os
import time
import logging
import yaml
from typing import Dict, Any, Optional, List
from llama_cpp import Llama
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)


class ModelWrapper(ABC):
    """Abstract base class for model wrappers"""
    
    @abstractmethod
    def load_model(self, config: Dict[str, Any]) -> Any:
        """Load the model with given configuration"""
        pass
    
    @abstractmethod
    def run_inference(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Run inference on the model"""
        pass
    
    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        pass


class LlamaCPPWrapper(ModelWrapper):
    """Wrapper for LlamaCPP models (GGUF format)"""
    
    def __init__(self):
        self.model = None
        self.model_config = None
    
    def load_model(self, config: Dict[str, Any]) -> Any:
        """Load a GGUF model using LlamaCPP"""
        logger.info(f"Loading LlamaCPP model: {config['model_path']}")
        start_time = time.time()
        
        # Get model path
        model_path = config['model_path']
        
        # If it's a relative path, try working directory first
        if not os.path.isabs(model_path):
            working_model_path = f"./.edgefoundry/{model_path}"
            if os.path.exists(working_model_path):
                model_path = working_model_path
        
        # Load model with configuration
        model_config = config.get('config', {})
        self.model = Llama(
            model_path=model_path,
            **model_config
        )
        
        self.model_config = config
        load_time = time.time() - start_time
        logger.info(f"Model loaded in {load_time:.2f} seconds")
        
        return self.model
    
    def run_inference(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Run inference on the loaded model"""
        if self.model is None:
            raise RuntimeError("Model not loaded")
        
        # Format prompt for better responses
        formatted_prompt = f"Human: {prompt}\nAssistant:"
        
        # Get inference parameters
        max_tokens = kwargs.get('max_tokens', self.model_config.get('config', {}).get('max_tokens', 64))
        temperature = kwargs.get('temperature', self.model_config.get('config', {}).get('temperature', 0.7))
        
        # Run inference
        result = self.model(
            formatted_prompt,
            max_tokens=max_tokens,
            stop=["Human:", "User:", "Student:", "\n\n", "Assistant:"],
            echo=False,
            temperature=temperature
        )
        
        return result
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        if self.model_config is None:
            return {}
        
        return {
            "name": self.model_config.get('name', 'Unknown'),
            "description": self.model_config.get('description', ''),
            "parameters": self.model_config.get('parameters', 'Unknown'),
            "quantization": self.model_config.get('quantization', 'Unknown'),
            "context_length": self.model_config.get('context_length', 2048),
            "model_type": self.model_config.get('model_type', 'Unknown'),
            "runtime": self.model_config.get('runtime', 'Unknown')
        }


class ModelManager:
    """Manages multiple demo models and their loading/switching"""
    
    def __init__(self, demo_models_config_path: str = "demo_models.yaml"):
        self.demo_models_config_path = demo_models_config_path
        self.demo_models = {}
        self.current_model = None
        self.current_wrapper = None
        self.load_demo_models_config()
    
    def load_demo_models_config(self):
        """Load demo models configuration"""
        try:
            with open(self.demo_models_config_path, "r") as f:
                config = yaml.safe_load(f)
                self.demo_models = config.get('demo_models', {})
                self.default_model = config.get('default_model', 'tinyllama-1b-3bit')
                logger.info(f"Loaded {len(self.demo_models)} demo models")
        except Exception as e:
            logger.error(f"Failed to load demo models config: {e}")
            self.demo_models = {}
            self.default_model = None
    
    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available demo models"""
        models = []
        for model_id, config in self.demo_models.items():
            models.append({
                "id": model_id,
                "name": config.get('name', model_id),
                "description": config.get('description', ''),
                "parameters": config.get('parameters', 'Unknown'),
                "quantization": config.get('quantization', 'Unknown'),
                "context_length": config.get('context_length', 2048),
                "model_type": config.get('model_type', 'Unknown'),
                "sample_prompts": config.get('sample_prompts', [])
            })
        return models
    
    def get_model_config(self, model_id: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a specific model"""
        return self.demo_models.get(model_id)
    
    def load_model(self, model_id: str) -> bool:
        """Load a specific demo model"""
        if model_id not in self.demo_models:
            logger.error(f"Model {model_id} not found in demo models")
            return False
        
        try:
            model_config = self.demo_models[model_id]
            runtime = model_config.get('runtime', 'llama_cpp')
            
            # Create appropriate wrapper based on runtime
            if runtime == 'llama_cpp':
                wrapper = LlamaCPPWrapper()
            else:
                logger.error(f"Unsupported runtime: {runtime}")
                return False
            
            # Load the model
            wrapper.load_model(model_config)
            
            # Update current model
            self.current_model = model_id
            self.current_wrapper = wrapper
            
            logger.info(f"Successfully loaded model: {model_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model {model_id}: {e}")
            return False
    
    def run_inference(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Run inference on the current model"""
        if self.current_wrapper is None:
            raise RuntimeError("No model loaded")
        
        return self.current_wrapper.run_inference(prompt, **kwargs)
    
    def get_current_model_info(self) -> Dict[str, Any]:
        """Get information about the currently loaded model"""
        if self.current_wrapper is None:
            return {"loaded": False}
        
        info = self.current_wrapper.get_model_info()
        info["loaded"] = True
        info["model_id"] = self.current_model
        return info
    
    def get_sample_prompts(self, model_id: Optional[str] = None) -> List[str]:
        """Get sample prompts for a model"""
        target_model = model_id or self.current_model
        if target_model and target_model in self.demo_models:
            return self.demo_models[target_model].get('sample_prompts', [])
        return []
    
    def switch_model(self, model_id: str) -> bool:
        """Switch to a different model"""
        if model_id == self.current_model:
            return True  # Already loaded
        
        # Load the new model
        return self.load_model(model_id)


# Global model manager instance
model_manager = ModelManager()


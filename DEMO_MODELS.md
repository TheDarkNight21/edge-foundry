# Demo Models Feature

This document describes the demo models feature implemented in Step 6 of the Edge Foundry MVP build order.

## Overview

The demo models feature allows users to easily switch between different pre-configured models and access sample prompts for testing and demonstration purposes.

## Features

### 1. Multiple Demo Models
- **TinyLlama 1B (3-bit)**: A compact 1B parameter model optimized for speed and efficiency
- **Phi-3 Mini**: Microsoft's efficient 3.8B parameter model for general purpose tasks

### 2. Model Management
- List available demo models
- Switch between models dynamically
- View model information and specifications
- Access sample prompts for each model

### 3. Sample Prompts
- Pre-configured prompts tailored to each model's strengths
- Easy one-click prompt insertion in the dashboard
- CLI access to sample prompts

## Configuration

Demo models are configured in `demo_models.yaml`:

```yaml
demo_models:
  tinyllama-1b-3bit:
    name: "TinyLlama 1B (3-bit)"
    description: "A compact 1B parameter model optimized for speed and efficiency"
    model_path: "./models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf"
    runtime: "llama_cpp"
    device: "local"
    model_type: "gguf"
    parameters: "1.1B"
    quantization: "Q8_0"
    context_length: 2048
    sample_prompts:
      - "What is the capital of France?"
      - "Explain quantum computing in simple terms"
      - "Write a short poem about artificial intelligence"
      - "What are the benefits of renewable energy?"
      - "How does machine learning work?"
```

## API Endpoints

### Demo Models
- `GET /demo-models` - List all available demo models
- `GET /demo-models/current` - Get current model information
- `POST /demo-models/switch` - Switch to a different model
- `GET /demo-models/{model_id}/sample-prompts` - Get sample prompts for a model

### Enhanced Inference
- `POST /inference` - Now supports `model_id` parameter for model switching

## CLI Commands

### List Demo Models
```bash
python cli.py demo-models
```

### Switch Model
```bash
python cli.py switch-model tinyllama-1b-3bit
```

### Get Sample Prompts
```bash
python cli.py sample-prompts tinyllama-1b-3bit
```

### Run Inference with Specific Model
```bash
python cli.py inference "Hello, world!" --model phi-3-mini
```

## Dashboard Features

### Demo Models Panel
- Visual model selection interface
- Model status indicators (Active/Loading/Inactive)
- One-click model switching
- Sample prompt access

### Enhanced Inference Panel
- Model selection dropdown
- Sample prompt chips for easy insertion
- Current model status display
- Model-specific configuration

## Model Download

Use the provided script to download demo models:

```bash
# Download all demo models
python download_demo_models.py --all

# Download specific model
python download_demo_models.py --model tinyllama-1b-3bit

# List available models
python download_demo_models.py --list

# Check download status
python download_demo_models.py --check
```

## Architecture

### Model Manager
The `ModelManager` class handles:
- Model loading and switching
- Configuration management
- Wrapper abstraction for different runtimes
- Sample prompt management

### Model Wrappers
- `LlamaCPPWrapper`: Handles GGUF format models
- Extensible design for future runtime support (ONNX, etc.)

### Backward Compatibility
- Existing functionality remains unchanged
- Legacy model loading still supported
- Gradual migration path for existing deployments

## Usage Examples

### 1. Basic Model Switching
```python
from model_manager import model_manager

# List available models
models = model_manager.get_available_models()

# Switch to a specific model
model_manager.switch_model("phi-3-mini")

# Run inference
result = model_manager.run_inference("What is machine learning?")
```

### 2. Dashboard Integration
```javascript
// Get available models
const models = await apiService.getDemoModels();

// Switch model
await apiService.switchModel("tinyllama-1b-3bit");

// Run inference with specific model
const result = await apiService.runInference(
  "Hello, world!", 
  64, 
  0.7, 
  "phi-3-mini"
);
```

## Benefits

1. **Versatility**: Easy switching between different model capabilities
2. **User Experience**: Pre-configured models with sample prompts
3. **Demonstration**: Perfect for showcasing different model strengths
4. **Development**: Quick testing with different model configurations
5. **Scalability**: Extensible architecture for adding more models

## Future Enhancements

- Support for ONNX runtime models
- Model performance comparison tools
- Custom model configuration interface
- Model caching and optimization
- A/B testing between models


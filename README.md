# Edge Foundry

A local AI agent management CLI for running TinyLlama models with FastAPI.

## Features

- 🚀 **Easy CLI Management**: Simple commands to deploy, start, stop, and monitor your AI agent
- 🤖 **Local Model Support**: Run TinyLlama models locally with llama-cpp-python
- 🌐 **FastAPI Integration**: RESTful API for model inference
- 📊 **Process Monitoring**: Built-in status monitoring and logging
- ⚙️ **Configuration Management**: YAML-based configuration system

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install the CLI (optional):
```bash
pip install -e .
```

## Quick Start

### 1. Initialize Edge Foundry
```bash
python cli.py init
```

### 2. Deploy a Model
```bash
python cli.py deploy --model path/to/your/model.gguf
```

### 3. Start the Agent
```bash
python cli.py start
```

### 4. Check Status
```bash
python cli.py status
```

### 5. Test the API
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/inference" -Method POST -ContentType "application/json" -Body '{"prompt": "Hello, how are you?"}'

# Bash/Linux
curl -X POST "http://localhost:8000/inference" -H "Content-Type: application/json" -d '{"prompt": "Hello, how are you?"}'
```

## CLI Commands

### `edgefoundry init`
Initialize Edge Foundry in the current directory. Creates the working directory structure and default configuration.

### `edgefoundry deploy --model MODEL_PATH`
Deploy a model file to the working directory. Copies the model and updates the configuration.

**Options:**
- `--model`: Path to the model file (.gguf format)
- `--config`: Optional path to custom config file

### `edgefoundry start`
Start the Edge Foundry agent in the background. The agent will load the model and start the FastAPI server.

### `edgefoundry stop`
Stop the running Edge Foundry agent.

### `edgefoundry status`
Show the current status of the agent including:
- Running status
- Process ID
- Uptime
- Memory usage
- CPU usage
- API URL
- Recent logs

### `edgefoundry logs`
Display recent agent logs.

## API Endpoints

### POST `/inference`
Run inference on the loaded model.

**Request Body:**
```json
{
  "prompt": "Your prompt here",
  "max_tokens": 64,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "response": "Model response text",
  "processing_time": 1.23,
  "model_info": {
    "model_path": "./models/tinyllama.gguf",
    "runtime": "llama_cpp",
    "device": "local",
    "max_tokens": 64,
    "temperature": 0.7
  }
}
```

### GET `/health`
Health check endpoint.

### GET `/`
Basic status endpoint.

## Configuration

The configuration is stored in `.edgefoundry/edgefoundry.yaml`:

```yaml
model_path: ./models/tinyllama.gguf
runtime: llama_cpp
device: local
port: 8000
host: 0.0.0.0
```

## File Structure

```
.
├── agent.py              # FastAPI application
├── cli.py                # CLI interface
├── load_model.py         # Model loading utilities
├── run_model.py          # CLI model runner
├── requirements.txt      # Python dependencies
├── setup.py             # Package setup
├── edgefoundry.yaml     # Default configuration
└── .edgefoundry/        # Working directory
    ├── edgefoundry.yaml # Active configuration
    ├── models/          # Deployed models
    ├── agent.pid        # Process ID file
    └── agent.log        # Agent logs
```

## Development

### Running Tests
```bash
python test_cli.py
```

### Manual Testing
```bash
# Start the agent manually
uvicorn agent:app --host 0.0.0.0 --port 8000

# Test with curl
curl -X POST "http://localhost:8000/inference" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is the capital of France?"}'
```

## Requirements

- Python 3.8+
- macOS (for Metal GPU acceleration)
- Sufficient RAM for model loading

## Troubleshooting

### Agent Won't Start
- Check if port 8000 is available
- Verify model file exists and is valid
- Check logs: `edgefoundry logs`

### Model Loading Issues
- Ensure model file is in GGUF format
- Check available memory
- Verify model path in configuration

### API Connection Issues
- Confirm agent is running: `edgefoundry status`
- Check firewall settings
- Verify correct port (default: 8000)

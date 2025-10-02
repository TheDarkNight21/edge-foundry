# EdgeFoundry

> 🚀 **Deploy, monitor, and manage local AI models with one CLI.** A complete DevOps platform for running TinyLlama, Phi-3 Mini, and other GGUF models locally with real-time observability.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)

## Why EdgeFoundry?

**EdgeFoundry** solves the complexity of deploying and monitoring local AI models. Instead of wrestling with model loading, API setup, and monitoring tools, you get a complete platform that handles everything from model deployment to real-time performance tracking.

### Key Features

- 🎯 **One-Command Deployment** - Deploy any GGUF model with a single CLI command
- 📊 **Real-Time Dashboard** - Beautiful React UI with live metrics, performance charts, and model switching
- 🔄 **Multi-Model Support** - Switch between TinyLlama, Phi-3 Mini, and custom models on-the-fly
- 📈 **Advanced Telemetry** - Track latency, tokens/sec, memory usage, and performance trends
- 🛠️ **Production Ready** - FastAPI backend with CORS, health checks, and process management
- 💾 **Local-First** - Everything runs locally with SQLite storage - no cloud dependencies
- 🎨 **Modern UI** - Responsive dashboard with dark mode, real-time updates, and intuitive controls

## Quick Start (5 Minutes)

### 1. Install EdgeFoundry
```bash
git clone https://github.com/yourusername/edge-foundry.git
cd edge-foundry
pip install -r requirements.txt
```

### 2. Initialize & Deploy
```bash
# Initialize EdgeFoundry
python cli.py init

# Download a demo model (TinyLlama 1B)
python download_demo_models.py --model tinyllama-1b-3bit

# Deploy the model
python cli.py deploy --model ./models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf
```

### 3. Start & Monitor
```bash
# Start the agent
python cli.py start

# Launch the dashboard
cd dashboard && npm install && npm start
```

### 4. Test Your Setup
```bash
# Test via CLI
python cli.py inference "Hello, how are you?"

# Test via API
curl -X POST "http://localhost:8000/inference" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is the capital of France?", "max_tokens": 64}'
```

**🎉 Done!** Visit `http://localhost:3000` to see your dashboard.

## Example Output

### CLI Response
```json
{
  "response": "The capital of France is Paris. Paris is the largest city in France and serves as the country's political, economic, and cultural center.",
  "processing_time": 1.23,
  "model_info": {
    "model_path": "./models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
    "runtime": "llama_cpp",
    "device": "local",
    "max_tokens": 64,
    "temperature": 0.7
  }
}
```

### Dashboard Screenshots
*[Placeholder for dashboard screenshots showing:*
- *Real-time metrics overview*
- *Model switching interface*
- *Performance charts*
- *Recent inferences table]*

## Architecture

```
EdgeFoundry/
├── 🎛️  CLI Interface (cli.py)          # Command-line management
├── 🚀  FastAPI Agent (agent.py)        # Model inference server
├── 📊  React Dashboard (dashboard/)     # Real-time monitoring UI
├── 📈  Telemetry System (telemetry.py) # Performance tracking
├── 🤖  Model Manager (model_manager.py) # Multi-model support
└── 📁  Models Directory (models/)       # Local model storage
```

## Supported Models

| Model | Parameters | Quantization | Context | Use Case |
|-------|------------|--------------|---------|----------|
| **TinyLlama 1B** | 1.1B | Q8_0 | 2K | Fast responses, low memory |
| **Phi-3 Mini** | 3.8B | Q4_K_M | 4K | Balanced performance |
| **Custom GGUF** | Any | Any | Any | Your models |

## CLI Commands

```bash
# Management
python cli.py init                    # Initialize EdgeFoundry
python cli.py deploy --model PATH     # Deploy a model
python cli.py start                   # Start the agent
python cli.py stop                    # Stop the agent
python cli.py status                  # Check status

# Model Operations
python cli.py demo-models             # List available models
python cli.py switch-model MODEL_ID   # Switch active model
python cli.py inference "PROMPT"      # Run inference

# Monitoring
python cli.py metrics                 # View performance metrics
python cli.py logs                    # View agent logs
```

## API Endpoints

### Core Endpoints
- `POST /inference` - Run model inference
- `GET /health` - Health check
- `GET /demo-models` - List available models
- `POST /demo-models/switch` - Switch active model

### Example API Usage
```python
import requests

# Run inference
response = requests.post('http://localhost:8000/inference', json={
    'prompt': 'Explain quantum computing',
    'max_tokens': 128,
    'temperature': 0.7
})

print(response.json()['response'])
```

## Configuration

EdgeFoundry uses YAML configuration stored in `.edgefoundry/edgefoundry.yaml`:

```yaml
model_path: ./models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf
runtime: llama_cpp
device: local
port: 8000
host: 0.0.0.0
n_ctx: 2048
n_gpu_layers: -1
temperature: 0.7
max_tokens: 64
```

## Development

### Prerequisites
- Python 3.8+
- Node.js 16+ (for dashboard)
- macOS (for Metal GPU acceleration) or Linux

### Setup Development Environment
```bash
# Backend
pip install -r requirements.txt
pip install -e .

# Frontend
cd dashboard
npm install
npm start
```

### Running Tests
```bash
python test_cli.py
python test_telemetry.py
python test_demo_models.py
```

## Roadmap

### 🎯 Next Steps
- [ ] **ONNX Runtime Support** - Add support for ONNX models
- [ ] **Docker Support** - Containerized deployment options
- [ ] **Model Comparison** - A/B testing between models
- [ ] **Custom Metrics** - User-defined performance metrics
- [ ] **REST API Extensions** - Batch inference, streaming responses

### 🚀 Future Features
- [ ] **Cloud Sync** - Optional cloud model storage
- [ ] **Model Marketplace** - Community model sharing
- [ ] **Advanced Analytics** - ML-powered performance insights
- [ ] **Multi-User Support** - Team collaboration features

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Community & Feedback

- 🐛 **Found a bug?** [Open an issue](https://github.com/yourusername/edge-foundry/issues)
- 💡 **Have an idea?** [Request a feature](https://github.com/yourusername/edge-foundry/issues)
- 💬 **Questions?** [Start a discussion](https://github.com/yourusername/edge-foundry/discussions)
- ⭐ **Like the project?** Give us a star!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [llama.cpp](https://github.com/ggerganov/llama.cpp) for efficient model inference
- [FastAPI](https://fastapi.tiangolo.com/) for the robust API framework
- [React](https://reactjs.org/) for the beautiful dashboard
- [TinyLlama](https://huggingface.co/TinyLlama) and [Phi-3](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct) for the demo models

---

**Made with ❤️ for the AI community**
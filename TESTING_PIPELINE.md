# Edge Foundry Testing Pipeline

This guide provides a comprehensive testing pipeline to verify all backend functionality before implementing the frontend.

## Prerequisites

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Download Model File**
   You can download the model using one of these methods:
   
   **Option A: Using CLI (Recommended)**
   ```bash
   python cli.py download
   ```
   
   **Option B: Using standalone script**
   ```bash
   python download_model.py
   ```
   
   **Option C: Manual download**
   - Download from Hugging Face: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF
   - Place the `tinyllama-1.1b-chat-v1.0.Q8_0.gguf` file in the `models/` directory

## Testing Pipeline

### Phase 1: Environment Setup & Validation

#### 1.1 Initialize Edge Foundry
```bash
python cli.py init
```
**Expected Output:**
- ✅ Created default config at .edgefoundry/edgefoundry.yaml
- ✅ Created .gitignore at .edgefoundry/.gitignore
- 🎉 Edge Foundry initialized successfully!

#### 1.2 Deploy Model
```bash
python cli.py deploy --model models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf
```
**Expected Output:**
- 📦 Deploying model: models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf
- ✅ Model copied to .edgefoundry/models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf
- ✅ Config updated at .edgefoundry/edgefoundry.yaml
- 🎉 Deployment completed successfully!

#### 1.3 Verify Configuration
```bash
cat .edgefoundry/edgefoundry.yaml
```
**Expected Output:**
```yaml
model_path: ./models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf
runtime: llama_cpp
device: local
port: 8000
host: 0.0.0.0
```

### Phase 2: CLI Functionality Testing

#### 2.1 Test Status Command (Before Start)
```bash
python cli.py status
```
**Expected Output:**
- 🔴 Agent is not running
- 📋 Configuration: .edgefoundry/edgefoundry.yaml
- Model: ./models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf
- Runtime: llama_cpp
- Device: local

#### 2.2 Test Clean Command
```bash
python cli.py clean --help
```
**Expected Output:**
- Shows help for clean command with options

```bash
python cli.py clean --force --keep-models --keep-config
```
**Expected Output:**
- 🧹 Cleanup Preview
- ✅ Removed temporary files
- 🎉 Cleanup completed!

### Phase 3: Agent Service Testing

#### 3.1 Start Agent
```bash
python cli.py start
```
**Expected Output:**
- 🚀 Starting Edge Foundry agent...
- ✅ Agent started successfully!
- 📊 Logs: .edgefoundry/agent.log
- 🌐 API: http://localhost:8000

#### 3.2 Verify Agent Status
```bash
python cli.py status
```
**Expected Output:**
- 🟢 Running
- PID: [process_id]
- Uptime: [seconds]
- Memory: [MB]
- CPU: [%]
- API URL: http://localhost:8000

#### 3.3 Check Logs
```bash
python cli.py logs
```
**Expected Output:**
- Recent log entries from the agent
- Should show successful startup messages

### Phase 4: API Endpoint Testing

#### 4.1 Test Health Check
```bash
curl http://localhost:8000/health
```
**Expected Output:**
```json
{"status": "healthy", "model_loaded": true}
```

#### 4.2 Test Model Info
```bash
curl http://localhost:8000/model-info
```
**Expected Output:**
```json
{
  "model_path": "./models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf",
  "runtime": "llama_cpp",
  "device": "local"
}
```

#### 4.3 Test Inference Endpoint
```bash
curl -X POST http://localhost:8000/inference \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, how are you?",
    "max_tokens": 50,
    "temperature": 0.7
  }'
```
**Expected Output:**
```json
{
  "response": "I'm doing well, thank you for asking! How can I help you today?",
  "tokens_generated": 15,
  "inference_time_ms": 1234.5
}
```

#### 4.4 Test Metrics Endpoint
```bash
curl http://localhost:8000/metrics
```
**Expected Output:**
```json
{
  "total_inferences": 1,
  "average_latency_ms": 1234.5,
  "average_tokens_per_second": 12.1,
  "average_memory_mb": 256.7
}
```

### Phase 5: CLI Metrics Testing

#### 5.1 Test Metrics Command
```bash
python cli.py metrics
```
**Expected Output:**
- 📊 Telemetry Summary table
- Total Inferences: 1
- Average Latency: [ms]
- Average Tokens/sec: [number]
- Recent Records table

#### 5.2 Test Metrics with Options
```bash
python cli.py metrics --limit 5 --summary
```
**Expected Output:**
- Summary only (no recent records table)
- Limited to 5 records

### Phase 6: Error Handling Testing

#### 6.1 Test Invalid Inference Request
```bash
curl -X POST http://localhost:8000/inference \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "",
    "max_tokens": -1
  }'
```
**Expected Output:**
- HTTP 400 error with validation message

#### 6.2 Test Stop Agent
```bash
python cli.py stop
```
**Expected Output:**
- ✅ Agent stopped successfully!

#### 6.3 Test Status After Stop
```bash
python cli.py status
```
**Expected Output:**
- 🔴 Agent is not running
- Configuration details

### Phase 7: Performance Testing

#### 7.1 Multiple Inference Requests
```bash
# Run this multiple times to test performance
for i in {1..5}; do
  curl -X POST http://localhost:8000/inference \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": \"Test prompt $i\", \"max_tokens\": 20}" &
done
wait
```

#### 7.2 Check Metrics After Performance Test
```bash
python cli.py metrics
```
**Expected Output:**
- Should show 5+ total inferences
- Performance metrics should be calculated

### Phase 8: Cleanup Testing

#### 8.1 Test Clean Command
```bash
python cli.py clean --force
```
**Expected Output:**
- Removes temporary files
- Keeps models and config (if not specified otherwise)

#### 8.2 Verify Clean State
```bash
python cli.py status
```
**Expected Output:**
- Should show clean state or prompt to initialize

## Automated Test Script

Create a test script to run all tests:

```bash
#!/bin/bash
# test_pipeline.sh

echo "🧪 Starting Edge Foundry Testing Pipeline..."

# Phase 1: Setup
echo "📋 Phase 1: Environment Setup"
python cli.py init
python cli.py deploy --model models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf

# Phase 2: CLI Testing
echo "📋 Phase 2: CLI Testing"
python cli.py status
python cli.py clean --force --keep-models --keep-config

# Phase 3: Agent Testing
echo "📋 Phase 3: Agent Testing"
python cli.py start
sleep 5
python cli.py status

# Phase 4: API Testing
echo "📋 Phase 4: API Testing"
curl -s http://localhost:8000/health
curl -s http://localhost:8000/model-info
curl -s -X POST http://localhost:8000/inference \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "max_tokens": 10}'

# Phase 5: Metrics Testing
echo "📋 Phase 5: Metrics Testing"
python cli.py metrics

# Phase 6: Cleanup
echo "📋 Phase 6: Cleanup"
python cli.py stop
python cli.py clean --force

echo "✅ Testing Pipeline Complete!"
```

## Success Criteria

All tests should pass with:
- ✅ No error messages
- ✅ Agent starts and stops cleanly
- ✅ API endpoints respond correctly
- ✅ Metrics are collected and displayed
- ✅ CLI commands work as expected
- ✅ Clean command removes temporary files

## Troubleshooting

### Common Issues:

1. **Model not found**: Ensure model file exists in `models/` directory
2. **Port already in use**: Check if another service is using port 8000
3. **Permission errors**: Ensure write permissions for `.edgefoundry/` directory
4. **Memory issues**: Large models may require significant RAM

### Debug Commands:

```bash
# Check if agent is running
ps aux | grep uvicorn

# Check port usage
lsof -i :8000

# Check logs
tail -f .edgefoundry/agent.log

# Check configuration
cat .edgefoundry/edgefoundry.yaml
```

## Next Steps

Once all tests pass:
1. ✅ Backend is fully functional
2. ✅ API endpoints are working
3. ✅ Telemetry is collecting data
4. ✅ CLI commands are operational
5. 🚀 Ready to implement frontend!

---

**Note**: This testing pipeline ensures your backend is solid before adding frontend complexity. All components should work independently and together.

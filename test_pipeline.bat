@echo off
REM Edge Foundry Testing Pipeline Script for Windows

echo 🧪 Starting Edge Foundry Testing Pipeline...
echo ==============================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    exit /b 1
)

REM Check if model file exists
set MODEL_FILE=models\tinyllama-1.1b-chat-v1.0.Q8_0.gguf
if not exist "%MODEL_FILE%" (
    echo ⚠️  Model file not found: %MODEL_FILE%
    echo ⚠️  Please ensure you have a model file in the models\ directory
    exit /b 1
)

echo ✅ Model file found: %MODEL_FILE%

REM Phase 1: Environment Setup
echo 📋 Phase 1: Environment Setup ^& Validation

echo 📋 Initializing Edge Foundry...
python cli.py init
if errorlevel 1 (
    echo ❌ Initialization failed
    exit /b 1
)
echo ✅ Initialization complete

echo 📋 Deploying model...
python cli.py deploy --model "%MODEL_FILE%"
if errorlevel 1 (
    echo ❌ Model deployment failed
    exit /b 1
)
echo ✅ Model deployment complete

echo 📋 Verifying configuration...
if exist ".edgefoundry\edgefoundry.yaml" (
    echo ✅ Configuration file exists
    echo Configuration contents:
    type .edgefoundry\edgefoundry.yaml
) else (
    echo ❌ Configuration file not found
    exit /b 1
)

REM Phase 2: CLI Functionality Testing
echo 📋 Phase 2: CLI Functionality Testing

echo 📋 Testing status command (before start)...
python cli.py status

echo 📋 Testing clean command...
python cli.py clean --force --keep-models --keep-config
echo ✅ Clean command test complete

REM Phase 3: Agent Service Testing
echo 📋 Phase 3: Agent Service Testing

echo 📋 Starting agent...
python cli.py start
if errorlevel 1 (
    echo ❌ Agent start failed
    exit /b 1
)
echo ✅ Agent start command sent

REM Wait for agent to start
echo 📋 Waiting for agent to initialize...
timeout /t 10 /nobreak >nul

echo 📋 Checking agent status...
python cli.py status

echo 📋 Checking logs...
python cli.py logs

REM Phase 4: API Endpoint Testing
echo 📋 Phase 4: API Endpoint Testing

echo 📋 Testing health check...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Health check failed
) else (
    echo ✅ Health check passed
    curl -s http://localhost:8000/health
)

echo 📋 Testing model info...
curl -s http://localhost:8000/model-info >nul 2>&1
if errorlevel 1 (
    echo ❌ Model info endpoint failed
) else (
    echo ✅ Model info endpoint working
    curl -s http://localhost:8000/model-info
)

echo 📋 Testing inference endpoint...
curl -s -X POST http://localhost:8000/inference -H "Content-Type: application/json" -d "{\"prompt\": \"Hello, how are you?\", \"max_tokens\": 20, \"temperature\": 0.7}"
if errorlevel 1 (
    echo ❌ Inference endpoint failed
) else (
    echo ✅ Inference endpoint working
)

echo 📋 Testing metrics endpoint...
curl -s http://localhost:8000/metrics >nul 2>&1
if errorlevel 1 (
    echo ❌ Metrics endpoint failed
) else (
    echo ✅ Metrics endpoint working
    curl -s http://localhost:8000/metrics
)

REM Phase 5: CLI Metrics Testing
echo 📋 Phase 5: CLI Metrics Testing

echo 📋 Testing CLI metrics command...
python cli.py metrics

echo 📋 Testing CLI metrics with options...
python cli.py metrics --limit 5 --summary

REM Phase 6: Performance Testing
echo 📋 Phase 6: Performance Testing

echo 📋 Running multiple inference requests...
for /L %%i in (1,1,3) do (
    echo Request %%i...
    curl -s -X POST http://localhost:8000/inference -H "Content-Type: application/json" -d "{\"prompt\": \"Test prompt %%i\", \"max_tokens\": 10}" >nul
    timeout /t 1 /nobreak >nul
)
echo ✅ Performance test complete

echo 📋 Checking metrics after performance test...
python cli.py metrics

REM Phase 7: Cleanup Testing
echo 📋 Phase 7: Cleanup Testing

echo 📋 Stopping agent...
python cli.py stop
echo ✅ Agent stopped

echo 📋 Testing status after stop...
python cli.py status

echo 📋 Testing clean command...
python cli.py clean --force
echo ✅ Clean command test complete

REM Final Status
echo.
echo ==============================================
echo ✅ 🎉 Testing Pipeline Complete!
echo ✅ Backend is ready for frontend implementation!
echo ==============================================

pause

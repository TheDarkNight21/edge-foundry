#!/bin/bash
# Edge Foundry Testing Pipeline Script

set -e  # Exit on any error

echo "🧪 Starting Edge Foundry Testing Pipeline..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Python is available
if ! command -v python &> /dev/null; then
    print_error "Python is not installed or not in PATH"
    exit 1
fi

# Check if model file exists
MODEL_FILE="models/tinyllama-1.1b-chat-v1.0.Q8_0.gguf"
if [ ! -f "$MODEL_FILE" ]; then
    print_warning "Model file not found: $MODEL_FILE"
    print_warning "Please ensure you have a model file in the models/ directory"
    exit 1
fi

print_success "Model file found: $MODEL_FILE"

# Phase 1: Environment Setup
print_status "Phase 1: Environment Setup & Validation"

print_status "Initializing Edge Foundry..."
python cli.py init
print_success "Initialization complete"

print_status "Deploying model..."
python cli.py deploy --model "$MODEL_FILE"
print_success "Model deployment complete"

print_status "Verifying configuration..."
if [ -f ".edgefoundry/edgefoundry.yaml" ]; then
    print_success "Configuration file exists"
    echo "Configuration contents:"
    cat .edgefoundry/edgefoundry.yaml
else
    print_error "Configuration file not found"
    exit 1
fi

# Phase 2: CLI Functionality Testing
print_status "Phase 2: CLI Functionality Testing"

print_status "Testing status command (before start)..."
python cli.py status

print_status "Testing clean command..."
python cli.py clean --force --keep-models --keep-config
print_success "Clean command test complete"

# Phase 3: Agent Service Testing
print_status "Phase 3: Agent Service Testing"

print_status "Starting agent..."
python cli.py start
print_success "Agent start command sent"

# Wait for agent to start
print_status "Waiting for agent to initialize..."
sleep 10

print_status "Checking agent status..."
python cli.py status

print_status "Checking logs..."
python cli.py logs

# Phase 4: API Endpoint Testing
print_status "Phase 4: API Endpoint Testing"

print_status "Testing health check..."
if curl -s http://localhost:8000/health > /dev/null; then
    print_success "Health check passed"
    curl -s http://localhost:8000/health | python -m json.tool
else
    print_error "Health check failed"
fi

print_status "Testing model info..."
if curl -s http://localhost:8000/model-info > /dev/null; then
    print_success "Model info endpoint working"
    curl -s http://localhost:8000/model-info | python -m json.tool
else
    print_error "Model info endpoint failed"
fi

print_status "Testing inference endpoint..."
INFERENCE_RESPONSE=$(curl -s -X POST http://localhost:8000/inference \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, how are you?",
    "max_tokens": 20,
    "temperature": 0.7
  }')

if [ $? -eq 0 ] && [ -n "$INFERENCE_RESPONSE" ]; then
    print_success "Inference endpoint working"
    echo "$INFERENCE_RESPONSE" | python -m json.tool
else
    print_error "Inference endpoint failed"
fi

print_status "Testing metrics endpoint..."
if curl -s http://localhost:8000/metrics > /dev/null; then
    print_success "Metrics endpoint working"
    curl -s http://localhost:8000/metrics | python -m json.tool
else
    print_error "Metrics endpoint failed"
fi

# Phase 5: CLI Metrics Testing
print_status "Phase 5: CLI Metrics Testing"

print_status "Testing CLI metrics command..."
python cli.py metrics

print_status "Testing CLI metrics with options..."
python cli.py metrics --limit 5 --summary

# Phase 6: Performance Testing
print_status "Phase 6: Performance Testing"

print_status "Running multiple inference requests..."
for i in {1..3}; do
    echo "Request $i..."
    curl -s -X POST http://localhost:8000/inference \
      -H "Content-Type: application/json" \
      -d "{\"prompt\": \"Test prompt $i\", \"max_tokens\": 10}" > /dev/null
    sleep 1
done
print_success "Performance test complete"

print_status "Checking metrics after performance test..."
python cli.py metrics

# Phase 7: Cleanup Testing
print_status "Phase 7: Cleanup Testing"

print_status "Stopping agent..."
python cli.py stop
print_success "Agent stopped"

print_status "Testing status after stop..."
python cli.py status

print_status "Testing clean command..."
python cli.py clean --force
print_success "Clean command test complete"

# Final Status
echo ""
echo "=============================================="
print_success "🎉 Testing Pipeline Complete!"
print_success "Backend is ready for frontend implementation!"
echo "=============================================="

#!/bin/bash
# Setup script for MacBook frontend

echo "🍎 Setting up Edge Foundry Dashboard on MacBook..."

# Get the PC's IP address
echo "📡 Please enter your PC's IP address (e.g., 192.168.1.100):"
read PC_IP

if [ -z "$PC_IP" ]; then
    echo "❌ IP address is required"
    exit 1
fi

echo "🔧 Updating configuration for PC IP: $PC_IP"

# Update config.js with the PC IP
cat > src/config.js << EOF
const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://$PC_IP:8000',
  POLLING_INTERVAL: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export default config;
EOF

# Update package.json proxy
sed -i '' "s/\"proxy\": \"http:\/\/.*:8000\"/\"proxy\": \"http:\/\/$PC_IP:8000\"/" package.json

echo "📦 Installing dependencies..."
npm install

echo "🧪 Testing connection to PC backend..."
if curl -s "http://$PC_IP:8000/health" > /dev/null; then
    echo "✅ Backend connection successful!"
else
    echo "⚠️  Backend connection failed. Please check:"
    echo "   1. PC is running the agent: python cli.py start"
    echo "   2. PC IP address is correct: $PC_IP"
    echo "   3. Windows Firewall allows port 8000"
    echo "   4. Both devices are on the same network"
fi

echo "🚀 Starting development server..."
echo "Dashboard will be available at: http://localhost:3000"
echo "Backend API: http://$PC_IP:8000"

npm start
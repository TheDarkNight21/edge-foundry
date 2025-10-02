#!/bin/bash

echo "========================================"
echo "Edge Foundry - MacBook Frontend Setup"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Recommended: Node.js 18 LTS or later"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo

# Navigate to dashboard directory
cd dashboard

# Install dependencies
echo "📦 Installing dashboard dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo

# Create .env file
echo "📝 Creating .env file for MacBook..."
echo "Please enter the backend URL from your Windows PC:"
echo "Examples:"
echo "  - ngrok: https://abc123.ngrok.io"
echo "  - localtunnel: https://abc123.loca.lt"
echo "  - Cloudflare: https://your-tunnel.trycloudflare.com"
echo
read -p "Enter backend URL: " BACKEND_URL

# Remove http:// or https:// if user included it
BACKEND_URL=$(echo $BACKEND_URL | sed 's|http://||g' | sed 's|https://||g')

# Add https:// if not present
if [[ ! $BACKEND_URL == https://* ]]; then
    BACKEND_URL="https://$BACKEND_URL"
fi

cat > .env << EOF
# Edge Foundry Dashboard Configuration
# Remote backend from Windows PC
REACT_APP_API_URL=$BACKEND_URL

# Optional: Customize the dashboard
# REACT_APP_TITLE=Edge Foundry Dashboard
# REACT_APP_REFRESH_INTERVAL=30000
EOF

echo "✅ Created .env file with backend URL: $BACKEND_URL"
echo

# Test backend connection
echo "🔍 Testing backend connection..."
if curl -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend is accessible from MacBook"
else
    echo "⚠️  Backend may not be accessible yet"
    echo "   Make sure your Windows PC is running the backend with tunneling"
    echo "   Check the tunnel URL is correct"
fi

echo
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo
echo "🌐 Configuration:"
echo "   Backend URL: $BACKEND_URL"
echo "   Dashboard will run on: http://localhost:3000"
echo
echo "🚀 To start the dashboard:"
echo "   npm start"
echo
echo "📱 Access the dashboard:"
echo "   Open browser: http://localhost:3000"
echo
echo "⚠️  Make sure your Windows PC backend is running with tunneling enabled"
echo

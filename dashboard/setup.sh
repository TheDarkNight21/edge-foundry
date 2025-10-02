#!/bin/bash

# Edge Foundry Dashboard Setup Script
echo "🚀 Setting up Edge Foundry Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js and try again."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies. Please check the error messages above."
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    
    # Ask for backend IP address
    echo ""
    echo "🌐 Backend Configuration"
    echo "Please enter the IP address of your PC where Edge Foundry is running:"
    echo "Examples:"
    echo "  - localhost (for same machine): localhost"
    echo "  - Local network IP: 192.168.1.100"
    echo "  - Remote IP: 10.0.0.50"
    echo ""
    read -p "Enter IP address [localhost]: " BACKEND_IP
    
    # Default to localhost if empty
    if [ -z "$BACKEND_IP" ]; then
        BACKEND_IP="localhost"
    fi
    
    # Remove http:// if user included it
    BACKEND_IP=$(echo $BACKEND_IP | sed 's|http://||g' | sed 's|https://||g')
    
    cat > .env << EOF
# Edge Foundry Dashboard Configuration
# Backend IP: $BACKEND_IP
REACT_APP_API_URL=http://$BACKEND_IP:8000

# Optional: Customize the dashboard
# REACT_APP_TITLE=Edge Foundry Dashboard
# REACT_APP_REFRESH_INTERVAL=30000
EOF
    echo "✅ Created .env file with backend IP: $BACKEND_IP"
else
    echo "✅ .env file already exists"
    echo "📝 Current backend URL: $(grep REACT_APP_API_URL .env | cut -d'=' -f2)"
fi

# Check if the backend is running
echo "🔍 Checking if Edge Foundry backend is running..."
BACKEND_URL=$(grep REACT_APP_API_URL .env | cut -d'=' -f2)
if curl -s $BACKEND_URL/health > /dev/null 2>&1; then
    echo "✅ Edge Foundry backend is running on $BACKEND_URL"
else
    echo "⚠️  Edge Foundry backend is not running on $BACKEND_URL"
    echo "   Please start the backend first:"
    echo "   - Run: python agent.py"
    echo "   - Or: edgefoundry start"
    echo ""
    echo "   Make sure the backend is accessible from this machine"
    echo "   Then start the dashboard with: npm start"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the dashboard:"
echo "  npm start"
echo ""
echo "The dashboard will be available at: http://localhost:3000"
echo ""
echo "Backend configuration:"
echo "  URL: $BACKEND_URL"
echo "  Make sure the Edge Foundry backend is running and accessible"
echo ""
echo "To change the backend IP later, edit the .env file:"
echo "  REACT_APP_API_URL=http://YOUR_PC_IP:8000"

#!/bin/bash

# Edge Foundry - Find Your PC's IP Address
echo "🔍 Finding your PC's IP address for Edge Foundry dashboard configuration..."
echo ""

# Function to get IP address based on OS
get_ip_address() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        ip=$(ip route get 1.1.1.1 | awk '{print $7}' | head -1)
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows (Git Bash)
        ip=$(ipconfig | grep "IPv4" | grep -v "127.0.0.1" | awk '{print $NF}' | head -1)
    else
        echo "❌ Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    echo "$ip"
}

# Get the IP address
IP_ADDRESS=$(get_ip_address)

if [ -z "$IP_ADDRESS" ]; then
    echo "❌ Could not determine your IP address automatically."
    echo ""
    echo "Please find your IP address manually:"
    echo ""
    echo "macOS/Linux:"
    echo "  ifconfig | grep 'inet ' | grep -v 127.0.0.1"
    echo ""
    echo "Windows:"
    echo "  ipconfig | findstr IPv4"
    echo ""
    echo "Then use it in the dashboard configuration:"
    echo "  http://YOUR_IP:8000"
    exit 1
fi

echo "✅ Found your IP address: $IP_ADDRESS"
echo ""
echo "🌐 Dashboard Configuration:"
echo "  Backend URL: http://$IP_ADDRESS:8000"
echo ""
echo "📝 To configure the dashboard:"
echo "  1. Run: ./setup.sh"
echo "  2. Enter: $IP_ADDRESS"
echo "  3. Or edit .env file: REACT_APP_API_URL=http://$IP_ADDRESS:8000"
echo ""
echo "🔧 Make sure your Edge Foundry backend is running and accessible:"
echo "  python agent.py"
echo "  # OR"
echo "  edgefoundry start"
echo ""
echo "⚠️  Note: Ensure your firewall allows connections on port 8000"

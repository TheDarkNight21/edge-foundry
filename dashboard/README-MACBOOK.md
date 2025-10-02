# Edge Foundry Dashboard - MacBook Setup

This guide will help you set up the frontend dashboard on your MacBook to connect to the Edge Foundry backend running on your PC.

## Prerequisites

- Node.js and npm installed on MacBook
- PC running Edge Foundry backend
- Both devices on the same network

## Quick Setup

### Option 1: Automated Setup
```bash
# Run the setup script
./setup-macbook.sh
```

### Option 2: Manual Setup

#### 1. Find Your PC's IP Address
On your PC, run:
```cmd
ipconfig
```
Look for the IPv4 address (e.g., 192.168.1.100)

#### 2. Update Configuration
Edit `src/config.js` and replace the IP address:
```javascript
const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://192.168.1.100:8000', // Your PC's IP
  POLLING_INTERVAL: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};
```

#### 3. Update Package.json Proxy
Edit `package.json` and update the proxy:
```json
{
  "proxy": "http://192.168.1.100:8000"
}
```

#### 4. Install Dependencies
```bash
npm install
```

#### 5. Start Development Server
```bash
npm start
```

## Testing Connection

Before starting the frontend, test the backend connection:

```bash
# Test health endpoint
curl http://192.168.1.100:8000/health

# Test model info
curl http://192.168.1.100:8000/model-info

# Test metrics
curl http://192.168.1.100:8000/metrics
```

## Troubleshooting

### Connection Issues
1. **Check PC IP Address**: Make sure the IP address is correct
2. **Verify Backend is Running**: On PC, run `python cli.py status`
3. **Check Windows Firewall**: Allow port 8000 through firewall
4. **Network Connectivity**: Ensure both devices are on the same network

### CORS Issues
If you get CORS errors, the backend needs to allow cross-origin requests. The agent should already be configured for this.

### Port Issues
- Backend runs on port 8000
- Frontend runs on port 3000
- Make sure no other services are using these ports

## Available Endpoints

The dashboard connects to these backend endpoints:
- `GET /health` - System health status
- `GET /model-info` - Model information
- `GET /metrics` - Telemetry metrics
- `POST /inference` - Run model inference

## Features

- **Real-time Metrics**: Auto-refreshes every 30 seconds
- **Health Monitoring**: Shows system and model status
- **Inference Panel**: Run prompts with customizable parameters
- **Recent Inferences**: Table of recent inference history
- **Performance Charts**: Visual representation of metrics
- **Responsive Design**: Works on desktop and mobile

## Development

### Project Structure
```
dashboard/
├── src/
│   ├── components/     # React components
│   ├── services/       # API service layer
│   ├── hooks/          # Custom React hooks
│   ├── config.js       # Configuration
│   └── App.js          # Main app component
├── package.json        # Dependencies
└── setup-macbook.sh    # Setup script
```

### Key Files
- `src/config.js` - API configuration
- `src/services/api.js` - API service layer
- `src/hooks/useApi.js` - Custom hooks for API calls
- `src/components/` - Dashboard components

## Production Build

To create a production build:
```bash
npm run build
```

The build files will be in the `build/` directory.

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify the backend is running and accessible
3. Check network connectivity between devices
4. Review the setup steps above

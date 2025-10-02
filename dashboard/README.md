# Edge Foundry Dashboard

A modern, responsive React dashboard for monitoring and interacting with the Edge Foundry AI agent. This dashboard provides real-time metrics, model information, and an interactive inference interface.

## Features

### 🎯 **Core Features**
- **Real-time Metrics**: Live monitoring of inference statistics, latency, and performance
- **Model Information**: Display model configuration, runtime, and health status
- **Interactive Inference**: Run model inferences directly from the dashboard
- **Recent Inferences Table**: Sortable and filterable history of inference requests
- **System Status**: Real-time connection and health monitoring
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📊 **Metrics Dashboard**
- Total inferences count
- Average latency and tokens per second
- Memory usage statistics
- First and last inference timestamps
- Real-time updates every 30 seconds

### 🤖 **Inference Panel**
- Text input for prompts
- Adjustable temperature (0.1-2.0) and max tokens (1-512)
- Real-time inference execution
- Performance metrics display
- Response history

### 📈 **Data Visualization**
- Sortable inference history table
- Filterable records
- Performance trend indicators
- System resource monitoring

## Prerequisites

- Node.js 16+ and npm
- Edge Foundry backend running on `http://localhost:8000`
- Modern web browser with JavaScript enabled

## Installation

1. **Navigate to the dashboard directory:**
   ```bash
   cd dashboard
   ```

2. **Find your PC's IP address (for remote backend):**
   ```bash
   ./find-ip.sh
   # OR
   npm run find-ip
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the setup script:**
   ```bash
   ./setup.sh
   # OR
   npm run setup
   ```

5. **Start the development server:**
   ```bash
   npm start
   ```

6. **Open your browser:**
   Navigate to `http://localhost:3000`

## Configuration

### Environment Variables

Create a `.env` file in the dashboard directory to customize the API endpoint:

```env
# For local backend
REACT_APP_API_URL=http://localhost:8000

# For remote backend (replace with your PC's IP)
REACT_APP_API_URL=http://192.168.1.100:8000
```

**Remote Backend Configuration:**
- Replace `192.168.1.100` with your PC's actual IP address
- Ensure the Edge Foundry backend is accessible from the network
- The dashboard includes a built-in configuration panel for easy IP changes

### Backend Requirements

Ensure your Edge Foundry backend is running with the following endpoints:
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /model-info` - Model information
- `GET /metrics` - Telemetry metrics
- `POST /inference` - Run inference

## Usage

### Starting the Dashboard

1. **Start the Edge Foundry backend:**
   ```bash
   # In the main project directory
   python agent.py
   # OR
   edgefoundry start
   ```

2. **Start the dashboard:**
   ```bash
   # In the dashboard directory
   npm start
   ```

3. **Access the dashboard:**
   Open `http://localhost:3000` in your browser

### Using the Dashboard

1. **Monitor System Status**: Check the connection status and model health at the top
2. **View Metrics**: See real-time performance statistics in the metrics overview
3. **Run Inferences**: Use the inference panel to test the model with custom prompts
4. **Review History**: Browse and filter recent inference records
5. **Configure Backend**: Click the settings icon to change the backend IP address
6. **Toggle Settings**: Switch between dark/light mode and enable/disable auto-refresh

### Backend Configuration

The dashboard includes a built-in configuration panel accessible via the settings icon in the header:

1. **Click the Settings Icon** in the top-right corner
2. **Enter your PC's IP address** (e.g., `192.168.1.100:8000`)
3. **Test the connection** to verify accessibility
4. **Save the configuration** and refresh the page

**Common IP Address Examples:**
- Local machine: `localhost:8000` or `127.0.0.1:8000`
- Local network: `192.168.1.100:8000` (replace with your actual IP)
- Remote server: `10.0.0.50:8000` (replace with your actual IP)

## Development

### Project Structure

```
dashboard/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── SystemStatus.js
│   │   ├── MetricsOverview.js
│   │   ├── ModelInfo.js
│   │   ├── InferencePanel.js
│   │   ├── RecentInferences.js
│   │   └── ErrorBoundary.js
│   ├── context/
│   │   └── AppContext.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Customization

#### Styling
The dashboard uses Tailwind CSS for styling. Customize the theme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom primary colors
      }
    }
  }
}
```

#### API Configuration
Modify the API service in `src/services/api.js` to change endpoints or add new functionality.

#### Components
All components are modular and can be easily customized or extended in the `src/components/` directory.

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure the Edge Foundry backend is running on `http://localhost:8000`
2. **CORS Issues**: The dashboard includes a proxy configuration for development
3. **Build Errors**: Make sure all dependencies are installed with `npm install`

### Debug Mode

Enable debug logging by opening browser developer tools and checking the console for API request/response logs.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of Edge Foundry and follows the same license terms.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the Edge Foundry documentation
3. Open an issue on the project repository

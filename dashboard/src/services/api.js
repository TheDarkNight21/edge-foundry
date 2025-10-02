import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - please try again');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error - please check the agent logs');
    }
    
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found - please check the agent is running');
    }
    
    if (!error.response) {
      throw new Error('Network error - please check the agent is running and accessible');
    }
    
    throw error;
  }
);

// API service functions
export const apiService = {
  // Health and status endpoints
  async getHealth() {
    const response = await api.get('/health');
    return response.data;
  },

  async getRoot() {
    const response = await api.get('/');
    return response.data;
  },

  // Model information
  async getModelInfo() {
    const response = await api.get('/model-info');
    return response.data;
  },

  // Metrics and telemetry
  async getMetrics() {
    const response = await api.get('/metrics');
    return response.data;
  },

  // Inference
  async runInference(prompt, maxTokens = 64, temperature = 0.7) {
    const response = await api.post('/inference', {
      prompt,
      max_tokens: maxTokens,
      temperature,
    });
    return response.data;
  },
};

// Utility functions for data transformation
export const dataUtils = {
  formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  },

  formatLatency(latencyMs) {
    if (latencyMs < 1000) {
      return `${latencyMs.toFixed(1)}ms`;
    }
    return `${(latencyMs / 1000).toFixed(2)}s`;
  },

  formatMemory(memoryMB) {
    if (memoryMB < 1024) {
      return `${memoryMB.toFixed(1)} MB`;
    }
    return `${(memoryMB / 1024).toFixed(2)} GB`;
  },

  formatTokensPerSecond(tokensPerSecond) {
    return `${tokensPerSecond.toFixed(1)} tokens/sec`;
  },

  getStatusColor(status) {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  },

  getStatusIcon(status) {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return '?';
    }
  },
};

export default api;

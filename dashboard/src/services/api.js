import config from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }

  // Model info
  async getModelInfo() {
    return this.request('/model-info');
  }

  // Metrics
  async getMetrics() {
    const result = await this.request('/metrics');
    console.log('Metrics data received:', result);
    console.log('Summary:', result.summary);
    console.log('Recent records:', result.recent_records);
    if (result.recent_records && result.recent_records.length > 0) {
      console.log('First record:', result.recent_records[0]);
    }
    return result;
  }

  // Inference
  async runInference(prompt, maxTokens = 64, temperature = 0.7, modelId = null) {
    return this.request('/inference', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        max_tokens: maxTokens,
        temperature,
        model_id: modelId,
      }),
    });
  }

  // Demo models
  async getDemoModels() {
    return this.request('/demo-models');
  }

  async getSamplePrompts(modelId) {
    return this.request(`/demo-models/${modelId}/sample-prompts`);
  }

  async switchModel(modelId) {
    return this.request('/demo-models/switch', {
      method: 'POST',
      body: JSON.stringify({
        model_id: modelId,
      }),
    });
  }

  async getCurrentModel() {
    return this.request('/demo-models/current');
  }

  // Root endpoint
  async getRoot() {
    return this.request('/');
  }
}

// Data utilities
export const dataUtils = {
  formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  },

  formatLatency(latency) {
    if (latency === null || latency === undefined) return 'N/A';
    const numLatency = Number(latency);
    if (isNaN(numLatency)) return 'N/A';
    return `${numLatency.toFixed(1)}ms`;
  },

  formatTokensPerSecond(tokensPerSecond) {
    if (tokensPerSecond === null || tokensPerSecond === undefined) return 'N/A';
    const numTokens = Number(tokensPerSecond);
    if (isNaN(numTokens)) return 'N/A';
    return `${numTokens.toFixed(1)}`;
  },

  formatMemory(memory) {
    if (memory === null || memory === undefined) return 'N/A';
    const numMemory = Number(memory);
    if (isNaN(numMemory)) return 'N/A';
    return `${numMemory.toFixed(1)}MB`;
  },

  formatTemperature(temperature) {
    if (temperature === null || temperature === undefined) return 'N/A';
    const numTemp = Number(temperature);
    if (isNaN(numTemp)) return 'N/A';
    return numTemp.toFixed(2);
  }
};

// Export both named and default exports
export const apiService = new ApiService();
export default apiService;
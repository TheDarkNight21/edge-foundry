import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { apiService } from '../services/api';

function ConfigPanel() {
  const { isConnected, actions } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load current backend URL from environment
  useEffect(() => {
    const currentUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    setBackendUrl(currentUrl);
  }, []);

  const testConnection = async () => {
    if (!backendUrl.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      // Temporarily override the base URL for testing
      const testApi = apiService;
      const originalBaseURL = testApi.defaults?.baseURL;
      
      // Create a temporary axios instance for testing
      const axios = require('axios');
      const testInstance = axios.create({
        baseURL: backendUrl,
        timeout: 5000,
      });

      const response = await testInstance.get('/health');
      setTestResult({
        success: true,
        message: 'Connection successful!',
        data: response.data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'Connection failed',
        data: null
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!backendUrl.trim() || !testResult?.success) return;

    setIsSaving(true);
    
    try {
      // Update the environment variable (this will require a page reload)
      localStorage.setItem('backendUrl', backendUrl);
      
      // Show success message
      setTestResult({
        ...testResult,
        message: 'Configuration saved! Please refresh the page to apply changes.'
      });
      
      // Auto-close after a delay
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
      
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to save configuration',
        data: null
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    setBackendUrl('http://localhost:8000');
    setTestResult(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
        title="Configuration"
      >
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Backend Configuration
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Status */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isConnected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Current: {process.env.REACT_APP_API_URL || 'http://localhost:8000'}
            </span>
          </div>

          {/* Backend URL Input */}
          <div>
            <label htmlFor="backendUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Backend URL
            </label>
            <input
              id="backendUrl"
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://192.168.1.100:8000"
              className="input"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the IP address and port where your Edge Foundry backend is running
            </p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg ${
              testResult.success 
                ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center space-x-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  testResult.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {testResult.message}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={testConnection}
              disabled={!backendUrl.trim() || isTesting}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Test Connection</span>
                </>
              )}
            </button>

            <button
              onClick={saveConfiguration}
              disabled={!testResult?.success || isSaving}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={resetToDefault}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>

          {/* Help Text */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><strong>Examples:</strong></p>
            <p>• Local machine: http://localhost:8000</p>
            <p>• Local network: http://192.168.1.100:8000</p>
            <p>• Remote server: http://10.0.0.50:8000</p>
            <p className="mt-2 text-yellow-600 dark:text-yellow-400">
              ⚠️ After saving, you'll need to refresh the page to apply changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfigPanel;

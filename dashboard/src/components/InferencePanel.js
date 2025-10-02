import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Loader2, 
  Settings,
  Clock,
  Zap,
  MemoryStick
} from 'lucide-react';
import { dataUtils } from '../services/api';

function InferencePanel() {
  const { 
    isConnected, 
    isRunningInference, 
    lastInference, 
    actions 
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState(64);
  const [temperature, setTemperature] = useState(0.7);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !isConnected || isRunningInference) return;

    try {
      await actions.runInference(prompt.trim(), maxTokens, temperature);
      setPrompt(''); // Clear prompt after successful inference
    } catch (error) {
      // Error is handled by the context and toast
    }
  };

  const isDisabled = !isConnected || isRunningInference || !prompt.trim();

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Run Inference
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prompt Input */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="input min-h-[100px] resize-none"
            disabled={!isConnected || isRunningInference}
            rows={4}
          />
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Max Tokens */}
          <div>
            <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Tokens: {maxTokens}
            </label>
            <input
              id="maxTokens"
              type="range"
              min="1"
              max="512"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              disabled={!isConnected || isRunningInference}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>512</span>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature: {temperature.toFixed(1)}
            </label>
            <input
              id="temperature"
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              disabled={!isConnected || isRunningInference}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.1</span>
              <span>2.0</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isDisabled}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          {isRunningInference ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Inference...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Run Inference</span>
            </>
          )}
        </button>
      </form>

      {/* Last Inference Result */}
      {lastInference && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Last Inference Result
          </h3>
          
          <div className="space-y-3">
            {/* Response */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Response:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {lastInference.response}
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {dataUtils.formatLatency(lastInference.processing_time * 1000)}
                </span>
              </div>
              
              {lastInference.model_info && (
                <>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {lastInference.model_info.temperature}°C
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {lastInference.model_info.max_tokens} tokens
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InferencePanel;

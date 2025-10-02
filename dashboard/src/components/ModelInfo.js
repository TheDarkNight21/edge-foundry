import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Cpu, 
  HardDrive, 
  CheckCircle, 
  XCircle,
  Settings,
  FileText
} from 'lucide-react';

function ModelInfo() {
  const { modelInfo, health, isLoading } = useApp();

  if (isLoading && !modelInfo) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Model Information
        </h2>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!modelInfo) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Model Information
        </h2>
        <div className="text-center py-4">
          <XCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No model information available
          </p>
        </div>
      </div>
    );
  }

  const isModelLoaded = health?.model_loaded || false;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Model Information
        </h2>
        <div className={`status-indicator ${
          isModelLoaded ? 'status-healthy' : 'status-error'
        }`}>
          {isModelLoaded ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {isModelLoaded ? 'Loaded' : 'Not Loaded'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Model Path */}
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Model Path
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
              {modelInfo.model_path || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Runtime */}
        <div className="flex items-center space-x-3">
          <Cpu className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Runtime
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {modelInfo.runtime || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Device */}
        <div className="flex items-center space-x-3">
          <HardDrive className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Device
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {modelInfo.device || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Configuration */}
        {modelInfo.config && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Configuration
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                {JSON.stringify(modelInfo.config, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModelInfo;

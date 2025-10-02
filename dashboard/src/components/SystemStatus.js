import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Cpu,
  HardDrive
} from 'lucide-react';

function SystemStatus() {
  const { isConnected, health, modelInfo, isLoading, error } = useApp();

  const getStatusInfo = () => {
    if (error) {
      return {
        status: 'error',
        icon: XCircle,
        text: 'Connection Error',
        description: error,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900',
        borderColor: 'border-red-200 dark:border-red-700',
      };
    }

    if (isLoading) {
      return {
        status: 'loading',
        icon: Clock,
        text: 'Connecting...',
        description: 'Establishing connection to Edge Foundry agent',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900',
        borderColor: 'border-yellow-200 dark:border-yellow-700',
      };
    }

    if (!isConnected) {
      return {
        status: 'disconnected',
        icon: XCircle,
        text: 'Disconnected',
        description: 'Unable to connect to Edge Foundry agent',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900',
        borderColor: 'border-red-200 dark:border-red-700',
      };
    }

    if (health?.model_loaded) {
      return {
        status: 'healthy',
        icon: CheckCircle,
        text: 'System Healthy',
        description: 'Edge Foundry agent is running and model is loaded',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900',
        borderColor: 'border-green-200 dark:border-green-700',
      };
    }

    return {
      status: 'warning',
      icon: AlertCircle,
      text: 'Model Loading',
      description: 'Edge Foundry agent is running but model is not loaded',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="mb-6">
      <div className={`rounded-lg border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className={`w-6 h-6 ${statusInfo.color} ${isLoading ? 'animate-pulse' : ''}`} />
            <div>
              <h3 className={`font-semibold ${statusInfo.color}`}>
                {statusInfo.text}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {statusInfo.description}
              </p>
            </div>
          </div>
          
          {/* System Info */}
          {isConnected && health && (
            <div className="flex items-center space-x-4 text-sm">
              {modelInfo?.runtime && (
                <div className="flex items-center space-x-1">
                  <Cpu className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {modelInfo.runtime}
                  </span>
                </div>
              )}
              
              {modelInfo?.device && (
                <div className="flex items-center space-x-1">
                  <HardDrive className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {modelInfo.device}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemStatus;

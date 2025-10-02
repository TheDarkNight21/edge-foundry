import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  Moon, 
  Sun, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Settings
} from 'lucide-react';
import ConfigPanel from './ConfigPanel';

function Header() {
  const { 
    isConnected, 
    darkMode, 
    autoRefresh, 
    isLoading,
    actions 
  } = useApp();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Edge Foundry
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI Agent Dashboard
              </p>
            </div>
          </div>

          {/* Status and Controls */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Auto Refresh Toggle */}
            <button
              onClick={actions.toggleAutoRefresh}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                autoRefresh
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Auto Refresh</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={actions.toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Configuration Panel */}
            <ConfigPanel />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

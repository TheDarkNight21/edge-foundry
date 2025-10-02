import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import MetricsOverview from './components/MetricsOverview';
import ModelInfo from './components/ModelInfo';
import DemoModels from './components/DemoModels';
import InferencePanel from './components/InferencePanel';
import RecentInferences from './components/RecentInferences';
import PerformanceCharts from './components/PerformanceCharts';
import SystemStatus from './components/SystemStatus';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
          
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            {/* System Status */}
            <SystemStatus />
            
            {/* Demo Models Section */}
            <div className="mb-8">
              <DemoModels />
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left Column - Metrics and Recent Inferences */}
              <div className="lg:col-span-2 space-y-6">
                <MetricsOverview />
                <RecentInferences />
              </div>
              
              {/* Right Column - Model Info and Inference Panel */}
              <div className="space-y-6">
                <ModelInfo />
                <InferencePanel />
              </div>
            </div>

            {/* Performance Charts Section */}
            <div className="mb-8">
              <PerformanceCharts />
            </div>
          </main>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;

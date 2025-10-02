import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  Clock, 
  Zap, 
  MemoryStick,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { dataUtils } from '../services/api';

function MetricsOverview() {
  const { metrics, isLoading } = useApp();

  if (isLoading && !metrics) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Metrics Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics?.summary) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Metrics Overview
        </h2>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No metrics data available. Run some inferences to see statistics.
          </p>
        </div>
      </div>
    );
  }

  const { summary } = metrics;

  const metricCards = [
    {
      title: 'Total Inferences',
      value: summary.total_inferences || 0,
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
    },
    {
      title: 'Avg Latency',
      value: dataUtils.formatLatency(summary.avg_latency_ms || 0),
      icon: Clock,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900',
    },
    {
      title: 'Avg Tokens/sec',
      value: dataUtils.formatTokensPerSecond(summary.avg_tokens_per_second || 0),
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900',
    },
    {
      title: 'Avg Memory',
      value: dataUtils.formatMemory(summary.avg_memory_mb || 0),
      icon: MemoryStick,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
    },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Metrics Overview
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`metric-card ${metric.bgColor} border-0`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.title}
                </span>
              </div>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>First Inference:</span>
          <span className="font-medium">
            {dataUtils.formatTimestamp(summary.first_inference)}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Last Inference:</span>
          <span className="font-medium">
            {dataUtils.formatTimestamp(summary.last_inference)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MetricsOverview;

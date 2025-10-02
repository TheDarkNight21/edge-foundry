import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Clock, Zap, MemoryStick } from 'lucide-react';

function PerformanceCharts() {
  const { recentInferences, isLoading } = useApp();

  if (isLoading && !recentInferences) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Trends
        </h2>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recentInferences || recentInferences.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Trends
        </h2>
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No data available for performance charts. Run some inferences to see trends.
          </p>
        </div>
      </div>
    );
  }

  // Prepare data for charts (last 20 records)
  const chartData = recentInferences.slice(0, 20).map((inference, index) => ({
    index: index + 1,
    timestamp: new Date(inference[1]).toLocaleTimeString(),
    latency: parseFloat(inference[3]) || 0,
    tokensPerSecond: parseFloat(inference[5]) || 0,
    memory: parseFloat(inference[6]) || 0,
    tokens: parseInt(inference[4]) || 0,
    temperature: parseFloat(inference[8]) || 0,
  })).reverse(); // Reverse to show chronological order

  // Calculate averages for summary
  const avgLatency = chartData.reduce((sum, item) => sum + item.latency, 0) / chartData.length;
  const avgTokensPerSecond = chartData.reduce((sum, item) => sum + item.tokensPerSecond, 0) / chartData.length;
  const avgMemory = chartData.reduce((sum, item) => sum + item.memory, 0) / chartData.length;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Performance Trends
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Avg Latency
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {avgLatency.toFixed(1)}ms
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Avg Tokens/sec
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {avgTokensPerSecond.toFixed(1)}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MemoryStick className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Avg Memory
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {avgMemory.toFixed(1)}MB
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Latency Trend */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Latency Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="index" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `#${value}`}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}ms`}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}ms`, 'Latency']}
                  labelFormatter={(label) => `Inference #${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tokens per Second Trend */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Tokens per Second Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="index" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `#${value}`}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(1)}`}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)} tokens/sec`, 'Tokens/sec']}
                  labelFormatter={(label) => `Inference #${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="tokensPerSecond" 
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
            Memory Usage
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="index" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `#${value}`}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}MB`}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}MB`, 'Memory']}
                  labelFormatter={(label) => `Inference #${label}`}
                />
                <Bar 
                  dataKey="memory" 
                  fill="#8b5cf6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceCharts;

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Clock, 
  Zap, 
  MemoryStick,
  Thermometer,
  ChevronUp,
  ChevronDown,
  Filter
} from 'lucide-react';
import { dataUtils } from '../services/api';

function RecentInferences() {
  const { recentInferences, isLoading } = useApp();
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filter, setFilter] = useState('');

  if (isLoading && !recentInferences) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Inferences
        </h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded h-16"></div>
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
          Recent Inferences
        </h2>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No inference records found. Run some inferences to see the history.
          </p>
        </div>
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const filteredInferences = recentInferences.filter(inference => {
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return (
      inference[1]?.toLowerCase().includes(searchTerm) || // timestamp
      inference[2]?.toString().includes(searchTerm) || // prompt_length
      inference[4]?.toString().includes(searchTerm) || // tokens_generated
      inference[6]?.toString().includes(searchTerm)    // memory_mb
    );
  });

  const sortedInferences = [...filteredInferences].sort((a, b) => {
    const aValue = a[getFieldIndex(sortField)];
    const bValue = b[getFieldIndex(sortField)];
    
    if (sortField === 'timestamp') {
      return sortDirection === 'asc' 
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }
    
    const numA = parseFloat(aValue) || 0;
    const numB = parseFloat(bValue) || 0;
    
    return sortDirection === 'asc' ? numA - numB : numB - numA;
  });

  function getFieldIndex(field) {
    const fieldMap = {
      timestamp: 1,
      prompt_length: 2,
      latency_ms: 3,
      tokens_generated: 4,
      tokens_per_second: 5,
      memory_mb: 6,
      temperature: 8
    };
    return fieldMap[field] || 1;
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Inferences
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {filteredInferences.length} of {recentInferences.length} records
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter inferences..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th 
                className="text-left py-2 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center space-x-1">
                  <span>Timestamp</span>
                  {getSortIcon('timestamp')}
                </div>
              </th>
              <th 
                className="text-right py-2 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('prompt_length')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Prompt</span>
                  {getSortIcon('prompt_length')}
                </div>
              </th>
              <th 
                className="text-right py-2 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('latency_ms')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Latency</span>
                  {getSortIcon('latency_ms')}
                </div>
              </th>
              <th 
                className="text-right py-2 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('tokens_generated')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>Tokens</span>
                  {getSortIcon('tokens_generated')}
                </div>
              </th>
              <th 
                className="text-right py-2 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('tokens_per_second')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Tokens/sec</span>
                  {getSortIcon('tokens_per_second')}
                </div>
              </th>
              <th 
                className="text-right py-2 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('memory_mb')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <MemoryStick className="w-3 h-3" />
                  <span>Memory</span>
                  {getSortIcon('memory_mb')}
                </div>
              </th>
              <th 
                className="text-right py-2 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => handleSort('temperature')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <Thermometer className="w-3 h-3" />
                  <span>Temp</span>
                  {getSortIcon('temperature')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedInferences.map((inference, index) => (
              <tr 
                key={index} 
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                  {dataUtils.formatTimestamp(inference[1])}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {inference[2]}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {dataUtils.formatLatency(inference[3])}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {inference[4]}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {dataUtils.formatTokensPerSecond(inference[5])}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {dataUtils.formatMemory(inference[6])}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {inference[8] ? inference[8].toFixed(1) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInferences.length === 0 && filter && (
        <div className="text-center py-8">
          <Filter className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400">
            No inferences match your filter.
          </p>
        </div>
      )}
    </div>
  );
}

export default RecentInferences;

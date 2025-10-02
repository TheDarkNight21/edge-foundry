import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  // System status
  isConnected: false,
  isLoading: false,
  error: null,
  
  // Health data
  health: null,
  modelInfo: null,
  
  // Metrics data
  metrics: null,
  recentInferences: [],
  
  // UI state
  darkMode: false,
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  
  // Inference state
  isRunningInference: false,
  lastInference: null,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_HEALTH: 'SET_HEALTH',
  SET_MODEL_INFO: 'SET_MODEL_INFO',
  SET_METRICS: 'SET_METRICS',
  SET_RECENT_INFERENCES: 'SET_RECENT_INFERENCES',
  SET_DARK_MODE: 'SET_DARK_MODE',
  SET_AUTO_REFRESH: 'SET_AUTO_REFRESH',
  SET_RUNNING_INFERENCE: 'SET_RUNNING_INFERENCE',
  SET_LAST_INFERENCE: 'SET_LAST_INFERENCE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.SET_CONNECTED:
      return { ...state, isConnected: action.payload };
    
    case ActionTypes.SET_HEALTH:
      return { ...state, health: action.payload, isConnected: true };
    
    case ActionTypes.SET_MODEL_INFO:
      return { ...state, modelInfo: action.payload };
    
    case ActionTypes.SET_METRICS:
      console.log('Reducer: Setting metrics to:', action.payload);
      return { ...state, metrics: action.payload };
    
    case ActionTypes.SET_RECENT_INFERENCES:
      return { ...state, recentInferences: action.payload };
    
    case ActionTypes.SET_DARK_MODE:
      return { ...state, darkMode: action.payload };
    
    case ActionTypes.SET_AUTO_REFRESH:
      return { ...state, autoRefresh: action.payload };
    
    case ActionTypes.SET_RUNNING_INFERENCE:
      return { ...state, isRunningInference: action.payload };
    
    case ActionTypes.SET_LAST_INFERENCE:
      return { ...state, lastInference: action.payload };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      dispatch({ type: ActionTypes.SET_DARK_MODE, payload: savedDarkMode === 'true' });
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', state.darkMode);
  }, [state.darkMode]);

  // Data fetching functions
  const fetchHealth = async () => {
    try {
      const health = await apiService.getHealth();
      dispatch({ type: ActionTypes.SET_HEALTH, payload: health });
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: false });
    }
  };

  const fetchModelInfo = async () => {
    try {
      const modelInfo = await apiService.getModelInfo();
      dispatch({ type: ActionTypes.SET_MODEL_INFO, payload: modelInfo });
    } catch (error) {
      console.error('Failed to fetch model info:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const metrics = await apiService.getMetrics();
      console.log('AppContext: Setting metrics:', metrics);
      console.log('AppContext: Metrics summary:', metrics?.summary);
      console.log('AppContext: Metrics recent_records:', metrics?.recent_records);
      dispatch({ type: ActionTypes.SET_METRICS, payload: metrics });
      
      if (metrics.recent_records) {
        console.log('AppContext: Setting recent inferences:', metrics.recent_records);
        dispatch({ type: ActionTypes.SET_RECENT_INFERENCES, payload: metrics.recent_records });
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchAllData = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      await Promise.all([
        fetchHealth(),
        fetchModelInfo(),
        fetchMetrics(),
      ]);
    } catch (error) {
      console.error('Failed to fetch all data:', error);
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  const runInference = async (prompt, maxTokens, temperature) => {
    dispatch({ type: ActionTypes.SET_RUNNING_INFERENCE, payload: true });
    try {
      const result = await apiService.runInference(prompt, maxTokens, temperature);
      dispatch({ type: ActionTypes.SET_LAST_INFERENCE, payload: result });
      toast.success('Inference completed successfully!');
      
      // Refresh metrics after successful inference
      await fetchMetrics();
    } catch (error) {
      toast.error(`Inference failed: ${error.message}`);
      throw error;
    } finally {
      dispatch({ type: ActionTypes.SET_RUNNING_INFERENCE, payload: false });
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(() => {
      fetchAllData();
    }, state.refreshInterval);

    return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval, fetchAllData]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Context value
  const value = {
    ...state,
    actions: {
      fetchHealth,
      fetchModelInfo,
      fetchMetrics,
      fetchAllData,
      runInference,
      toggleDarkMode: () => dispatch({ type: ActionTypes.SET_DARK_MODE, payload: !state.darkMode }),
      toggleAutoRefresh: () => dispatch({ type: ActionTypes.SET_AUTO_REFRESH, payload: !state.autoRefresh }),
      clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR }),
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

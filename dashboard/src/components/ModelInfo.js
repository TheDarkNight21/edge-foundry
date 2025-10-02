import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { 
  Storage, 
  Settings, 
  Computer, 
  CheckCircle, 
  Error 
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const ModelInfo = () => {
  const { modelInfo: modelData, isLoading: loading, error } = useApp();
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Model Information</Typography>
          <Typography>Loading model info...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">Model Information</Typography>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (loaded) => {
    return loaded ? <CheckCircle color="success" /> : <Error color="error" />;
  };

  const getStatusColor = (loaded) => {
    return loaded ? 'success' : 'error';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Model Information
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="subtitle1">Status:</Typography>
          {getStatusIcon(modelData?.model_loaded)}
          <Chip
            label={modelData?.model_loaded ? 'Loaded' : 'Not Loaded'}
            color={getStatusColor(modelData?.model_loaded)}
            size="small"
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Storage fontSize="small" color="action" />
            <Typography variant="body2">
              <strong>Model Path:</strong> {modelData?.model_path || 'Unknown'}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Settings fontSize="small" color="action" />
            <Typography variant="body2">
              <strong>Runtime:</strong> {modelData?.runtime || 'Unknown'}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Computer fontSize="small" color="action" />
            <Typography variant="body2">
              <strong>Device:</strong> {modelData?.device || 'Unknown'}
            </Typography>
          </Box>
        </Box>

        {modelData?.config && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Configuration Details:
            </Typography>
            <Box
              sx={{
                p: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}
            >
              <pre>{JSON.stringify(modelData.config, null, 2)}</pre>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelInfo;
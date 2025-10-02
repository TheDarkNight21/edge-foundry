import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { CheckCircle, Error, Warning } from '@mui/icons-material';

const HealthStatus = ({ healthData, loading, error }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      default:
        return <Error color="error" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      default:
        return 'error';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">System Health</Typography>
          <Typography>Loading...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">System Health</Typography>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h6">System Health</Typography>
          {getStatusIcon(healthData?.status)}
        </Box>
        
        <Box display="flex" gap={1} mb={2}>
          <Chip
            label={healthData?.status || 'Unknown'}
            color={getStatusColor(healthData?.status)}
            size="small"
          />
          <Chip
            label={healthData?.model_loaded ? 'Model Loaded' : 'Model Not Loaded'}
            color={healthData?.model_loaded ? 'success' : 'error'}
            size="small"
          />
        </Box>

        {healthData?.config && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Configuration:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Model: {healthData.config.model_path || 'Unknown'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Runtime: {healthData.config.runtime || 'Unknown'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Device: {healthData.config.device || 'Unknown'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthStatus;

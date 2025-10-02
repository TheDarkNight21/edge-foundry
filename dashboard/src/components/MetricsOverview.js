import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { 
  Speed, 
  Memory, 
  Timer,
  Assessment
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const MetricsOverview = () => {
  const { metrics: metricsData, isLoading: loading, error } = useApp();
  console.log('MetricsOverview - Full context state:', { metrics: metricsData, isLoading: loading, error });
  console.log('MetricsOverview - Raw metrics data:', metricsData);
  
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Metrics Overview</Typography>
          <Typography>Loading metrics...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">Metrics Overview</Typography>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  const summary = metricsData?.summary || {};
  const recentRecords = metricsData?.recent_records || [];
  
  console.log('MetricsOverview processed data:', { summary, recentRecords });

  const metricCards = [
    {
      title: 'Total Inferences',
      value: summary.total_inferences || 0,
      icon: <Assessment />,
      color: 'primary'
    },
    {
      title: 'Avg Latency',
      value: `${(summary.avg_latency_ms || 0).toFixed(2)} ms`,
      icon: <Timer />,
      color: 'secondary'
    },
    {
      title: 'Avg Tokens/sec',
      value: (summary.avg_tokens_per_second || 0).toFixed(2),
      icon: <Speed />,
      color: 'success'
    },
    {
      title: 'Avg Memory',
      value: `${(summary.avg_memory_mb || 0).toFixed(2)} MB`,
      icon: <Memory />,
      color: 'warning'
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Metrics Overview
      </Typography>
      
      <Grid container spacing={2} mb={3}>
        {metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box color={`${metric.color}.main`}>
                    {metric.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {metric.value}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {metric.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            First Inference: {summary.first_inference || 'N/A'}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Last Inference: {summary.last_inference || 'N/A'}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Recent Records: {recentRecords.length}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MetricsOverview;
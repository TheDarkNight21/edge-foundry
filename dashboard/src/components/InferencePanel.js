import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Slider,
  Box,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { Send, Settings } from '@mui/icons-material';
import api from '../services/api';
import { useApp } from '../context/AppContext';

const InferencePanel = () => {
  const { actions } = useApp();
  const [prompt, setPrompt] = useState('');
  const [maxTokens, setMaxTokens] = useState(64);
  const [temperature, setTemperature] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await api.runInference(prompt, maxTokens, temperature);
      setResponse(result);
      // Refresh data after successful inference
      if (actions && actions.fetchAllData) {
        actions.fetchAllData();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Run Inference
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            margin="normal"
            required
          />

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Max Tokens: {maxTokens}
              </Typography>
              <Slider
                value={maxTokens}
                onChange={(e, value) => setMaxTokens(value)}
                min={1}
                max={512}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 256, label: '256' },
                  { value: 512, label: '512' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Temperature: {temperature.toFixed(2)}
              </Typography>
              <Slider
                value={temperature}
                onChange={(e, value) => setTemperature(value)}
                min={0.1}
                max={2.0}
                step={0.1}
                marks={[
                  { value: 0.1, label: '0.1' },
                  { value: 1.0, label: '1.0' },
                  { value: 2.0, label: '2.0' }
                ]}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>

          <Box mt={2}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              disabled={loading || !prompt.trim()}
              fullWidth
            >
              {loading ? 'Running Inference...' : 'Run Inference'}
            </Button>
          </Box>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {response && (
          <Box mt={2}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Inference completed in {response.processing_time?.toFixed(2)}s
            </Alert>
            
            <Typography variant="h6" gutterBottom>
              Response:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300'
              }}
            >
              <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                {response.response}
              </Typography>
            </Box>

            {response.model_info && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Model Info:
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Model: {response.model_info.model_path}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Runtime: {response.model_info.runtime}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Device: {response.model_info.device}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default InferencePanel;
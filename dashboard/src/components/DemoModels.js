import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Psychology,
  SwapHoriz,
  PlayArrow,
  Info,
  CheckCircle,
  Error,
  Refresh
} from '@mui/icons-material';
import { apiService } from '../services/api';

const DemoModels = () => {
  const [demoModels, setDemoModels] = useState([]);
  const [currentModel, setCurrentModel] = useState(null);
  const [samplePrompts, setSamplePrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [switching, setSwitching] = useState(false);
  const [promptsDialogOpen, setPromptsDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    loadDemoModels();
    loadCurrentModel();
  }, []);

  const loadDemoModels = async () => {
    try {
      setLoading(true);
      const models = await apiService.getDemoModels();
      setDemoModels(models);
      setError(null);
    } catch (err) {
      console.error('Error loading demo models:', err);
      setError('Failed to load demo models');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentModel = async () => {
    try {
      const current = await apiService.getCurrentModel();
      setCurrentModel(current);
    } catch (err) {
      console.error('Error loading current model:', err);
    }
  };

  const handleSwitchModel = async (modelId) => {
    try {
      setSwitching(true);
      await apiService.switchModel(modelId);
      await loadCurrentModel();
      setError(null);
    } catch (err) {
      console.error('Error switching model:', err);
      setError(`Failed to switch to model: ${err.message}`);
    } finally {
      setSwitching(false);
    }
  };

  const handleShowSamplePrompts = async (modelId) => {
    try {
      const prompts = await apiService.getSamplePrompts(modelId);
      setSamplePrompts(prompts.sample_prompts || []);
      setSelectedModel(modelId);
      setPromptsDialogOpen(true);
    } catch (err) {
      console.error('Error loading sample prompts:', err);
      setError('Failed to load sample prompts');
    }
  };

  const handleRefresh = () => {
    loadDemoModels();
    loadCurrentModel();
  };

  const getModelStatus = (modelId) => {
    if (!currentModel) return 'unknown';
    if (currentModel.model_id === modelId) {
      return currentModel.loaded ? 'active' : 'loading';
    }
    return 'inactive';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'loading': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'loading': return <CircularProgress size={16} />;
      case 'inactive': return <Psychology />;
      default: return <Error />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={24} />
            <Typography>Loading demo models...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Demo Models</Typography>
          <Box>
            <Tooltip title="Refresh models">
              <IconButton onClick={handleRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {currentModel && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Current Model:</strong> {currentModel.name || currentModel.model_id || 'Unknown'}
              {currentModel.loaded && <Chip label="Loaded" color="success" size="small" sx={{ ml: 1 }} />}
            </Typography>
          </Alert>
        )}

        <Grid container spacing={2}>
          {demoModels.map((model) => {
            const status = getModelStatus(model.id);
            const isCurrent = currentModel && currentModel.model_id === model.id;
            
            return (
              <Grid item xs={12} md={6} key={model.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" component="div">
                        {model.name}
                      </Typography>
                      <Chip
                        icon={getStatusIcon(status)}
                        label={status === 'active' ? 'Active' : status === 'loading' ? 'Loading' : 'Inactive'}
                        color={getStatusColor(status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {model.description}
                    </Typography>

                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      <Chip label={`${model.parameters} parameters`} size="small" variant="outlined" />
                      <Chip label={model.quantization} size="small" variant="outlined" />
                      <Chip label={`${model.context_length} context`} size="small" variant="outlined" />
                    </Box>

                    <Box display="flex" gap={1}>
                      <Button
                        variant={isCurrent ? "contained" : "outlined"}
                        size="small"
                        startIcon={<SwapHoriz />}
                        onClick={() => handleSwitchModel(model.id)}
                        disabled={switching || isCurrent}
                      >
                        {isCurrent ? 'Current' : 'Switch To'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => handleShowSamplePrompts(model.id)}
                      >
                        Sample Prompts
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {demoModels.length === 0 && (
          <Alert severity="warning">
            No demo models available. Make sure the agent is running and demo models are configured.
          </Alert>
        )}

        {/* Sample Prompts Dialog */}
        <Dialog
          open={promptsDialogOpen}
          onClose={() => setPromptsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Sample Prompts - {selectedModel}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              Click on a prompt to use it in the inference panel.
            </Typography>
            <List>
              {samplePrompts.map((prompt, index) => (
                <React.Fragment key={index}>
                  <ListItemButton
                    onClick={() => {
                      // This would need to be connected to the inference panel
                      console.log('Selected prompt:', prompt);
                      setPromptsDialogOpen(false);
                    }}
                  >
                    <ListItemText
                      primary={prompt}
                      secondary={`Click to use this prompt`}
                    />
                  </ListItemButton>
                  {index < samplePrompts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPromptsDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default DemoModels;


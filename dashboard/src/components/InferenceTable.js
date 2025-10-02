import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box
} from '@mui/material';

const InferenceTable = ({ recentRecords, loading, error }) => {
  if (loading) {
    return (
      <Paper>
        <Box p={2}>
          <Typography variant="h6">Recent Inferences</Typography>
          <Typography>Loading...</Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper>
        <Box p={2}>
          <Typography variant="h6" color="error">Recent Inferences</Typography>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      </Paper>
    );
  }

  if (!recentRecords || recentRecords.length === 0) {
    return (
      <Paper>
        <Box p={2}>
          <Typography variant="h6">Recent Inferences</Typography>
          <Typography color="textSecondary">No inference data available</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Recent Inferences ({recentRecords.length})
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell align="right">Prompt Tokens</TableCell>
              <TableCell align="right">Latency (ms)</TableCell>
              <TableCell align="right">Generated Tokens</TableCell>
              <TableCell align="right">Tokens/sec</TableCell>
              <TableCell align="right">Memory (MB)</TableCell>
              <TableCell align="right">Temperature</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell>
                  {record[1] ? new Date(record[1]).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell align="right">
                  {record[2] || 0}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${(record[3] || 0).toFixed(1)}`}
                    size="small"
                    color={record[3] > 1000 ? 'error' : record[3] > 500 ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell align="right">
                  {record[4] || 0}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${(record[5] || 0).toFixed(1)}`}
                    size="small"
                    color={record[5] > 20 ? 'success' : record[5] > 10 ? 'warning' : 'error'}
                  />
                </TableCell>
                <TableCell align="right">
                  {(record[6] || 0).toFixed(1)}
                </TableCell>
                <TableCell align="right">
                  {record[8] ? record[8].toFixed(2) : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InferenceTable;

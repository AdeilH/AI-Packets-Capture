import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';

interface AnalysisOverviewProps {
  summary: {
    total_packets?: number;
    duration?: number;
    protocols?: Record<string, number>;
    services?: Record<string, number>;
    top_sources?: Array<{ ip: string; count: number }>;
    top_destinations?: Array<{ ip: string; count: number }>;
  };
}

const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({ summary }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Network Traffic Overview
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="primary">
              General Statistics
            </Typography>
            <Typography>Total Packets: {summary?.total_packets || 0}</Typography>
            <Typography>
              Capture Duration: {summary?.duration ? `${summary.duration.toFixed(2)}s` : '0s'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" color="primary">
              Top Source IPs
            </Typography>
            {summary?.top_sources?.slice(0, 5).map((source, index) => (
              <Typography key={index}>
                {source.ip}: {source.count} packets
              </Typography>
            )) || <Typography>No data available</Typography>}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="primary">
              Protocol Distribution
            </Typography>
            {Object.entries(summary?.protocols || {}).slice(0, 5).map(([protocol, count], index) => (
              <Typography key={index}>
                {protocol}: {count}
              </Typography>
            )) || <Typography>No data available</Typography>}
          </Box>
          
          <Box>
            <Typography variant="subtitle1" color="primary">
              Top Destination IPs
            </Typography>
            {summary?.top_destinations?.slice(0, 5).map((dest, index) => (
              <Typography key={index}>
                {dest.ip}: {dest.count} packets
              </Typography>
            )) || <Typography>No data available</Typography>}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AnalysisOverview; 
'use client';

import React from 'react';
import { Paper, Typography, Box, Chip, List, ListItem, ListItemText, Divider } from '@mui/material';
import { ErrorOutline, Security, CheckCircle } from '@mui/icons-material';

interface LLMAnalysisProps {
  analysis: {
    summary?: string;
    details?: string;
    recommendations?: string[];
  };
}

const LLMAnalysis: React.FC<LLMAnalysisProps> = ({ analysis }) => {
  if (!analysis || !analysis.summary) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        AI Analysis
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="primary">
          Summary
        </Typography>
        <Typography paragraph>
          {analysis.summary}
        </Typography>
      </Box>
      
      {analysis.details && (
        <Box sx={{ mb: 2 }}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" color="primary">
            Detailed Analysis
          </Typography>
          <Typography paragraph>
            {analysis.details}
          </Typography>
        </Box>
      )}
      
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" color="primary">
            Recommendations
          </Typography>
          <ul>
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index}>
                <Typography>{recommendation}</Typography>
              </li>
            ))}
          </ul>
        </Box>
      )}
    </Paper>
  );
};

export default LLMAnalysis; 
'use client';

import React, { ReactNode } from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
}

function StatusCard({ title, value, icon, color }: StatusCardProps) {
  return (
    <Paper 
      sx={{ 
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bgcolor: `${color}22`,
          p: 1.5,
          borderRadius: '0 0 0 50%',
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ mt: 1, fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default StatusCard; 
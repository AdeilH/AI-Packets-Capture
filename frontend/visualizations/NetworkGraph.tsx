'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';

interface Node {
  id: string;
  name: string;
  value: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

interface NetworkGraphProps {
  data: {
    nodes: Node[];
    links: Link[];
  };
}

function NetworkGraph({ data }: NetworkGraphProps) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 1,
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {data.nodes.length > 0 
          ? 'Network graph visualization will be rendered here' 
          : 'No network data available'}
      </Typography>
    </Box>
  );
}

export default NetworkGraph; 
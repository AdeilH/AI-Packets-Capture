'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { CloudUpload, Dashboard, Assessment } from '@mui/icons-material';

interface SystemStatus {
  status?: string;
}

interface NavigationProps {
  systemStatus: SystemStatus | null;
}

function Navigation({ systemStatus }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Network Anomaly Detector
        </Typography>
        
        <Box sx={{ mr: 2 }}>
          <Chip 
            label={`Status: ${systemStatus?.status || 'Connecting...'}`}
            color={systemStatus?.status === 'running' ? 'success' : 'warning'}
            size="small"
            sx={{ mr: 2 }}
          />
        </Box>
        
        <Button 
          color={pathname === '/' ? 'primary' : 'inherit'}
          startIcon={<Dashboard />}
          onClick={() => router.push('/')}
        >
          Dashboard
        </Button>
        
        <Button 
          color={pathname === '/upload' ? 'primary' : 'inherit'}
          startIcon={<CloudUpload />}
          onClick={() => router.push('/upload')}
        >
          Upload
        </Button>
        
        <Button 
          color={pathname === '/analysis' ? 'primary' : 'inherit'}
          startIcon={<Assessment />}
          onClick={() => router.push('/analysis')}
        >
          Analysis
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation; 
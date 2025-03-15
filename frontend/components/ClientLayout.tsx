'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import Navigation from '@/components/Navigation';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [systemStatus, setSystemStatus] = useState(null);
  
  useEffect(() => {
    // Fetch system status
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        setSystemStatus(data);
      } catch (error) {
        console.error('Error fetching system status:', error);
        setSystemStatus({ status: 'error', message: 'Could not connect to server' });
      }
    };
    
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="app">
        <Navigation systemStatus={systemStatus} />
        <Container maxWidth="xl" className="main-content">
          {children}
        </Container>
      </div>
    </ThemeProvider>
  );
} 
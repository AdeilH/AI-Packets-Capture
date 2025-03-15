import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import Navigation from './components/Navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import './App.css';

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

function App() {
  const [systemStatus, setSystemStatus] = useState(null);
  
  useEffect(() => {
    // Fetch system status
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/status');
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
      <Router>
        <div className="app">
          <Navigation systemStatus={systemStatus} />
          <Container maxWidth="xl" className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard systemStatus={systemStatus} />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App; 
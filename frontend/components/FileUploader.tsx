'use client';

import React, { useState } from 'react';
import { 
  Paper, Typography, Box, Button, 
  Alert, CircularProgress, Divider 
} from '@mui/material';
import { CloudUpload, BarChart } from '@mui/icons-material';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { fetchAnalysisData, fetchSampleAnalysis } from '@/services/api';
import { useRouter } from 'next/navigation';

const FileUploader: React.FC = () => {
  const [localLoading, setLocalLoading] = useState(false);
  const { setAnalysisData, setIsLoading, setError, isLoading, error } = useAnalysis();
  const router = useRouter();
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (!file) return;
    
    setLocalLoading(true);
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('run_llm_analysis', 'true');
    
    try {
      const data = await fetchAnalysisData(formData);
      setAnalysisData(data);
      router.push('/analysis');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analysis data';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };
  
  const handleViewDemo = async () => {
    setLocalLoading(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchSampleAnalysis();
      setAnalysisData(data);
      router.push('/analysis');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load demo analysis';
      setError(errorMessage);
      console.error('Demo error:', err);
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload PCAP File for Analysis
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
        <input
          accept=".pcap,.pcapng"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleFileUpload}
          disabled={localLoading}
        />
        <label htmlFor="raised-button-file">
          <Button 
            variant="contained" 
            component="span"
            disabled={localLoading}
            startIcon={<CloudUpload />}
            size="large"
          >
            {localLoading ? 'Uploading...' : 'Select PCAP File'}
          </Button>
        </label>
        
        {localLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>Analyzing network traffic...</Typography>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">OR</Typography>
      </Divider>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleViewDemo}
          startIcon={<BarChart />}
          disabled={localLoading}
        >
          View Demo Analysis
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default FileUploader; 
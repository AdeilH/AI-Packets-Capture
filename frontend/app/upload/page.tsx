'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [runLLMAnalysis, setRunLLMAnalysis] = useState(true);
  const router = useRouter();
  
  const steps = ['Select PCAP file', 'Upload and analyze', 'View results'];
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setActiveStep(1);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('run_llm_analysis', runLLMAnalysis.toString());
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setUploadResult(result);
      setActiveStep(2);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleViewResults = () => {
    router.push('/analysis');
  };
  
  const renderContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              accept=".pcap,.pcapng,.cap"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload">
              <Button 
                variant="outlined" 
                component="span"
                startIcon={<CloudUpload />}
                size="large"
                sx={{ mb: 2 }}
              >
                Select PCAP File
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary">
              Supported formats: .pcap, .pcapng, .cap
            </Typography>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selected file: {selectedFile?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Size: {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB
            </Typography>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={runLLMAnalysis} 
                  onChange={(e) => setRunLLMAnalysis(e.target.checked)}
                />
              }
              label="Run AI analysis on network traffic"
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleUpload}
              disabled={isUploading}
              sx={{ mt: 2 }}
            >
              {isUploading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Analyzing...
                </>
              ) : (
                'Upload and Analyze'
              )}
            </Button>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Analysis Complete
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              File: {uploadResult?.file_name}
            </Typography>
            
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, my: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary:
              </Typography>
              <Typography variant="body2">
                • Total packets: {uploadResult?.packet_count}
              </Typography>
              <Typography variant="body2">
                • Anomalies detected: {uploadResult?.anomalies?.length || 0}
              </Typography>
              <Typography variant="body2">
                • Anomaly percentage: {uploadResult?.summary?.anomaly_percentage?.toFixed(2) || 0}%
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleViewResults}
              sx={{ mt: 2 }}
            >
              View Detailed Results
            </Button>
          </Box>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Upload Network Capture
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        {renderContent()}
      </Paper>
    </Box>
  );
} 
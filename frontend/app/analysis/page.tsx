'use client';

import { useAnalysis } from '@/contexts/AnalysisContext';
import { useRouter } from 'next/navigation';
import { Container, Typography, Grid, Paper, Box, Button, Alert } from '@mui/material';
import AnalysisOverview from '@/components/AnalysisOverview';
import AnomalyTable from '@/components/AnomalyTable';
import LLMAnalysis from '@/components/LLMAnalysis';
import ComprehensiveAnalysis from '@/components/ComprehensiveAnalysis';

export default function AnalysisPage() {
  const { analysisData, isLoading, error } = useAnalysis();
  const router = useRouter();
  
  // If no analysis data is available, redirect to upload page
  if (!analysisData && !isLoading) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">
          No analysis data available. Please upload a PCAP file first.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => router.push('/')}
          sx={{ mt: 2 }}
        >
          Go to Upload Page
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Network Traffic Analysis
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isLoading ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading analysis...</Typography>
        </Paper>
      ) : analysisData && (
        <>
          <AnalysisOverview summary={analysisData.summary} />
          <AnomalyTable anomalies={analysisData.anomalies || []} />
          {analysisData.llm_analysis && (
            <>
              <LLMAnalysis analysis={{
                summary: analysisData.llm_analysis.summary,
                details: analysisData.llm_analysis.analysis,
                recommendations: analysisData.llm_analysis.recommendations
              }} />
              
              <ComprehensiveAnalysis data={{
                traffic_overview: analysisData.llm_analysis.traffic_overview,
                protocol_analysis: analysisData.llm_analysis.protocol_analysis,
                connection_patterns: analysisData.llm_analysis.connection_patterns,
                security_assessment: analysisData.llm_analysis.security_assessment,
                contextual_interpretation: analysisData.llm_analysis.contextual_interpretation,
                full_analysis: analysisData.llm_analysis.full_analysis,
                alert_level: analysisData.llm_analysis.alert_level,
                identified_threats: analysisData.llm_analysis.identified_threats,
                recommendations: analysisData.llm_analysis.recommendations
              }} />
            </>
          )}
          
          <Box sx={{ mt: 3, mb: 5, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/')}
            >
              Upload Another File
            </Button>
            
            <Button 
              variant="contained" 
              onClick={() => window.print()}
            >
              Export Report
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
} 
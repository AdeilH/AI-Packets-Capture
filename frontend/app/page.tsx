'use client';

import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  LinearProgress,
  Divider,
  Button
} from '@mui/material';
import { 
  Security, 
  ShowChart, 
  Warning, 
  CheckCircle,
  Preview
} from '@mui/icons-material';
import NetworkGraph from '@/visualizations/NetworkGraph';
import AnomalyTimeline from '@/visualizations/AnomalyTimeline';
import TrafficDistribution from '@/visualizations/TrafficDistribution';
import StatusCard from '@/components/StatusCard';
import { useAnalysis } from '@/contexts/AnalysisContext';
import { fetchAnalysisData, fetchSampleAnalysis } from '@/services/api';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/FileUploader';

interface SystemStatus {
  status: string;
  analyzed_packets: number;
  detected_anomalies: number;
  model_status: {
    status: string;
    last_training?: string;
    training_samples?: number;
  };
}

interface TopSource {
  ip: string;
  count: number;
}

interface TimelineData {
  time: string;
  anomalies: number;
  packets: number;
}

interface RecentAnalysis {
  anomalyCount: number;
  packetCount: number;
  topSources: TopSource[];
  protocols: Record<string, number>;
  timelineData: TimelineData[];
}

export default function DashboardPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentAnalysis, setRecentAnalysis] = useState<RecentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const { setAnalysisData, setIsLoading, setError } = useAnalysis();
  const router = useRouter();
  
  useEffect(() => {
    // Fetch system status
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        setSystemStatus(data);
      } catch (error) {
        console.error('Error fetching system status:', error);
        setSystemStatus({ 
          status: 'error', 
          analyzed_packets: 0, 
          detected_anomalies: 0,
          model_status: { status: 'error' }
        });
      }
    };
    
    // Simulate fetching recent analysis data
    const fetchAnalysis = () => {
      setTimeout(() => {
        setRecentAnalysis({
          anomalyCount: 12,
          packetCount: 13584,
          topSources: [
            { ip: '192.168.1.105', count: 3254 },
            { ip: '10.0.0.23', count: 1785 },
            { ip: '172.16.45.2', count: 922 }
          ],
          protocols: {
            TCP: 65,
            UDP: 23,
            ICMP: 8,
            Other: 4
          },
          timelineData: [
            { time: '08:00', anomalies: 1, packets: 780 },
            { time: '09:00', anomalies: 0, packets: 650 },
            { time: '10:00', anomalies: 3, packets: 920 },
            { time: '11:00', anomalies: 2, packets: 1100 },
            { time: '12:00', anomalies: 6, packets: 1350 }
          ]
        });
        setLoading(false);
      }, 1500);
    };
    
    fetchStatus();
    fetchAnalysis();
    
    const intervalId = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('run_llm_analysis', 'true');
    
    try {
      const data = await fetchAnalysisData(formData);
      setAnalysisData(data);
      // Show results on the same page or navigate to analysis page
      router.push('/analysis');
    } catch (err) {
      setError(err.message || 'Failed to fetch analysis data');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDemo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchSampleAnalysis();
      setAnalysisData(data);
      router.push('/analysis');
    } catch (err) {
      setError('Failed to load demo analysis');
      console.error('Demo error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Network Traffic Analysis Dashboard
      </Typography>
      
      {loading && <LinearProgress />}
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Status cards */}
        <Grid item xs={12} md={3}>
          <StatusCard 
            title="System Status"
            value={systemStatus?.status || 'Loading...'}
            icon={<CheckCircle color="success" />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatusCard 
            title="Analyzed Packets"
            value={systemStatus?.analyzed_packets || 0}
            icon={<ShowChart />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatusCard 
            title="Detected Anomalies"
            value={systemStatus?.detected_anomalies || 0}
            icon={<Warning />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatusCard 
            title="Threat Level"
            value="Medium"
            icon={<Security />}
            color="#f44336"
          />
        </Grid>
        
        {/* Main visualizations */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Network Traffic Anomalies
            </Typography>
            <AnomalyTimeline data={recentAnalysis?.timelineData || []} />
          </Paper>
        </Grid>
        
        {/* File Uploader */}
        <Grid item xs={12}>
          <FileUploader />
        </Grid>
      </Grid>

      <Button
        variant="outlined"
        onClick={handleViewDemo}
        startIcon={<Preview />}
        sx={{ ml: 2 }}
      >
        View Demo Analysis
      </Button>
    </Box>
  );
} 
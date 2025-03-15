import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  LinearProgress,
  Divider 
} from '@mui/material';
import { 
  Security, 
  ShowChart, 
  Warning, 
  CheckCircle 
} from '@mui/icons-material';
import NetworkGraph from '../visualizations/NetworkGraph';
import AnomalyTimeline from '../visualizations/AnomalyTimeline';
import TrafficDistribution from '../visualizations/TrafficDistribution';
import StatusCard from '../components/StatusCard';

function Dashboard({ systemStatus }) {
  const [recentAnalysis, setRecentAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching recent analysis data
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
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Network Traffic Analysis Dashboard
      </Typography>
      
      {loading && <LinearProgress />}
      
      <Grid container spacing={3} mt={1}>
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
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 350 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Protocol Distribution
            </Typography>
            <TrafficDistribution data={recentAnalysis?.protocols || {}} />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 450 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Network Communication Graph
            </Typography>
            <NetworkGraph data={{ nodes: [], links: [] }} /> {/* Placeholder for actual network data */}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Recent Anomalies
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {!loading && recentAnalysis ? (
                <Box>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ mb: 2, p: 1, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="error">
                        Unusual Port Scanning
                      </Typography>
                      <Typography variant="body2">
                        Source: 192.168.1.{Math.floor(Math.random() * 255)} • {new Date().toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Attempted connection to {Math.floor(Math.random() * 20) + 5} closed ports
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Loading anomaly data...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Top Talkers
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {!loading && recentAnalysis ? (
                <Box>
                  {recentAnalysis.topSources.map((source, index) => (
                    <Box key={index} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2">
                          {source.ip}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {source.count} packets
                        </Typography>
                      </Box>
                      <Box sx={{ width: '60%' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(source.count / recentAnalysis.topSources[0].count) * 100} 
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Loading source data...
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 
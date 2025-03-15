'use client';

import React, { useState } from 'react';
import { 
  Paper, Typography, Box, Tabs, Tab, Divider,
  Card, CardContent, Chip, List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails  
} from '@mui/material';
import { 
  ExpandMore, Security, DnsOutlined, NetworkCheckOutlined,
  AssessmentOutlined, DescriptionOutlined, RecommendOutlined 
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ComprehensiveAnalysisProps {
  data: {
    traffic_overview?: string;
    protocol_analysis?: string;
    connection_patterns?: string;
    security_assessment?: string;
    contextual_interpretation?: string;
    full_analysis?: string;
    alert_level?: string;
    identified_threats?: string[];
    recommendations?: string[];
  };
}

const ComprehensiveAnalysis: React.FC<ComprehensiveAnalysisProps> = ({ data }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (!data) return null;

  const getAlertColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      case 'none': return 'success';
      default: return 'info';
    }
  };

  return (
    <Paper elevation={3} sx={{ mb: 3 }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Comprehensive Analysis</Typography>
        {data.alert_level && (
          <Chip 
            label={`Alert Level: ${data.alert_level}`} 
            color={getAlertColor(data.alert_level) as any}
          />
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="analysis tabs">
          <Tab label="Overview" />
          <Tab label="Protocols" />
          <Tab label="Connections" />
          <Tab label="Security" />
          <Tab label="Interpretation" />
          <Tab label="Full Analysis" />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <Typography paragraph>{data.traffic_overview || 'No overview available'}</Typography>
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <Typography paragraph>{data.protocol_analysis || 'No protocol analysis available'}</Typography>
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <Typography paragraph>{data.connection_patterns || 'No connection pattern analysis available'}</Typography>
      </TabPanel>
      
      <TabPanel value={value} index={3}>
        <Typography paragraph>{data.security_assessment || 'No security assessment available'}</Typography>
        
        {data.identified_threats && data.identified_threats.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" color="error">Identified Threats:</Typography>
            <ul>
              {data.identified_threats.map((threat, index) => (
                <li key={index}><Typography>{threat}</Typography></li>
              ))}
            </ul>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={value} index={4}>
        <Typography paragraph>{data.contextual_interpretation || 'No contextual interpretation available'}</Typography>
      </TabPanel>
      
      <TabPanel value={value} index={5}>
        <Typography 
          paragraph 
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          {data.full_analysis || 'No full analysis available'}
        </Typography>
      </TabPanel>
      
      {data.recommendations && data.recommendations.length > 0 && (
        <Box sx={{ p: 3, backgroundColor: 'background.default' }}>
          <Typography variant="subtitle1" color="primary">Recommendations:</Typography>
          <ul>
            {data.recommendations.map((rec, index) => (
              <li key={index}><Typography>{rec}</Typography></li>
            ))}
          </ul>
        </Box>
      )}
    </Paper>
  );
};

export default ComprehensiveAnalysis; 
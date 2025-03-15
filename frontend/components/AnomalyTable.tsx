import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source_ip?: string;
  destination_ip?: string;
  timestamp?: string;
}

interface AnomalyTableProps {
  anomalies: Anomaly[];
}

const AnomalyTable: React.FC<AnomalyTableProps> = ({ anomalies }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Detected Anomalies
      </Typography>
      
      {anomalies?.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Destination</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {anomalies.map((anomaly) => (
                <TableRow key={anomaly.id}>
                  <TableCell>{anomaly.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={anomaly.severity} 
                      color={getSeverityColor(anomaly.severity) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{anomaly.description}</TableCell>
                  <TableCell>{anomaly.source_ip || 'N/A'}</TableCell>
                  <TableCell>{anomaly.destination_ip || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No anomalies detected</Typography>
      )}
    </Paper>
  );
};

export default AnomalyTable; 
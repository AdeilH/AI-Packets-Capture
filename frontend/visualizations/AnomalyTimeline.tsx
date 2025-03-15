'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimelineData {
  time: string;
  anomalies: number;
  packets: number;
}

interface AnomalyTimelineProps {
  data: TimelineData[];
}

function AnomalyTimeline({ data }: AnomalyTimelineProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p>No timeline data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="packets" 
          stroke="#8884d8" 
          name="Packet Count"
          strokeWidth={2}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="anomalies" 
          stroke="#ff5722" 
          name="Anomalies" 
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default AnomalyTimeline; 
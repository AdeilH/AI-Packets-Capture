'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrafficDistributionProps {
  data: Record<string, number>;
}

function TrafficDistribution({ data }: TrafficDistributionProps) {
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9C27B0', '#3F51B5'];
  
  // Convert data object to array format for recharts
  const chartData = Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length]
  }));

  if (chartData.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p>No protocol data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} packets`, 'Count']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default TrafficDistribution; 
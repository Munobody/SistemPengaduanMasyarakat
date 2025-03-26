import React from 'react';
import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface ChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderWidth: number;
    }[];
  };
  loading?: boolean;
}

const Chart: React.FC<ChartProps> = ({ data, loading }) => {
  return (
    <Paper sx={{ p: 3, height: '100%', backgroundColor: '#E3FEF7', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)' }}>
      <Typography variant="h6" gutterBottom>
        Status Pengaduan
      </Typography>
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={400} />
      ) : (
        <Box sx={{ width: '100%', height: 400, display: 'flex', justifyContent: 'center' }}>
          <Pie data={data} />
        </Box>
      )}
    </Paper>
  );
};

export default Chart;
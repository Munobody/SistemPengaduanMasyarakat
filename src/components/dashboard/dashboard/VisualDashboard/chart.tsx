import React, { useMemo } from 'react';
import { Box, Paper, Skeleton, Typography } from '@mui/material';
import { ArcElement, Chart as ChartJS, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

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

  const statusCounts = useMemo(() => {
    return data.labels.reduce(
      (acc, label, index) => {
        acc[label] = data.datasets[0].data[index];
        return acc;
      },
      {} as Record<string, number>
    );
  }, [data]);

  const totalCount = useMemo(() => {
    return data.datasets[0].data.reduce((sum, value) => sum + value, 0);
  }, [data]);

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart: any) => {
      const { width } = chart;
      const { height } = chart;
      const ctx = chart.ctx;
      ctx.restore();
      const fontSize = (height / 100).toFixed(2);
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#666';
    },
  };

  return (
    <Paper sx={{ p: 3, backgroundColor: '#E3FEF7' }}>
      <Typography variant="h6" gutterBottom>
        Status Pengaduan
      </Typography>
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={250} />
      ) : (
        <>
          <Box
            sx={{
              width: '100%',
              height: 300,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Pie
              data={data}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              plugins={[centerTextPlugin]} 
            />
          </Box>
        </>
      )}
    </Paper>
  );
};

export default Chart;

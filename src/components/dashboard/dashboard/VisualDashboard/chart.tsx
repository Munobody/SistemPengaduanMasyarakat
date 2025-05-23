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
  // Add default empty data
  const chartData = useMemo(() => {
    if (!data || !data.labels || !data.datasets?.length) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 1
        }]
      };
    }
    return data;
  }, [data]);

  const statusCounts = useMemo(() => {
    if (!chartData.labels || !chartData.datasets?.[0]?.data) return {};
    
    return chartData.labels.reduce(
      (acc, label, index) => {
        acc[label] = chartData.datasets[0].data[index];
        return acc;
      },
      {} as Record<string, number>
    );
  }, [chartData]);

  const totalCount = useMemo(() => {
    if (!chartData.datasets?.[0]?.data) return 0;
    
    return chartData.datasets[0].data.reduce((sum, value) => sum + value, 0);
  }, [chartData]);

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
        <Box
          sx={{
            width: '100%',
            height: 300,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {chartData.labels.length > 0 ? (
            <Pie
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
              plugins={[centerTextPlugin]} 
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <Typography color="textSecondary">
                Tidak ada data untuk ditampilkan
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default Chart;
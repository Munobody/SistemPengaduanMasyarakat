import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  loading: boolean;
  icon: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  textColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  loading,
  icon,
  backgroundColor = '#E3FEF7',
  textColor = '#000000'
}) => {
  return (
    <Box
      sx={{
        p: 3, // Kurangi padding untuk efisiensi
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        backgroundColor,
        color: textColor,
      }}
    >
      <Box sx={{ mr: 2 }}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={80} height={32} /> // Gunakan Skeleton
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(StatsCard); // Gunakan memoization untuk mencegah rendering ulang
import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton, CircularProgress } from '@mui/material';

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
        p: 5,
        borderRadius: 2,
        // boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
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
          <CircularProgress size={24} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default StatsCard;
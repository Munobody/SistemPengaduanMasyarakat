import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  loading: boolean;
  icon: React.ReactNode;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, loading, icon, color }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {icon}
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography variant="h3" component="div" sx={{ color }}>
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
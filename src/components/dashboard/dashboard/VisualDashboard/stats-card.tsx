import React from 'react';
import { Box, Typography, Skeleton, Card } from '@mui/material';
import { styled } from '@mui/material/styles';

interface StatsCardProps {
  title: string;
  value: string | number;
  loading: boolean;
  icon: React.ReactNode;
  color?: string;
  backgroundColor?: string;
  textColor?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  marginRight: theme.spacing(2),
  background: 'rgba(19, 93, 102, 0.1)',
}));

const ValueTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1.75rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
  },
}));

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  loading,
  icon,
  backgroundColor = '#E3FEF7',
  textColor = '#003C43',
  color = '#135D66' // Add default color
}) => {
  if (loading) {
    return <Skeleton variant="rectangular" height="100%" sx={{ minHeight: { xs: 100, sm: 120, md: 140 }, borderRadius: 2 }} />;
  }

  return (
    <StyledCard>
      <Box
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          backgroundColor,
          color: textColor,
          height: '100%',
        }}
      >
        <IconWrapper sx={{
          '& svg': {
            fontSize: {
              xs: '1.75rem',
              sm: '2rem',
              md: '2.25rem'
            },
            color: color
          }
        }}>
          {icon}
        </IconWrapper>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
              mb: 0.5,
              color: 'rgba(0, 60, 67, 0.7)'
            }}
          >
            {title}
          </Typography>
          <ValueTypography sx={{ color }}>
            {value}
          </ValueTypography>
        </Box>
      </Box>
    </StyledCard>
  );
};

export default React.memo(StatsCard);
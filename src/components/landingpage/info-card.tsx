import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface CardProps {
  title: string;
  subtitle: string;
}

const InfoCard: React.FC<CardProps> = ({ title, subtitle }) => {
  return (
    <Card sx={{ width: 280, textAlign: 'center', border: '2px solid #FFC107', boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h5" color="primary" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" mt={1}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ReportSummary: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" p={4}>
      <Card sx={{ textAlign: 'center', border: '2px solid #FFC107', boxShadow: 3, borderRadius: 2, p: 4, mb: 6, width: 400 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" color="black">
            JUMLAH LAPORAN SEKARANG
          </Typography>
          <Typography variant="h3" fontWeight="bold" mt={2} color="black">
            XXXXXX
          </Typography>
        </CardContent>
      </Card>
      <Box display="flex" gap={4}>
        <InfoCard title="XXX" subtitle="Fakultas" />
        <InfoCard title="XXX" subtitle="Unit Pelayan Terpadu" />
        <InfoCard title="XXX" subtitle="Lembaga" />
      </Box>
    </Box>
  );
};

export default ReportSummary;

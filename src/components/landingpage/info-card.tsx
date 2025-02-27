
import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';

interface CardProps {
  title: string;
  subtitle: string;
}

const InfoCard: React.FC<CardProps> = ({ title, subtitle }) => {
  return (
    <Card sx={{ width: '100%', textAlign: 'center', border: '2px solid #4A628A', boxShadow: 3, borderRadius: 2, backgroundColor: '#E0F7FA' }}>
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
    <Box display="flex" flexDirection="column" alignItems="center" p={4}>
      <Typography variant="h2" fontWeight="bold" color="white" sx={{textAlign: 'center'}} mb={4}>
        JUMLAH LAPORAN PENGADUAN
      </Typography>
      <Card sx={{ textAlign: 'center', border: '2px solid #4A628A', boxShadow: 3, borderRadius: 2, p: 4, mb: 6, width: '100%', maxWidth: 400, backgroundColor: '#E0F7FA' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" color="black">
            JUMLAH LAPORAN SEKARANG
          </Typography>
          <Typography variant="h3" fontWeight="bold" mt={2} color="black">
            XXXXXX
          </Typography>
        </CardContent>
      </Card>
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard title="XXX" subtitle="Fakultas" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard title="XXX" subtitle="Unit Pelayan Terpadu" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <InfoCard title="XXX" subtitle="Lembaga" />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportSummary;
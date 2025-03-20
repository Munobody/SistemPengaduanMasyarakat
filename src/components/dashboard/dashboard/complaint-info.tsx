import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ComplaintInfo: React.FC = () => {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Tata Cara Pengaduan
      </Typography>
      <Typography variant="body1" paragraph>
        1. Isi formulir pengaduan dengan lengkap dan benar.
      </Typography>
      <Typography variant="body1" paragraph>
        2. Lampirkan bukti pendukung yang relevan.
      </Typography>
      <Typography variant="body1" paragraph>
        3. Submit formulir dan tunggu konfirmasi dari pihak terkait.
      </Typography>
      <Typography variant="body1" paragraph>
        4. Pantau status pengaduan melalui dashboard ini.
      </Typography>
    </Paper>
  );
};

export default ComplaintInfo;
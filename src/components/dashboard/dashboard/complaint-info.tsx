import React from 'react';
import { Box, Paper, Typography, Stepper, Step, StepLabel, Grid } from '@mui/material';

const ComplaintInfo: React.FC = () => {
  const steps = [
    'Isi formulir pengaduan dengan lengkap dan benar.',
    'Lampirkan bukti pendukung yang relevan.',
    'Submit formulir dan tunggu konfirmasi dari pihak terkait.',
    'Pantau status pengaduan melalui dashboard ini.'
  ];

  return (
    <Paper sx={{ p: 5, height: '100%', backgroundColor: '#E3FEF7' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#003C43', textAlign: 'center' }}>
        Tata Cara Pengaduan
      </Typography>
      <Box sx={{ position: 'relative', mt: 4 }}>
        <Box sx={{ position: 'absolute', left: '50%', top: 0, bottom: 0, transform: 'translateX(-50%)' }} />
        {steps.map((step, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
              alignItems: 'center',
              position: 'relative',
              mb: 4
            }}
          >
            <Box
              sx={{
                backgroundColor: '#77B0AA',
                color: '#E3FEF7',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                mr: index % 2 === 0 ? 2 : 0,
                ml: index % 2 !== 0 ? 2 : 0
              }}
            >
              {index + 1}
            </Box>
            <Typography
              sx={{
                backgroundColor: '#FFFF',
                color: '#135D66',
                p: 2,
                borderRadius: 2,
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                maxWidth: '60%'
              }}
            >
              {step}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ComplaintInfo;

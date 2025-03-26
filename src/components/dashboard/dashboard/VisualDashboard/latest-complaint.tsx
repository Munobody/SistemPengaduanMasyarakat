import React from 'react';
import { Box, Typography, Card, CardContent, Paper, Skeleton } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';

interface Complaint {
  id: string;
  judul: string;
  deskripsi: string;
  createdAt: string;
  status: string;
}

interface LatestComplaintsProps {
  complaints: Complaint[];
  loading?: boolean;
}

const LatestComplaints: React.FC<LatestComplaintsProps> = ({ complaints, loading }) => {
  return (
    <Paper sx={{ p: 3, backgroundColor: '#E3FEF7', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'}}>
      <Typography variant="h6" gutterBottom>
        Pengaduan Terbaru
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3].map((_, index) => (
            <Card key={index} variant="outlined">
              <CardContent>
                <Skeleton variant="text" width="80%" height={30} />
                <Skeleton variant="text" width="100%" height={60} />
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="30%" height={20} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={10}
          slidesPerView={3}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 1 },
            600: { slidesPerView: 2 },
            960: { slidesPerView: 3 },
          }}
        >
          {complaints.slice(0, 6).map((entry) => (
            <SwiperSlide key={entry.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" component="h2" noWrap>
                    {entry.judul}
                  </Typography>
                  <Typography variant="body2" component="p" sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {entry.deskripsi}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        bgcolor: entry.status === 'COMPLETED' ? 'success.main' : 'warning.main',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      {entry.status}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Paper>
  );
};

export default LatestComplaints;
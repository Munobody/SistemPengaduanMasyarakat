"use client";

import * as React from 'react';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

export interface PengaduanSayaProps {
  sx?: SxProps;
}

export function PengaduanSaya({ sx }: PengaduanSayaProps): React.JSX.Element {
  const [value, setValue] = React.useState<string>('0');
  const [trend, setTrend] = React.useState<'up' | 'down'>('up');
  const [diff, setDiff] = React.useState<number>(0);

  React.useEffect(() => {
    console.log("useEffect triggered"); // Debugging log

    const fetchPengaduan = async () => {
      console.log("fetchPengaduan called"); // Debugging log

      try {
        const token = localStorage.getItem("custom-auth-token");

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pelaporan?page=1&rows=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data;
        console.log("Response data:", data);

        if (data?.content?.totalData !== undefined) {
          setValue(data.content.totalData.toString());
        } else {
          console.error("Invalid data structure:", data);
        }

        setTrend(data.trend || 'up');
        setDiff(data.diff || 0);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error fetching data:", error.response?.data || error.message);
        } else {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchPengaduan();
  }, []); // Dependency array kosong agar hanya dipanggil sekali

  const TrendIcon = trend === "up" ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === "up" ? "var(--mui-palette-success-main)" : "var(--mui-palette-error-main)";

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Pengaduan Saya
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: "var(--mui-palette-success-main)", height: "56px", width: "56px" }}>
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff !== 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <TrendIcon color={trendColor} />
              <Typography color={trendColor} variant="body2">
                {diff}%
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CampaignIcon from "@mui/icons-material/Campaign";
import type { SxProps } from "@mui/material/styles";
import api from "@/lib/api/api";

export interface PengaduanBelumSelesaiProps {
  sx?: SxProps;
}

export function PengaduanBelumSelesai({ sx }: PengaduanBelumSelesaiProps): React.JSX.Element {
  const [jumlahBelumSelesai, setJumlahBelumSelesai] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/pelaporan`);
        console.log("📌 Data API:", response.data);
  
        const data = response.data?.content?.entries || [];
        console.log("🔍 Semua pengaduan:", data);
  
        // Filter pengaduan yang berstatus "PENDING" atau "PROCESS"
        const belumSelesaiPengaduan = data.filter(
          (item: any) => item.status === "PENDING" || item.status === "PROCESS"
        );
        console.log("✅ Pengaduan belum selesai:", belumSelesaiPengaduan);
  
        setJumlahBelumSelesai(belumSelesaiPengaduan.length);
      } catch (error) {
        console.error("❌ Gagal mengambil data pengaduan:", error);
      }
    };
  
    fetchData();
  }, []);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Pengaduan Belum Selesai
            </Typography>
            <Typography variant="h4">{jumlahBelumSelesai}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: "#ff9800", height: 56, width: 56 }}>
            <CampaignIcon fontSize="large" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

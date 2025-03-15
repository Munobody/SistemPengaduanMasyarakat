"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import axios from "axios";
import api from "@/lib/api/api";

export interface PengaduanSelesaiProps {
  sx?: object;
}

export function PengaduanSelesa({ sx }: PengaduanSelesaiProps): React.JSX.Element {
  const [jumlahSelesai, setJumlahSelesai] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/pelaporan`);
        console.log("📌 Data API:", response.data); // Pastikan API mengembalikan data yang benar
  
        const data = response.data?.content?.entries || [];
        console.log("🔍 Semua pengaduan:", data); // Periksa apakah semua data ada
  
        // Filter pengaduan yang berstatus "COMPLETED"
        const selesaiPengaduan = data.filter((item: any) => item.status === "COMPLETED");
        console.log("✅ Pengaduan selesai:", selesaiPengaduan); // Pastikan ada 2 data
  
        setJumlahSelesai(selesaiPengaduan.length);
      } catch (error) {
        console.error("❌ Gagal mengambil data pengaduan:", error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Pengaduan Layanan Selesai
              </Typography>
              <Typography variant="h4">{jumlahSelesai}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: "var(--mui-palette-warning-main)", height: 56, width: 56 }}>
              <DoneAllIcon fontSize="large" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

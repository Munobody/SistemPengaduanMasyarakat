"use client";

import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SummarizeIcon from "@mui/icons-material/Summarize";
import type { SxProps } from "@mui/material/styles";
import api from "@/lib/api/api";

export interface TotalPengaduanProps {
  sx?: SxProps;
}

export function TotalPengaduan({ sx }: TotalPengaduanProps): React.JSX.Element {
  const [jumlah, setJumlah] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/pelaporan`);
        console.log("📌 Data API:", response.data);

        const data = response.data?.content?.entries || [];
        console.log("🔍 Semua pengaduan:", data);

        setJumlah(data.length);
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
                Total Pengaduan Saya
              </Typography>
              <Typography variant="h4">{jumlah}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: "#116A7B", height: 56, width: 56 }}>
              <SummarizeIcon fontSize="large" />
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
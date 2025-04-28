"use client";

import AddPetugasPage from "@/components/petugas/tambah-petugas";
import PetugasTable from "@/components/petugas/PetugasTable";
import { Box, Typography } from "@mui/material";

export default function KelolaPage() {
  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Kelola Petugas
      </Typography>
      <AddPetugasPage unitId={""} />
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Daftar Petugas
      </Typography>
      <PetugasTable unitId={""} currentUserId={""} />
    </Box>
  );
}
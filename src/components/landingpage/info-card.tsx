"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Skeleton,
  useMediaQuery,
  Theme,
} from "@mui/material";

interface CardProps {
  title: string;
  subtitle: string;
  loading: boolean;
}

const InfoCard: React.FC<CardProps> = ({ title, subtitle, loading }) => {
  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 120,
        textAlign: "center",
        border: "2px solid #4A628A",
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#D1F8EF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        transition: "transform 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
    >
      <CardContent>
        {loading ? (
          <>
            <Skeleton
              variant="text"
              width="60%"
              height={32}
              sx={{ mx: "auto", bgcolor: "grey.300" }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={24}
              sx={{ mx: "auto", mt: 1, bgcolor: "grey.300" }}
            />
          </>
        ) : (
          <>
            <Typography
              variant="h5"
              sx={{
                color: "black", // Changed color to black
                fontWeight: "bold",
              }}
            >
              {title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" mt={1}>
              {subtitle}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const ReportSummary: React.FC = () => {
  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  const isMediumScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between("sm", "md")
  );

  const [loading, setLoading] = useState(true);
  const [unitCounts, setUnitCounts] = useState({
    FAKULTAS: 0,
    DIREKTORAT: 0,
    UPT: 0,
    LEMBAGA: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch data from the /units endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/units?page=1&rows=50`);
        const data = await response.json();

        const units = data.content?.entries || [];

        // Count units by jenis_unit
        const counts = units.reduce(
          (acc: { [key: string]: number }, unit: { jenis_unit: string }) => {
            acc[unit.jenis_unit] = (acc[unit.jenis_unit] || 0) + 1;
            return acc;
          },
          { FAKULTAS: 0, DIREKTORAT: 0, UPT: 0, LEMBAGA: 0 }
        );

        setUnitCounts(counts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={isSmallScreen ? 2 : isMediumScreen ? 3 : 4}
      width="100%"
      bgcolor="#FFFFFF"
    >
      {loading ? (
        <Skeleton
          variant="text"
          width={isSmallScreen ? "80%" : "60%"}
          height={isSmallScreen ? 40 : 48}
          sx={{ mb: isSmallScreen ? 2 : 4, bgcolor: "grey.300" }}
        />
      ) : (
        <Typography
          variant={isSmallScreen ? "h5" : isMediumScreen ? "h4" : "h3"}
          fontWeight="bold"
          color="black"
          sx={{ textAlign: "center", mb: isSmallScreen ? 3 : 4 }}
        >
          Instansi Terhubung
        </Typography>
      )}

      <Grid
        container
        spacing={isSmallScreen ? 2 : isMediumScreen ? 3 : 4}
        justifyContent="center"
        width="100%"
        maxWidth={isSmallScreen ? "100%" : isMediumScreen ? "900px" : "1200px"}
      >
        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            title={unitCounts.FAKULTAS.toString()}
            subtitle="Fakultas"
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            title={unitCounts.DIREKTORAT.toString()}
            subtitle="Direktorat"
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            title={unitCounts.UPT.toString()}
            subtitle="Unit Pelayanan Terpadu"
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <InfoCard
            title={unitCounts.LEMBAGA.toString()}
            subtitle="Lembaga"
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportSummary;
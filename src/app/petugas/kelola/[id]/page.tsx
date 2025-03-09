'use client';

import { useParams } from 'next/navigation';
import KelolaPengaduanPage from "@/components/petugas/kelola";

export default function KelolaDetailPage() {
  const params = useParams();
  return <KelolaPengaduanPage id={params.id as string} />;
}
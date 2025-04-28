'use client';

import { useParams } from 'next/navigation';
import KelolaPengaduanWbsPage from '@/components/petugaswbs/kelolawbs';

export default function KelolaDetailPage() {
  const params = useParams();
  return <KelolaPengaduanWbsPage id={params.id as string} />;
}
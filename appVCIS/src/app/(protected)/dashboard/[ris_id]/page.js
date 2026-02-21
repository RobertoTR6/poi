'use client';
import { use } from 'react';
import DashboardView from '@/components/dashboard/DashboardView';

export default function DetailsDashboardPage({ params }) {
  const { ris_id } = use(params);
  return <DashboardView risId={ris_id} />;
}

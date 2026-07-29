import { Suspense } from 'react';
import VenueDetailClientView from '../../../venues/detail/VenueDetailClientView';

export default function DashboardVenueDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-500">Loading venue details...</div>}>
      <VenueDetailClientView />
    </Suspense>
  );
}

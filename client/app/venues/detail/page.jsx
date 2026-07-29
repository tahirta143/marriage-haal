import { Suspense } from 'react';
import VenueDetailClientView from './VenueDetailClientView';

export default function VenueDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-500">Loading venue details...</div>}>
      <VenueDetailClientView />
    </Suspense>
  );
}

import { Suspense } from 'react';
import CategoryClientView from './CategoryClientView';

export async function generateStaticParams() {
  return [
    { slug: 'catering' },
    { slug: 'decor' },
    { slug: 'bridal-makeup' },
    { slug: 'henna-artists' },
    { slug: 'dj-sound-system' },
    { slug: 'photographers' },
    { slug: 'car-rental' },
    { slug: 'stationery' },
  ];
}

export default function CategoryPage({ params }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBFB] flex items-center justify-center text-xs font-semibold text-[#705562]">
        Loading vendors...
      </div>
    }>
      <CategoryClientView slug={params.slug} />
    </Suspense>
  );
}

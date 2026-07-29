import CategoryClientView from '../../../categories/[slug]/CategoryClientView';

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

export default function DashboardCategoryPage({ params }) {
  return <CategoryClientView slug={params.slug} />;
}

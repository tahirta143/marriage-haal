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
  return <CategoryClientView slug={params.slug} />;
}

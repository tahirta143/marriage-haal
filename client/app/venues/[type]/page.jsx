import VenueClientView from './VenueClientView';

export async function generateStaticParams() {
  return [
    { type: 'ballroom' },
    { type: 'marquee' },
    { type: 'lawn' },
    { type: 'farmhouse' },
    { type: 'rooftop' },
    { type: 'banquet' },
    { type: 'detail' },
  ];
}

export default function VenuePage({ params }) {
  return <VenueClientView type={params.type} />;
}

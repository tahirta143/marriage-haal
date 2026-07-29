import EventClientView from '../../../events/[slug]/EventClientView';

export async function generateStaticParams() {
  return [
    { slug: 'barat-planning' },
    { slug: 'mehndi-mayo' },
    { slug: 'walima-reception' },
    { slug: 'nikkah' },
    { slug: 'bridal-shower' },
    { slug: 'qawali-night' },
    { slug: 'engagement' },
  ];
}

export default function DashboardEventPage({ params }) {
  return <EventClientView slug={params.slug} />;
}

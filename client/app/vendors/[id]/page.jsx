import VendorDetailClientView from './VendorDetailClientView';
export default function VendorDetailPage({ params }) {
  return <VendorDetailClientView vendorId={params.id} />;
}

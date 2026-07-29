import BookingInvoiceClientView from './BookingInvoiceClientView';

export async function generateStaticParams() {
  return [{ id: '1' }];
}

export default function BookingInvoicePage({ params }) {
  return <BookingInvoiceClientView id={params.id} />;
}

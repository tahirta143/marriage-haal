import './globals.css';
import { AuthProvider } from '../lib/auth';

export const metadata = {
  title: 'ShaadiPro — Marriage Hall & Event Management System',
  description: 'Enterprise Marriage Hall Booking & Operations Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-[#111827] min-h-screen antialiased selection:bg-[#AA336A] selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

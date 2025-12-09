import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/auth-provider';
import { RestaurantProvider } from '@/providers/restaurant-state-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marisquería Online',
  description: 'Gestión digital para restaurantes en la playa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <RestaurantProvider>
            {children}
            <Toaster />
          </RestaurantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

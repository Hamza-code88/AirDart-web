import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AirDart - High-Speed P2P Local Data Sharing',
  description: 'Zero-cost, offline-workable peer-to-peer data sharing ecosystem over local Wi-Fi and hotspot networks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#FFF5E4] text-[#3B2A2A]">
        {children}
      </body>
    </html>
  );
}

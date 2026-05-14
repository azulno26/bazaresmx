import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('https://www.bazaresmx.com.mx'),
  title: {
    default: 'BazaresMX — El directorio de bazares en México',
    template: '%s | BazaresMX'
  },
  description: 'Encuentra bazares, vendimias y mercados en México. Descubre eventos por ciudad, fecha y categoría. Para visitantes y organizadores de bazares.',
  keywords: ['bazares Mexico', 'bazares CDMX', 'vendimias Mexico', 'mercados artesanales', 'bazares fin de semana', 'expositores bazares'],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://www.bazaresmx.com.mx',
    siteName: 'BazaresMX',
    title: 'BazaresMX — El directorio de bazares en México',
    description: 'Encuentra bazares, vendimias y mercados en México.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'BazaresMX' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BazaresMX — El directorio de bazares en México',
    description: 'Encuentra bazares, vendimias y mercados en México.',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publica tu bazar gratis en México | BazaresMX",
  description: "Registra tu bazar en BazaresMX y llega a más visitantes y expositores en Google. Gratis. Sin complicaciones. ¡Empieza hoy!",
  keywords: ["publicar bazar", "anunciar bazar gratis", "directorio de bazares", "expositores para bazar", "organizar bazar mexico"],
  openGraph: {
    title: "Publica tu bazar gratis en México | BazaresMX",
    description: "Registra tu bazar y llega a más personas.",
    url: "https://www.bazaresmx.com.mx/publica-tu-bazar",
    type: "website",
  }
};

export default function PublicaTuBazarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

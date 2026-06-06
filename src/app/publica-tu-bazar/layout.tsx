import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anuncia y Publica tu Bazar Gratis | Directorio BazaresMX",
  description: "Promociona tu bazar en México de forma gratuita. Llena tus espacios con expositores de calidad y atrae visitantes. Conoce nuestros planes destacados y haz crecer tu evento.",
  keywords: ["publicar bazar", "anunciar bazar gratis", "directorio de bazares", "expositores para bazar", "organizar bazar mexico"],
  openGraph: {
    title: "Anuncia y Publica tu Bazar Gratis | BazaresMX",
    description: "La forma más rápida y efectiva de llenar los espacios de tu bazar con expositores calificados sin comisiones en México.",
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

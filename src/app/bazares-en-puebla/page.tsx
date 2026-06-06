import Link from "next/link";
import { getBazaresFromSheets } from "@/src/lib/sheets";
import BazarCard from "@/src/components/BazarCard";
import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Bazares en Puebla 2026 — Directorio y Calendario de Eventos | BazaresMX",
  description: "Descubre la guía de bazares en Puebla y Cholula. Calendario de eventos de diseño independiente, moda local, arte y mercaditos artesanales de fin de semana.",
  keywords: ["bazares en puebla", "bazares puebla fin de semana", "directorio de bazares puebla", "bazar de ropa puebla", "bazares en cholula"],
};

export default async function BazaresPueblaPage() {
  const bazares = await getBazaresFromSheets();
  
  // Filter for Puebla bazares
  const bazaresPuebla = bazares.filter((b: any) => {
    const ciudadLower = (b.ciudad || "").toLowerCase();
    return ciudadLower === "puebla" || ciudadLower === "heroica puebla de zaragoza" || ciudadLower === "cholula";
  });

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* 1. NAVBAR */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="text-xl sm:text-2xl font-title font-extrabold text-gray-900 tracking-tight">
            Bazares<span className="text-[#1A7A52]">MX</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/publica-tu-bazar"
              className="text-[#1A7A52] hover:text-[#156a46] font-bold text-xs sm:text-sm transition duration-300 whitespace-nowrap bg-[#EBF7F2] px-4 py-2 rounded-full"
            >
              Publicar Bazar
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO / SEO INTRO */}
      <header className="bg-white border-b border-gray-100 pt-16 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <Link href="/" className="text-primary font-bold hover:underline mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl md:text-6xl font-syne font-extrabold text-[#1a1a1a] tracking-tight mb-6 leading-tight">
            Los mejores bazares en Puebla y Cholula
          </h1>
          <div className="text-lg text-gray-600 leading-relaxed font-medium space-y-4">
            <p>
              La escena de **bazares en Puebla** y la zona conurbada de **San Andrés y San Pedro Cholula** ha crecido exponencialmente. Estos eventos se han convertido en plataformas clave para el florecimiento de marcas creativas de moda local, joyería artesanal, cosmética natural, repostería gourmet y diseño para el hogar.
            </p>
            <p>
              Desde el emblemático **Centro Histórico de Puebla**, con su arquitectura colonial única, hasta el ambiente alternativo y universitario de **Cholula** cerca de la pirámide, los bazares de fin de semana ofrecen un plan alternativo de esparcimiento cultural. En nuestro **directorio y calendario actualizado** puedes encontrar ubicaciones exactas, fechas y costos para visitar o solicitar espacios como expositor.
            </p>
          </div>
        </div>
      </header>

      {/* 3. LISTADO */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Próximos eventos en Puebla y Cholula</h2>
            <p className="text-sm text-gray-500 font-semibold">Calendario de bazares activos confirmados</p>
          </div>
          <div className="inline-block bg-[#D1F2E8] text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest self-start sm:self-auto">
            {bazaresPuebla.length} bazares confirmados
          </div>
        </div>

        {bazaresPuebla.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bazaresPuebla.map((bazar) => (
              <BazarCard key={bazar.id} bazar={bazar} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="text-5xl mb-4">🎪</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay eventos activos programados por ahora</h3>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              Estamos actualizando el calendario de fechas de los próximos bazares en Puebla. Si organizas un evento en Puebla o Cholula, publícalo gratis hoy para recibir solicitudes de expositores locales.
            </p>
            <Link 
              href="/publica-tu-bazar" 
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-[#156a46] transition shadow-md"
            >
              Publicar mi bazar gratis
            </Link>
          </div>
        )}
      </main>

      {/* 4. SECCIÓN SEO DE CAPTACIÓN (ORGANIZADORES) */}
      <section className="bg-primary text-white py-16 px-6 text-center border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Organizas bazares en Puebla?</h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Consigue mayor exposición para tus eventos de fin de semana, atrae marcas locales y llena tus espacios más rápido publicando tu bazar en el directorio líder de México.
          </p>
          <Link 
            href="/publica-tu-bazar" 
            className="inline-block bg-white text-primary px-8 py-4 rounded-2xl font-extrabold hover:bg-gray-50 transition shadow-xl"
          >
            Anunciar mi Bazar Gratis 🚀
          </Link>
        </div>
      </section>

      {/* 5. ENLAZADO INTERNO PIE */}
      <footer className="bg-[#1a1a1a] text-white/50 py-12 px-6 text-center text-xs font-semibold border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center gap-6 text-sm text-white/80">
            <Link href="/" className="hover:underline">Directorio Principal</Link>
            <span>|</span>
            <Link href="/bazares-en-cdmx" className="hover:underline">Bazares en CDMX</Link>
            <span>|</span>
            <Link href="/publica-tu-bazar" className="hover:underline">Publicar Evento</Link>
          </div>
          <p>© 2026 BazaresMX · Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

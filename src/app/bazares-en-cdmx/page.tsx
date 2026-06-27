import Link from "next/link";
import { getBazares } from "@/src/lib/supabase";
import BazarCard from "@/src/components/BazarCard";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bazares en CDMX 2026 — Directorio y Calendario de Eventos | BazaresMX",
  description: "Descubre la guía de bazares en la Ciudad de México (CDMX). Encuentra eventos de moda vintage, diseño independiente y mercaditos de fin de semana en Roma, Condesa y Coyoacán.",
  keywords: ["bazares en cdmx", "bazares cdmx fin de semana", "directorio de bazares cdmx", "bazares de ropa cdmx", "bazar de diseño cdmx"],
};

export default async function BazaresCdmxPage() {
  const bazares = await getBazares();
  
  // Filter for CDMX bazares
  const bazaresCdmx = bazares.filter((b: any) => {
    const ciudadLower = (b.ciudad || "").toLowerCase();
    return ciudadLower === "ciudad de mexico" || ciudadLower === "cdmx" || ciudadLower === "df" || ciudadLower === "distrito federal";
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
            Los mejores bazares en la Ciudad de México (CDMX)
          </h1>
          <div className="text-lg text-gray-600 leading-relaxed font-medium space-y-4">
            <p>
              La **Ciudad de México** es el epicentro de la cultura de los bazares y mercaditos de diseño en el país. Colonias como la **Roma Norte, Condesa, Juárez, Coyoacán y el Centro Histórico** se transforman cada fin de semana en puntos de encuentro vibrantes donde el talento local, la moda vintage, la ilustración y la gastronomía artesanal cobran vida.
            </p>
            <p>
              Ya sea que busques renovar tu clóset con prendas únicas de segunda mano (*slow fashion*), comprar piezas de diseño independiente mexicano o simplemente pasar una tarde agradable apoyando a marcas locales y emprendedores, en nuestro **directorio actualizado** encontrarás las fechas, horarios y ubicaciones exactas de los próximos eventos en la capital. Si quieres hacer planes inmediatos, revisa los <Link href="/bazares-este-fin-de-semana" className="text-[#1A7A52] hover:underline font-bold">bazares este fin de semana</Link>. También puedes explorar <Link href="/bazares-en-estado-de-mexico" className="text-primary hover:underline font-bold">bazares en Estado de México cerca de CDMX</Link>.
            </p>
          </div>
        </div>
      </header>

      {/* 3. LISTADO */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Próximos eventos en CDMX</h2>
            <p className="text-sm text-gray-500 font-semibold">Calendario de bazares activos confirmados</p>
          </div>
          <div className="inline-block bg-[#D1F2E8] text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest self-start sm:self-auto">
            {bazaresCdmx.length} bazares confirmados
          </div>
        </div>

        {bazaresCdmx.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bazaresCdmx.map((bazar) => (
              <BazarCard key={bazar.id} bazar={bazar} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="text-5xl mb-4">🎪</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay eventos activos programados por ahora</h3>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              Estamos validando las fechas de los próximos bazares en la Ciudad de México. Si organizas un bazar en CDMX, publícalo hoy mismo para captar marcas y expositores.
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
          <h2 className="text-3xl font-bold mb-4">¿Organizas bazares en CDMX?</h2>
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
            <Link href="/bazares-en-estado-de-mexico" className="hover:underline">Bazares en Estado de México</Link>
            <span>|</span>
            <Link href="/bazares-en-puebla" className="hover:underline">Bazares en Puebla</Link>
            <span>|</span>
            <Link href="/publica-tu-bazar" className="hover:underline">Publicar Evento</Link>
          </div>
          <p>© 2026 BazaresMX · Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { getBazares } from "@/src/lib/supabase";
import BazarCard from "@/src/components/BazarCard";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bazares este fin de semana en CDMX y México | BazaresMX",
  description: "Encuentra bazares este fin de semana con fechas, horarios y ubicaciones. Moda, comida, diseño y emprendimientos locales en CDMX y más ciudades.",
  keywords: [
    "bazares este fin de semana",
    "bazares en cdmx este fin de semana",
    "que hacer este fin de semana cdmx",
    "bazares de ropa este fin de semana",
    "mercados artesanales fin de semana",
    "directorio de bazares mexico"
  ],
  alternates: {
    canonical: "https://www.bazaresmx.com.mx/bazares-este-fin-de-semana",
  },
};

function getWeekendDates() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  
  let sat = new Date(today);
  let sun = new Date(today);
  
  if (dayOfWeek === 6) { // Sábado
    sat = new Date(today);
    sun = new Date(today.getTime() + 86400000);
  } else if (dayOfWeek === 0) { // Domingo
    sat = new Date(today.getTime() - 86400000);
    sun = new Date(today);
  } else { // Lunes a Viernes
    const daysToSat = 6 - dayOfWeek;
    sat = new Date(today.getTime() + daysToSat * 86400000);
    sun = new Date(sat.getTime() + 86400000);
  }
  
  // Formato YYYY-MM-DD
  const format = (d: Date) => d.toISOString().split("T")[0];
  return {
    saturdayStr: format(sat),
    sundayStr: format(sun),
    saturdayDesc: sat.toLocaleDateString("es-MX", { day: "numeric", month: "long" }),
    sundayDesc: sun.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
  };
}

export default async function BazaresFinDeSemanaPage() {
  const { saturdayStr, sundayStr, saturdayDesc, sundayDesc } = getWeekendDates();
  const bazares = await getBazares();
  
  // Filtrar bazares que se crucen con el fin de semana:
  // bazar.fecha <= sundayStr AND (bazar.fechaFin || bazar.fecha) >= saturdayStr
  const bazaresFinDeSemana = bazares.filter((b: any) => {
    const fInicio = b.fecha;
    const fFin = b.fechaFin || b.fecha;
    return fInicio <= sundayStr && fFin >= saturdayStr;
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
            Bazares este fin de semana
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">
            Encuentra mercaditos, ferias de diseño y bazares activos confirmados para este fin de semana en CDMX, Estado de México, Puebla y más ciudades del país. Descubre propuestas de moda vintage, segunda mano, diseño independiente, ilustración, accesorios y delicias gastronómicas.
          </p>
        </div>
      </header>

      {/* 3. LISTADO */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Eventos confirmados para el {saturdayDesc} y {sundayDesc}
            </h2>
            <p className="text-sm text-gray-500 font-semibold">
              Calendario de bazares activos este fin de semana
            </p>
          </div>
          <div className="inline-block bg-[#D1F2E8] text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest self-start sm:self-auto">
            {bazaresFinDeSemana.length} bazares confirmados
          </div>
        </div>

        {bazaresFinDeSemana.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bazaresFinDeSemana.map((bazar) => (
              <BazarCard key={bazar.id} bazar={bazar} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="text-5xl mb-4">🎪</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay eventos activos programados para este fin</h3>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              Actualmente no tenemos bazares programados para este fin de semana en el directorio. ¡Vuelve pronto o registra tu evento hoy mismo!
            </p>
            <Link 
              href="/publica-tu-bazar" 
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-[#156a46] transition shadow-md"
            >
              Publicar mi bazar gratis
            </Link>
          </div>
        )}

        {/* EXPLORA POR CIUDADES */}
        <section className="mt-20 border-t border-gray-100 pt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center md:text-left">
            Explora bazares por región
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: "Ciudad de México (CDMX)", path: "/bazares-en-cdmx", bg: "bg-white border-green-100 hover:border-green-300" },
              { name: "Estado de México (Edomex)", path: "/bazares-en-estado-de-mexico", bg: "bg-white border-green-100 hover:border-green-300" },
              { name: "Puebla", path: "/bazares-en-puebla", bg: "bg-white border-green-100 hover:border-green-300" }
            ].map((city, i) => (
              <Link key={i} href={city.path} className="group block">
                <div className={`p-6 rounded-2xl border shadow-sm transition hover:shadow-md ${city.bg} flex justify-between items-center`}>
                  <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{city.name}</span>
                  <span className="text-primary font-bold group-hover:translate-x-1 transition-transform inline-block">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* 4. SECCIÓN CAPTACIÓN */}
      <section className="bg-primary text-white py-16 px-6 text-center border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Organizas un bazar este fin de semana?</h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Consigue mayor exposición para tus eventos de fin de semana, atrae marcas locales y llena tus espacios publicando tu bazar gratis en el directorio especializado de México.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/publica-tu-bazar" 
              className="inline-block bg-white text-primary px-8 py-4 rounded-2xl font-extrabold hover:bg-gray-50 transition shadow-xl"
            >
              Publicar mi Bazar Gratis 🚀
            </Link>
            <Link 
              href="/promocionar-bazar" 
              className="inline-block border-2 border-white/20 hover:border-white text-white px-8 py-4 rounded-2xl font-extrabold transition"
            >
              Ver Opciones de Promoción
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-[#1a1a1a] text-white/50 py-12 px-6 text-center text-xs font-semibold border-t border-white/5">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-center gap-6 text-sm text-white/80">
            <Link href="/" className="hover:underline">Directorio Principal</Link>
            <span>|</span>
            <Link href="/bazares-en-cdmx" className="hover:underline">Bazares en CDMX</Link>
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

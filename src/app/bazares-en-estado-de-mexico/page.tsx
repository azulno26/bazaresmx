import Link from "next/link";
import { getBazares } from "@/src/lib/supabase";
import BazarCard from "@/src/components/BazarCard";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bazares en Estado de México 2026 | BazaresMX",
  description: "Encuentra bazares en Estado de México y Edomex con fechas, horarios y ubicaciones. Moda, diseño, comida y emprendimientos locales cerca de CDMX.",
  keywords: [
    "bazares en estado de mexico",
    "bazares edomex",
    "bazares cerca de cdmx",
    "bazares este fin de semana en estado de mexico",
    "bazares en municipios del estado de mexico",
    "eventos de emprendedores en edomex",
    "bazares de ropa en estado de mexico",
    "ferias y bazares en edomex"
  ],
  alternates: {
    canonical: "https://www.bazaresmx.com.mx/bazares-en-estado-de-mexico",
  },
};

const municipiosEdomex = [
  'Estado de México', 'Edomex', 'Edo. Méx.', 'EdoMex',
  'Naucalpan', 'Tlalnepantla', 'Metepec', 'Toluca',
  'Ecatepec', 'Huixquilucan', 'Satélite', 'Atizapán',
  'Texcoco', 'Chalco', 'Ixtapaluca', 'Valle de México'
];

export default async function BazaresEdomexPage() {
  const bazares = await getBazares();
  
  // Filter for Edomex bazares
  const bazaresEdomex = bazares.filter((b: any) => {
    const ciudadLower = (b.ciudad || "").toLowerCase();
    return municipiosEdomex.some(m => ciudadLower.includes(m.toLowerCase()));
  });

  // Sort: pro > medio > basico (same order as CDMX)
  bazaresEdomex.sort((a: any, b: any) => {
    const orden: Record<string, number> = { pro: 1, medio: 2, basico: 3 };
    return (orden[a.plan] || 4) - (orden[b.plan] || 4);
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
            Bazares en Estado de México
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium mb-8">
            Descubre bazares en Edomex con fechas, horarios y ubicaciones. Moda, diseño, comida, artesanías y emprendimientos locales cerca de CDMX.
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <a 
              href="#bazares" 
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-[#156a46] transition shadow-md"
            >
              Ver bazares activos
            </a>
            <Link 
              href="/publica-tu-bazar" 
              className="border-2 border-primary text-primary px-6 py-3 rounded-xl font-bold hover:bg-[#EBF7F2]/20 transition"
            >
              Publicar mi bazar
            </Link>
          </div>
        </div>
      </header>

      {/* 3. LISTADO */}
      <main id="bazares" className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Bazares activos en Estado de México</h2>
            <p className="text-sm text-gray-500 font-semibold">Calendario de bazares activos confirmados en Edomex</p>
          </div>
          <div className="inline-block bg-[#D1F2E8] text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest self-start sm:self-auto">
            {bazaresEdomex.length} bazares confirmados
          </div>
        </div>

        {/* Sección 1: Grid de Bazares */}
        {bazaresEdomex.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bazaresEdomex.map((bazar) => (
              <BazarCard key={bazar.id} bazar={bazar} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="text-5xl mb-4">🎪</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Por ahora no hay bazares activos en Estado de México</h3>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              ¿Organizas uno? Publícalo gratis en BazaresMX.
            </p>
            <Link 
              href="/publica-tu-bazar" 
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-[#156a46] transition shadow-md"
            >
              Publicar mi bazar
            </Link>
          </div>
        )}

        {/* CONTENIDO SEO SEMÁNTICO ADICIONAL */}
        <div className="mt-20 border-t border-gray-100 pt-16 grid md:grid-cols-2 gap-12 text-gray-700 leading-relaxed">
          {/* Sección 2 */}
          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Bazares en Edomex cerca de CDMX</h2>
            <p className="text-gray-600 font-medium text-sm leading-relaxed">
              El Estado de México es clave para encontrar bazares cerca de CDMX. En municipios como Naucalpan, Tlalnepantla, Metepec, Toluca, Ecatepec, Huixquilucan, Satélite y Atizapán, emprendedores organizan eventos de moda, diseño, comida, arte y artesanías.
            </p>
          </section>

          {/* Sección 3 */}
          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">¿Qué puedes encontrar?</h2>
            <p className="text-xs text-gray-500 font-bold mb-4">Categorías populares en mercaditos locales</p>
            <div className="flex flex-wrap gap-2">
              {["Moda", "Diseño", "Comida", "Artesanías", "Accesorios", "Emprendimientos", "Regalos"].map((tag, idx) => (
                <span key={idx} className="bg-primary/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Sección 5: Enlace a fin de semana */}
        <section className="mt-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Buscas plan para este fin de semana?</h3>
            <p className="text-sm text-gray-600 font-semibold">Encuentra los bazares confirmados para el sábado y domingo en Edomex y alrededores.</p>
          </div>
          <Link 
            href="/bazares-este-fin-de-semana"
            className="bg-[#E8621A] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#d85015] transition shadow-md shrink-0 text-sm whitespace-nowrap"
          >
            Ver bazares en Edomex este fin de semana →
          </Link>
        </section>
      </main>

      {/* 4. SECCIÓN SEO DE CAPTACIÓN (ORGANIZADORES) - Sección 4 */}
      <section className="bg-primary text-white py-16 px-6 text-center border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Organizas un bazar en Estado de México?</h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed font-medium">
            Publícalo en BazaresMX para que más personas lo encuentren en Google.
          </p>
          <Link 
            href="/publica-tu-bazar" 
            className="inline-block bg-white text-primary px-8 py-4 rounded-2xl font-extrabold hover:bg-gray-50 transition shadow-xl"
          >
            Publicar mi bazar gratis
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

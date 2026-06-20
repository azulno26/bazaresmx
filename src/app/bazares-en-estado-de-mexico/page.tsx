import Link from "next/link";
import { getBazares } from "@/src/lib/supabase";
import BazarCard from "@/src/components/BazarCard";
import type { Metadata } from "next";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Bazares en Estado de México 2026 | BazaresMX",
  description: "Encuentra bazares en Estado de México y Edomex con fechas, horarios, ubicaciones y detalles para visitar eventos de diseño, moda, comida, emprendimientos locales y más.",
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
  "naucalpan", "satelite", "satélite", "tlalnepantla", "ecatepec", "metepec", "toluca", 
  "nezahualcoyotl", "nezahualcóyotl", "neza", "huixquilucan", "interlomas", "atizapan", 
  "atizapán", "cuautitlan", "cuautitlán", "coacalco", "tultitlan", "tultitlán", "tecamac", 
  "tecámac", "chalco", "chimalhuacan", "chimalhuacán", "valle de chalco", "texcoco", 
  "ixtapaluca", "nicolas romero", "nicolás romero", "chicoloapan", "zona esmeralda"
];

export default async function BazaresEdomexPage() {
  const bazares = await getBazares();
  
  // Filter for Estado de Mexico bazares
  const bazaresEdomex = bazares.filter((b: any) => {
    const ciudadLower = (b.ciudad || "").toLowerCase().trim();
    
    // Detección preferente y explícita
    const esEdomexDirecto = 
      ciudadLower === "estado de mexico" ||
      ciudadLower === "estado de méxico" ||
      ciudadLower === "edomex" ||
      ciudadLower === "edo. mex." ||
      ciudadLower === "edo. méx." ||
      ciudadLower === "edo mex" ||
      ciudadLower === "edo méx";

    const esMunicipioEdomex = municipiosEdomex.some(m => ciudadLower === m || ciudadLower.includes(m));

    // Evitar falsos positivos
    const esCdmxOPuebla = 
      ciudadLower.includes("cdmx") || 
      ciudadLower.includes("ciudad de mexico") || 
      ciudadLower.includes("df") || 
      ciudadLower.includes("distrito federal") ||
      ciudadLower.includes("puebla") ||
      ciudadLower.includes("cholula");

    return (esEdomexDirecto || esMunicipioEdomex) && !esCdmxOPuebla;
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
          <div className="text-lg text-gray-600 leading-relaxed font-medium space-y-4">
            <p>
              Encuentra bazares en Estado de México, también conocido como Edomex, con fechas, horarios, ubicaciones y detalles para visitar eventos de diseño, moda, comida, productos artesanales, emprendimientos locales y propuestas independientes cerca de CDMX.
            </p>
          </div>
        </div>
      </header>

      {/* 3. LISTADO */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Bazares activos en Estado de México</h2>
            <p className="text-sm text-gray-500 font-semibold">Calendario de bazares activos confirmados en Edomex</p>
          </div>
          <div className="inline-block bg-[#D1F2E8] text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest self-start sm:self-auto">
            {bazaresEdomex.length} bazares confirmados
          </div>
        </div>

        {bazaresEdomex.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bazaresEdomex.map((bazar) => (
              <BazarCard key={bazar.id} bazar={bazar} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="text-5xl mb-4">🎪</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay eventos activos programados por ahora</h3>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              Estamos validando las fechas de los próximos bazares en el Estado de México. Si organizas un bazar en Edomex, publícalo hoy mismo para captar marcas y expositores.
            </p>
            <Link 
              href="/publica-tu-bazar" 
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-[#156a46] transition shadow-md"
            >
              Publicar mi bazar gratis
            </Link>
          </div>
        )}

        {/* CONTENIDO SEO SEMÁNTICO ADICIONAL */}
        <div className="mt-20 border-t border-gray-100 pt-16 grid md:grid-cols-2 gap-12 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Bazares en Edomex cerca de CDMX</h2>
            <p className="text-gray-600">
              Si buscas bazares cerca de CDMX, el Estado de México puede ser una excelente opción para descubrir eventos locales, emprendimientos, productos de diseño, moda, gastronomía y propuestas independientes en municipios conectados con la zona metropolitana.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">¿Qué puedes encontrar en los bazares del Estado de México?</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm font-semibold text-gray-600">
              <li className="flex items-center gap-1.5"><span>✨</span> Moda y calzado</li>
              <li className="flex items-center gap-1.5"><span>✨</span> Accesorios hechos a mano</li>
              <li className="flex items-center gap-1.5"><span>✨</span> Diseño independiente</li>
              <li className="flex items-center gap-1.5"><span>✨</span> Repostería y comida</li>
              <li className="flex items-center gap-1.5"><span>✨</span> Artículos para regalo</li>
              <li className="flex items-center gap-1.5"><span>✨</span> Productos kawaii y coleccionables</li>
            </ul>
          </section>
        </div>
      </main>

      {/* 4. SECCIÓN SEO DE CAPTACIÓN (ORGANIZADORES) */}
      <section className="bg-primary text-white py-16 px-6 text-center border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Quieres anunciar un bazar en Estado de México?</h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Si organizas un bazar en Estado de México, puedes publicarlo en BazaresMX para que más personas encuentren tu evento en Google y conozcan fechas, horarios, ubicación y detalles para asistir.
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

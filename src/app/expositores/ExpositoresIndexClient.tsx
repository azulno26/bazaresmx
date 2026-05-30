"use client";

import Link from "next/link";
import Image from "next/image";

interface Expositor {
  id: number;
  slug: string;
  nombreNegocio: string;
  giro: string;
  descripcion: string;
  ciudad: string;
  disponibilidad: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  planElegido: "Básico" | "Media" | "Top";
  fotoPerfil: string;
  badgeVerificado: boolean;
}

type ExpositoresIndexClientProps = {
  featuredExpositores: Expositor[];
};

export default function ExpositoresIndexClient({ featuredExpositores }: ExpositoresIndexClientProps) {
  return (
    <div className="min-h-screen bg-[#FFFAF5] pb-24">
      {/* NAVBAR */}
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/" className="text-xl sm:text-2xl font-title font-extrabold text-[#1a1a1a] tracking-tight">
            Bazares<span className="text-accent">MX</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="text-gray-600 hover:text-primary transition font-bold text-xs sm:text-base whitespace-nowrap">
              Ver Bazares
            </Link>
            <Link 
              href="/expositores/registro"
              className="bg-[#1A7A52] text-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold hover:brightness-110 transition text-xs sm:text-base shadow-md shadow-[#1A7A52]/20 whitespace-nowrap"
            >
              Publicar mi Perfil
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative px-6 pt-16 pb-24 md:pt-24 md:pb-32 bg-gradient-to-b from-[#EBF7F2] to-[#FFFAF5] text-center">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex bg-[#D1F2E8] text-[#1A7A52] px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider mb-6">
            Directorio de Marcas
          </span>
          <h1 className="font-syne font-extrabold text-5xl md:text-7xl tracking-tighter leading-none text-[#1a1a1a] mb-6">
            Encuentra el talento ideal para tus <span className="text-[#1A7A52]">bazares</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
            Explora las propuestas de los expositores y emprendedores más creativos de México. Conecta directamente sin comisiones.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/expositores/directorio"
              className="w-full sm:w-auto bg-[#1A7A52] text-white px-10 py-5 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-xl shadow-[#1A7A52]/20 text-center"
            >
              Ver todos los expositores
            </Link>
            <Link
              href="/expositores/registro"
              className="w-full sm:w-auto border-3 border-[#1A7A52] text-[#1A7A52] px-10 py-5 rounded-2xl font-extrabold text-lg hover:bg-[#1A7A52]/5 transition text-center"
            >
              Registrarme gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* VITRINA TOP 10 (DESTACADOS) */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <span className="text-accent font-black tracking-widest uppercase text-sm">Destacados</span>
            <h2 className="text-4xl md:text-5xl font-syne font-extrabold mt-3 text-[#1a1a1a] tracking-tight">
              Top 10 Expositores Estrella
            </h2>
            <p className="text-lg text-gray-500 mt-2 font-medium">
              Las mejores marcas recomendadas esta temporada
            </p>
          </div>
          <Link
            href="/expositores/directorio"
            className="text-[#1A7A52] font-black hover:underline flex items-center justify-center gap-2 text-base md:text-lg"
          >
            Explorar el directorio completo →
          </Link>
        </div>

        {featuredExpositores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredExpositores.map((exp) => (
              <Link key={exp.id} href={`/expositores/${exp.slug}`}>
                <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-neutral-100/50 hover:shadow-2xl hover:shadow-neutral-200/40 hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between">
                  <div>
                    {/* Imagen de Portada / Perfil */}
                    <div className="relative w-full aspect-square overflow-hidden bg-neutral-50 border-b border-gray-100">
                      {exp.fotoPerfil ? (
                        <Image
                          src={exp.fotoPerfil}
                          alt={exp.nombreNegocio}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-6xl bg-gray-50">
                          📸
                        </div>
                      )}
                      
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-[#0B5E43] text-white px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                          ⭐ Destacado
                        </span>
                        {exp.badgeVerificado && (
                          <span className="bg-blue-600 text-white px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                            ✓ Verificado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Información */}
                    <div className="p-8">
                      <span className="bg-[#1A7A52]/10 text-[#1A7A52] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        {exp.giro}
                      </span>
                      <h3 className="text-2xl font-bold mt-5 mb-3 group-hover:text-[#1A7A52] transition leading-tight">
                        {exp.nombreNegocio}
                      </h3>
                      <p className="text-gray-500 font-medium text-sm line-clamp-3 leading-relaxed mb-4">
                        {exp.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="px-8 pb-8 pt-0 flex justify-between items-center border-t border-gray-50 mt-auto">
                    <span className="text-xs font-bold text-gray-400">
                      📍 {exp.ciudad}
                    </span>
                    <span className="text-[#1A7A52] font-extrabold text-sm group-hover:underline flex items-center gap-1">
                      Ver Catálogo →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <span className="text-5xl block mb-4">🛍️</span>
            <h3 className="font-syne font-extrabold text-2xl text-gray-800">Directorio abriendo pronto</h3>
            <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto">
              Sé uno de los primeros destacados. ¡Registra tu marca completamente gratis hoy!
            </p>
            <Link
              href="/expositores/registro"
              className="inline-block bg-[#1A7A52] text-white px-8 py-3.5 rounded-xl font-bold mt-6 hover:brightness-110 transition"
            >
              Registrar mi Marca
            </Link>
          </div>
        )}
      </section>

      {/* SECCIÓN UNIRSE */}
      <section className="bg-white max-w-5xl mx-auto px-8 py-16 md:p-20 rounded-[3rem] border border-gray-100 shadow-xl mt-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBF7F2] rounded-full -mr-16 -mt-16"></div>
        <span className="text-accent font-black tracking-widest uppercase text-sm block mb-4">Emprende con Nosotros</span>
        <h2 className="font-syne font-extrabold text-3xl md:text-5xl text-gray-900 mb-6 tracking-tight">
          ¿Quieres aparecer aquí en la cima?
        </h2>
        <p className="text-gray-600 font-medium max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
          Los perfiles destacados reciben visitas de organizadores de todo México diariamente. Aprovecha nuestro primer mes gratis para nuevos registros.
        </p>
        <Link
          href="/expositores/registro"
          className="inline-flex bg-accent text-white px-10 py-5 rounded-2xl font-extrabold text-lg shadow-lg hover:brightness-110 transition shadow-accent/20"
        >
          Quiero Registrarme Gratis
        </Link>
      </section>
    </div>
  );
}

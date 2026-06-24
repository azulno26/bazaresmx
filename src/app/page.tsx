import Image from "next/image";
import { getBazares, getExpositores } from "@/src/lib/supabase";
import Link from "next/link";
import { CalendarIcon, BriefcaseIcon } from "lucide-react";
import BazarCard from "@/src/components/BazarCard";

export const revalidate = 60;

export const metadata = {
  title: "Bazares en México 2026 — Directorio y Calendario de Eventos",
  description: "Descubre los mejores bazares de ropa, diseño, arte y emprendimientos locales en México. Directorio de eventos en CDMX, Puebla y más regiones.",
  keywords: ["bazares Mexico", "bazares CDMX", "directorio de bazares", "calendario de bazares", "bazares en Puebla"],
};


export default async function LandingPage() {
  const bazares = await getBazares();
  const bazaresDestacados = bazares
    .filter((b: any) => ['pro','medio','promo'].includes(b.plan))
    .sort((a: any, b: any) => {
      const orden: Record<string, number> = { pro: 1, promo: 2, medio: 3 }
      return (orden[a.plan] || 4) - (orden[b.plan] || 4)
    })
    .slice(0, 12);

  const expositores = await getExpositores();
  const expositoresTop = expositores
    .filter((e: any) => e.planElegido === 'Top')
    .slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen bg-white">
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
            <Link 
              href="/expositores/registro"
              className="bg-[#1A7A52] text-white px-4 py-2 rounded-full font-bold hover:bg-[#156a46] transition text-xs sm:text-sm whitespace-nowrap"
            >
              Registrar mi Marca
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* 2. HERO SPLIT SECTION (BIFURCADO) */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="inline-flex items-center bg-[#EBF7F2] text-[#1A7A52] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-8">
              🚀 Bazares Digital — Donde Crece tu Negocio
            </div>
            <h1 className="font-syne font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tighter leading-none text-gray-900 mb-6">
              Conecta tu marca con los <br className="hidden md:block" /> mejores <span className="text-[#1A7A52]">bazares</span> de México
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-16 max-w-2xl mx-auto font-medium">
              Conecta bazares con expositores. Sin límites. Sin complicaciones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
              {/* Card Organizadores */}
              <div className="p-8 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                    <CalendarIcon className="w-6 h-6 text-[#1A7A52]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">¿Organizas Bazares?</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Llena tus espacios con expositores de calidad sin comisiones. Publica gratis 
                    y gestiona solicitudes en un solo lugar.
                  </p>
                </div>
                <Link 
                  href="/publica-tu-bazar" 
                  className="block w-full py-3 px-4 bg-[#1A7A52] text-white font-bold rounded-lg hover:bg-[#156a46] transition-colors text-center text-sm"
                >
                  Publicar Bazar
                </Link>
              </div>

              {/* Card Expositores */}
              <div className="p-8 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                    <BriefcaseIcon className="w-6 h-6 text-[#E8621A]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">¿Eres Expositor?</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    Descubre bazares que encajen con tu marca. Vende, conecta y crece 
                    sin límites.
                  </p>
                </div>
                <Link 
                  href="/expositores/registro" 
                  className="block w-full py-3 px-4 bg-[#E8621A] text-white font-bold rounded-lg hover:bg-[#d85015] transition-colors text-center text-sm"
                >
                  Registrar mi Marca
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECCIÓN PROBLEMA */}
        <section className="bg-[#1D9E75] text-white py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-title font-extrabold text-center mb-16 tracking-tight">
              ¿Por qué existe BazaresMX?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "📱", title: "Todo en Facebook", desc: "Los eventos y las marcas se pierden entre un mar de publicaciones" },
                { icon: "🔍", title: "Difícil de encontrar", desc: "No hay un lugar centralizado para buscar por ciudad, fecha o giro" },
                { icon: "🤝", title: "Contacto fragmentado", desc: "Perfiles estáticos que complican el proceso de solicitud de espacios" }
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 hover:bg-white/15 transition group">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition duration-300">{item.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/80 text-lg leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CÓMO FUNCIONA */}
        <section className="py-20 px-6 bg-white border-t border-gray-200">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-syne font-extrabold text-center text-gray-900 mb-16 tracking-tight">Cómo funciona</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Para Organizadores */}
              <div className="bg-[#FFFAF5]/50 p-8 rounded-2xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-8">Para Organizadores</h3>
                
                {[
                  { num: 1, title: "Publicas tu bazar", desc: "Nombre, fecha, ubicación y requisitos." },
                  { num: 2, title: "Recibe solicitudes", desc: "Expositores te encuentran y solicitan espacio." },
                  { num: 3, title: "Negocias directo", desc: "Contacto por WhatsApp, sin intermediarios." },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4 mb-6 last:mb-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-[#1A7A52] text-lg">{step.num}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Para Expositores */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-8">Para Expositores</h3>
                
                {[
                  { num: 1, title: "Te registras", desc: "Tu marca, productos y ubicación." },
                  { num: 2, title: "Descubres bazares", desc: "Filtramos eventos que encajen contigo." },
                  { num: 3, title: "Contactas y vendes", desc: "Directo al organizador, sin esperas." },
                ].map((step) => (
                  <div key={step.num} className="flex gap-4 mb-6 last:mb-0">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-[#E8621A] text-lg">{step.num}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. BAZARES ACTIVOS SECTION */}
        <section className="py-20 px-6 bg-gray-50 border-t border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Bazares Activos</h2>
                <p className="text-gray-600">Descubre eventos donde tu marca puede crecer</p>
              </div>
              <Link
                href="/bazares"
                className="text-[#1A7A52] font-black hover:underline flex items-center justify-center gap-2 text-sm whitespace-nowrap bg-white px-5 py-2.5 rounded-full border border-gray-100 shadow-sm"
              >
                Ver todos los bazares →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {bazaresDestacados.map((bazar: any) => (
                <BazarCard key={bazar.id} bazar={bazar} />
              ))}
            </div>
          </div>
        </section>

        {/* 5.5. MARCAS Y EXPOSITORES DESTACADOS (EXCLUSIVO PLAN TOP) */}
        {expositoresTop.length > 0 && (
          <section className="bg-white py-24 px-6 border-b border-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <span className="text-[#1A7A52] font-black tracking-widest uppercase text-sm">Talento Local</span>
                  <h2 className="text-5xl font-title font-extrabold mt-4 text-[#1a1a1a] tracking-tight">Marcas y Expositores Destacados</h2>
                  <p className="text-xl text-gray-500 mt-4 font-medium">Descubre emprendedores creativos recomendados por BazaresMX</p>
                </div>
                <Link
                  href="/expositores/directorio"
                  className="text-[#1A7A52] font-black hover:underline flex items-center justify-center gap-2 text-lg whitespace-nowrap"
                >
                  Explorar todas las marcas →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {expositoresTop.map((exp: any) => (
                  <Link key={exp.id} href={`/expositores/${exp.slug}`} className="group">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                      <div>
                        {/* Imagen de Portada */}
                        <div className="relative h-48 w-full overflow-hidden bg-neutral-50 flex items-center justify-center text-white border-b border-gray-100">
                          {exp.fotoPerfil ? (
                            <Image
                              src={exp.fotoPerfil}
                              alt={exp.nombreNegocio}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-6xl bg-gray-50">
                              📸
                            </div>
                          )}
                          <div className="absolute top-4 left-4 flex gap-2 z-10">
                            <span className="bg-green-50 text-[#1A7A52] text-xs font-semibold px-3 py-1 rounded-lg shadow-sm">
                              🏆 Destacado
                            </span>
                            {exp.badgeVerificado && (
                              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-lg shadow-sm">
                                ✓ Verificado
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-5">
                          {exp.giro && (
                            <span className="bg-[#1A7A52]/10 text-[#1A7A52] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-block mb-3">
                              {exp.giro}
                            </span>
                          )}
                          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#1A7A52] transition">
                            {exp.nombreNegocio}
                          </h3>
                          <div className="text-xs text-gray-500 font-semibold mb-3 space-y-1">
                            <p className="flex items-center gap-1.5">
                              <span>📍</span> 
                              <span>{exp.ciudad}</span>
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                            {exp.descripcion}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        <span className="block w-full py-2.5 bg-[#1A7A52] text-white font-semibold text-sm rounded-lg hover:bg-[#156a46] transition-colors text-center shadow-sm hover:shadow">
                          Ver Catálogo
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5.9. TESTIMONIOS */}
        <section className="bg-white py-24 px-6 text-center border-b border-gray-50">
          <div className="max-w-3xl mx-auto">
            <span className="text-6xl block mb-6">💬</span>
            <blockquote className="text-2xl sm:text-3xl font-title font-extrabold italic text-gray-900 leading-tight mb-8">
              "Vendí 3x más cuando registré mi marca en BazaresMX. Los organizadores de bazares me contactan directo por WhatsApp para invitarme sin rodeos."
            </blockquote>
            <cite className="font-extrabold text-[#1A7A52] text-base sm:text-lg not-italic">
              — Sandra, Joyería Artesanal, Ciudad de México
            </cite>
          </div>
        </section>

        {/* 6. FINAL CTA SECTION */}
        <section className="py-16 md:py-20 px-4 md:px-8 bg-white border-t border-gray-200 text-center">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              ¿Listo para crecer?
            </h2>
            <p className="text-gray-600 mb-8">
              Sin tarjeta de crédito. Sin esperas. Comienza hoy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/publica-tu-bazar"
                className="px-6 py-3 border-2 border-[#1A7A52] text-[#1A7A52] font-bold rounded-lg hover:bg-green-50 transition-colors text-center text-sm"
              >
                Publicar Bazar
              </Link>
              <Link 
                href="/expositores/registro"
                className="px-6 py-3 bg-[#1A7A52] text-white font-bold rounded-lg hover:bg-[#156a46] transition-colors text-center text-sm"
              >
                Registrar mi Marca
              </Link>
            </div>
          </div>
        </section>

        {/* 6.5 SECCIÓN ENLACES RÁPIDOS SEO (CIUDADES) */}
        <section className="py-10 bg-gray-50 border-t border-gray-100 text-center">
          <div className="max-w-5xl mx-auto px-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Directorio de Bazares por Región
            </h3>
            <div className="flex flex-wrap justify-center gap-6 text-base font-bold text-[#1A7A52]">
              <Link href="/bazares-en-cdmx" className="hover:underline">
                Bazares en CDMX
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/bazares-en-estado-de-mexico" className="hover:underline">
                Bazares en Estado de México
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/bazares-en-puebla" className="hover:underline">
                Bazares en Puebla
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="bg-[#1a1a1a] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-4xl font-title font-extrabold mb-4 tracking-tight">
            Bazares<span className="text-[#1A7A52]">MX</span>
          </div>

          {/* Redes Sociales */}
          <div className="flex items-center gap-5 mb-8 mt-2">
            <a 
              href="https://www.instagram.com/bazaresmx.com.mx/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/5 hover:bg-[#E1306C] text-white p-3.5 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg flex items-center justify-center"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61590197427263" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/5 hover:bg-[#1877F2] text-white p-3.5 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg flex items-center justify-center"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>

          <div className="h-px w-24 bg-white/20 mb-8"></div>
          <p className="text-white/50 text-lg font-medium mb-2">
            El directorio digital de bazares en México · 2026
          </p>
          <p className="text-white/30 text-xs">
            Desarrollado por 💡 <a href="https://www.flowisolutions.com/" target="_blank" rel="noopener noreferrer" className="text-[#1A7A52] hover:underline font-bold">Flowi Solutions</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

import Image from "next/image";
import { getBazaresFromSheets } from "@/src/lib/sheets";
import Link from "next/link";
import { getExpositoresTodas } from "@/src/lib/sheets-expositores";

export const revalidate = 86400;

function formatBazarDate(bazar: any) {
  const fInicio = new Date(bazar.fecha + "T00:00:00");
  const hasFechaFin = bazar.fechaFin && bazar.fechaFin !== "";
  
  if (hasFechaFin && bazar.fechaFin !== bazar.fecha) {
    const fFin = new Date(bazar.fechaFin + "T00:00:00");
    const dInicio = fInicio.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
    const dFin = fFin.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
    return `${dInicio} - ${dFin}`;
  }
  
  return fInicio.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function LandingPage() {
  const bazares = await getBazaresFromSheets();
  const bazaresDestacados = bazares
    .filter((b: any) => ['pro','medio','promo'].includes(b.plan))
    .sort((a: any, b: any) => {
      const orden: Record<string, number> = { pro: 1, promo: 2, medio: 3 }
      return (orden[a.plan] || 4) - (orden[b.plan] || 4)
    })
    .slice(0, 12);

  const expositores = await getExpositoresTodas();
  const expositoresTop = expositores
    .filter((e: any) => e.planElegido === 'Top')
    .slice(0, 6);
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. NAVBAR */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/55">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="text-xl sm:text-2xl font-title font-extrabold text-[#1a1a1a] tracking-tight">
            Bazares<span className="text-accent">MX</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/publica-tu-bazar"
              className="text-[#1A7A52] hover:text-[#1D9E75] font-black text-xs sm:text-sm transition duration-300 whitespace-nowrap bg-[#EBF7F2] px-4 py-2 rounded-full"
            >
              Publicar Bazar (Gratis)
            </Link>
            <Link 
              href="/expositores/registro"
              className="bg-accent text-white px-4 py-2 rounded-full font-bold hover:brightness-110 transition shadow-lg shadow-accent/20 text-xs sm:text-sm whitespace-nowrap"
            >
              Registrar mi Marca
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* 2. HERO SPLIT SECTION */}
        <section className="bg-gradient-to-b from-[#EBF7F2] to-[#FFFAF5] border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 text-center">
            <div className="inline-flex items-center bg-[#D1F2E8] text-primary px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-8">
              🚀 Bazares Digital — Donde Crece tu Negocio
            </div>
            <h1 className="font-syne font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tighter leading-none text-[#1a1a1a] mb-6">
              Conecta tu marca con los <br className="hidden md:block" /> mejores <span className="text-accent">bazares</span> de México
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-16 max-w-2xl mx-auto font-medium">
              Conecta bazares con expositores. Sin límites. Sin complicaciones.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
              {/* ORGANIZADORES HERO CARD */}
              <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-neutral-100/50 flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-[#EBF7F2] text-primary px-3 py-1 rounded-full font-black uppercase tracking-wider mb-4 inline-block">
                    Para Organizadores
                  </span>
                  <h2 className="text-3xl font-title font-extrabold text-[#1a1a1a] tracking-tight mb-4">
                    Publicar tu bazar es gratis
                  </h2>
                  <p className="text-gray-600 mb-8 font-medium leading-relaxed">
                    Llena tus espacios con expositores de calidad sin pagar comisiones. En BazaresMX te conectamos con emprendedores listos para vender.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Publicación instantánea en el directorio",
                      "Contacto directo con expositores por WhatsApp",
                      "Sin intermediarios ni cobros ocultos",
                      "Sin requerir tarjeta de crédito"
                    ].map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                        <span className="text-primary text-base">✓</span> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/publica-tu-bazar"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-extrabold text-center hover:brightness-110 transition shadow-lg shadow-primary/20 block"
                >
                  Publicar Bazar Ahora
                </Link>
              </div>

              {/* EXPOSITORES HERO CARD */}
              <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-neutral-100/50 flex flex-col justify-between">
                <div>
                  <span className="text-xs bg-[#FFF3EC] text-accent px-3 py-1 rounded-full font-black uppercase tracking-wider mb-4 inline-block">
                    Para Expositores
                  </span>
                  <h2 className="text-3xl font-title font-extrabold text-[#1a1a1a] tracking-tight mb-4">
                    Vende en los mejores bazares
                  </h2>
                  <p className="text-gray-600 mb-8 font-medium leading-relaxed">
                    Descubre eventos que encajen a la perfección con tu marca. Crea tu perfil comercial y haz que los organizadores te descubran.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Perfil digital con catálogo de productos",
                      "Aparece de forma prioritaria en búsquedas",
                      "Contacto directo con organizadores por WhatsApp",
                      "Sin requerir tarjeta de crédito"
                    ].map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-500 font-bold">
                        <span className="text-accent text-base">✓</span> {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/expositores/registro"
                  className="w-full bg-accent text-white py-4 rounded-2xl font-extrabold text-center hover:brightness-110 transition shadow-lg shadow-accent/20 block"
                >
                  Registrar mi Marca Ahora
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

        {/* 4. CÓMO FUNCIONA (DOBLE AUDIENCIA) */}
        <section className="py-32 px-6 max-w-7xl mx-auto w-full">
          <div className="text-center mb-24">
            <span className="text-accent font-black tracking-widest uppercase text-sm">El Proceso</span>
            <h2 className="text-5xl font-title font-extrabold mt-4 tracking-tight">Cómo funciona la plataforma</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16">
            {/* LADO ORGANIZADORES */}
            <div className="bg-[#FFFAF5] p-8 sm:p-12 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-wider mb-10 flex items-center gap-2">
                <span>🏢</span> Para Organizadores
              </h3>
              <div className="space-y-12">
                {[
                  { num: "01", title: "Publicas tu Bazar", desc: "Sube los detalles de tu evento, ubicación, fechas y requisitos para participar." },
                  { num: "02", title: "Expositores te Encuentran", desc: "Las marcas y artesanos interesados ven tu publicación y revisan si cumplen tu perfil." },
                  { num: "03", title: "Tú Decides y Apruebas", desc: "Recibes las solicitudes directo en tu WhatsApp para negociar el espacio sin intermediarios." }
                ].map((step, i) => (
                  <div key={i} className="border-l-[6px] border-[#9FE1CB] pl-8 py-2 relative text-left">
                    <span className="text-5xl font-title font-extrabold text-[#9FE1CB] opacity-60 block mb-2 leading-none">{step.num}</span>
                    <h4 className="text-2xl font-bold mb-2 tracking-tight text-[#1a1a1a]">{step.title}</h4>
                    <p className="text-gray-600 text-base leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* LADO EXPOSITORES */}
            <div className="bg-white p-8 sm:p-12 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-wider mb-10 flex items-center gap-2">
                <span>🛍️</span> Para Expositores
              </h3>
              <div className="space-y-12">
                {[
                  { num: "01", title: "Registras tu Marca", desc: "Crea tu perfil con fotos de tus productos, giro, ubicación y links a tus redes sociales." },
                  { num: "02", title: "Encuentras Bazares", desc: "Explora la cartelera y busca bazares activos por ciudad o tipo que encajen con tu marca." },
                  { num: "03", title: "Contactas al Organizador", desc: "Solicita tu lugar directo al WhatsApp del organizador enviándole tu catálogo digital con un clic." }
                ].map((step, i) => (
                  <div key={i} className="border-l-[6px] border-[#FBDCD0] pl-8 py-2 relative text-left">
                    <span className="text-5xl font-title font-extrabold text-accent opacity-40 block mb-2 leading-none">{step.num}</span>
                    <h4 className="text-2xl font-bold mb-2 tracking-tight text-[#1a1a1a]">{step.title}</h4>
                    <p className="text-gray-600 text-base leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. BAZARES DESTACADOS */}
        <section className="bg-[#FFF3EC] py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-accent font-black tracking-widest uppercase text-sm">Próximos eventos</span>
                <h2 className="text-5xl font-title font-extrabold mt-4 text-[#1a1a1a] tracking-tight">Bazares destacados</h2>
                <p className="text-xl text-gray-600 mt-4 font-medium">Los eventos más populares esta temporada</p>
              </div>
              <Link
                href="/bazares"
                className="text-[#1A7A52] font-black hover:underline flex items-center justify-center gap-2 text-lg whitespace-nowrap"
              >
                Ver todos los bazares →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bazaresDestacados.map((bazar: any) => (
                <Link key={bazar.id} href={`/bazares/${bazar.slug}`}>
                  <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-accent/5 hover:shadow-accent/10 transition duration-500 group cursor-pointer h-full">
                    <div className="relative w-full aspect-[1200/630] overflow-hidden">
                      {bazar.imagen && bazar.imagen !== "" ? (
                        <Image 
                          src={bazar.imagen} 
                          alt={bazar.nombre} 
                          fill 
                          className="object-cover group-hover:scale-105 transition duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg p-4 text-center">
                          📸 Imagen próximamente
                        </div>
                      )}
                      {(bazar as any).badge === "destacado" && (
                        <div className="absolute top-4 left-4 z-10">
                          <span className="bg-[#0B5E43] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                            ⭐ Destacado
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-8">
                      <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        {bazar.tipo}
                      </span>
                      <h3 className="text-2xl font-bold mt-5 mb-3 group-hover:text-primary transition">{bazar.nombre}</h3>
                      <div className="flex flex-col gap-2 text-gray-500 font-medium">
                        {(() => {
                          const coloniasParsed = bazar.colonias?.length > 0 ? bazar.colonias : [bazar.colonia];
                          const sedesExtra = coloniasParsed.length - 1;
                          return (
                            <span className="flex items-center gap-2">
                              📍 {bazar.ciudad}, {coloniasParsed[0]}
                              {sedesExtra > 0 && (
                                <span className="text-xs text-gray-400 ml-1">+{sedesExtra} sedes más</span>
                              )}
                            </span>
                          );
                        })()}
                        <span className="flex items-center gap-2">
                          📅 {formatBazarDate(bazar)}
                        </span>
                        {bazar.horario && bazar.horario !== "" && bazar.horario.toLowerCase() !== "por confirmar" && (
                          <span className="flex items-center gap-2">📅 {bazar.horario}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 5.5. MARCAS Y EXPOSITORES DESTACADOS (EXCLUSIVO PLAN TOP) */}
        {expositoresTop.length > 0 && (
          <section className="bg-white py-32 px-6 border-b border-gray-50">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {expositoresTop.map((exp: any) => (
                  <Link key={exp.id} href={`/expositores/${exp.slug}`} className="group">
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-accent/5 hover:shadow-accent/10 transition duration-500 h-full flex flex-col justify-between">
                      <div>
                        {/* Imagen de Portada */}
                        <div className="relative w-full aspect-[1200/630] overflow-hidden bg-neutral-50 border-b border-gray-100">
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

                        {/* Info */}
                        <div className="p-8">
                          <span className="bg-[#1A7A52]/10 text-[#1A7A52] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                            {exp.giro}
                          </span>
                          <h3 className="text-2xl font-bold mt-5 mb-3 group-hover:text-[#1A7A52] transition leading-tight text-gray-900">
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
            </div>
          </section>
        )}

        {/* 5.7. PROPUESTA DE VALOR / PLANES DE EXPOSITORES */}
        <section className="bg-gradient-to-b from-[#FFFAF5] to-[#EBF7F2] py-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <span className="text-primary font-black tracking-widest uppercase text-sm">Planes de Expositores</span>
            <h2 className="text-5xl font-title font-extrabold mt-4 mb-20 tracking-tight text-[#1a1a1a]">Elige el plan ideal para tu marca</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
              {/* PLAN BÁSICO */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 flex items-center gap-2">
                    🥉 Básico
                  </h3>
                  <div className="text-3xl font-extrabold text-primary mb-6">
                    $99 <span className="text-sm font-semibold text-gray-400">/ mes</span>
                  </div>
                  <p className="text-sm text-gray-500 font-bold mb-6">Ideal para: Probar y ser visible en el mapa.</p>
                  <hr className="border-gray-50 mb-6" />
                  <ul className="space-y-3 mb-8">
                    {[
                      "Perfil público en directorio",
                      "1 imagen comercial",
                      "Enlaces a tus redes sociales",
                      "Contacto directo de WhatsApp"
                    ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                        <span className="text-[#1A7A52]">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/expositores/registro"
                  className="w-full border-2 border-primary text-primary hover:bg-[#EBF7F2] py-3.5 rounded-xl font-bold text-center transition block animate-pulse-slow"
                >
                  Registrarme Gratis
                </Link>
              </div>

              {/* PLAN MEDIA */}
              <div className="bg-white p-8 rounded-[2rem] border-2 border-[#1A7A52] shadow-2xl relative flex flex-col justify-between">
                <span className="absolute -top-4 right-8 bg-[#1A7A52] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Recomendado</span>
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 flex items-center gap-2">
                    🥈 Media
                  </h3>
                  <div className="text-3xl font-extrabold text-primary mb-6">
                    $199 <span className="text-sm font-semibold text-gray-400">/ mes</span>
                  </div>
                  <p className="text-sm text-gray-500 font-bold mb-6">Ideal para: Vender activamente en bazares.</p>
                  <hr className="border-gray-50 mb-6" />
                  <ul className="space-y-3 mb-8">
                    {[
                      "Todo lo del Básico",
                      "Hasta 5 fotos en tu galería",
                      "Buscador específico por ciudad y giro",
                      "Catálogo digital de 3 productos estrella",
                      "Contacto directo de organizadores"
                    ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                        <span className="text-[#1A7A52]">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/expositores/registro"
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-center hover:brightness-110 transition block"
                >
                  Elegir Plan Media
                </Link>
              </div>

              {/* PLAN TOP */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 flex items-center gap-2">
                    🥇 Top
                  </h3>
                  <div className="text-3xl font-extrabold text-primary mb-6">
                    $349 <span className="text-sm font-semibold text-gray-400">/ mes</span>
                  </div>
                  <p className="text-sm text-gray-500 font-bold mb-6">Ideal para: Marcas consolidadas, máxima visibilidad.</p>
                  <hr className="border-gray-50 mb-6" />
                  <ul className="space-y-3 mb-8">
                    {[
                      "Todo lo del plan Media",
                      "Destacado en portada principal",
                      "Badge de verificación ⭐",
                      "Estadísticas de visitas en tu perfil",
                      "Hasta 20 fotos comerciales",
                      "Escaparate premium de 3 productos estrella"
                    ].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                        <span className="text-[#1A7A52]">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/expositores/registro"
                  className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-xl font-bold text-center hover:bg-neutral-800 transition block"
                >
                  Elegir Plan Top
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5.9. TESTIMONIOS */}
        <section className="bg-white py-24 px-6 text-center border-b border-gray-50">
          <div className="max-w-3xl mx-auto">
            <span className="text-6xl block mb-6">💬</span>
            <blockquote className="text-2xl sm:text-3xl font-title font-extrabold italic text-gray-900 leading-tight mb-8">
              "Vendí 3x más cuando registré mi marca en BazaresMX. Los organizadores de bazares me contactan directo por WhatsApp para invitarme sin rodeos."
            </blockquote>
            <cite className="font-extrabold text-primary text-base sm:text-lg not-italic">
              — Sandra, Joyería Artesanal, Ciudad de México
            </cite>
          </div>
        </section>

        {/* 6. SECCIÓN LLAMADO A LA ACCIÓN FINAL */}
        <section className="py-32 px-6 max-w-7xl mx-auto w-full text-center">
          <div className="bg-primary p-12 md:p-20 rounded-[3rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden max-w-5xl mx-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <h3 className="text-4xl sm:text-5xl font-syne font-extrabold mb-4 relative z-10">¿Listo para hacer crecer tu negocio?</h3>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-12 font-medium relative z-10 leading-relaxed">
              Publica tu bazar de forma completamente gratuita o registra tu emprendimiento comercial hoy mismo en la plataforma de bazares más activa de México.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto relative z-10">
              <Link 
                href="/publica-tu-bazar"
                className="w-full bg-[#1a1a1a] text-white py-4.5 rounded-2xl font-extrabold text-lg hover:bg-neutral-800 transition block text-center"
              >
                Soy Organizador
              </Link>
              <Link 
                href="/expositores/registro"
                className="w-full bg-accent text-white py-4.5 rounded-2xl font-extrabold text-lg hover:brightness-110 transition block text-center shadow-lg shadow-accent/20"
              >
                Soy Expositor
              </Link>
            </div>
            
            <p className="text-[10px] md:text-xs text-white/50 text-center mt-6 relative z-10 font-bold">
              ✓ Sin requerir tarjeta de crédito · ✓ Activación rápida · ✓ Sin intermediarios
            </p>
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="bg-[#1a1a1a] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="text-4xl font-title font-extrabold mb-4 tracking-tight">
            Bazares<span className="text-accent">MX</span>
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
            Desarrollado por 💡 <a href="https://www.flowisolutions.com/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-bold">Flowi Solutions</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBazaresFromSheets } from "@/src/lib/sheets";
import BazarCarrusel from "./BazarCarrusel";

export const revalidate = 86400;
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

function slugifyCiudad(ciudad: string): string {
  const norm = (ciudad || "").toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, "-")      // replace non-alphanumeric with hyphen
    .replace(/-+/g, "-")            // merge duplicate hyphens
    .replace(/^-|-$/g, "");          // trim hyphens

  if (norm === "ciudad-de-mexico" || norm === "cdmx" || norm === "distrito-federal") return "cdmx";
  if (norm === "estado-de-mexico" || norm === "edomex") return "estado-de-mexico";
  return norm;
}

export async function generateStaticParams() {
  const bazares = await getBazaresFromSheets();
  return bazares.map((b: any) => ({
    slug: b.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const bazares = await getBazaresFromSheets();
  const bazar = bazares.find((b: any) => b.slug === slug);

  if (!bazar) {
    return {
      title: "Bazar no encontrado | BazaresMX",
    };
  }

  // Título natural y óptimo para SERP (máx 60 caracteres)
  let rawTitle = "";
  if (bazar.tipo) {
    rawTitle = `${bazar.nombre}: bazar de ${bazar.tipo.toLowerCase()} en ${bazar.ciudad}`;
  } else {
    rawTitle = `${bazar.nombre}: bazar en ${bazar.ciudad}`;
  }

  let finalTitle = rawTitle;
  if (finalTitle.length > 50) {
    finalTitle = `${bazar.nombre} | Bazar en ${bazar.ciudad}`;
  } else {
    finalTitle = `${finalTitle} | BazaresMX`;
  }

  // Descripción dinámica optimizada
  const cleanDesc = bazar.descripcion ? bazar.descripcion.substring(0, 130).trim() : '';
  const defaultDesc = `¿Cuándo es ${bazar.nombre}? Conoce las fechas, horarios, entrada libre y ubicación exacta en ${bazar.colonia || bazar.ciudad}. Toda la información del bazar aquí.`;
  const description = cleanDesc 
    ? `${cleanDesc}... Conoce horarios, ubicación y fechas de ${bazar.nombre} en ${bazar.ciudad}.` 
    : defaultDesc;

  return {
    title: finalTitle,
    description: description,
    openGraph: {
      title: `${bazar.nombre} | BazaresMX`,
      description: description,
      images: [{ url: bazar.imagen }],
      type: 'website',
    }
  };
}

// Helper to format date strings from Sheets to ISO YYYY-MM-DD
function formatIsoDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const clean = dateStr.trim();
  if (clean.includes('/')) {
    const [d, m, y] = clean.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return clean;
}

// Helper to construct fully absolute image URLs for SEO structured data
function getAbsoluteImageUrl(img: string | undefined | null): string {
  if (!img) return "https://www.bazaresmx.com.mx/icon.png";
  const clean = img.trim();
  if (clean.startsWith("http")) return clean;
  return `https://www.bazaresmx.com.mx${clean.startsWith("/") ? "" : "/"}${clean}`;
}

// Dynamic dynamic text to prevent duplicate content penalty
function getPorQueVisitar(bazar: any): string {
  const tipoText = bazar.tipo ? ` de tipo ${bazar.tipo.toLowerCase()}` : '';
  const entradaText = (bazar.entrada || '').toLowerCase() === 'libre' 
    ? 'cuenta con entrada libre, lo que lo hace un plan ideal y accesible' 
    : 'es una excelente oportunidad';
  const expositoresText = bazar.acepta_expositores 
    ? ' Además, si tienes un emprendimiento o marca local, es el espacio perfecto para darte a conocer y conectar con otros creadores.' 
    : '';
  
  return `Visitar ${bazar.nombre} es una excelente oportunidad para apoyar el comercio local y descubrir propuestas de diseño independientes en ${bazar.ciudad}. Este evento ${tipoText} ${entradaText} para pasar el fin de semana con amigos o familia.${expositoresText}`;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const bazares = await getBazaresFromSheets();
  const bazar = bazares.find((b: any) => b.slug === slug);

  if (!bazar) {
    notFound();
  }

  const hasValidHorario = bazar.horario && bazar.horario !== "" && bazar.horario.toLowerCase() !== "por confirmar";
  const fechaInicio = bazar.fecha ? new Date(bazar.fecha + "T00:00:00").toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const fechaFin = bazar.fechaFin && bazar.fechaFin !== bazar.fecha ? new Date(bazar.fechaFin + "T00:00:00").toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  const fechaDisplay = fechaFin 
    ? `${fechaInicio} - ${fechaFin}` 
    : fechaInicio

  // Enlazado interno & recomendados
  const ciudadSlug = slugifyCiudad(bazar.ciudad);
  const otrosBazares = bazares
    .filter((b: any) => b.slug !== slug && b.ciudad.toLowerCase() === bazar.ciudad.toLowerCase())
    .slice(0, 3);

  // Schema Event Dates Validation (Null-safety)
  const isoStartDate = formatIsoDate(bazar.fecha);
  const isoEndDate = formatIsoDate(bazar.fechaFin || bazar.fecha);
  const todayIso = new Date().toISOString().split('T')[0];
  const hasValidStart = /^\d{4}-\d{2}-\d{2}$/.test(isoStartDate);
  const hasValidEnd = /^\d{4}-\d{2}-\d{2}$/.test(isoEndDate);

  const startDateSchema = hasValidStart ? isoStartDate : todayIso;
  const endDateSchema = hasValidEnd ? isoEndDate : startDateSchema;

  // validFrom Schema calculation (with Published date or Fallback to startDateSchema)
  let validFromSchema = "";
  if (bazar.publicado && bazar.publicado.trim() !== "") {
    const isoPublicado = formatIsoDate(bazar.publicado);
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoPublicado)) {
      validFromSchema = isoPublicado;
    }
  }
  if (!validFromSchema) {
    validFromSchema = startDateSchema;
  }


  return (
    <div className="min-h-screen bg-[#FFFAF5] pb-20">
      {/* NAVBAR / BREADCRUMB */}
      <nav className="max-w-5xl mx-auto px-6 py-6">
        <Link 
          href="/" 
          className="text-primary font-bold hover:underline flex items-center gap-2"
        >
          ← Volver al directorio
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6">
        {/* HEADER */}
        {bazar.imagenes && bazar.imagenes.length > 1 ? (
          <BazarCarrusel
            imagenes={bazar.imagenes}
            nombre={bazar.nombre}
            tipo={bazar.tipo}
          />
        ) : (
          <div className="relative w-full aspect-[1200/630] rounded-[2rem] overflow-hidden shadow-2xl mb-10 bg-neutral-900/5">
            {bazar.imagen && bazar.imagen !== "" ? (
              <>
                {/* Blurred background */}
                <Image
                  src={bazar.imagen}
                  alt=""
                  fill
                  className="object-cover blur-2xl scale-110 opacity-30 select-none pointer-events-none"
                  priority
                />
                {/* Padded foreground image */}
                <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8">
                  <div className="relative w-full h-full">
                    <Image
                      src={bazar.imagen}
                      alt={bazar.nombre}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-2xl p-4 text-center">
                📸 Imagen próximamente
              </div>
            )}
            <div className="absolute top-6 left-6 z-20">
              <span className="bg-accent text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                {bazar.tipo}
              </span>
            </div>
          </div>
        )}

        <div className="mb-12">
          <h1 className="font-syne text-4xl md:text-6xl font-extrabold text-[#1a1a1a] mb-4 tracking-tight">
            {bazar.nombre}
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            📍 {bazar.ciudad}, {bazar.colonia}
          </p>
        </div>

        {/* CUERPO */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-2 space-y-12">
            {/* 1. SOBRE EL BAZAR */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">¿Qué es {bazar.nombre}?</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {bazar.descripcion || `Conoce los detalles de ${bazar.nombre}, un espacio creado para impulsar emprendimientos locales y marcas independientes de diseño.`}
              </p>
              {bazar.tags && bazar.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-6">
                  {bazar.tags.map((tag: any) => (
                    <span 
                      key={tag} 
                      className="bg-[#D1F2E8] text-primary px-4 py-2 rounded-xl font-bold text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* 2. ¿POR QUÉ VISITAR ESTE BAZAR? (Dinámico) */}
            <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-primary">¿Por qué visitar este bazar?</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {getPorQueVisitar(bazar)}
              </p>
            </section>

            {/* 3. QUÉ ENCONTRARÁS */}
            {bazar.queEncontraras && bazar.queEncontraras.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">¿Qué puedes encontrar en este bazar?</h2>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 mb-6">
                  {bazar.queEncontraras.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 text-lg text-gray-700">
                      <span className="text-2xl leading-none">✨</span>
                      <div>
                        <span className="font-semibold text-gray-900">{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(bazar as any).recurrente && (
              <section className="bg-yellow-brand/10 p-6 rounded-2xl border border-yellow-brand/20">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                  📅 Recurrencia
                </h2>
                <p className="text-lg font-medium text-gray-800">
                  {(bazar as any).recurrencia}
                </p>
              </section>
            )}

            {/* 4. SEDES Y UBICACIÓN */}
            {bazar.colonias && bazar.colonias.length > 1 ? (
              <section>
                <h2 className="text-2xl font-bold mb-6 text-primary">¿Dónde se realiza {bazar.nombre}? Ubicaciones y Sedes</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {bazar.colonias.map((colonia: string, i: number) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                      <div className="mb-4">
                        <p className="font-extrabold text-gray-900 text-lg flex items-center gap-1.5">
                          <span>📍</span> {colonia}
                        </p>
                        {bazar.direcciones && bazar.direcciones[i] && (
                          <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
                            {bazar.direcciones[i]}
                          </p>
                        )}
                      </div>
                      {bazar.plan === 'pro' && (
                        <iframe
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            (bazar.direcciones && bazar.direcciones[i]) || colonia
                          )}&output=embed`}
                          width="100%"
                          height="220"
                          style={{ border: 0, borderRadius: '24px' }}
                          allowFullScreen
                          loading="lazy"
                          className="shadow-sm border border-gray-100 mt-4"
                          title={`Mapa de la sede en ${colonia}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              bazar.direccion && (
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">¿Dónde se realiza {bazar.nombre}? Ubicación exacta</h2>
                  <div className="flex items-start gap-3 text-lg text-gray-700 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <span className="text-2xl">🗺️</span>
                    <p>{bazar.direccion}</p>
                  </div>
                  {bazar.plan === 'pro' && (
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(bazar.direccion)}&output=embed`}
                      width="100%"
                      height="300"
                      style={{ border: 0, borderRadius: '24px' }}
                      allowFullScreen
                      loading="lazy"
                      className="shadow-md border border-gray-100"
                      title={`Mapa del bazar ${bazar.nombre}`}
                    />
                  )}
                </section>
              )
            )}
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-primary p-8 rounded-[2rem] text-white shadow-xl">
              <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-4">
                Fechas y Horarios de {bazar.nombre}
              </h3>
              <ul className="space-y-6">
                <li className="flex flex-col">
                  <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
                    {"fechas" in bazar && Array.isArray((bazar as any).fechas)
                      ? "Fechas y Horario"
                      : "Próxima Fecha y Horario"}
                  </span>
                  <span className="text-lg font-bold">{fechaDisplay}</span>
                  {bazar.horario && bazar.horario !== '' && (
                    <div className="mt-2 text-white/90 text-sm font-bold flex items-center gap-1.5">
                      🕐 {bazar.horario}
                    </div>
                  )}
                </li>
                {bazar.entrada === "libre" && (
                  <li className="flex flex-col">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Costo de entrada</span>
                    <span className="text-lg font-bold">Entrada Libre</span>
                  </li>
                )}
                {bazar.acepta_expositores && (
                  <li className="flex flex-col">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Expositores</span>
                    <span className="text-lg font-bold">✓ Acepta expositores</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              {bazar.whatsapp && bazar.whatsapp !== "" && (
                <a
                  href={`https://wa.me/${bazar.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-4 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-lg"
                >
                  <span>Contactar por WhatsApp</span>
                </a>
              )}
              {bazar.instagram && bazar.instagram !== "" && (
                <a
                  href={bazar.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-accent text-white py-4 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-lg"
                >
                  <span>Ver en Instagram</span>
                </a>
              )}
              {bazar.facebook && bazar.facebook !== "" && (
                <a
                  href={bazar.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-[#1877F2] text-white py-4 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-lg"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                  <span>Facebook</span>
                </a>
              )}
              {bazar.tiktok && bazar.tiktok !== "" && (
                <a
                  href={bazar.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-black text-white py-4 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-lg"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.85.99 2 1.7 3.29 2 .03 1.37.03 2.74.01 4.11-.97-.06-1.93-.36-2.79-.84a8.2 8.2 0 01-2.92-2.82c-.06 3.65-.02 7.3-.04 10.95-.14 1.94-.97 3.79-2.4 5.09-1.84 1.74-4.5 2.4-6.95 1.74-2.52-.61-4.63-2.46-5.59-4.88A9.8 9.8 0 011.025 12c.16-2.87 1.52-5.61 3.82-7.3a9.85 9.85 0 018.66-1.58c.07.69.17 1.38.28 2.07A7.8 7.8 0 006.185 8c-.68 1.13-1.07 2.46-.97 3.79.08 1.96.95 3.82 2.48 5.05 1.63 1.34 3.96 1.7 5.92 1.05 1.72-.51 3.12-1.84 3.68-3.51.34-1.12.28-2.31.29-3.48-.01-4.9-.01-9.8.01-14.7-.09-.07-.1-.13-.08-.2z"/>
                  </svg>
                  <span>TikTok</span>
                </a>
              )}
              {bazar.plan === 'pro' && bazar.acepta_expositores && bazar.whatsapp && bazar.whatsapp !== "" && (
                <a
                  href={`https://wa.me/${bazar.whatsapp}?text=Hola,%20vi%20tu%20bazar%20en%20BazaresMX%20y%20me%20interesa%20exponer%20en%20${encodeURIComponent(bazar.nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full text-white py-4 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-lg"
                  style={{ backgroundColor: '#D85A30' }}
                >
                  <span>🛍️ Quiero exponer aquí</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* OTROS RECOMENDADOS */}
        {otrosBazares.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Otros bazares recomendados en {bazar.ciudad}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otrosBazares.map((ot: any) => (
                <Link key={ot.id} href={`/bazares/${ot.slug}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition border border-gray-100 flex flex-col h-full">
                    <div className="relative aspect-[16/9] w-full bg-gray-50">
                      {ot.imagen ? (
                        <Image
                          src={ot.imagen}
                          alt={ot.nombre}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">📸</div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-gray-900 group-hover:text-primary mb-2 line-clamp-1">{ot.nombre}</h3>
                      <p className="text-xs text-gray-500 font-semibold">📍 {ot.colonia || ot.ciudad}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ENLAZADO INTERNO */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-base font-bold text-gray-800 mb-4">Explora el directorio</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-gray-600">
            <Link href="/" className="text-primary hover:underline">
              Inicio
            </Link>
            <span className="text-gray-300">|</span>
            <Link href={`/bazares-en-${ciudadSlug}`} className="text-primary hover:underline">
              Bazares en {bazar.ciudad}
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/publica-tu-bazar" className="text-[#E8621A] hover:underline flex items-center gap-1">
              📢 ¿Organizas un bazar? Anúncialo gratis aquí
            </Link>
          </div>
        </div>

        {(bazar as any).publicado && (
          <p className="text-xs text-gray-300 mt-8 text-right">
            Publicado el {(() => {
              const dateStr = (bazar as any).publicado.trim();
              let date: Date;
              
              if (dateStr.includes('/')) {
                const [d, m, y] = dateStr.split('/');
                date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
              } else if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                if (parts[0].length === 4) {
                  date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                } else {
                  date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                }
              } else {
                date = new Date(dateStr);
              }
              
              if (isNaN(date.getTime())) {
                return dateStr;
              }
              return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
            })()}
          </p>
        )}
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": bazar.nombre,
            "description": bazar.descripcion || `Detalles de fecha, ubicación y expositores del bazar ${bazar.nombre}`,
            "startDate": startDateSchema,
            "endDate": endDateSchema,
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "image": getAbsoluteImageUrl(bazar.imagen),
            "location": {
              "@type": "Place",
              "name": bazar.nombre,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": bazar.direccion || "Dirección por confirmar",
                "addressLocality": bazar.colonia || bazar.ciudad || "Colonia por confirmar",
                "addressRegion": bazar.ciudad || "México",
                "addressCountry": "MX"
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": bazar.organizador || bazar.nombre,
              "url": bazar.instagram || `https://www.bazaresmx.com.mx/bazares/${bazar.slug}`
            },
            "performer": {
              "@type": "PerformingGroup",
              "name": bazar.organizador || "Expositores y Emprendedores Locales"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "MXN",
              "availability": "https://schema.org/InStock",
              "validFrom": validFromSchema,
              "url": `https://www.bazaresmx.com.mx/bazares/${bazar.slug}`
            },
            "isAccessibleForFree": (bazar.entrada === "libre"),
            "url": `https://www.bazaresmx.com.mx/bazares/${bazar.slug}`
          })
        }}
      />
    </div>
  );
}

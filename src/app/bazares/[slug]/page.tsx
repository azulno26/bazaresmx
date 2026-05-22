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

  return {
    title: bazar.nombre,
    description: bazar.descripcion,
    openGraph: {
      title: `${bazar.nombre} | BazaresMX`,
      description: bazar.descripcion,
      images: [{ url: bazar.imagen }],
      type: 'website',
    }
  };
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

  return (
    <div className="min-h-screen bg-[#FFFAF5] pb-20">
      {/* NAVBAR / BREADCRUMB */}
      <nav className="max-w-5xl mx-auto px-6 py-6">
        <Link 
          href="/" 
          className="text-primary font-bold hover:underline flex items-center gap-2"
        >
          ← Volver a bazares
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
          <div className="relative w-full h-72 md:h-96 rounded-[2rem] overflow-hidden shadow-2xl mb-10">
            {bazar.imagen && bazar.imagen !== "" ? (
              <Image
                src={bazar.imagen}
                alt={bazar.nombre}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-2xl p-4 text-center">
                📸 Imagen próximamente
              </div>
            )}
            <div className="absolute top-6 left-6">
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
            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">Sobre el bazar</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {bazar.descripcion}
              </p>
            </section>

            {((bazar as any).queEncontraras || bazar.slug === "bazarista") ? (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Qué encontrarás</h2>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 mb-6">
                  <div className="flex items-start gap-3 text-lg text-gray-700">
                    <span className="text-2xl leading-none">🎨</span>
                    <div>
                      <span className="font-semibold text-gray-900">Marcas emergentes y diseño independiente</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-lg text-gray-700">
                    <span className="text-2xl leading-none">🛍️</span>
                    <div>
                      <span className="font-semibold text-gray-900">Productos artesanales y de consumo local</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-lg text-gray-700">
                    <span className="text-2xl leading-none">🌱</span>
                    <div>
                      <span className="font-semibold text-gray-900">Emprendimiento y economía creativa</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {bazar.tags.map((tag: any) => (
                    <span 
                      key={tag} 
                      className="bg-[#D1F2E8] text-primary px-4 py-2 rounded-xl font-bold text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </section>
            ) : (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Qué encontrarás</h2>
                <div className="flex flex-wrap gap-3">
                  {bazar.tags.map((tag: any) => (
                    <span 
                      key={tag} 
                      className="bg-[#D1F2E8] text-primary px-4 py-2 rounded-xl font-bold text-sm"
                    >
                      #{tag}
                    </span>
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

            {(bazar as any).direccion && (
              <section>
                <h2 className="text-2xl font-bold mb-4 text-primary">Ubicación</h2>
                <div className="flex items-start gap-3 text-lg text-gray-700 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <span className="text-2xl">🗺️</span>
                  <p>{(bazar as any).direccion}</p>
                </div>
              </section>
            )}
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-primary p-8 rounded-[2rem] text-white shadow-xl">
              <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-4">
                Información clave
              </h3>
              <ul className="space-y-6">
                <li className="flex flex-col">
                  <span className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
                    {"fechas" in bazar && Array.isArray((bazar as any).fechas)
                      ? (hasValidHorario ? "Fechas y Horario" : "Fechas")
                      : (hasValidHorario ? "Próxima Fecha y Horario" : "Próxima Fecha")}
                  </span>
                  <span className="text-lg font-bold">{fechaDisplay}</span>
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
            </div>
          </div>
        </div>

        {(bazar as any).publicado && (
          <p className="text-xs text-gray-300 mt-8 text-right">
            Publicado el {(() => {
              const parts = (bazar as any).publicado.split("-");
              const date = parts[0].length === 4
                ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
                : new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
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
            "description": bazar.descripcion,
            "startDate": bazar.fecha,
            "location": {
              "@type": "Place",
              "name": bazar.nombre,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": (bazar as any).direccion,
                "addressLocality": bazar.colonia,
                "addressRegion": bazar.ciudad,
                "addressCountry": "MX"
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": bazar.nombre,
              "url": bazar.instagram
            },
            "isAccessibleForFree": bazar.entrada === "libre",
            "url": `https://www.bazaresmx.com.mx/bazares/${bazar.slug}`
          })
        }}
      />
    </div>
  );
}

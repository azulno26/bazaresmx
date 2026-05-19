import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import bazares from "@/src/data/bazares.json";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return bazares.map((b) => ({
    slug: b.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const bazar = bazares.find((b) => b.slug === slug);

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
  const bazar = bazares.find((b) => b.slug === slug);

  if (!bazar) {
    notFound();
  }

  let formattedDate = "";
  if ("fechas" in bazar && Array.isArray((bazar as any).fechas)) {
    formattedDate = (bazar as any).fechas.map((f: string) => {
      return new Date(f + "T00:00:00").toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
      });
    }).join(" · ") + ` · ${bazar.horario}`;
  } else {
    formattedDate = new Date(bazar.fecha + "T00:00:00").toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) + ` · ${bazar.horario}`;
  }

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
        <div className="relative w-full h-72 md:h-96 rounded-[2rem] overflow-hidden shadow-2xl mb-10">
          <Image
            src={bazar.imagen}
            alt={bazar.nombre}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute top-6 left-6">
            <span className="bg-accent text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
              {bazar.tipo}
            </span>
          </div>
        </div>

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

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary">Qué encontrarás</h2>
              <div className="flex flex-wrap gap-3">
                {bazar.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="bg-[#D1F2E8] text-primary px-4 py-2 rounded-xl font-bold text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </section>

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
                    {"fechas" in bazar && Array.isArray((bazar as any).fechas) ? "Fechas y Horario" : "Próxima Fecha y Horario"}
                  </span>
                  <span className="text-lg font-bold">{formattedDate}</span>
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
              <a
                href={`https://wa.me/${bazar.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-4 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-lg"
              >
                <span>Contactar por WhatsApp</span>
              </a>
              <a
                href={bazar.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-accent text-white py-4 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-lg"
              >
                <span>Ver en Instagram</span>
              </a>
              {(bazar as any).facebook && (
                <a
                  href={(bazar as any).facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-accent text-white py-4 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-lg"
                >
                  <span>Contactar por FB</span>
                </a>
              )}
            </div>
          </div>
        </div>
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

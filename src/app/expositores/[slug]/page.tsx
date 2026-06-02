import { getExpositorBySlug, getExpositoresTodas } from "@/src/lib/sheets-expositores";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDisponibilidad } from "@/src/lib/formatters";
import { VisitTracker } from "./VisitTracker";

// ISR: Pre-generate all active ones at build time, revalidate every 24h, generate on-demand if new
export const revalidate = 86400;
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const expositores = await getExpositoresTodas();
  // Only pre-generate static profiles for Media and Top plans
  return expositores
    .filter((e) => e.planElegido === 'Media' || e.planElegido === 'Top')
    .map((e) => ({
      slug: e.slug,
    }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const exp = await getExpositorBySlug(slug);
  
  if (!exp || exp.planElegido === 'Básico') {
    return {
      title: "Expositor no encontrado | BazaresMX",
    };
  }

  return {
    title: `${exp.nombreNegocio} - ${exp.giro} en ${exp.ciudad} | BazaresMX`,
    description: exp.descripcion,
    openGraph: {
      title: `${exp.nombreNegocio} - BazaresMX`,
      description: exp.descripcion,
      images: exp.fotoPerfil ? [{ url: exp.fotoPerfil }] : [],
      type: "website",
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const exp = await getExpositorBySlug(slug);

  if (!exp || exp.planElegido === 'Básico') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FFFAF5] pb-24">
      {/* NAVBAR */}
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="text-xl sm:text-2xl font-title font-extrabold text-[#1a1a1a] tracking-tight">
            Bazares<span className="text-accent">MX</span>
          </Link>
          <Link href="/expositores" className="text-[#1A7A52] font-bold hover:underline text-xs sm:text-base whitespace-nowrap">
            ← Ser Expositor
          </Link>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="bg-[#EBF7F2] py-4 px-6 border-b border-gray-100/50">
        <div className="max-w-5xl mx-auto text-xs sm:text-sm text-gray-500 font-medium flex items-center gap-2">
          <Link href="/" className="hover:underline">Inicio</Link>
          <span>/</span>
          <span>Expositores</span>
          <span>/</span>
          <span className="text-gray-900 font-bold">{exp.nombreNegocio}</span>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          
          {/* COLUMNA IZQUIERDA: Foto de perfil y contacto */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="w-full aspect-square relative mb-6 rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 bg-white">
              {exp.fotoPerfil ? (
                <Image
                  src={exp.fotoPerfil}
                  alt={exp.nombreNegocio}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center text-gray-400 font-bold text-lg text-center p-4">
                  📸 Foto próximamente
                </div>
              )}
            </div>

            {/* Redes sociales */}
            <div className="flex gap-4 justify-center w-full mb-6 flex-wrap">
              {exp.instagram && (
                <a
                  href={exp.instagram.startsWith("http") ? exp.instagram : `https://instagram.com/${exp.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 border border-gray-100 hover:text-[#E1306C] hover:border-[#E1306C]/20 transition shadow-sm"
                >
                  📸 Instagram
                </a>
              )}
              {exp.facebook && (
                <a
                  href={exp.facebook.startsWith("http") ? exp.facebook : `https://facebook.com/${exp.facebook.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 border border-gray-100 hover:text-[#1877F2] hover:border-[#1877F2]/20 transition shadow-sm"
                >
                  👤 Facebook
                </a>
              )}
              {exp.tiktok && (
                <a
                  href={exp.tiktok.startsWith("http") ? exp.tiktok : `https://tiktok.com/@${exp.tiktok.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 border border-gray-100 hover:text-[#1a1a1a] hover:border-black/20 transition shadow-sm"
                >
                  🎵 TikTok
                </a>
              )}
            </div>

            {/* Botón principal de contacto */}
            <a
              href={`https://wa.me/${exp.whatsapp}?text=Hola%20${encodeURIComponent(exp.nombreNegocio)},%20vi%20tu%20perfil%20en%20BazaresMX%20y%20me%20gustar%C3%ADa%20conocer%20m%C3%A1s%20sobre%20tus%20productos.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#1A7A52] text-white py-4 rounded-2xl font-extrabold text-center hover:brightness-110 transition shadow-lg shadow-[#1A7A52]/20 block"
            >
              Contactar por WhatsApp
            </a>
            <div className="w-full mt-4 bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm flex items-center justify-center gap-2 text-xs font-bold text-gray-500">
              <span className="text-base">👁️</span>
              <span>
                Perfil visto <strong className="text-[#1A7A52] font-extrabold">{exp.visitas} veces</strong>
              </span>
            </div>
          </div>

          {/* COLUMNA DERECHA: Información comercial */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="bg-[#D1F2E8] text-[#1A7A52] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-3">
                {exp.giro}
              </span>
              <h1 className="font-syne font-extrabold text-4xl sm:text-5xl text-[#1a1a1a] tracking-tight leading-none">
                {exp.nombreNegocio}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="bg-white border border-gray-100 px-4 py-1.5 rounded-full text-sm font-bold text-gray-600 shadow-sm">
                📍 {exp.ciudad}
              </span>
              {exp.badgeVerificado && (
                <span className="bg-blue-50 border border-blue-200/50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest shadow-sm">
                  ⭐ Verificado
                </span>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">¿Cuándo puede exponer?</h3>
              <p className="text-[#1A7A52] font-extrabold text-base">
                📅 {formatDisponibilidad(exp.disponibilidad) || "No especificada"}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary">Sobre nosotros</h2>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                {exp.descripcion}
              </p>
            </div>

            <div className="bg-[#FFF3EC] p-6 rounded-2xl border border-amber-500/10 text-accent font-semibold text-sm">
              👑 Expositor afiliado al plan <strong>{exp.planElegido}</strong> de BazaresMX.
            </div>
          </div>
        </div>

        {/* GALERÍA DE FOTOS (Si tiene) */}
        {exp.fotosProductos.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-syne font-extrabold text-gray-900 mb-6 tracking-tight">Galería de fotos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {exp.fotosProductos.map((foto, idx) => (
                <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md group">
                  <Image
                    src={foto}
                    alt={`${exp.nombreNegocio} - Galería ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CATÁLOGO DE PRODUCTOS (Media / Top plan only) */}
        {exp.productos.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-syne font-extrabold text-gray-900 mb-6 tracking-tight">Catálogo destacado</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exp.productos.map((prod, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl transition duration-300">
                  <div className="aspect-square relative bg-neutral-50 border-b border-gray-100">
                    {prod.foto ? (
                      <Image
                        src={prod.foto}
                        alt={prod.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-5xl">
                        🛍️
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-1 leading-snug">{prod.nombre}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 font-medium">{prod.descripcion}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-2xl font-extrabold text-[#1A7A52]">
                        ${prod.precio.toLocaleString("es-MX")}
                      </span>
                      <a
                        href={`https://wa.me/${exp.whatsapp}?text=Hola%20${encodeURIComponent(exp.nombreNegocio)},%20me%20interesa%20el%20producto:%20${encodeURIComponent(prod.nombre)}%20que%20vi%20en%20su%20cat%C3%A1logo%20de%20BazaresMX.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#1A7A52]/10 text-[#1A7A52] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1A7A52] hover:text-white transition duration-200"
                      >
                        Preguntar
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CALL TO ACTION PARA ORGANIZADORES */}
        <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 text-center shadow-xl max-w-3xl mx-auto">
          <span className="text-5xl block mb-4">📢</span>
          <h3 className="font-syne font-extrabold text-2xl md:text-3xl text-gray-900 mb-3 tracking-tight">
            ¿Organizas un bazar?
          </h3>
          <p className="text-gray-600 font-medium max-w-lg mx-auto mb-8 leading-relaxed">
            Este expositor cuenta con una propuesta excelente para complementar tu evento. Contáctalo directamente para invitarlo.
          </p>
          <a
            href={`https://wa.me/${exp.whatsapp}?text=Hola%20${encodeURIComponent(exp.nombreNegocio)},%20somos%20organizadores%20de%20bazares%20y%20nos%20gustar%C3%ADa%20invitarte%20a%20nuestro%20pr%C3%B3ximo%20evento.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-accent text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-lg hover:brightness-110 transition shadow-accent/20"
          >
            Invitar a mi Bazar
          </a>
        </section>
      </main>
      <VisitTracker slug={exp.slug} />
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 86400; // Cache de 24 horas (página comercial estática)

export const metadata: Metadata = {
  title: "Promociona tu bazar y consigue más visitantes | BazaresMX",
  description: "Dale más visibilidad a tu bazar con opciones destacadas en BazaresMX. Aparece primero, llega a más personas y consigue más expositores.",
  keywords: [
    "promocionar bazar",
    "publicidad para bazares",
    "como conseguir expositores para mi bazar",
    "como atraer gente a mi bazar",
    "difusion de bazares mexico",
    "publicidad de eventos"
  ],
  alternates: {
    canonical: "https://www.bazaresmx.com.mx/promocionar-bazar",
  },
};

const paquetes = [
  {
    nombre: "Publicación Básica",
    precio: "Gratis",
    desc: "Presencia básica en el directorio de eventos.",
    incluye: [
      "Ficha básica del bazar",
      "Fecha, horario y ubicación",
      "Botón directo de WhatsApp",
      "1 imagen comercial",
      "Indexado en Google"
    ],
    cta: "Publicar gratis",
    href: "/publica-tu-bazar",
    destacado: false,
    badge: ""
  },
  {
    nombre: "Bazar Destacado",
    precio: "$299 MXN / mes",
    desc: "Multiplica tu visibilidad y destaca frente a la competencia.",
    incluye: [
      "Todo lo de Básico",
      "Sello ⭐ Destacado en el directorio",
      "Aparición preferente en búsquedas y página de ciudad",
      "Enlaces directos a todas tus redes sociales",
      "Publicación express (menos de 12 horas)"
    ],
    cta: "Quiero Bazar Destacado",
    href: "/publica-tu-bazar",
    destacado: true,
    badge: "POPULAR"
  },
  {
    nombre: "Bazar Premium",
    precio: "$499 MXN / mes",
    desc: "La máxima experiencia de visibilidad y conversión.",
    incluye: [
      "Todo lo de Bazar Destacado",
      "Mapa dinámico de Google Maps en tu página",
      "Botón de expositores '🛍️ Quiero exponer aquí'",
      "Banner destacado en la portada principal",
      "Galería destacada de marcas y productos",
      "Soporte prioritario por WhatsApp 24/7"
    ],
    cta: "Quiero Bazar Premium",
    href: "/publica-tu-bazar",
    destacado: false,
    badge: "MEJOR VALOR"
  },
  {
    nombre: "Difusión Plus",
    precio: "$799 MXN / evento",
    desc: "Promoción activa y dirigida a través de todos nuestros canales.",
    incluye: [
      "Todo lo de Bazar Premium",
      "Publicación dedicada en las redes de BazaresMX",
      "Creación de copy promocional optimizado",
      "Diseño de imagen publicitaria",
      "Recomendado destacado por 7 días"
    ],
    cta: "Contratar Difusión Plus",
    href: `https://wa.me/5215623194635?text=${encodeURIComponent("Hola, quiero contratar el paquete Difusión Plus de $799 para mi bazar")}`,
    destacado: false,
    badge: "EVENTO ÚNICO"
  },
  {
    nombre: "Organizador Pro",
    precio: "$1,499 MXN / mes",
    desc: "El plan definitivo para organizadores con eventos recurrentes.",
    incluye: [
      "Hasta 4 bazares Premium activos al mismo tiempo",
      "Prioridad máxima en portada y páginas de ciudad",
      "Difusión recurrente en redes sociales",
      "Apoyo con redacción SEO de copys",
      "Aparición destacada en redes sociales de BazaresMX"
    ],
    cta: "Ser Organizador Pro",
    href: `https://wa.me/5215623194635?text=${encodeURIComponent("Hola, me interesa la suscripción de Organizador Pro de $1,499/mes")}`,
    destacado: false,
    badge: "ORGANIZADOR ELITE"
  }
];

export default function PromocionarBazarPage() {
  return (
    <div className="min-h-screen bg-[#FFFAF5] pb-20">
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

      {/* 2. HERO */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-16 text-center">
        <Link href="/publica-tu-bazar" className="text-primary font-bold hover:underline mb-6 inline-block">
          ← Volver a publicar bazar
        </Link>
        <h1 className="text-4xl md:text-6xl font-syne font-extrabold text-[#1a1a1a] tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Haz que más personas descubran tu bazar
        </h1>
        <p className="text-xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed mb-10">
          En BazaresMX puedes destacar tu evento para aparecer con mayor visibilidad en nuestras páginas de ciudad, secciones recomendadas y canales de difusión en redes. Atrae más expositores y llena tus espacios rápidamente.
        </p>
        <a 
          href="https://wa.me/5215623194635?text=Hola,%20quiero%20conocer%20las%20opciones%20de%20promocion%20de%20bazar"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-5 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-xl shadow-green-500/10"
        >
          <span>💬 Hablar con un asesor por WhatsApp</span>
        </a>
      </header>

      {/* 3. TABLA DE PAQUETES */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto text-left mb-20">
          {paquetes.map((p, i) => (
            <div 
              key={i}
              className={`bg-white p-8 rounded-[2.5rem] border-2 shadow-xl flex flex-col justify-between relative transition-all duration-300 hover:-translate-y-1 ${
                p.destacado 
                  ? "border-[#1A7A52] bg-[#EBF7F2]/5 scale-[1.02] shadow-2xl" 
                  : "border-gray-100"
              } ${p.nombre === "Organizador Pro" || p.nombre === "Difusión Plus" ? "lg:col-span-1" : ""}`}
            >
              {p.badge && (
                <span className="absolute -top-4 right-8 bg-[#1A7A52] text-white px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {p.badge}
                </span>
              )}
              
              <div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{p.nombre}</h3>
                  <div className="text-3xl font-extrabold text-primary my-3">{p.precio}</div>
                  <p className="text-xs text-gray-500 font-bold mb-4">{p.desc}</p>
                </div>
                <hr className="border-gray-100 mb-6" />
                <ul className="space-y-3.5 mb-8">
                  {p.incluye.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600 font-semibold leading-relaxed">
                      <span className="text-[#1A7A52] font-extrabold">✓</span> <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a 
                href={p.href}
                target={p.href.startsWith("http") ? "_blank" : "_self"}
                rel={p.href.startsWith("http") ? "noopener noreferrer" : ""}
                className={`w-full py-4 rounded-xl font-bold text-center block transition ${
                  p.destacado
                    ? "bg-[#1A7A52] text-white hover:bg-[#156a46] shadow-lg shadow-green-500/20"
                    : p.nombre === "Publicación Básica"
                    ? "border-2 border-primary text-primary hover:bg-[#EBF7F2]/20"
                    : p.nombre === "Bazar Premium"
                    ? "bg-[#1a1a1a] text-white hover:bg-neutral-800"
                    : "bg-[#E8621A] text-white hover:bg-[#d85015]"
                }`}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>

        {/* CÓMO FUNCIONA */}
        <section className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm mb-20">
          <h2 className="text-3xl font-extrabold text-[#1a1a1a] text-center mb-12">¿Cómo funciona la promoción?</h2>
          <div className="grid md:grid-cols-5 gap-6 text-center">
            {[
              { step: 1, title: "Eliges", desc: "Selecciona el plan óptimo para tu evento." },
              { step: 2, title: "Envías info", desc: "Llenas el formulario o nos mandas WhatsApp." },
              { step: 3, title: "Validamos", desc: "Revisamos el pago y confirmamos los detalles." },
              { step: 4, title: "Publicamos", desc: "Activamos los accesos destacados en la web." },
              { step: 5, title: "Recibes marcas", desc: "Expositores te contactan directo." }
            ].map((s, idx) => (
              <div key={idx} className="space-y-3">
                <div className="w-10 h-10 bg-[#EBF7F2] text-[#1A7A52] rounded-full flex items-center justify-center font-bold text-lg mx-auto">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQS */}
        <section className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-extrabold text-[#1a1a1a] text-center mb-12">Preguntas Frecuentes</h2>
          <div className="space-y-6">
            {[
              {
                q: "¿La promoción garantiza visitantes al evento?",
                a: "No podemos garantizar un número exacto de asistentes ya que depende de factores como la temática, ubicación y clima. Sin embargo, aumentamos masivamente la visibilidad de tu bazar en los resultados de Google de alta intención."
              },
              {
                q: "¿Puedo pagar solo por un único evento?",
                a: "Sí, la opción de 'Difusión Plus' es idónea para contratar únicamente por evento, sin contratos recurrentes ni plazos mínimos."
              },
              {
                q: "¿Puedo promocionar convocatoria para expositores?",
                a: "Totalmente. En las fichas destacadas resaltamos de forma prioritaria si el bazar acepta expositores y enlazamos tu contacto directo."
              },
              {
                q: "¿Cuánto tiempo dura activa la promoción?",
                a: "El plan Bazar Destacado y Premium se mantienen vigentes de forma mensual (30 días). En el caso de Difusión Plus, la publicidad en redes sociales se pauta por 7 días previos al evento."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-2">❓ {faq.q}</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-primary text-white py-16 px-6 text-center rounded-[2.5rem] max-w-5xl mx-auto shadow-xl">
          <h2 className="text-3xl font-bold mb-4">¿Listo para llenar los espacios de tu bazar?</h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
            Únete a decenas de organizadores que ya promocionan sus bazares en México con nosotros de forma rápida y efectiva.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://wa.me/5215623194635?text=Hola,%20quiero%20promocionar%20mi%20bazar"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-8 py-4 rounded-2xl font-extrabold hover:brightness-110 transition shadow-xl"
            >
              💬 Hablar por WhatsApp
            </a>
            <Link 
              href="/publica-tu-bazar" 
              className="bg-white text-primary px-8 py-4 rounded-2xl font-extrabold hover:bg-gray-50 transition shadow-xl"
            >
              Publicar gratis primero
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-white/50 py-12 px-6 text-center text-xs font-semibold border-t border-white/5 mt-20">
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

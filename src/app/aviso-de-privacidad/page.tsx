import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | BazaresMX",
  description: "Aviso de Privacidad de BazaresMX. Conoce cómo protegemos y tratamos tus datos personales conforme a la LFPDPPP en México.",
  alternates: {
    canonical: "https://www.bazaresmx.com.mx/aviso-de-privacidad",
  },
};

export default function AvisoDePrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#FFFAF5] flex flex-col justify-between">
      {/* NAVBAR */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <Link href="/" className="text-xl sm:text-2xl font-title font-extrabold text-gray-900 tracking-tight">
            Bazares<span className="text-[#1A7A52]">MX</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-bold text-xs sm:text-sm transition duration-200"
            >
              Directorio
            </Link>
            <Link
              href="/publica-tu-bazar"
              className="text-[#1A7A52] hover:text-[#156a46] font-bold text-xs sm:text-sm transition duration-300 whitespace-nowrap bg-[#EBF7F2] px-4 py-2 rounded-full"
            >
              Publicar Bazar
            </Link>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        {/* HEADER / TITULO */}
        <div className="mb-10 text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:underline mb-4"
          >
            ← Volver al inicio
          </Link>
          <div className="inline-block bg-[#EBF7F2] text-[#1A7A52] text-xs font-extrabold uppercase px-3 py-1 rounded-full mb-3 tracking-wider">
            Documento Legal
          </div>
          <h1 className="text-3xl sm:text-5xl font-syne font-extrabold text-[#1a1a1a] tracking-tight mb-3">
            Aviso de Privacidad
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            <strong>Última actualización:</strong> 2 de agosto de 2026
          </p>
        </div>

        {/* TARJETA DE CONTENIDO */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-gray-100 shadow-sm space-y-10 text-gray-700 leading-relaxed font-sans">
          {/* SECCIÓN 1 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              1. Identidad y domicilio del responsable
            </h2>
            <p>
              <strong>BazaresMX</strong> (operado por Flowi Solutions / Diego Castellanos Maya), con domicilio en Ciudad de México, México, y dirección de contacto electrónico{" "}
              <a
                href="mailto:contacto@bazaresmx.com.mx"
                className="text-primary font-bold hover:underline"
              >
                contacto@bazaresmx.com.mx
              </a>
              , es el responsable del tratamiento de tus datos personales conforme a la{" "}
              <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> y su Reglamento.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 2 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              2. Datos personales que recabamos
            </h2>
            <p>
              Dependiendo de si te registras como <strong>Organizador de Bazares</strong> o como <strong>Expositor</strong>, podemos recabar:
            </p>

            <div className="space-y-4 pt-2">
              <div className="bg-[#FFFAF5] p-5 rounded-2xl border border-orange-100">
                <h3 className="font-bold text-gray-900 mb-2">📌 Datos de identificación y contacto:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Nombre completo</li>
                  <li>Número de WhatsApp / teléfono</li>
                  <li>Correo electrónico</li>
                  <li>Ciudad y zona de operación</li>
                </ul>
              </div>

              <div className="bg-[#FFFAF5] p-5 rounded-2xl border border-orange-100">
                <h3 className="font-bold text-gray-900 mb-2">🛍️ Datos del negocio o marca:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Nombre comercial</li>
                  <li>Descripción de productos o servicios</li>
                  <li>Giro o categoría</li>
                  <li>Fotografías de productos, logotipos e imágenes de perfil</li>
                  <li>Redes sociales (Instagram, Facebook, TikTok)</li>
                  <li>Precios y catálogo de productos (en su caso)</li>
                </ul>
              </div>

              <div className="bg-[#FFFAF5] p-5 rounded-2xl border border-orange-100">
                <h3 className="font-bold text-gray-900 mb-2">💳 Datos relacionados con pagos:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Referencia o concepto de transferencia bancaria</li>
                  <li>Comprobante de pago (imagen o PDF) que nos envíes por correo para validar tu suscripción</li>
                </ul>
                <p className="mt-2 text-xs text-gray-600 italic">
                  * No solicitamos ni almacenamos datos de tarjetas de crédito o débito, ya que los pagos se realizan mediante transferencia bancaria directa validada manualmente.
                </p>
              </div>

              <div className="bg-[#FFFAF5] p-5 rounded-2xl border border-orange-100">
                <h3 className="font-bold text-gray-900 mb-2">🌐 Datos de navegación (recabados automáticamente):</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Dirección IP, tipo de dispositivo y navegador</li>
                  <li>Páginas visitadas y tiempo de permanencia, mediante Google Analytics y Vercel Analytics</li>
                  <li>Cookies técnicas necesarias para el funcionamiento del sitio</li>
                </ul>
              </div>
            </div>

            <p className="text-sm font-semibold text-gray-600 bg-gray-50 p-4 rounded-xl">
              ⚠️ No recabamos datos personales sensibles en los términos del artículo 3, fracción VI de la LFPDPPP.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 3 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              3. Finalidades del tratamiento
            </h2>

            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-lg">Finalidades primarias (necesarias para el servicio):</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                <li>Crear y administrar tu perfil como Organizador o Expositor dentro del directorio de BazaresMX</li>
                <li>Validar el pago de tu plan y activar o desactivar tu perfil según corresponda</li>
                <li>Mostrar tu información pública (nombre de marca, fotos, descripción, contacto) a otros usuarios de la plataforma</li>
                <li>Contactarte para notificarte sobre el estado de tu registro, vencimientos o renovaciones</li>
                <li>Enviarte confirmaciones y notificaciones relacionadas con tu cuenta vía correo electrónico o WhatsApp</li>
                <li>Dar cumplimiento a obligaciones legales y fiscales aplicables</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-gray-900 text-lg">Finalidades secundarias (no necesarias, puedes oponerte):</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                <li>Enviarte información promocional sobre nuevos bazares, funciones de la plataforma o campañas de BazaresMX</li>
                <li>Elaborar estadísticas internas sobre el uso de la plataforma</li>
                <li>Contactarte para ofrecerte otros servicios de Flowi Solutions (como desarrollo web)</li>
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl text-sm">
              <p>
                Si no deseas que tus datos se utilicen para las finalidades secundarias, puedes manifestarlo en cualquier momento escribiendo a{" "}
                <a href="mailto:contacto@bazaresmx.com.mx" className="text-primary font-bold hover:underline">
                  contacto@bazaresmx.com.mx
                </a>{" "}
                con el asunto <em>&quot;Oposición a finalidades secundarias&quot;</em>.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 4 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              4. Transferencia de datos
            </h2>
            <p>
              Tu información pública de perfil (nombre de marca, fotos, descripción, ciudad, contacto) es{" "}
              <strong>visible para cualquier visitante del sitio</strong> por la naturaleza de un directorio público, incluyendo organizadores de bazares y otros expositores que busquen contactarte.
            </p>
            <p>
              No vendemos, rentamos ni compartimos tus datos personales privados (correo electrónico, comprobantes de pago) con terceros ajenos a BazaresMX, salvo:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>
                Con proveedores tecnológicos que nos apoyan en la operación del sitio (por ejemplo, Supabase para almacenamiento de base de datos, Resend para envío de correos, y servicios de hosting como Vercel), quienes están obligados contractualmente a proteger tu información.
              </li>
              <li>Cuando exista un requerimiento de autoridad competente conforme a la ley.</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              5. Derechos ARCO
            </h2>
            <p>
              Tienes derecho a <strong>Acceder, Rectificar, Cancelar u Oponerte (ARCO)</strong> al tratamiento de tus datos personales, así como a revocar el consentimiento que nos hayas otorgado.
            </p>
            <p>
              Para ejercer estos derechos, envía tu solicitud a{" "}
              <a href="mailto:contacto@bazaresmx.com.mx" className="text-primary font-bold hover:underline">
                contacto@bazaresmx.com.mx
              </a>{" "}
              incluyendo:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>Tu nombre completo y correo electrónico registrado</li>
              <li>Descripción clara del derecho que deseas ejercer</li>
              <li>Documento que acredite tu identidad (en su caso)</li>
            </ol>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
              Responderemos tu solicitud en un plazo máximo de <strong>20 días hábiles</strong>, conforme a lo establecido por la LFPDPPP.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              6. Uso de cookies y tecnologías de rastreo
            </h2>
            <p>
              BazaresMX utiliza cookies y tecnologías similares (Google Analytics, Vercel Analytics) para:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>Medir el tráfico y comportamiento de los visitantes del sitio</li>
              <li>Mejorar la experiencia de navegación</li>
              <li>Analizar la efectividad de nuestras campañas de marketing</li>
            </ul>
            <p className="text-sm text-gray-600">
              Puedes deshabilitar las cookies desde la configuración de tu navegador, aunque esto podría afectar algunas funcionalidades del sitio.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              7. Medidas de seguridad
            </h2>
            <p>
              Implementamos medidas administrativas y técnicas razonables para proteger tus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado, incluyendo:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>Almacenamiento en bases de datos con acceso restringido (Supabase)</li>
              <li>Conexiones cifradas (HTTPS/SSL)</li>
              <li>Acceso limitado a la información sólo al personal autorizado de BazaresMX</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 8 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              8. Cambios al aviso de privacidad
            </h2>
            <p>
              Este aviso de privacidad puede ser modificado en cualquier momento para atender novedades legislativas, políticas internas o nuevos requerimientos del servicio. Cualquier cambio será publicado en esta misma página con la fecha de actualización correspondiente.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 9 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              9. Contacto
            </h2>
            <p>
              Si tienes dudas sobre este aviso de privacidad o sobre el tratamiento de tus datos, contáctanos en:
            </p>
            <p className="text-lg">
              📧{" "}
              <a
                href="mailto:contacto@bazaresmx.com.mx"
                className="text-primary font-bold hover:underline"
              >
                contacto@bazaresmx.com.mx
              </a>
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 text-xs text-gray-500 italic">
            Este aviso de privacidad fue elaborado conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) vigente en México. Se recomienda su revisión por un profesional del derecho antes de su publicación definitiva.
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-white/50 py-12 px-6 text-center text-xs font-semibold border-t border-white/5 mt-16">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-white/80">
            <Link href="/" className="hover:underline">Directorio Principal</Link>
            <span>|</span>
            <Link href="/terminos-y-condiciones" className="hover:underline">Términos y Condiciones</Link>
            <span>|</span>
            <Link href="/aviso-de-privacidad" className="hover:underline text-white font-bold">Aviso de Privacidad</Link>
            <span>|</span>
            <Link href="/publica-tu-bazar" className="hover:underline">Publicar Evento</Link>
          </div>
          <p>© 2026 BazaresMX · Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

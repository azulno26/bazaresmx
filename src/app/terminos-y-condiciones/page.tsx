import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | BazaresMX",
  description: "Términos y Condiciones de uso de la plataforma BazaresMX. Conoce las políticas de publicación, pagos, reembolsos y responsabilidades.",
  alternates: {
    canonical: "https://www.bazaresmx.com.mx/terminos-y-condiciones",
  },
};

export default function TerminosYCondicionesPage() {
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
            Términos y Condiciones
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
              1. Aceptación de los términos
            </h2>
            <p>
              Al registrarte, publicar un bazar, registrar tu marca como expositor o utilizar el sitio{" "}
              <strong>bazaresmx.com.mx</strong> de cualquier forma, aceptas quedar sujeto a los presentes Términos y Condiciones. Si no estás de acuerdo, te pedimos no utilizar la plataforma.
            </p>
            <p>
              BazaresMX es operado por <strong>Flowi Solutions / Diego Castellanos Maya</strong> (&quot;BazaresMX&quot;, &quot;nosotros&quot; o &quot;la Plataforma&quot;), con domicilio en Ciudad de México, México.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 2 */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              2. Descripción del servicio
            </h2>
            <p>
              BazaresMX es una <strong>plataforma de conexión (marketplace)</strong> entre:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
              <li>
                <strong>Organizadores de bazares</strong>, quienes publican información sobre sus eventos (fecha, ubicación, horario, condiciones de participación).
              </li>
              <li>
                <strong>Expositores</strong>, quienes registran su marca, productos y datos de contacto para ser visibles ante los organizadores.
              </li>
            </ul>
            <div className="bg-orange-50 border border-orange-200/60 p-4 rounded-2xl text-sm text-orange-950 font-medium">
              ⚠️ <strong>BazaresMX no organiza, produce ni participa en los bazares publicados</strong>, y no es parte de la relación comercial que se genere entre organizadores y expositores. Nuestro rol se limita a ofrecer un directorio digital de conexión.
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 3 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              3. Registro y cuentas
            </h2>
            <p>
              Para publicar un bazar o registrar una marca como expositor, debes proporcionar información veraz, completa y actualizada. Eres responsable de mantener la confidencialidad de los datos de contacto asociados a tu registro.
            </p>
            <p>BazaresMX se reserva el derecho de rechazar, suspender o eliminar cualquier registro que:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>Contenga información falsa, ofensiva o engañosa</li>
              <li>Promueva productos o servicios ilegales</li>
              <li>Infrinja derechos de propiedad intelectual de terceros</li>
              <li>Constituya spam, fraude o suplantación de identidad</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 4 */}
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              4. Planes, precios y pagos
            </h2>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-lg">4.1 Planes disponibles</h3>
              <p className="text-sm">
                BazaresMX ofrece distintos planes de suscripción mensual tanto para Organizadores de Bazares como para Expositores, cuyos precios, beneficios y vigencia se muestran en el sitio al momento del registro y pueden actualizarse sin previo aviso hacia futuros periodos de contratación (los planes ya activos conservan las condiciones bajo las cuales fueron contratados hasta su vencimiento).
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-lg">4.2 Forma de pago</h3>
              <p className="text-sm">
                Los pagos se realizan mediante <strong>transferencia bancaria (SPEI)</strong> a la cuenta indicada por BazaresMX. No se procesan pagos con tarjeta de crédito o débito dentro de la plataforma.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-lg">4.3 Validación y activación</h3>
              <p className="text-sm">
                Una vez realizada la transferencia, el usuario debe enviar el comprobante de pago a{" "}
                <a href="mailto:contacto@bazaresmx.com.mx" className="text-primary font-bold hover:underline">
                  contacto@bazaresmx.com.mx
                </a>
                . La activación del perfil se realiza de forma manual por el equipo de BazaresMX en un plazo de hasta 24 horas hábiles tras la recepción y validación del comprobante.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-lg">4.4 Vigencia y renovación</h3>
              <p className="text-sm">
                Los planes tienen una vigencia de <strong>30 días naturales</strong> a partir de su activación. BazaresMX podrá notificar al usuario, vía correo electrónico, WhatsApp o Telegram, sobre el próximo vencimiento de su plan. <strong>La renovación no es automática</strong>: si el usuario no realiza el pago correspondiente antes de la fecha de vencimiento, su perfil podrá cambiar a estado inactivo y dejará de ser visible en el sitio, sin que esto genere responsabilidad para BazaresMX.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-lg">4.5 Política de reembolsos</h3>
              <p className="text-sm">
                Los pagos realizados por planes de suscripción <strong>no son reembolsables</strong>, salvo error atribuible directamente a BazaresMX en el cobro o activación del servicio, caso en el cual se evaluará cada situación de forma individual.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 5 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              5. Obligaciones del usuario
            </h2>
            <p>El usuario se compromete a:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>Proporcionar información veraz sobre su marca, productos o evento</li>
              <li>No utilizar la plataforma con fines fraudulentos, ilícitos o para difundir contenido que infrinja derechos de terceros</li>
              <li>Ser el único responsable de la calidad, legalidad y entrega de los productos o servicios que ofrezca, así como de las condiciones de participación de su bazar</li>
              <li>Negociar directamente y bajo su propia responsabilidad las condiciones comerciales (costos de espacio, comisiones, logística, etc.) con la contraparte que contacte a través de la Plataforma</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 6 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              6. Limitación de responsabilidad
            </h2>
            <p>
              BazaresMX actúa únicamente como <strong>intermediario tecnológico de conexión</strong> y, por lo tanto:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 ml-2">
              <li>
                <strong>No garantiza</strong> la celebración, calidad, seguridad o resultado de ninguna transacción, acuerdo o evento entre Organizadores y Expositores.
              </li>
              <li>
                <strong>No se hace responsable</strong> por cancelaciones, cambios de fecha, incumplimientos, disputas de pago entre particulares, o cualquier daño derivado de la relación comercial entre los usuarios de la plataforma.
              </li>
              <li>
                <strong>No verifica de forma exhaustiva</strong> la veracidad de toda la información publicada por los usuarios, aunque se reserva el derecho de solicitar aclaraciones o eliminar contenido que incumpla estos Términos.
              </li>
              <li>
                No garantiza disponibilidad ininterrumpida del sitio, y no será responsable por fallas técnicas, caídas del servicio o pérdida de información derivada de causas de fuerza mayor o fallas de terceros proveedores (hosting, base de datos, etc.).
              </li>
            </ul>
            <p className="text-sm font-semibold text-gray-800 bg-gray-50 p-4 rounded-xl">
              El uso de la información de contacto obtenida a través de BazaresMX es responsabilidad exclusiva de quien la utiliza.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 7 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              7. Contenido e imágenes
            </h2>
            <p>
              Al subir fotografías, logotipos, descripciones o cualquier otro contenido a la plataforma, el usuario:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>Declara ser el titular de los derechos de dicho contenido o contar con autorización para su uso</li>
              <li>Otorga a BazaresMX una licencia no exclusiva para mostrar dicho contenido dentro del sitio y, en su caso, en publicaciones promocionales de BazaresMX en redes sociales (Instagram, Facebook), con fines de difusión del directorio</li>
              <li>Es responsable de que el contenido no infrinja derechos de autor, marca o imagen de terceros</li>
            </ul>
            <p className="text-sm">
              BazaresMX podrá eliminar cualquier contenido que incumpla derechos de terceros o estos Términos, sin necesidad de previo aviso.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 8 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              8. Propiedad intelectual de BazaresMX
            </h2>
            <p>
              El nombre &quot;BazaresMX&quot;, su logotipo, diseño de sitio, estructura y demás elementos propios de la plataforma son propiedad de Flowi Solutions / Diego Castellanos Maya. Queda prohibida su reproducción, copia o uso no autorizado.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 9 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              9. Conducta prohibida
            </h2>
            <p>Queda prohibido usar BazaresMX para:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
              <li>Publicar productos ilegales, falsificados o prohibidos por la legislación mexicana</li>
              <li>Realizar prácticas de spam, phishing o suplantación de identidad</li>
              <li>Extraer masivamente (scraping) datos de la plataforma sin autorización</li>
              <li>Interferir con el funcionamiento técnico del sitio</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 10 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              10. Suspensión y terminación de cuentas
            </h2>
            <p>
              BazaresMX podrá suspender o eliminar, de forma temporal o permanente, cualquier cuenta que incumpla estos Términos, sin que esto genere derecho a reembolso ni indemnización alguna a favor del usuario.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 11 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              11. Modificaciones a los Términos
            </h2>
            <p>
              BazaresMX podrá actualizar estos Términos y Condiciones en cualquier momento. Los cambios serán publicados en esta misma página con su fecha de actualización. El uso continuado de la plataforma después de dicha publicación constituye la aceptación de los nuevos términos.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 12 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              12. Legislación aplicable y jurisdicción
            </h2>
            <p>
              Estos Términos se rigen por las leyes de los <strong>Estados Unidos Mexicanos</strong>. Para cualquier controversia relacionada con su interpretación o cumplimiento, las partes se someten a la jurisdicción de los tribunales competentes de la <strong>Ciudad de México</strong>, renunciando a cualquier otro fuero que pudiera corresponderles.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* SECCIÓN 13 */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-syne font-bold text-[#1a1a1a]">
              13. Contacto
            </h2>
            <p>Para dudas, aclaraciones o notificaciones relacionadas con estos Términos y Condiciones:</p>
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
            Estos Términos y Condiciones fueron elaborados para reflejar el modelo de negocio actual de BazaresMX conforme a la legislación mexicana aplicable. Se recomienda su revisión por un profesional del derecho antes de su publicación definitiva.
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-white/50 py-12 px-6 text-center text-xs font-semibold border-t border-white/5 mt-16">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-white/80">
            <Link href="/" className="hover:underline">Directorio Principal</Link>
            <span>|</span>
            <Link href="/terminos-y-condiciones" className="hover:underline text-white font-bold">Términos y Condiciones</Link>
            <span>|</span>
            <Link href="/aviso-de-privacidad" className="hover:underline">Aviso de Privacidad</Link>
            <span>|</span>
            <Link href="/publica-tu-bazar" className="hover:underline">Publicar Evento</Link>
          </div>
          <p>© 2026 BazaresMX · Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

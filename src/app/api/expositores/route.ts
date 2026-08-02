import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPlanDisplayName, getPlanInternalName } from '@/src/lib/plan-names';
import { emailTemplate, emailInfoBox } from '@/src/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);
const SHEET_ID = '1R0WdyRPenxGsu8A9WRuzngDAgFhRYGlYguItBOkVdEk';

// Helper to remove accents and format slug using principal city only
function generateSlug(nombreNegocio: string, ciudad: string): string {
  // Extraer ciudad principal (primera parte antes de la coma, ej: "CDMX" de "CDMX, Coyoacán, ...")
  const ciudadPrincipal = ciudad ? ciudad.split(',')[0].trim() : '';
  const base = `${nombreNegocio}-${ciudadPrincipal}`.toLowerCase();

  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9-]/g, "-")    // Replace special chars with -
    .replace(/-+/g, "-")            // Collapse multiple hyphens
    .replace(/^-+|-+$/g, "");       // Trim hyphens
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Server-side validation
    if (!data.nombreCompleto || !data.whatsapp || !data.correo || !data.nombreNegocio || !data.giro || !data.ciudad || !data.planElegido) {
      return NextResponse.json({ ok: false, error: 'Campos requeridos faltantes' }, { status: 400 });
    }

    // Validar si ya existe un expositor con este correo en Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data: existingEmail } = await supabaseAdmin
        .from('expositores')
        .select('id')
        .eq('email', data.correo.trim().toLowerCase())
        .maybeSingle();

      if (existingEmail) {
        return NextResponse.json({
          ok: false,
          error: "Ya tienes un perfil registrado con este correo. ¿Necesitas ayuda?"
        }, { status: 400 });
      }
    }

    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    let nextId = 11; // Fallback if Sheets fetch fails, defaults to > 10
    
    if (apiKey) {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Expositores%21A2%3AA100?key=${apiKey}`,
          { cache: 'no-store' }
        );
        if (response.ok) {
          const resJson = await response.json();
          const rows = resJson.values || [];
          nextId = rows.length + 1;
        }
      } catch (err) {
        console.error("Error fetching rows to calculate ID:", err);
      }
    }

    const slug = generateSlug(data.nombreNegocio, data.ciudad);
    const mesGratis = 'No';
    const statusDefault = 'pendiente';

    // Gather product images for the gallery field
    const perfilImg = data.fotoPerfil || (data.productos?.[0]?.foto || '');
    const productGallery = data.productos
      ? data.productos.map((p: any) => p.foto).filter(Boolean).join(',')
      : '';

    // Flat array of values for columns A to AF (32 columns)
    const rowValues = [
      nextId,                                     // Col A: ID
      slug,                                       // Col B: Slug
      data.nombreCompleto,                        // Col C: Nombre Completo
      data.whatsapp,                              // Col D: WhatsApp
      data.correo,                                // Col E: Correo
      data.nombreNegocio,                         // Col F: Nombre Negocio
      data.giro,                                  // Col G: Giro
      data.descripcion || '',                     // Col H: Descripción
      data.ciudad,                                // Col I: Ciudad
      data.disponibilidad || '',                  // Col J: Disponibilidad
      data.instagram || '',                       // Col K: Instagram
      data.facebook || '',                        // Col L: Facebook
      data.tiktok || '',                          // Col M: TikTok
      data.planElegido,                           // Col N: Plan Elegido
      mesGratis,                                  // Col O: Mes Gratis
      statusDefault,                              // Col P: Status
      'No',                                       // Col Q: Badge Verificado
      perfilImg,                                  // Col R: Foto Perfil
      productGallery,                             // Col S: Fotos Productos
      new Date().toLocaleDateString('es-MX'),      // Col T: Fecha Registro
      
      // Producto 1 (Col U-X)
      data.productos?.[0]?.nombre || '',
      data.productos?.[0]?.descripcion || '',
      data.productos?.[0]?.precio || '',
      data.productos?.[0]?.foto || '',
      
      // Producto 2 (Col Y-AB)
      data.productos?.[1]?.nombre || '',
      data.productos?.[1]?.descripcion || '',
      data.productos?.[1]?.precio || '',
      data.productos?.[1]?.foto || '',
      
      // Producto 3 (Col AC-AF)
      data.productos?.[2]?.nombre || '',
      data.productos?.[2]?.descripcion || '',
      data.productos?.[2]?.precio || '',
      data.productos?.[2]?.foto || '',
    ];

    let sheetsWritten = false;
    const scriptUrl = process.env.EXPOSITORES_SCRIPT_URL;

    if (scriptUrl) {
      try {
        const sheetsResponse = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: rowValues })
        });
        if (sheetsResponse.ok) {
          sheetsWritten = true;
        }
      } catch (err) {
        console.error("Error writing to Google Sheets Apps Script:", err);
      }
    }

    // Escribir en Supabase
    let supabaseWritten = false;
    let supabaseError = null;
    let insertedExpositorId = null;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabaseAdminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const planMapped = getPlanInternalName(data.planElegido);

        const hoy = new Date();
        const vencimientoDate = new Date(hoy);
        vencimientoDate.setDate(hoy.getDate() + 30);
        const fechaVencimiento = vencimientoDate.toISOString().split('T')[0];

        const { data: insertedExpositor, error: expErr } = await supabaseAdminClient
          .from('expositores')
          .insert({
            nombre_completo: data.nombreCompleto,
            nombre_negocio: data.nombreNegocio,
            slug: slug,
            email: data.correo,
            whatsapp: data.whatsapp,
            descripcion: data.descripcion || '',
            giro: data.giro,
            ciudad: data.ciudad,
            disponibilidad: data.disponibilidad || '',
            instagram: data.instagram || '',
            facebook: data.facebook || '',
            tiktok: data.tiktok || '',
            foto_perfil: perfilImg,
            galeria_urls: productGallery ? productGallery.split(',').filter(Boolean) : [],
            plan: planMapped,
            mes_gratis: false,
            status: statusDefault,
            badge_verificado: false,
            vencimiento: fechaVencimiento
          })
          .select()
          .single();

        if (expErr) {
          supabaseError = expErr.message;
          console.error("Error writing expositor to Supabase:", expErr);
        } else {
          supabaseWritten = true;
          insertedExpositorId = insertedExpositor.id;

          // Insertar productos si existen
          if (data.productos && data.productos.length > 0) {
            const productsToInsert = data.productos
              .filter((p: any) => p.nombre || p.foto)
              .map((p: any) => ({
                expositor_id: insertedExpositor.id,
                nombre: p.nombre || 'Producto',
                descripcion: p.descripcion || '',
                precio: parseFloat(p.precio) || 0,
                imagen_url: p.foto || ''
              }));

            if (productsToInsert.length > 0) {
              const { error: prodErr } = await supabaseAdminClient
                .from('productos')
                .insert(productsToInsert);
              if (prodErr) {
                console.error("Error writing products to Supabase:", prodErr);
              }
            }
          }
        }
      } catch (err: any) {
        supabaseError = err.message;
        console.error("Critical error writing expositor to Supabase:", err);
      }
    }

    // Send confirmation email via Resend
    try {
      const isActivo = false;
      const emailStatusText = isActivo ? '✅ Activo' : '⏳ Pendiente de pago';
      const accionRequerida = isActivo 
        ? 'Ninguna, ya aparece en el sitio.' 
        : 'Esperar comprobante de transferencia en contacto@bazaresmx.com.mx.<br/>Una vez recibido, activar en: <a href="https://www.bazaresmx.com.mx/admin/vencimientos">bazaresmx.com.mx/admin/vencimientos</a>';

      const planPrices: Record<string, string> = {
        basico: '$99 MXN/mes',
        media: '$199 MXN/mes',
        top: '$349 MXN/mes'
      };
      const planMapped = getPlanInternalName(data.planElegido);
      const montoACobrar = planPrices[planMapped] || '$99 MXN/mes';

      const clabeVal = process.env.CLABE || '';
      const titularVal = process.env.TITULAR || '';

      const supabaseStatusText = supabaseWritten ? '✓ Exitoso' : `✗ Fallido (${supabaseError})`;

      const adminEmailHtml = emailTemplate({
        title: `Nuevo Expositor Registrado: ${data.nombreNegocio}`,
        greeting: `Nuevo Registro de Expositor 🛍️`,
        bodyHtml: `
          <p style="margin-top: 0;">Se ha registrado un nuevo expositor en la plataforma con los siguientes datos:</p>
          
          ${emailInfoBox(`
            <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr><td width="38%" style="color: #666; font-weight: bold;">ID Supabase:</td><td style="color: #111; font-weight: bold;">${insertedExpositorId || 'Error / No guardado'}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">ID Sheets:</td><td>${nextId}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">Slug:</td><td><a href="https://www.bazaresmx.com.mx/expositores/${slug}" target="_blank" style="color: #1A7A52; font-weight: bold;">${slug}</a></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Marca / Negocio:</td><td style="color: #111; font-weight: bold;">${data.nombreNegocio}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">Emprendedor:</td><td>${data.nombreCompleto}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">Plan Elegido:</td><td><strong style="color: #1A7A52;">${getPlanDisplayName(planMapped)}</strong></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Giro:</td><td>${data.giro}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">Ciudad / Zona:</td><td>${data.ciudad}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">WhatsApp:</td><td><a href="https://wa.me/${(data.whatsapp || '').replace(/\D/g, '')}" target="_blank" style="color: #1A7A52;">${data.whatsapp}</a></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Correo:</td><td><a href="mailto:${data.correo}">${data.correo}</a></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Descripción:</td><td>${data.descripcion || 'Sin descripción'}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">Estatus:</td><td><strong>${emailStatusText}</strong></td></tr>
            </table>
          `)}

          <h3 style="font-size: 16px; color: #1A7A52; margin: 20px 0 8px 0;">Datos de Cobro SPEI:</h3>
          ${emailInfoBox(`
            <table border="0" cellpadding="3" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr><td width="38%" style="color: #666; font-weight: bold;">Monto a cobrar:</td><td><strong style="color: #E8621A; font-size: 15px;">${montoACobrar}</strong></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Banco:</td><td>Scotiabank</td></tr>
              <tr><td style="color: #666; font-weight: bold;">CLABE:</td><td><code>${clabeVal}</code></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Titular:</td><td>${titularVal}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">Concepto:</td><td>${data.nombreNegocio} + ${getPlanDisplayName(planMapped)}</td></tr>
            </table>
          `, '#F0E6D8', '#FFFDF9')}

          <h3 style="font-size: 16px; color: #1A7A52; margin: 20px 0 8px 0;">Productos Subidos:</h3>
          ${data.productos && data.productos.length > 0
            ? `<div style="background-color: #FAFAFA; border: 1px solid #EBEBEB; border-radius: 12px; padding: 12px 16px;">
                ${data.productos.map((p: any, idx: number) => `
                  <div style="padding: 8px 0; border-bottom: ${idx < data.productos.length - 1 ? '1px solid #EEE' : 'none'};">
                    <strong style="color: #111;">${idx + 1}. ${p.nombre}</strong> &mdash; <span style="color: #E8621A; font-weight: bold;">$${p.precio} MXN</span><br/>
                    <span style="font-size: 13px; color: #666;">${p.descripcion || 'Sin descripción'}</span><br/>
                    ${p.foto ? `<a href="${p.foto}" target="_blank" style="font-size: 12px; color: #1A7A52; font-weight: 600;">Ver foto del producto &rarr;</a>` : ''}
                  </div>
                `).join('')}
              </div>`
            : '<p style="color: #888; font-style: italic;">Sin productos agregados en el formulario.</p>'
          }

          <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #EEE; font-size: 12px; color: #777;">
            <div><strong>Supabase:</strong> ${supabaseStatusText}</div>
            <div><strong>Google Sheets:</strong> ${sheetsWritten ? '✓ Exitoso (Apps Script)' : '✗ Pendiente'}</div>
          </div>
        `,
        ctaText: 'Administrar en Panel de Vencimientos',
        ctaUrl: 'https://www.bazaresmx.com.mx/admin/vencimientos'
      });

      await resend.emails.send({
        from: 'contacto@bazaresmx.com.mx',
        to: 'azulno26@hotmail.com',
        subject: `Nuevo registro de expositor: ${data.nombreNegocio} (${getPlanDisplayName(planMapped)})`,
        html: adminEmailHtml
      });

      // Confirmation email to the exhibitor
      let customerInstructionsHtml = '';
      if (!isActivo) {
        customerInstructionsHtml = `
          <h3 style="font-size: 16px; color: #1A7A52; margin: 24px 0 8px 0;">💳 Pasos para activar tu perfil público:</h3>
          <p style="margin-top: 0;">Para completar la activación de tu marca y catálogo en BazaresMX, realiza tu transferencia interbancaria (SPEI):</p>
          
          ${emailInfoBox(`
            <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr><td width="35%" style="color: #666; font-weight: bold;">Monto a pagar:</td><td><strong style="color: #E8621A; font-size: 16px;">${montoACobrar}</strong></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Banco:</td><td><strong>Scotiabank</strong></td></tr>
              <tr><td style="color: #666; font-weight: bold;">CLABE:</td><td><code style="background-color: #E8EFEA; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #1A7A52;">${clabeVal}</code></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Titular:</td><td><strong>${titularVal}</strong></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Concepto:</td><td>${data.nombreNegocio} + ${getPlanDisplayName(planMapped)}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">Enviar comprobante:</td><td><a href="mailto:contacto@bazaresmx.com.mx" style="color: #1A7A52; font-weight: bold;">contacto@bazaresmx.com.mx</a></td></tr>
            </table>
          `, '#D2E8DC', '#F0F8F4')}
        `;
      }

      const clientEmailHtml = emailTemplate({
        title: `¡Bienvenido a BazaresMX, ${data.nombreNegocio}!`,
        greeting: `¡Gracias por unirte a BazaresMX, ${data.nombreCompleto}! 🎉`,
        bodyHtml: `
          <p style="margin-top: 0; font-size: 16px;">
            Hemos recibido con éxito el registro de tu marca <strong>${data.nombreNegocio}</strong> en el plan <strong>${getPlanDisplayName(planMapped)}</strong>.
          </p>

          ${emailInfoBox(`
            <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
              <tr><td width="40%" style="color: #666; font-weight: bold;">Marca:</td><td style="font-weight: bold; color: #111;">${data.nombreNegocio}</td></tr>
              <tr><td style="color: #666; font-weight: bold;">Plan:</td><td><strong style="color: #1A7A52;">${getPlanDisplayName(planMapped)}</strong></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Enlace reservado:</td><td><a href="https://www.bazaresmx.com.mx/expositores/${slug}" target="_blank" style="color: #1A7A52; font-weight: bold;">bazaresmx.com.mx/expositores/${slug}</a></td></tr>
              <tr><td style="color: #666; font-weight: bold;">Estatus actual:</td><td><strong>${isActivo ? '✅ Activo (Visible en el directorio)' : '⏳ Pendiente de validación de pago'}</strong></td></tr>
            </table>
          `)}

          ${customerInstructionsHtml}

          <p style="margin-top: 20px;">
            Pronto nos pondremos en contacto contigo vía WhatsApp para validar los últimos detalles y publicar tu catálogo ante cientos de organizadores de bazares en México.
          </p>

          <p style="margin-top: 24px; color: #555;">
            Atentamente,<br/>
            <strong style="color: #1A7A52;">El equipo de BazaresMX</strong>
          </p>
        `,
        ctaText: 'Ver Directorio de Bazares',
        ctaUrl: 'https://www.bazaresmx.com.mx'
      });

      await resend.emails.send({
        from: 'contacto@bazaresmx.com.mx',
        to: data.correo,
        subject: `¡Bienvenido a BazaresMX, ${data.nombreNegocio}!`,
        html: clientEmailHtml
      });
    } catch (emailErr) {
      console.error("Error sending notification emails:", emailErr);
    }

    return NextResponse.json({ ok: true, slug, nextId, mesGratis: false, sheetsWritten, supabaseWritten, supabaseError, id: insertedExpositorId });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

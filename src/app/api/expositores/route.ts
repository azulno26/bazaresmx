import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPlanDisplayName, getPlanInternalName } from '@/src/lib/plan-names';

const resend = new Resend(process.env.RESEND_API_KEY);
const SHEET_ID = '1R0WdyRPenxGsu8A9WRuzngDAgFhRYGlYguItBOkVdEk';

// Helper to remove accents and format slug
function generateSlug(nombreNegocio: string, ciudad: string): string {
  const base = `${nombreNegocio}-${ciudad}`.toLowerCase();
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

      await resend.emails.send({
        from: 'contacto@bazaresmx.com.mx',
        to: 'azulno26@hotmail.com',
        subject: `Nuevo registro de expositor: ${data.nombreNegocio} (${getPlanDisplayName(planMapped)})`,
        html: `
          <h2>Nuevo Expositor Registrado en BazaresMX</h2>
          <p><strong>ID Asignado (Sheets):</strong> ${nextId}</p>
          <p><strong>ID Asignado (Supabase):</strong> ${insertedExpositorId || 'Error / No guardado'}</p>
          <p><strong>Slug:</strong> ${slug}</p>
          <p><strong>Nombre del Negocio:</strong> ${data.nombreNegocio}</p>
          <p><strong>Emprendedor:</strong> ${data.nombreCompleto}</p>
          <p><strong>Plan Elegido:</strong> ${getPlanDisplayName(planMapped)}</p>
          <p><strong>Giro:</strong> ${data.giro}</p>
          <p><strong>Ciudad/Zona:</strong> ${data.ciudad}</p>
          <p><strong>Descripción:</strong> ${data.descripcion || 'Sin descripción'}</p>
          <p><strong>WhatsApp:</strong> ${data.whatsapp}</p>
          <p><strong>Correo:</strong> ${data.correo}</p>
          <p><strong>Estatus:</strong> ${emailStatusText}</p>
          <p><strong>Acción requerida:</strong> ${accionRequerida}</p>
          <hr />
          <h3>Datos de Cobro:</h3>
          <p><strong>Monto a cobrar:</strong> ${montoACobrar}</p>
          <p><strong>Datos de transferencia:</strong><br/>
            🏦 Banco: Scotiabank<br/>
            💳 CLABE: ${clabeVal}<br/>
            👤 Titular: ${titularVal}<br/>
            📝 Concepto: ${data.nombreNegocio} + ${getPlanDisplayName(planMapped)}<br/>
            📧 Comprobante a: contacto@bazaresmx.com.mx
          </p>
          <hr />
          <h3>Productos Subidos:</h3>
          ${data.productos && data.productos.length > 0
            ? data.productos.map((p: any, idx: number) => `
                <p><strong>Producto ${idx + 1}:</strong> ${p.nombre} - $${p.precio}<br/>
                <em>${p.descripcion}</em><br/>
                <a href="${p.foto}" target="_blank">Ver foto del producto</a></p>
              `).join('')
            : '<p>Sin productos agregados</p>'
          }
          <hr />
          <p><em>Estatus de escritura en Google Sheet: ${sheetsWritten ? '✓ Exitoso (Apps Script)' : '✗ Pendiente (Configurar EXPOSITORES_SCRIPT_URL)'}</em></p>
          <p><em>Estatus de escritura en Supabase: ${supabaseStatusText}</em></p>
        `
      });

      // Optional: Send auto-reply to the exhibitor
      let customerInstructions = '';
      if (!isActivo) {
        customerInstructions = `
          <p><strong>Para activar tu perfil público, realiza la transferencia correspondiente:</strong></p>
          <ul>
            <li><strong>Monto a pagar:</strong> ${montoACobrar}</li>
            <li>🏦 <strong>Banco:</strong> Scotiabank</li>
            <li>💳 <strong>CLABE:</strong> ${clabeVal}</li>
            <li>👤 <strong>Titular:</strong> ${titularVal}</li>
            <li>📝 <strong>Concepto:</strong> ${data.nombreNegocio} + ${getPlanDisplayName(planMapped)}</li>
            <li>📧 <strong>Comprobante a:</strong> contacto@bazaresmx.com.mx</li>
          </ul>
        `;
      }

      await resend.emails.send({
        from: 'contacto@bazaresmx.com.mx',
        to: data.correo,
        subject: `¡Bienvenido a BazaresMX, ${data.nombreNegocio}!`,
        html: `
          <h2>¡Gracias por registrarte en BazaresMX, ${data.nombreCompleto}!</h2>
          <p>Hemos recibido el perfil de tu marca <strong>${data.nombreNegocio}</strong> con el plan <strong>${getPlanDisplayName(planMapped)}</strong>.</p>
          <p><strong>Detalles de tu registro:</strong></p>
          <ul>
            <li><strong>Tu enlace de perfil reservado:</strong> /expositores/${slug}</li>
            <li><strong>Estatus actual:</strong> ${isActivo ? 'Activo (Perfil público)' : 'Pendiente de validación de pago'}</li>
          </ul>
          ${customerInstructions}
          <p>Pronto nos pondremos en contacto contigo vía WhatsApp para validar los últimos detalles y activar tu perfil público si elegiste un plan de catálogo.</p>
          <p>Síguenos en nuestra cuenta oficial de Instagram para novedades: <a href="https://www.instagram.com/bazaresmx.com.mx/">@bazaresmx.com.mx</a></p>
          <br/>
          <p>Atentamente,<br/><strong>El equipo de BazaresMX</strong></p>
        `
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

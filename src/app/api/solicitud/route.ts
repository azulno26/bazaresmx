import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailTemplate, emailInfoBox } from '@/src/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);
const SHEET_ID = '1R0WdyRPenxGsu8A9WRuzngDAgFhRYGlYguItBOkVdEk';

// Helper to remove accents and format slug
function generateSlug(nombre: string, ciudad: string): string {
  const base = `${nombre}-${ciudad}`.toLowerCase();
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9-]/g, "-")    // Replace special chars with -
    .replace(/-+/g, "-")            // Collapse multiple hyphens
    .replace(/^-+|-+$/g, "");       // Trim hyphens
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data = JSON.parse(formData.get('data') as string);
    const imagen = formData.get('imagen') as File | null;

    let imageInfo = 'No se adjuntó imagen';
    let attachments = undefined;

    if (imagen) {
      const buffer = Buffer.from(await imagen.arrayBuffer());
      const base64 = buffer.toString('base64');
      imageInfo = `Imagen adjunta: ${imagen.name} (${(imagen.size / 1024).toFixed(0)} KB)`;
      
      attachments = [{
        filename: imagen.name,
        content: base64,
      }];
    }

    // Google Sheets Integration
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    let nextId = 12; // Fallback if fetch fails, defaults to safe number > 10
    
    if (apiKey) {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Bazares%21A2%3AA100?key=${apiKey}`,
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

    const slug = generateSlug(data.nombre, data.estado);
    const planLower = (data.planElegido || 'Básico').toLowerCase();
    const isActivo = planLower === 'básico' ? 1 : 0; // Básico plan is active immediately, paid tiers are pending validation

    // Flat array of values for columns A to AB (28 columns exactly)
    const rowValues = [
      nextId,                                       // Col A: ID
      slug,                                         // Col B: Slug
      data.nombre,                                  // Col C: Nombre
      data.estado,                                  // Col D: Ciudad (Estado)
      data.colonia,                                 // Col E: Colonia
      data.direccion || '',                         // Col F: Dirección
      data.fechaInicio || '',                       // Col G: Fecha Inicio
      data.fechaFin || '',                          // Col H: Fecha Fin
      `${data.horarioInicio} - ${data.horarioFin}`, // Col I: Horario
      data.descripcion || '',                       // Col J: Descripción
      '',                                           // Col K: Qué encontrarás (vacío)
      data.whatsapp || '',                          // Col L: WhatsApp
      data.instagram || '',                         // Col M: Instagram
      data.facebook || '',                          // Col N: Facebook
      data.plataformaOtraRed === 'TikTok' ? data.otraRedSocial : '', // Col O: TikTok
      data.aceptaExpositores || 'Sí',               // Col P: Acepta Expositores
      data.entradaLibre || 'Sí',                    // Col Q: Entrada
      data.organizador || '',                       // Col R: Organizador
      data.imagenUrl || '',                         // Col S: Imagen URL (Cloudinary)
      '',                                           // Col T: Imagen 2 URL
      '',                                           // Col U: Imagen 3 URL
      planLower,                                    // Col V: Plan (básico, medio, pro)
      isActivo,                                     // Col W: Activo (1 o 0)
      new Date().toLocaleDateString('es-MX'),       // Col X: Publicado (Fecha hoy)
      '',                                           // Col Y: Vencimiento
      '',                                           // Col Z: Tags
      'artesanal',                                  // Col AA: Tipo
      '',                                           // Col AB: Sedes
    ];

    let sheetsWritten = false;
    const scriptUrl = process.env.BAZARES_SCRIPT_URL;

    if (scriptUrl) {
      try {
        const sheetsResponse = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sheetName: "Bazares", values: rowValues })
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
    let insertedBazarId = null;

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabaseAdminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const tags: string[] = [];
        const que_encontraras: string[] = [];

        const { data: insertedBazar, error: subErr } = await supabaseAdminClient
          .from('bazares')
          .insert({
            nombre: data.nombre,
            slug: slug,
            descripcion: data.descripcion || '',
            ciudad: data.estado,
            colonia: data.colonia,
            direccion: data.direccion || '',
            horario: `${data.horarioInicio} - ${data.horarioFin}`,
            fecha: data.fechaInicio,
            fecha_fin: data.fechaFin || null,
            organizador: data.organizador || '',
            whatsapp: data.whatsapp || '',
            instagram: data.instagram || '',
            facebook: data.facebook || '',
            tiktok: data.plataformaOtraRed === 'TikTok' ? data.otraRedSocial : '',
            acepta_expositores: data.aceptaExpositores === 'Sí',
            entrada: data.entradaLibre || 'libre',
            imagen_url: data.imagenUrl || '',
            plan: planLower,
            status: planLower === 'básico' || planLower === 'basico' ? 'activo' : 'pendiente',
            vencimiento: null,
            tags,
            que_encontraras
          })
          .select()
          .single();

        if (subErr) {
          supabaseError = subErr.message;
          console.error("Error writing to Supabase:", subErr);
        } else {
          supabaseWritten = true;
          insertedBazarId = insertedBazar.id;
        }
      } catch (err: any) {
        supabaseError = err.message;
        console.error("Critical error writing to Supabase:", err);
      }
    }

    // Send notification email to admin via Resend
    const adminEmailHtml = emailTemplate({
      title: `Nueva Solicitud de Bazar: ${data.nombre}`,
      greeting: `Nueva Solicitud de Publicación 🎪`,
      bodyHtml: `
        <p style="margin-top: 0;">Se ha recibido una nueva solicitud para publicar un bazar en la plataforma:</p>

        ${emailInfoBox(`
          <table border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 14px;">
            <tr><td width="38%" style="color: #666; font-weight: bold;">ID Supabase:</td><td style="color: #111; font-weight: bold;">${insertedBazarId || 'Error / No guardado'}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Slug:</td><td><a href="https://www.bazaresmx.com.mx/bazares/${slug}" target="_blank" style="color: #1A7A52; font-weight: bold;">${slug}</a></td></tr>
            <tr><td style="color: #666; font-weight: bold;">Nombre del Bazar:</td><td style="color: #111; font-weight: bold;">${data.nombre}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Organizador:</td><td>${data.organizador || 'No especificado'}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Plan Solicitado:</td><td><strong style="color: #1A7A52;">${data.planElegido || 'Básico'}</strong></td></tr>
            <tr><td style="color: #666; font-weight: bold;">Estado / Ciudad:</td><td>${data.estado}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Colonia:</td><td>${data.colonia}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Dirección:</td><td>${data.direccion || 'Sin dirección exacta'}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Fechas:</td><td>${data.fechaInicio} ${data.fechaFin ? `al ${data.fechaFin}` : ''}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Horario:</td><td>${data.horarioInicio} - ${data.horarioFin}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Recurrente:</td><td>${data.recurrente ? (data.frecuencia || 'Sí') : 'No'}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Acepta Expositores:</td><td>${data.aceptaExpositores}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Tipo Entrada:</td><td>${data.entrada}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">WhatsApp:</td><td><a href="https://wa.me/${(data.whatsapp || '').replace(/\D/g, '')}" target="_blank" style="color: #1A7A52;">${data.whatsapp}</a></td></tr>
            <tr><td style="color: #666; font-weight: bold;">Instagram:</td><td>${data.instagram || 'No especificado'}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Facebook:</td><td>${data.facebook || 'No especificado'}</td></tr>
            <tr><td style="color: #666; font-weight: bold;">Descripción:</td><td>${data.descripcion || 'Sin descripción'}</td></tr>
          </table>
        `)}

        <h3 style="font-size: 16px; color: #1A7A52; margin: 20px 0 8px 0;">Archivos e Imágenes:</h3>
        ${emailInfoBox(`
          <p style="margin: 0 0 6px 0;"><strong>URL Portada:</strong> ${data.imagenUrl ? `<a href="${data.imagenUrl}" target="_blank" style="color: #1A7A52; word-break: break-all;">${data.imagenUrl}</a>` : 'Sin URL'}</p>
          <p style="margin: 0;"><strong>Archivo adjunto:</strong> ${imageInfo}</p>
        `)}

        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid #EEE; font-size: 12px; color: #777;">
          <div><strong>Supabase:</strong> ${supabaseWritten ? '✓ Exitoso' : `✗ Fallido (${supabaseError})`}</div>
          <div><strong>Google Sheets:</strong> ${sheetsWritten ? '✓ Exitoso' : '✗ Fallido / No configurado'}</div>
        </div>
      `,
      ctaText: 'Ver en Directorio',
      ctaUrl: `https://www.bazaresmx.com.mx/bazares/${slug}`
    });

    await resend.emails.send({
      from: 'contacto@bazaresmx.com.mx',
      to: 'azulno26@hotmail.com',
      subject: `Nueva solicitud de bazar: ${data.nombre}`,
      attachments,
      html: adminEmailHtml
    });

    return NextResponse.json({ ok: true, sheetsWritten, supabaseWritten, supabaseError, id: insertedBazarId });
  } catch (error) {
    console.error("Error sending email or writing to Sheets:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

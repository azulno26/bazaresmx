import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    // BAZARES_SCRIPT_URL or EXPOSITORES_SCRIPT_URL (fallback since they are on the same spreadsheet)
    const scriptUrl = process.env.BAZARES_SCRIPT_URL || process.env.EXPOSITORES_SCRIPT_URL;

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
            que_encontraras,
            tipo: 'artesanal'
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
    await resend.emails.send({
      from: 'contacto@bazaresmx.com.mx',
      to: 'azulno26@hotmail.com',
      subject: `Nueva solicitud de bazar: ${data.nombre}`,
      attachments,
      html: `
        <h2>Nueva solicitud de publicación en BazaresMX</h2>
        <p><strong>ID Asignado (Sheets):</strong> ${nextId}</p>
        <p><strong>ID Asignado (Supabase):</strong> ${insertedBazarId || 'Error / No guardado'}</p>
        <p><strong>Slug:</strong> ${slug}</p>
        <p><strong>Nombre del bazar:</strong> ${data.nombre}</p>
        <p><strong>Estado:</strong> ${data.estado}</p>
        <p><strong>Colonia:</strong> ${data.colonia}</p>
        <p><strong>Dirección:</strong> ${data.direccion || 'Sin dirección'}</p>
        <p><strong>Fecha inicio:</strong> ${data.fechaInicio}</p>
        <p><strong>Fecha fin:</strong> ${data.fechaFin || 'No especificada'}</p>
        <p><strong>Recurrente:</strong> ${data.recurrente ? data.frecuencia : 'No'}</p>
        <p><strong>Horario:</strong> ${data.horarioInicio} - ${data.horarioFin}</p>
        <p><strong>Descripción:</strong> ${data.descripcion}</p>
        <p><strong>WhatsApp:</strong> ${data.whatsapp}</p>
        <p><strong>Instagram:</strong> ${data.instagram || 'No especificado'}</p>
        <p><strong>Facebook:</strong> ${data.facebook || 'No especificado'}</p>
        <p><strong>Otro contacto:</strong> ${data.otroTipo} - ${data.otro || 'No especificado'}</p>
        <p><strong>Acepta expositores:</strong> ${data.aceptaExpositores}</p>
        <p><strong>Entrada:</strong> ${data.entrada}</p>
        <p><strong>Organizador:</strong> ${data.organizador}</p>
        <p><strong>Plan Elegido:</strong> ${data.planElegido || 'Básico'}</p>
        <p><strong>Imagen Cloudinary:</strong> ${data.imagenUrl ? `<a href="${data.imagenUrl}" target="_blank">${data.imagenUrl}</a>` : 'Sin URL Cloudinary'}</p>
        <p><strong>Imagen adjunta:</strong> ${imageInfo}</p>
        <hr />
        <p><em>Estatus de escritura en Google Sheet (pestaña Bazares): ${sheetsWritten ? '✓ Exitoso (Apps Script)' : '✗ Fallido/Pendiente (Configurar URL)'}</em></p>
        <p><em>Estatus de escritura en Supabase: ${supabaseWritten ? '✓ Exitoso' : `✗ Fallido (${supabaseError})`}</em></p>
      `
    });

    return NextResponse.json({ ok: true, sheetsWritten, supabaseWritten, supabaseError, id: insertedBazarId });
  } catch (error) {
    console.error("Error sending email or writing to Sheets:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

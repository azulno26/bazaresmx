import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/src/lib/security';
import { createClient } from '@supabase/supabase-js';
import { logEvento } from '@/src/lib/logger';
import { sendTelegramMessage } from '@/src/lib/telegram';
import { sendEmail } from '@/src/lib/email';
import { emailTemplate } from '@/src/lib/email-template';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, data } = body;

    if (!token || !data) {
      return NextResponse.json({ error: 'Faltan datos requeridos.' }, { status: 400 });
    }

    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const decoded = secret ? verifyToken(token, secret) : null;
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 });
    }

    const now = Date.now();
    if (now > decoded.exp) {
      return NextResponse.json({ error: 'Este enlace ha expirado. Por favor solicita uno nuevo.' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuración del servidor incompleta.' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const table = decoded.type === 'bazar' ? 'bazares' : 'expositores';

    // 1. Fetch current data to get name and email for the confirmation
    const { data: currentRecord, error: fetchError } = await supabase
      .from(table)
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (fetchError || !currentRecord) {
      await logEvento({
        tipo: 'portal-actualizacion',
        entidadTipo: decoded.type,
        entidadId: decoded.id,
        accion: 'datos_actualizados',
        resultado: 'error',
        detalle: 'Registro no encontrado en la base de datos.'
      });
      return NextResponse.json({ error: 'Registro no encontrado.' }, { status: 404 });
    }

    const nombre = decoded.type === 'bazar' ? currentRecord.nombre : currentRecord.nombre_negocio;
    const userEmail = currentRecord.email;

    // 2. Format Data to update
    let updatePayload: any = {};
    if (decoded.type === 'bazar') {
      updatePayload = {
        fecha: data.fecha,
        fecha_fin: data.fecha_fin,
        horario: data.horario,
        colonia: data.colonia,
        direccion: data.direccion,
        descripcion: data.descripcion,
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        facebook: data.facebook,
        recordatorios_enviados: 0
      };
      
      if (data.imagen_url) {
        updatePayload.imagen_url = data.imagen_url;
      }
      
      // if future date, active status
      if (data.fecha) {
        const eventDate = new Date(data.fecha + 'T00:00:00');
        const today = new Date();
        today.setHours(0,0,0,0);
        if (eventDate >= today) {
          updatePayload.status = 'activo';
        }
      }
    } else {
      updatePayload = {
        descripcion: data.descripcion,
        ciudad: data.ciudad,
        disponibilidad: data.disponibilidad,
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        facebook: data.facebook,
        tiktok: data.tiktok,
        recordatorios_enviados: 0
      };
    }

    // 3. Update Supabase
    const { error: updateError } = await supabase
      .from(table)
      .update(updatePayload)
      .eq('id', decoded.id);

    if (updateError) {
      await logEvento({
        tipo: 'portal-actualizacion',
        entidadTipo: decoded.type,
        entidadId: decoded.id,
        entidadNombre: nombre,
        accion: 'datos_actualizados',
        resultado: 'error',
        detalle: updateError.message
      });
      await sendTelegramMessage(`🔴 Error al actualizar [${nombre}]: ${updateError.message}`);
      return NextResponse.json({ error: 'Ocurrió un error al guardar los datos.' }, { status: 500 });
    }

    // 4. Success Log
    await logEvento({
      tipo: 'portal-actualizacion',
      entidadTipo: decoded.type,
      entidadId: decoded.id,
      entidadNombre: nombre,
      accion: 'datos_actualizados',
      resultado: 'exito'
    });

    // 5. Telegram
    await sendTelegramMessage(`✅ El ${decoded.type} <b>${nombre}</b> actualizó sus datos mediante el portal de autoservicio.`);

    // 6. Email Confirmation
    let changesHtml = `<ul style="list-style-type: none; padding: 0;">`;
    for (const [key, newValue] of Object.entries(updatePayload)) {
      if (key === 'status') continue;
      
      const oldVal = currentRecord[key] || '(vacío)';
      const newVal = newValue || '(vacío)';
      
      // Solo mostrar los que cambiaron, o si quieres mostrar todos, quita el if
      if (oldVal !== newVal) {
        changesHtml += `<li style="margin-bottom: 8px;"><b>${key.toUpperCase()}:</b><br/> <span style="color: #666; text-decoration: line-through;">${oldVal}</span> &rarr; <span style="color: #1A7A52; font-weight: bold;">${newVal}</span></li>`;
      } else {
        changesHtml += `<li style="margin-bottom: 8px;"><b>${key.toUpperCase()}:</b> ${newVal}</li>`;
      }
    }
    changesHtml += `</ul>`;

    const profileUrl = `https://www.bazaresmx.com.mx/${decoded.type === 'bazar' ? 'bazares' : 'expositores'}/${currentRecord.slug}`;
    const dateStr = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

    const bodyHtml = `
      <p><b>Fecha de actualización:</b> ${dateStr}</p>
      <p>Hemos guardado los siguientes datos en el perfil:</p>
      <div class="info-box">${changesHtml}</div>
      <p>Si no fuiste tú quien realizó estos cambios, escríbenos a <a href="mailto:contacto@bazaresmx.com.mx">contacto@bazaresmx.com.mx</a>.</p>
    `;

    if (userEmail) {
      const html = emailTemplate({
        title: `Actualizamos tu perfil en BazaresMX`,
        greeting: `Hola, equipo de ${nombre}:`,
        bodyHtml: bodyHtml,
        ctaText: 'Ver mi perfil',
        ctaUrl: profileUrl
      });

      await sendEmail({
        to: userEmail,
        bcc: 'contacto@bazaresmx.com.mx',
        subject: `✅ Actualizamos tu ${decoded.type} en BazaresMX`,
        html: html
      });
    } else {
      // Si el usuario no tiene correo registrado, notificar directamente a Diego
      const html = emailTemplate({
        title: `Actualización de perfil (sin correo)`,
        greeting: `Notificación del sistema:`,
        bodyHtml: bodyHtml,
        ctaText: 'Ver perfil público',
        ctaUrl: profileUrl
      });

      await sendEmail({
        to: 'contacto@bazaresmx.com.mx',
        subject: `✅ ${nombre} actualizó sus datos (sin correo registrado)`,
        html: html
      });
    }

    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("Error in actualizar endpoint:", err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

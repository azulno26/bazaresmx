import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { verifyToken } from '@/src/lib/security';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email') || '';

    if (!id || !token) {
      return new NextResponse('<h1>❌ Solicitud inválida</h1><p>Faltan parámetros id y token.</p>', {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 1. Verificar el token criptográfico
    const decoded = verifyToken(token);
    if (!decoded || decoded.id !== id) {
      return new NextResponse('<h1>❌ Enlace de activación inválido o expirado</h1><p>El token es incorrecto, está alterado o han pasado más de 24 horas.</p>', {
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const { type } = decoded;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return new NextResponse('<h1>❌ Error interno del servidor</h1><p>Faltan configuraciones de base de datos.</p>', {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    let record: any = null;
    let plan = 'basico';
    let slug = '';
    let name = '';

    // 2. Buscar el registro y verificar su existencia
    if (type === 'bazar') {
      const { data, error } = await supabaseAdmin
        .from('bazares')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        return new NextResponse('<h1>❌ Registro no encontrado</h1><p>El bazar solicitado no existe en la base de datos.</p>', {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      record = data;
      plan = data.plan || 'basico';
      slug = data.slug || '';
      name = data.nombre || '';
    } else {
      const { data, error } = await supabaseAdmin
        .from('expositores')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return new NextResponse('<h1>❌ Registro no encontrado</h1><p>El expositor solicitado no existe en la base de datos.</p>', {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
      record = data;
      plan = data.plan || 'basico';
      slug = data.slug || '';
      name = data.nombre_negocio || '';
    }

    // Si ya está activo, avisamos
    if (record.status === 'activo') {
      return new NextResponse(`<h1>ℹ️ El plan ya se encuentra activo</h1><p>El registro <b>${name}</b> ya estaba activo con vencimiento el <b>${record.vencimiento || 'Sin fecha'}</b>.</p>`, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 3. Calcular la fecha de vencimiento según el plan
    const now = new Date();
    let durationDays = 30; // Planes mensuales estándar
    if (plan.toLowerCase() === 'promo') {
      durationDays = 90; // Promo de 3 meses
    }
    const vencimientoDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const vencimientoStr = vencimientoDate.toISOString().split('T')[0];

    // 4. Actualizar registro en Supabase
    const updatePayload = {
      status: 'activo',
      vencimiento: vencimientoStr
    };

    if (type === 'bazar') {
      const { error } = await supabaseAdmin
        .from('bazares')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('expositores')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
    }

    // 5. Enviar correo de bienvenida al usuario vía Resend
    const recipientEmail = record.email || emailParam;
    let emailSent = false;

    if (recipientEmail) {
      try {
        const welcomeSubject = type === 'bazar' 
          ? `¡Felicidades! Tu bazar está activo en BazaresMX 🎪`
          : `¡Bienvenido a BazaresMX! Tu marca ya está activa 🚀`;

        const siteUrl = 'https://www.bazaresmx.com.mx';
        const detailLink = type === 'bazar' 
          ? `${siteUrl}/bazares/${slug}`
          : `${siteUrl}/expositores/${slug}`;

        const htmlBody = type === 'bazar'
          ? `
            <h2>¡Tu bazar ha sido activado en BazaresMX! 🎉</h2>
            <p>Hola,</p>
            <p>Hemos verificado tu comprobante de pago con éxito y tu bazar <strong>${name}</strong> ya se encuentra publicado con el plan <strong>${plan.toUpperCase()}</strong>.</p>
            <p><strong>Detalles de la publicación:</strong></p>
            <ul>
              <li><strong>Estatus:</strong> Activo (Visible en el directorio)</li>
              <li><strong>Plan contratado:</strong> ${plan.toUpperCase()}</li>
              <li><strong>Válido hasta:</strong> ${vencimientoStr}</li>
              <li><strong>Enlace directo a tu bazar:</strong> <a href="${detailLink}" target="_blank">${detailLink}</a></li>
            </ul>
            <p>Tu evento ya está disponible para que miles de expositores y visitantes lo encuentren.</p>
            <p>¡Mucho éxito con tu bazar!</p>
            <hr />
            <p>Atentamente,<br/><strong>El equipo de BazaresMX</strong></p>
          `
          : `
            <h2>¡Tu marca ya está activa en BazaresMX! 🎉</h2>
            <p>Hola <strong>${record.nombre_completo || 'Emprendedor'}</strong>,</p>
            <p>Hemos verificado tu comprobante de pago con éxito y el perfil de tu marca <strong>${name}</strong> ya se encuentra activo con el plan <strong>${plan.toUpperCase()}</strong>.</p>
            <p><strong>Detalles de tu membresía:</strong></p>
            <ul>
              <li><strong>Estatus:</strong> Activo (Visible en el directorio de expositores)</li>
              <li><strong>Plan contratado:</strong> ${plan.toUpperCase()}</li>
              <li><strong>Válido hasta:</strong> ${vencimientoStr}</li>
              <li><strong>Enlace a tu perfil público:</strong> <a href="${detailLink}" target="_blank">${detailLink}</a></li>
            </ul>
            <p>Tu marca ya se destaca y está lista para recibir solicitudes e interactuar con organizadores de bazares.</p>
            <p>¡Mucho éxito con tus ventas!</p>
            <hr />
            <p>Atentamente,<br/><strong>El equipo de BazaresMX</strong></p>
          `;

        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: recipientEmail,
          subject: welcomeSubject,
          html: htmlBody
        });
        emailSent = true;
      } catch (err) {
        console.error("Error al enviar el email de bienvenida:", err);
      }
    }

    return new NextResponse(`
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)">
        <h1 style="color: #059669; margin-top: 0">✅ Plan activado correctamente</h1>
        <p>El registro <strong>${name}</strong> (${type === 'bazar' ? 'Bazar' : 'Expositor'}) ha sido activado con éxito.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0" />
        <ul style="list-style: none; padding: 0; line-height: 1.6">
          <li><strong>Plan:</strong> ${plan.toUpperCase()}</li>
          <li><strong>Nueva fecha de vencimiento:</strong> ${vencimientoStr}</li>
          <li><strong>Correo de bienvenida enviado:</strong> ${emailSent ? `✓ Sí (${recipientEmail})` : '✗ No enviado (no se detectó correo)'}</li>
        </ul>
        <div style="margin-top: 30px; text-align: center">
          <a href="https://www.bazaresmx.com.mx/${type === 'bazar' ? 'bazares' : 'expositores'}/${slug}" target="_blank" style="background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block">Ver perfil en el sitio web</a>
        </div>
      </div>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error: any) {
    console.error("Error en api/activar-plan:", error);
    return new NextResponse(`<h1>❌ Error al procesar activación</h1><p>${error.message}</p>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

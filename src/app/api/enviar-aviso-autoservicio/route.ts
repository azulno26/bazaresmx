import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/src/lib/email';
import { emailTemplate } from '@/src/lib/email-template';
import { sendTelegramMessage } from '@/src/lib/telegram';
import { logEvento } from '@/src/lib/logger';
import { generateToken } from '@/src/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const adminSecretHeader = req.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET;
    
    // We only accept Bearer ADMIN_SECRET or query param ?secret=ADMIN_SECRET
    const querySecret = req.nextUrl.searchParams.get('secret');

    const isAuthorized = adminSecret && (
      adminSecretHeader === `Bearer ${adminSecret}` || 
      querySecret === adminSecret
    );

    if (!isAuthorized) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: bazares, error } = await supabase
      .from('bazares')
      .select('id, nombre, email, slug')
      .eq('status', 'activo');

    if (error || !bazares) {
      throw new Error(`Error fetching bazares: ${error?.message}`);
    }

    let emailsSent = 0;
    let emailsErrors = 0;
    const noEmailList: { nombre: string; link: string }[] = [];
    const exp = Date.now() + 15 * 24 * 60 * 60 * 1000;

    for (const bazar of bazares) {
      if (!bazar.email) {
        const token = generateToken(bazar.id, 'bazar', exp, supabaseServiceKey);
        noEmailList.push({
          nombre: bazar.nombre,
          link: `https://www.bazaresmx.com.mx/actualizar/${token}`
        });
        continue;
      }

      try {
        const token = generateToken(bazar.id, 'bazar', exp, supabaseServiceKey);
        const updateLink = `https://www.bazaresmx.com.mx/actualizar/${token}`;
        
        const bodyHtml = `
          <p>Te escribimos desde BazaresMX con una buena noticia 🎉</p>
          <p>A partir de la próxima semana vas a poder actualizar la información de tu bazar directamente desde un enlace que te enviaremos por correo, sin necesidad de escribirnos por WhatsApp.</p>
          <div class="info-box" style="margin-top: 20px;">
            <p>Podrás actualizar tú mismo:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>✅ Fecha y horario de tu próximo evento</li>
              <li>✅ Ubicación y dirección</li>
              <li>✅ Descripción</li>
              <li>✅ Redes sociales y contacto</li>
              <li>✅ Imagen principal de tu bazar</li>
            </ul>
          </div>
          <p>⚠️ <b>IMPORTANTE:</b><br/>
          Todas las actualizaciones llegarán a ESTE correo electrónico. Por favor confirma que es el correo correcto respondiendo a este mensaje, o escríbenos a <a href="mailto:contacto@bazaresmx.com.mx">contacto@bazaresmx.com.mx</a> si prefieres usar otro.</p>
          <p>Si no recibimos confirmación, seguiremos usando este mismo correo.</p>
          <p>Gracias por ser parte de BazaresMX 💚</p>
        `;

        const html = emailTemplate({
          title: 'Nuevo: actualiza tu bazar tú mismo en BazaresMX 🎪',
          greeting: `Hola, equipo de ${bazar.nombre}:`,
          bodyHtml: bodyHtml,
          ctaText: 'Ver mi bazar en el sitio',
          ctaUrl: `https://www.bazaresmx.com.mx/bazares/${bazar.slug}`
        });

        const res = await sendEmail({ 
          to: bazar.email, 
          subject: 'Nuevo: actualiza tu bazar tú mismo en BazaresMX 🎪', 
          html 
        });

        if (res.error) throw new Error(res.error);

        await logEvento({ 
          tipo: 'cron-avisos', 
          entidadTipo: 'bazar', 
          entidadId: bazar.id, 
          entidadNombre: bazar.nombre, 
          accion: 'email_enviado', 
          resultado: 'exito', 
          detalle: 'Aviso de nuevo sistema de autoservicio' 
        });
        emailsSent++;

      } catch (err: any) {
        emailsErrors++;
        await logEvento({ 
          tipo: 'cron-avisos', 
          entidadTipo: 'bazar', 
          entidadId: bazar.id, 
          entidadNombre: bazar.nombre, 
          accion: 'email_enviado', 
          resultado: 'error', 
          detalle: `Fallo envío aviso autoservicio: ${err.message}` 
        });
      }
    }

    let telegramMsg = `<b>📣 AVISO AUTOSERVICIO ENVIADO</b>\n`;
    telegramMsg += `📧 Avisos enviados: ${emailsSent} ✅\n`;
    telegramMsg += `🔴 Errores: ${emailsErrors}\n\n`;

    if (noEmailList.length > 0) {
      telegramMsg += `<b>⚠️ Bazares sin correo (contactar por WhatsApp):</b>\n\n`;
      noEmailList.forEach(n => {
        telegramMsg += `<b>${n.nombre}</b>\n<code>${n.link}</code>\n\n`;
      });
    } else {
      telegramMsg += `Todos los bazares activos tienen correo registrado.`;
    }

    await sendTelegramMessage(telegramMsg);

    return NextResponse.json({ 
      ok: true, 
      emailsSent, 
      emailsErrors, 
      noEmailList: noEmailList.map(n => n.nombre)
    });

  } catch (err: any) {
    console.error('Error in enviar-aviso-autoservicio:', err);
    await sendTelegramMessage(`🚨 ERROR EN AVISO AUTOSERVICIO: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

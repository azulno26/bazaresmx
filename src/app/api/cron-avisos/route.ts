import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateToken } from '@/src/lib/security';
import { sendEmail } from '@/src/lib/email';
import { emailTemplate } from '@/src/lib/email-template';
import { sendTelegramMessage } from '@/src/lib/telegram';
import { logEvento } from '@/src/lib/logger';

export const dynamic = 'force-dynamic';

function getMexicoDateDiff(targetStr: string | null) {
  if (!targetStr) return null;
  const options = { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-US', options as any);
  const [{ value: m }, , { value: d }, , { value: y }] = formatter.formatToParts(new Date());
  const todayParsed = new Date(`${y}-${m}-${d}T00:00:00`);
  const targetParsed = new Date(targetStr + 'T00:00:00');
  
  return Math.floor((todayParsed.getTime() - targetParsed.getTime()) / (1000 * 60 * 60 * 24));
}

function wasSentInLast72Hours(ultimo_aviso: string | null) {
  if (!ultimo_aviso) return false;
  const target = new Date(ultimo_aviso + 'T00:00:00');
  const now = new Date();
  const diffHours = (now.getTime() - target.getTime()) / (1000 * 60 * 60);
  return diffHours < 72;
}

function todayYYYYMMDD() {
  const options = { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-US', options as any);
  const [{ value: m }, , { value: d }, , { value: y }] = formatter.formatToParts(new Date());
  return `${y}-${m}-${d}`;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // We also allow if CRON_SECRET is empty for local testing, but recommend setting it
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
    const today = todayYYYYMMDD();
    let emailsSent = 0;
    let emailsErrors = 0;
    let autoDeactivated = 0;
    const errorDetails: string[] = [];

    // --- CASO A: Bazares ---
    const { data: bazares } = await supabase.from('bazares').select('id, nombre, email, fecha, fecha_fin, ultimo_aviso_enviado').eq('status', 'activo');
    
    if (bazares) {
      for (const bazar of bazares) {
        if (!bazar.email) continue;
        const targetDate = bazar.fecha_fin || bazar.fecha;
        const diffDays = getMexicoDateDiff(targetDate);
        
        // Event is passed by >= 1 day
        if (diffDays !== null && diffDays >= 1) {
          if (!wasSentInLast72Hours(bazar.ultimo_aviso_enviado)) {
            try {
              const exp = Date.now() + 15 * 24 * 60 * 60 * 1000;
              const token = generateToken(bazar.id, 'bazar', exp, supabaseServiceKey || 'default-secret');
              const link = `https://www.bazaresmx.com.mx/actualizar/${token}`;

              const html = emailTemplate({
                title: 'Actualiza la fecha de tu bazar',
                greeting: `Hola, equipo de ${bazar.nombre}`,
                bodyHtml: `<p>Hemos notado que la fecha de tu bazar en nuestro directorio ya ha pasado. Para seguir recibiendo visitas y prospectos, te invitamos a actualizar la información de tu próxima edición.</p>`,
                ctaText: 'Actualizar mis datos',
                ctaUrl: link
              });

              const res = await sendEmail({ to: bazar.email, subject: 'Actualiza la fecha de tu bazar en BazaresMX', html });
              if (res.error) throw new Error(res.error);

              await supabase.from('bazares').update({ ultimo_aviso_enviado: today }).eq('id', bazar.id);
              await logEvento({ tipo: 'cron-avisos', entidadTipo: 'bazar', entidadId: bazar.id, entidadNombre: bazar.nombre, accion: 'email_enviado', resultado: 'exito', detalle: 'Caso A: Evento pasado' });
              emailsSent++;
            } catch (err: any) {
              emailsErrors++;
              errorDetails.push(`Bazar ${bazar.nombre}: ${err.message}`);
              await logEvento({ tipo: 'cron-avisos', entidadTipo: 'bazar', entidadId: bazar.id, entidadNombre: bazar.nombre, accion: 'email_enviado', resultado: 'error', detalle: err.message });
            }
          }
        }
      }
    }

    // --- CASO B, C, D: Expositores ---
    const { data: expositores } = await supabase.from('expositores').select('id, nombre_negocio, email, plan, vencimiento, ultimo_aviso_enviado').eq('status', 'activo');
    
    if (expositores) {
      for (const exp of expositores) {
        if (!exp.email || !exp.vencimiento) continue;
        const diffDays = getMexicoDateDiff(exp.vencimiento); // If vencimiento is tomorrow, diff is -1. If today, diff is 0. If yesterday, diff is 1.
        
        if (diffDays === null) continue;

        let emailSubject = '';
        let emailBody = '';
        let isCaseD = false;
        let ctaText = 'Actualizar y Renovar Perfil';

        if (diffDays === -7) {
          // CASO B: a 7 días de vencer
          emailSubject = 'Tu plan en BazaresMX vence en 7 días';
          emailBody = `<p>Te recordamos que tu perfil está a 7 días de vencer. Renueva hoy para mantener tu visibilidad.</p>`;
        } else if (diffDays === 0) {
          // CASO C: vencidos (día 0)
          emailSubject = 'Tu perfil se desactivará pronto';
          emailBody = `<p>Tu plan comercial en BazaresMX vence hoy. Renueva ahora mismo para evitar que tu perfil sea desactivado del directorio.</p>`;
        } else if (diffDays === 7) {
          // CASO D: vencidos +7 días
          isCaseD = true;
          emailSubject = 'Tu perfil se ha desactivado';
          emailBody = `<p>Tu plan comercial ha expirado hace 7 días, por lo que tu perfil ha sido desactivado temporalmente. Reactívalo cuando quieras actualizando tus datos y enviando tu comprobante de pago.</p>`;
          ctaText = 'Reactivar mi perfil';
        } else {
          continue; // Not a matching date for cron
        }

        if (!wasSentInLast72Hours(exp.ultimo_aviso_enviado)) {
          try {
            const expTime = Date.now() + 15 * 24 * 60 * 60 * 1000;
            const token = generateToken(exp.id, 'expositor', expTime, supabaseServiceKey || 'default-secret');
            const link = `https://www.bazaresmx.com.mx/actualizar/${token}`;

            const paymentInfo = `
              <div class="info-box" style="margin-top: 20px;">
                <p><b>Datos de pago:</b></p>
                <p>🏦 Banco: Scotiabank<br/>
                💳 CLABE: ${process.env.CLABE || '032180000118359719'}<br/>
                👤 Titular: ${process.env.TITULAR || 'Diego Castellanos'}<br/>
                📝 Concepto: ${exp.nombre_negocio} ${exp.plan}</p>
                <p>📧 Envía tu comprobante a: <a href="mailto:contacto@bazaresmx.com.mx">contacto@bazaresmx.com.mx</a></p>
              </div>
            `;

            const html = emailTemplate({
              title: emailSubject,
              greeting: `Hola, equipo de ${exp.nombre_negocio}`,
              bodyHtml: emailBody + paymentInfo,
              ctaText: ctaText,
              ctaUrl: link
            });

            if (isCaseD) {
              await supabase.from('expositores').update({ status: 'inactivo', ultimo_aviso_enviado: today }).eq('id', exp.id);
              autoDeactivated++;
              await logEvento({ tipo: 'cron-avisos', entidadTipo: 'expositor', entidadId: exp.id, entidadNombre: exp.nombre_negocio, accion: 'auto_desactivado', resultado: 'exito' });
            } else {
              await supabase.from('expositores').update({ ultimo_aviso_enviado: today }).eq('id', exp.id);
            }

            const res = await sendEmail({ to: exp.email, subject: emailSubject, html });
            if (res.error) throw new Error(res.error);

            await logEvento({ tipo: 'cron-avisos', entidadTipo: 'expositor', entidadId: exp.id, entidadNombre: exp.nombre_negocio, accion: 'email_enviado', resultado: 'exito' });
            emailsSent++;

          } catch (err: any) {
            emailsErrors++;
            errorDetails.push(`Expositor ${exp.nombre_negocio}: ${err.message}`);
            await logEvento({ tipo: 'cron-avisos', entidadTipo: 'expositor', entidadId: exp.id, entidadNombre: exp.nombre_negocio, accion: 'email_enviado', resultado: 'error', detalle: err.message });
          }
        }
      }
    }

    // --- Resumen consolidado a Telegram ---
    let telegramMsg = `<b>📊 CRON AVISOS — ${today}</b>\n`;
    telegramMsg += `✅ Correos enviados: ${emailsSent}\n`;
    telegramMsg += `🔴 Errores: ${emailsErrors}\n`;
    telegramMsg += `⏸️ Auto-desactivados: ${autoDeactivated}\n`;

    if (errorDetails.length > 0) {
      telegramMsg += `\n<b>Detalle de errores:</b>\n`;
      errorDetails.forEach(e => telegramMsg += `- ${e}\n`);
    }

    await sendTelegramMessage(telegramMsg);

    return NextResponse.json({ ok: true, emailsSent, emailsErrors, autoDeactivated });

  } catch (err: any) {
    console.error('Critical error in cron-avisos:', err);
    await sendTelegramMessage(`🚨 CRON AVISOS FALLÓ: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

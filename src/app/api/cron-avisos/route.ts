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
    
    const summary = {
      day1: [] as string[],
      day5: [] as string[],
      day12: [] as string[],
      day20: [] as string[],
      errors: [] as string[]
    };

    // --- CASO A: Bazares ---
    const { data: bazares } = await supabase.from('bazares')
      .select('id, nombre, email, fecha, fecha_fin, ultimo_aviso_enviado, recordatorios_enviados')
      .eq('status', 'activo');
    
    if (bazares) {
      for (const bazar of bazares) {
        if (!bazar.email) continue;
        const targetDate = bazar.fecha_fin || bazar.fecha;
        const diffDays = getMexicoDateDiff(targetDate);
        
        if (diffDays === null || diffDays < 1) continue;
        if (wasSentInLast72Hours(bazar.ultimo_aviso_enviado)) continue;
        
        const recs = bazar.recordatorios_enviados || 0;
        
        let subject = '';
        let body = '';
        let newRecs = recs;
        let ctaText = 'Actualizar mi bazar';
        let deactivate = false;
        let summaryList = null;

        if (diffDays >= 20 && recs === 3) {
          subject = 'Tu bazar se ocultó del directorio';
          body = '<p>Como tu bazar no ha actualizado la fecha de su próximo evento, ha sido ocultado del directorio para no mostrar información desactualizada.</p><p>Puedes reactivarlo en cualquier momento simplemente actualizando tu fecha de próximo evento con el siguiente enlace.</p>';
          newRecs = 4;
          deactivate = true;
          summaryList = summary.day20;
        } else if (diffDays >= 12 && recs === 2) {
          subject = 'Tu bazar dejará de aparecer pronto';
          body = '<p>Si no actualizas la fecha de tu próximo evento, tu bazar será ocultado temporalmente del directorio para evitar mostrar información desactualizada a los visitantes.</p>';
          newRecs = 3;
          summaryList = summary.day12;
        } else if (diffDays >= 5 && recs === 1) {
          subject = '¿Ya tienes fecha para tu próximo bazar?';
          body = '<p>Notamos que tu bazar sigue mostrando la fecha anterior en el sitio. Si ya tienes fecha para tu próxima edición, actualízala ahora para que los expositores puedan encontrarte.</p>';
          newRecs = 2;
          summaryList = summary.day5;
        } else if (diffDays >= 1 && recs === 0) {
          subject = 'Actualiza la fecha de tu próximo bazar';
          body = '<p>El evento de tu bazar ya ha pasado. Para mantener activo tu perfil y seguir atrayendo prospectos, te invitamos a actualizar la fecha de tu próxima edición.</p>';
          newRecs = 1;
          summaryList = summary.day1;
        } else {
          continue; // No action needed
        }

        try {
          const exp = Date.now() + 15 * 24 * 60 * 60 * 1000;
          const token = generateToken(bazar.id, 'bazar', exp, supabaseServiceKey || 'default-secret');
          const link = `https://www.bazaresmx.com.mx/actualizar/${token}`;

          const html = emailTemplate({
            title: subject,
            greeting: `Hola, equipo de ${bazar.nombre}`,
            bodyHtml: body,
            ctaText: ctaText,
            ctaUrl: link
          });

          const res = await sendEmail({ to: bazar.email, subject: subject, html });
          if (res.error) throw new Error(res.error);

          const updatePayload: any = { ultimo_aviso_enviado: today, recordatorios_enviados: newRecs };
          if (deactivate) {
            updatePayload.status = 'inactivo';
            await sendTelegramMessage(`⏸️ <b>${bazar.nombre}</b> se ocultó por falta de actualización.`);
          }

          await supabase.from('bazares').update(updatePayload).eq('id', bazar.id);
          summaryList?.push(`[Bazar] ${bazar.nombre}`);
          await logEvento({ tipo: 'cron-avisos', entidadTipo: 'bazar', entidadId: bazar.id, entidadNombre: bazar.nombre, accion: deactivate ? 'auto_desactivado' : 'email_enviado', resultado: 'exito', detalle: `Recordatorio ${newRecs}` });
        } catch (err: any) {
          summary.errors.push(`[Bazar] ${bazar.nombre}: ${err.message}`);
          await logEvento({ tipo: 'cron-avisos', entidadTipo: 'bazar', entidadId: bazar.id, entidadNombre: bazar.nombre, accion: 'email_enviado', resultado: 'error', detalle: err.message });
        }
      }
    }

    // --- CASO B, C, D: Expositores ---
    const { data: expositores } = await supabase.from('expositores')
      .select('id, nombre_negocio, email, plan, vencimiento, ultimo_aviso_enviado, recordatorios_enviados')
      .eq('status', 'activo');
    
    if (expositores) {
      for (const exp of expositores) {
        if (!exp.email || !exp.vencimiento) continue;
        const diffDays = getMexicoDateDiff(exp.vencimiento);
        
        if (diffDays === null) continue;
        
        const recs = exp.recordatorios_enviados || 0;
        let subject = '';
        let body = '';
        let newRecs = recs;
        let ctaText = 'Actualizar y Renovar Perfil';
        let deactivate = false;
        let summaryList = null;
        let isPreReminder = false;

        if (diffDays === -7 && !wasSentInLast72Hours(exp.ultimo_aviso_enviado)) {
          isPreReminder = true;
          subject = 'Tu plan en BazaresMX vence en 7 días';
          body = '<p>Te recordamos que tu perfil está a 7 días de vencer. Renueva hoy para mantener tu visibilidad.</p>';
        } else if (diffDays >= 20 && recs === 3 && !wasSentInLast72Hours(exp.ultimo_aviso_enviado)) {
          subject = 'Tu perfil se ha desactivado';
          body = '<p>Tu plan comercial ha expirado hace 20 días, por lo que tu perfil ha sido desactivado del directorio. Reactívalo cuando quieras actualizando tus datos y enviando tu comprobante de pago.</p>';
          newRecs = 4;
          deactivate = true;
          summaryList = summary.day20;
        } else if (diffDays >= 12 && recs === 2 && !wasSentInLast72Hours(exp.ultimo_aviso_enviado)) {
          subject = 'Tu perfil se desactivará pronto';
          body = '<p>Tu plan expiró hace más de una semana. Si no renuevas, tu perfil será desactivado pronto del directorio.</p>';
          newRecs = 3;
          summaryList = summary.day12;
        } else if (diffDays >= 5 && recs === 1 && !wasSentInLast72Hours(exp.ultimo_aviso_enviado)) {
          subject = 'Recordatorio para renovar tu perfil';
          body = '<p>Esperamos que estés vendiendo mucho. Te recordamos que tu plan está vencido, renueva ahora para no perder visibilidad.</p>';
          newRecs = 2;
          summaryList = summary.day5;
        } else if (diffDays >= 0 && recs === 0 && !wasSentInLast72Hours(exp.ultimo_aviso_enviado)) {
          subject = 'Tu plan ha vencido hoy';
          body = '<p>Tu plan comercial en BazaresMX ha expirado. Renueva ahora mismo para evitar que tu perfil sea desactivado del directorio.</p>';
          newRecs = 1;
          summaryList = summary.day1;
        } else {
          continue;
        }

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
            title: subject,
            greeting: `Hola, equipo de ${exp.nombre_negocio}`,
            bodyHtml: body + paymentInfo,
            ctaText: ctaText,
            ctaUrl: link
          });

          const res = await sendEmail({ to: exp.email, subject: subject, html });
          if (res.error) throw new Error(res.error);

          const updatePayload: any = { ultimo_aviso_enviado: today };
          if (!isPreReminder) {
            updatePayload.recordatorios_enviados = newRecs;
          }
          if (deactivate) {
            updatePayload.status = 'inactivo';
            await sendTelegramMessage(`⏸️ <b>${exp.nombre_negocio}</b> se ocultó por falta de renovación (20 días).`);
          }

          await supabase.from('expositores').update(updatePayload).eq('id', exp.id);
          
          if (!isPreReminder && summaryList) {
            summaryList.push(`[Expositor] ${exp.nombre_negocio}`);
          }
          
          await logEvento({ tipo: 'cron-avisos', entidadTipo: 'expositor', entidadId: exp.id, entidadNombre: exp.nombre_negocio, accion: deactivate ? 'auto_desactivado' : 'email_enviado', resultado: 'exito', detalle: `Recordatorio ${isPreReminder ? '-7' : newRecs}` });
        } catch (err: any) {
          summary.errors.push(`[Expositor] ${exp.nombre_negocio}: ${err.message}`);
          await logEvento({ tipo: 'cron-avisos', entidadTipo: 'expositor', entidadId: exp.id, entidadNombre: exp.nombre_negocio, accion: 'email_enviado', resultado: 'error', detalle: err.message });
        }
      }
    }

    // --- Resumen consolidado a Telegram ---
    let telegramMsg = `<b>📊 CRON AVISOS — ${today}</b>\n`;
    telegramMsg += `📧 Primeros avisos: ${summary.day1.length}\n`;
    if (summary.day1.length > 0) telegramMsg += `   <pre>${summary.day1.join('\n   ')}</pre>\n`;
    
    telegramMsg += `🔔 Recordatorios día 5: ${summary.day5.length}\n`;
    if (summary.day5.length > 0) telegramMsg += `   <pre>${summary.day5.join('\n   ')}</pre>\n`;
    
    telegramMsg += `⚠️ Avisos día 12: ${summary.day12.length}\n`;
    if (summary.day12.length > 0) telegramMsg += `   <pre>${summary.day12.join('\n   ')}</pre>\n`;
    
    telegramMsg += `⏸️ Desactivados día 20: ${summary.day20.length}\n`;
    if (summary.day20.length > 0) telegramMsg += `   <pre>${summary.day20.join('\n   ')}</pre>\n`;
    
    telegramMsg += `🔴 Errores: ${summary.errors.length}\n`;
    if (summary.errors.length > 0) telegramMsg += `   <pre>${summary.errors.join('\n   ')}</pre>\n`;

    await sendTelegramMessage(telegramMsg);

    return NextResponse.json({ ok: true, summary });

  } catch (err: any) {
    console.error('Critical error in cron-avisos:', err);
    await sendTelegramMessage(`🚨 CRON AVISOS FALLÓ: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { createClient } from '@supabase/supabase-js';
import { generateToken } from '@/src/lib/security';

export const dynamic = 'force-dynamic';

// Helper to convert readable stream to Buffer if needed
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: any[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function GET(req: NextRequest) {
  try {
    // 1. Validar origen de Vercel Cron (o permitir en desarrollo local)
    const isCron = req.headers.get('x-vercel-cron') === '1';
    const isDev = process.env.NODE_ENV === 'development';
    
    // Verificar token secreto si está configurado en Vercel
    const authHeader = req.headers.get('authorization');
    const hasCronSecret = process.env.CRON_SECRET ? authHeader === `Bearer ${process.env.CRON_SECRET}` : false;

    if (!isCron && !isDev && !hasCronSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const imapPassword = process.env.IMAP_PASSWORD;
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!imapPassword || !telegramToken || !telegramChatId || !supabaseUrl || !supabaseServiceKey) {
      console.error("Faltan variables de entorno necesarias para correr el check-pagos.");
      return NextResponse.json({ ok: false, error: 'Environment variables missing' }, { status: 500 });
    }

    // Inicializar clientes
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const client = new ImapFlow({
      host: 'imap.hostinger.com',
      port: 993,
      secure: true,
      auth: {
        user: 'contacto@bazaresmx.com.mx',
        pass: imapPassword
      },
      logger: false
    });

    console.log("Conectando a Hostinger IMAP...");
    await client.connect();
    
    const lock = await client.getMailboxLock('INBOX');
    let processedCount = 0;

    try {
      // Buscar correos no leídos
      const searchResult = await client.search({ seen: false });
      const uids = searchResult ? searchResult : [];
      console.log(`Encontrados ${uids.length} correos no leídos.`);

      if (uids.length > 0) {
        // Obtener expositores y bazares pendientes para la heurística de asociación
        const { data: pendingExpositores } = await supabaseAdmin
          .from('expositores')
          .select('*')
          .eq('status', 'pendiente');

        const { data: pendingBazares } = await supabaseAdmin
          .from('bazares')
          .select('*')
          .eq('status', 'pendiente');

        for (const uid of uids) {
          console.log(`Procesando correo UID: ${uid}...`);
          const download = await client.download(uid);
          const rawEmail = await streamToBuffer(download.content);
          const parsed = await simpleParser(rawEmail);

          // 1. Validar que tenga adjunto (PDF o imagen)
          const validAttachments = (parsed.attachments || []).filter(att => {
            const ct = (att.contentType || '').toLowerCase();
            const fn = (att.filename || '').toLowerCase();
            return ct.includes('pdf') || ct.includes('image') || 
                   fn.endsWith('.pdf') || fn.endsWith('.jpg') || fn.endsWith('.jpeg') || fn.endsWith('.png');
          });

          // Si no tiene adjuntos válidos, lo marcamos como leído (para no procesarlo de nuevo) pero no alertamos pago
          if (validAttachments.length === 0) {
            console.log(`Correo UID ${uid} sin adjuntos de pago válidos. Marcando como leído.`);
            await client.messageFlagsAdd({ uid }, ['\\Seen']);
            processedCount++;
            continue;
          }

          // 2. Extraer remitente
          const senderEmail = (parsed.from?.value?.[0]?.address || '').toLowerCase().trim();
          const senderName = parsed.from?.value?.[0]?.name || senderEmail;
          const subject = parsed.subject || '(Sin Asunto)';
          const bodyText = ((parsed.text || '') + ' ' + (parsed.html || '')).toLowerCase();

          // 3. Ejecutar Heurística de Asociación
          let matchedRecord: any = null;
          let matchedType: 'bazar' | 'expositor' | null = null;

          // A) Intentar asociar expositor por email exacto
          if (senderEmail && pendingExpositores) {
            matchedRecord = pendingExpositores.find(e => (e.email || '').toLowerCase().trim() === senderEmail);
            if (matchedRecord) matchedType = 'expositor';
          }

          // B) Si no hay match, buscar en bazares por nombre o slug en asunto/cuerpo
          if (!matchedRecord && pendingBazares) {
            matchedRecord = pendingBazares.find(b => {
              const slug = (b.slug || '').toLowerCase();
              const nombre = (b.nombre || '').toLowerCase();
              return (slug && (subject.toLowerCase().includes(slug) || bodyText.includes(slug))) ||
                     (nombre && (subject.toLowerCase().includes(nombre) || bodyText.includes(nombre)));
            });
            if (matchedRecord) matchedType = 'bazar';
          }

          // C) Si aún no hay match, buscar en expositores por nombre, slug o marca en asunto/cuerpo
          if (!matchedRecord && pendingExpositores) {
            matchedRecord = pendingExpositores.find(e => {
              const slug = (e.slug || '').toLowerCase();
              const negocio = (e.nombre_negocio || '').toLowerCase();
              const completo = (e.nombre_completo || '').toLowerCase();
              return (slug && (subject.toLowerCase().includes(slug) || bodyText.includes(slug))) ||
                     (negocio && (subject.toLowerCase().includes(negocio) || bodyText.includes(negocio))) ||
                     (completo && (subject.toLowerCase().includes(completo) || bodyText.includes(completo)));
            });
            if (matchedRecord) matchedType = 'expositor';
          }

          // 4. Enviar notificación a Diego por Telegram
          let telegramMessage = '';

          if (matchedRecord && matchedType) {
            // Generar enlace de activación seguro (expira en 24h)
            const exp = Date.now() + 24 * 60 * 60 * 1000;
            const token = generateToken(matchedRecord.id, matchedType, exp);
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.bazaresmx.com.mx';
            const activationLink = `${appUrl}/api/activar-plan?id=${matchedRecord.id}&token=${token}&email=${encodeURIComponent(senderEmail)}`;

            telegramMessage = `💰 <b>Nuevo comprobante de pago</b>
--------------------------------------
<b>De:</b> ${senderName}
<b>Asunto:</b> ${subject}
<b>Registro Asociado:</b> ${matchedType === 'bazar' ? '🎪 Bazar' : '👤 Expositor'}
<b>Nombre:</b> ${matchedType === 'bazar' ? matchedRecord.nombre : matchedRecord.nombre_negocio}
<b>Plan:</b> ${matchedRecord.plan?.toUpperCase()}
<b>Comprobante:</b> ${validAttachments[0].filename}
--------------------------------------
👉 <a href="${activationLink}"><b>Haga clic aquí para Activar Plan</b></a>`;
          } else {
            // Alerta general sin enlace de activación
            telegramMessage = `⚠️ <b>Comprobante de pago recibido (Sin asociar)</b>
--------------------------------------
<b>De:</b> ${senderName}
<b>Asunto:</b> ${subject}
<b>Comprobante:</b> ${validAttachments[0].filename}
--------------------------------------
<i>No pudimos encontrar un bazar o expositor pendiente que coincida con el remitente o el asunto del correo. Valida de forma manual.</i>`;
          }

          // Realizar POST a Telegram API
          const telegramRes = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: telegramMessage,
              parse_mode: 'HTML'
            })
          });

          if (!telegramRes.ok) {
            console.error(`Error enviando notificación a Telegram: ${telegramRes.status}`);
          }

          // 5. Marcar como leído
          await client.messageFlagsAdd({ uid }, ['\\Seen']);
          processedCount++;
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
    console.log("Conexión IMAP cerrada.");

    return NextResponse.json({ ok: true, processedCount });
  } catch (error: any) {
    console.error("Error catastrófico en api/check-pagos:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

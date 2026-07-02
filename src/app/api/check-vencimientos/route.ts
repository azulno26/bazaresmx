import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getMexicoToday() {
  const options = { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-US', options as any);
  const [{ value: month }, , { value: day }, , { value: year }] = formatter.formatToParts(new Date());
  return `${year}-${month}-${day}`;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Verify authorization (bearer cron secret OR admin secret in query param)
    const authHeader = req.headers.get('authorization');
    const queryToken = req.nextUrl.searchParams.get('token');
    const cronSecret = process.env.CRON_SECRET;
    const adminSecret = process.env.ADMIN_SECRET;

    const isCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isQueryAuth = (cronSecret && queryToken === cronSecret) || (adminSecret && queryToken === adminSecret);

    if (!isCronAuth && !isQueryAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (!supabaseUrl || !supabaseServiceKey || !telegramToken || !telegramChatId) {
      return NextResponse.json({ error: 'Missing configuration variables' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch active expositores
    const { data: expositores, error } = await supabase
      .from('expositores')
      .select('nombre_negocio, nombre_completo, whatsapp, email, plan, vencimiento')
      .eq('status', 'activo')
      .order('vencimiento', { ascending: true });

    if (error) {
      console.error('Error fetching expositores:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Date math in Mexico City timezone
    const todayStr = getMexicoToday();
    
    const todayDate = new Date(todayStr);
    
    // Tomorrow
    const dTom = new Date(todayDate);
    dTom.setDate(dTom.getDate() + 1);
    const tomorrowStr = dTom.toISOString().split('T')[0];

    // Limit (8 days from today)
    const dLim = new Date(todayDate);
    dLim.setDate(dLim.getDate() + 8);
    const limitStr = dLim.toISOString().split('T')[0];

    // Grouping
    const vencidos: any[] = [];
    const vencenManana: any[] = [];
    const proximos: any[] = [];

    expositores.forEach(e => {
      if (!e.vencimiento) return;
      
      const cleanPhone = (e.whatsapp || '').replace(/\D/g, '');
      const finalPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
      const waLink = `wa.me/${finalPhone}`;

      if (e.vencimiento <= todayStr) {
        // Calculate days expired
        const vencDate = new Date(e.vencimiento);
        const diffTime = todayDate.getTime() - vencDate.getTime();
        const dias = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
        vencidos.push({
          nombre: e.nombre_negocio,
          whatsapp: waLink,
          dias: dias,
          vencimiento: e.vencimiento
        });
      } else if (e.vencimiento === tomorrowStr) {
        vencenManana.push({
          nombre: e.nombre_negocio,
          whatsapp: waLink
        });
      } else if (e.vencimiento > tomorrowStr && e.vencimiento <= limitStr) {
        vencidos.push; // wait, let's push to proximos
        const [y, m, d] = e.vencimiento.split('-');
        proximos.push({
          nombre: e.nombre_negocio,
          whatsapp: waLink,
          vencimiento: `${d}/${m}`
        });
      }
    });

    // Formatting date for output (DD/MM/YYYY)
    const [y, m, d] = todayStr.split('-');
    const formattedToday = `${d}/${m}/${y}`;

    // Construct Telegram message text in HTML
    let message = `<b>📊 REPORTE DIARIO BAZARESMX</b>\n${formattedToday}\n\n`;

    message += `<b>🔴 VENCIDOS (${vencidos.length}):</b>\n`;
    if (vencidos.length === 0) {
      message += `Sin vencidos hoy.\n`;
    } else {
      vencidos.forEach(item => {
        message += `- <b>${item.nombre}</b> (${item.whatsapp}) - <code>${item.dias} días vencido</code>\n`;
      });
    }
    message += `\n`;

    message += `<b>🟡 VENCEN MAÑANA (${vencenManana.length}):</b>\n`;
    if (vencenManana.length === 0) {
      message += `Sin vencimientos mañana.\n`;
    } else {
      vencenManana.forEach(item => {
        message += `- <b>${item.nombre}</b> (${item.whatsapp})\n`;
      });
    }
    message += `\n`;

    message += `<b>🟢 PRÓXIMOS 7 DÍAS (${proximos.length}):</b>\n`;
    if (proximos.length === 0) {
      message += `Sin vencimientos próximos.\n`;
    } else {
      proximos.forEach(item => {
        message += `- <b>${item.nombre}</b> (${item.whatsapp}) - <code>vence ${item.vencimiento}</code>\n`;
      });
    }
    message += `\n`;

    message += `👉 <b>Panel admin:</b>\nhttps://bazaresmx.com.mx/admin/vencimientos`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Error sending Telegram message:', errText);
      return NextResponse.json({ ok: false, error: 'Telegram API error: ' + errText }, { status: 500 });
    }

    return NextResponse.json({ ok: true, today: todayStr, report: { vencidos: vencidos.length, vencenManana: vencenManana.length, proximos: proximos.length } });
  } catch (err: any) {
    console.error('Unexpected error in check-vencimientos:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// Support POST requests as well (for Cron triggers)
export async function POST(req: NextRequest) {
  return GET(req);
}

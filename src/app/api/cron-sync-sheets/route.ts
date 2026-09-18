import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/src/lib/telegram';
import { logEvento } from '@/src/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const bazaresScriptUrl = process.env.BAZARES_SCRIPT_URL;
    const expositoresScriptUrl = process.env.EXPOSITORES_SCRIPT_URL;

    if (!bazaresScriptUrl || !expositoresScriptUrl) {
      throw new Error("Missing Google Apps Script Webhook URLs");
    }

    let successB = false;
    let successE = false;
    let errDetail = '';

    try {
      const resB = await fetch(bazaresScriptUrl, { method: 'POST' });
      if (!resB.ok) throw new Error("Bazares script failed: " + await resB.text());
      successB = true;
      await logEvento({ tipo: 'sync-sheets', accion: 'sync_sheets', resultado: 'exito', detalle: 'Bazares tab synced' });
    } catch (err: any) {
      errDetail += err.message + " | ";
      await logEvento({ tipo: 'sync-sheets', accion: 'sync_sheets', resultado: 'error', detalle: 'Bazares: ' + err.message });
    }

    try {
      const resE = await fetch(expositoresScriptUrl, { method: 'POST' });
      if (!resE.ok) throw new Error("Expositores script failed: " + await resE.text());
      successE = true;
      await logEvento({ tipo: 'sync-sheets', accion: 'sync_sheets', resultado: 'exito', detalle: 'Expositores tab synced' });
    } catch (err: any) {
      errDetail += err.message;
      await logEvento({ tipo: 'sync-sheets', accion: 'sync_sheets', resultado: 'error', detalle: 'Expositores: ' + err.message });
    }

    if (successB && successE) {
      await sendTelegramMessage(`📊 Sync Sheets: ✅ Bazares y Expositores sincronizados correctamente con Supabase.`);
    } else {
      await sendTelegramMessage(`🔴 Error sincronizando Sheets: ${errDetail}`);
    }

    return NextResponse.json({ ok: true, bazares: successB, expositores: successE });

  } catch (err: any) {
    console.error('Critical error in cron-sync-sheets:', err);
    await sendTelegramMessage(`🚨 CRON SYNC SHEETS FALLÓ: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

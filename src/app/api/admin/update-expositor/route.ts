import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify token
    const token = req.headers.get('x-admin-token');
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret || token !== adminSecret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ ok: false, error: 'Missing parameters' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ ok: false, error: 'Database credentials missing' }, { status: 500 });
    }

    // Initialize Supabase admin client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let updatePayload: Record<string, any> = {};

    if (action === 'activar') {
      updatePayload = { status: 'activo' };
    } else if (action === 'inactivar') {
      updatePayload = { status: 'inactivo' };
    } else if (action === 'contactado') {
      updatePayload = { ultimo_contacto: new Date().toISOString().split('T')[0] };
    } else {
      return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('expositores')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Error updating database:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Unexpected error in update-expositor:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

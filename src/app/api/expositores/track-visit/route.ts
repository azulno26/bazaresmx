import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json();
    if (!slug) {
      return NextResponse.json({ ok: false, error: 'Slug requerido' }, { status: 400 });
    }

    const scriptUrl = process.env.EXPOSITORES_SCRIPT_URL;
    if (!scriptUrl) {
      return NextResponse.json({ ok: false, error: 'EXPOSITORES_SCRIPT_URL no configurado' }, { status: 500 });
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'trackVisit', slug })
    });

    if (!response.ok) {
      throw new Error(`Apps Script responded with status ${response.status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in track-visit route:", error);
    return NextResponse.json({ ok: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

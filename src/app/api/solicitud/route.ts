import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const data = await req.json()
  
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'azulno26@hotmail.com',
      subject: `Nueva solicitud de bazar: ${data.nombre}`,
      html: `
        <h2>Nueva solicitud de publicación en BazaresMX</h2>
        <p><strong>Nombre del bazar:</strong> ${data.nombre}</p>
        <p><strong>Estado:</strong> ${data.estado}</p>
        <p><strong>Colonia:</strong> ${data.colonia}</p>
        <p><strong>Dirección:</strong> ${data.direccion}</p>
        <p><strong>Fecha inicio:</strong> ${data.fechaInicio}</p>
        <p><strong>Fecha fin:</strong> ${data.fechaFin || 'No especificada'}</p>
        <p><strong>Recurrente:</strong> ${data.recurrente ? data.frecuencia : 'No'}</p>
        <p><strong>Horario:</strong> ${data.horarioInicio} - ${data.horarioFin}</p>
        <p><strong>Descripción:</strong> ${data.descripcion}</p>
        <p><strong>WhatsApp:</strong> ${data.whatsapp}</p>
        <p><strong>Instagram:</strong> ${data.instagram || 'No especificado'}</p>
        <p><strong>Facebook:</strong> ${data.facebook || 'No especificado'}</p>
        <p><strong>Otro contacto:</strong> ${data.otroTipo} - ${data.otro || 'No especificado'}</p>
        <p><strong>Acepta expositores:</strong> ${data.aceptaExpositores}</p>
        <p><strong>Entrada:</strong> ${data.entrada}</p>
        <p><strong>Organizador:</strong> ${data.organizador}</p>
      `
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

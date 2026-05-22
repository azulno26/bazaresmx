import { google } from 'googleapis'

const SHEET_ID = '1R0WdyRPenxGsu8A9WRuzngDAgFhRYGlYguItBOkVdEk'
const RANGE = 'Bazares!A2:Z100'

export async function getBazaresFromSheets() {
  const sheets = google.sheets({ version: 'v4' })
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    key: process.env.GOOGLE_SHEETS_API_KEY,
  })

  const rows = response.data.values || []
  const today = new Date()
  today.setHours(0,0,0,0)

  return rows
    .map((row) => ({
      id: row[0] || '',
      slug: row[1] || '',
      nombre: row[2] || '',
      ciudad: row[3] || '',
      colonia: row[4] || '',
      direccion: row[5] || '',
      fecha: row[6] || '',
      fechaFin: row[7] || '',
      horario: row[8] || '',
      descripcion: row[9] || '',
      whatsapp: row[10] || '',
      instagram: row[11] || '',
      facebook: row[12] || '',
      tiktok: row[13] || '',
      acepta_expositores: row[14] === 'Sí',
      entrada: row[15] || '',
      organizador: row[16] || '',
      imagen: row[17] || '',
      imagen2: row[18] || '',
      imagen3: row[19] || '',
      imagenes: [row[17], row[18], row[19]].filter(Boolean),
      plan: row[20] || 'básico',
      activo: row[21] === '1' || row[21] === 1,
      publicado: row[22] || '',
      vencimiento: row[23] || '',
      notas: row[24] || '',
      destacado: row[20] === 'pro',
      badge: row[20] === 'pro' ? 'destacado' : '',
      tags: [],
      tipo: 'artesanal',
      recurrente: false,
    }))
    .filter((bazar) => {
      if (!bazar.activo) return false
      if (!bazar.vencimiento) return true
      const venc = new Date(bazar.vencimiento)
      return venc >= today
    })
}

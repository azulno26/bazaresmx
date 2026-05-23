import { google } from 'googleapis'

const SHEET_ID = '1R0WdyRPenxGsu8A9WRuzngDAgFhRYGlYguItBOkVdEk'
const RANGE = 'Bazares!A2:AA100'

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date(0)
  // Si tiene formato DD/M/YYYY o DD/MM/YYYY
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/')
    return new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`)
  }
  // Si tiene formato YYYY-MM-DD
  return new Date(dateStr)
}

export async function getBazaresFromSheets() {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY
  
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Bazares%21A2%3AAA100?key=${apiKey}`
  )
  
  if (!response.ok) {
    throw new Error(`Sheets API error: ${response.status}`)
  }
  
  const data = await response.json()
  const rows = (data.values || []) as string[][]
  const today = new Date()
  today.setHours(0,0,0,0)

  return rows
    .map((row: string[]) => ({
      id: row[0] || '',
      slug: row[1] || '',
      nombre: row[2] || '',
      ciudad: row[3]?.split(';')[0]?.trim() || '',
      colonia: row[4] || '',
      direccion: row[5] || '',
      colonias: row[4] ? row[4].split(';').map((s: string) => s.trim()).filter(Boolean) : [],
      direcciones: row[5] ? row[5].split(';').map((s: string) => s.trim()).filter(Boolean) : [],
      fecha: row[6] || '',
      fechaFin: row[7] || '',
      horario: row[8] || '',
      descripcion: row[9] || '',
      queEncontraras: row[10] ? row[10].split(',').map((t: string) => t.trim()) : [],
      whatsapp: row[11] || '',
      instagram: row[12] || '',
      facebook: row[13] || '',
      tiktok: row[14] || '',
      acepta_expositores: row[15] === 'Sí',
      entrada: row[16] || '',
      organizador: row[17] || '',
      imagen: row[18] || '',
      imagen2: row[19] || '',
      imagen3: row[20] || '',
      imagenes: [row[18], row[19], row[20]].filter(Boolean),
      plan: row[21] || 'básico',
      activo: row[22] === '1' || Number(row[22]) === 1,
      publicado: row[23] || '',
      vencimiento: row[24] || '',
      tags: row[25] ? row[25].split(',').map((t: string) => t.trim()) : [],
      tipo: row[26] || 'artesanal',
      destacado: row[21] === 'pro',
      badge: row[21] === 'pro' ? 'destacado' : '',
      recurrente: false,
    }))
    .filter((bazar: any) => {
      if (!bazar.activo) return false
      if (!bazar.vencimiento) return true
      const venc = parseDate(bazar.vencimiento)
      return venc >= today
    })
}

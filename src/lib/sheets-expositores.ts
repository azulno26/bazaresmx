export interface Producto {
  nombre: string;
  descripcion: string;
  precio: number;
  foto: string;
}

export interface Expositor {
  id: number;
  slug: string;
  nombreCompleto: string;
  whatsapp: string;
  correo: string;
  nombreNegocio: string;
  giro: string;
  descripcion: string;
  ciudad: string;
  disponibilidad: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  planElegido: "Básico" | "Media" | "Top";
  mesGratis: boolean;
  status: "Activo" | "Inactivo" | "Pendiente pago";
  badgeVerificado: boolean;
  fotoPerfil: string;
  fotosProductos: string[];
  productos: Producto[];
}

const SHEET_ID = '1R0WdyRPenxGsu8A9WRuzngDAgFhRYGlYguItBOkVdEk';

export async function getExpositoresTodas(): Promise<Expositor[]> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_SHEETS_API_KEY is not defined");
    return [];
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Expositores%21A2%3AAF100?key=${apiKey}`,
      { next: { revalidate: 86400 } } // Cache 24h
    );

    if (!response.ok) {
      throw new Error(`Sheets API error: ${response.status}`);
    }

    const data = await response.json();
    const rows = (data.values || []) as string[][];

    return rows
      .map((row: string[]) => {
        const id = parseInt(row[0]) || 0;
        const slug = row[1] || '';
        const nombreCompleto = row[2] || '';
        const whatsapp = row[3] || '';
        const correo = row[4] || '';
        const nombreNegocio = row[5] || '';
        const giro = row[6] || '';
        const descripcion = row[7] || '';
        const ciudad = row[8] || '';
        const disponibilidad = row[9] || '';
        const instagram = row[10] || '';
        const facebook = row[11] || '';
        const tiktok = row[12] || '';
        const planElegido = (row[13] || 'Básico') as "Básico" | "Media" | "Top";
        const mesGratis = row[14] === 'Sí';
        const status = (row[15] || 'Pendiente pago') as "Activo" | "Inactivo" | "Pendiente pago";
        const badgeVerificado = row[16] === 'Sí' || row[16] === 'VERDADERO' || row[16] === 'true';
        const fotoPerfil = row[17] || '';
        
        // Fotos de productos (pueden venir separadas por comas)
        const fotosProductosRaw = row[18] || '';
        const fotosProductos = fotosProductosRaw
          ? fotosProductosRaw.split(',').map((f: string) => f.trim()).filter(Boolean)
          : [];

        // Agrupar los 3 productos adicionales (columnas U-X, Y-AB, AC-AF)
        const productos: Producto[] = [];

        // Producto 1
        if (row[20] || row[23]) { // Nombre o Foto
          productos.push({
            nombre: row[20] || '',
            descripcion: row[21] || '',
            precio: parseFloat(row[22]) || 0,
            foto: row[23] || '',
          });
        }

        // Producto 2
        if (row[24] || row[27]) {
          productos.push({
            nombre: row[24] || '',
            descripcion: row[25] || '',
            precio: parseFloat(row[26]) || 0,
            foto: row[27] || '',
          });
        }

        // Producto 3
        if (row[28] || row[31]) {
          productos.push({
            nombre: row[28] || '',
            descripcion: row[29] || '',
            precio: parseFloat(row[30]) || 0,
            foto: row[31] || '',
          });
        }

        return {
          id,
          slug,
          nombreCompleto,
          whatsapp,
          correo,
          nombreNegocio,
          giro,
          descripcion,
          ciudad,
          disponibilidad,
          instagram,
          facebook,
          tiktok,
          planElegido,
          mesGratis,
          status,
          badgeVerificado,
          fotoPerfil,
          fotosProductos,
          productos,
        };
      })
      .filter((expositor) => {
        // Filtrar: Status = "Activo"
        return expositor.status === 'Activo';
      });
  } catch (error) {
    console.error("Error fetching expositores from sheets:", error);
    return [];
  }
}

export async function getExpositorBySlug(slug: string): Promise<Expositor | null> {
  const expositores = await getExpositoresTodas();
  const expositor = expositores.find((e) => e.slug === slug);
  return expositor || null;
}

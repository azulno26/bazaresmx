import { createClient } from '@supabase/supabase-js';
import { Producto } from '@/src/lib/sheets-expositores';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Crear el cliente de Supabase de manera segura para evitar que la compilación falle si faltan las variables de entorno
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper para parsear fechas de forma segura
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export async function getBazares() {
  if (!supabase) {
    console.error("Supabase client is not initialized. NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('bazares')
      .select('*')
      .eq('status', 'activo');

    if (error) {
      console.error("Error fetching bazares from Supabase:", error);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (data || [])
      .map((b: any) => ({
        id: b.id,
        nombre: b.nombre || '',
        slug: b.slug || '',
        descripcion: b.descripcion || '',
        ciudad: b.ciudad || '',
        colonia: b.colonia || '',
        direccion: b.direccion || '',
        colonias: b.colonia ? b.colonia.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
        direcciones: b.direccion ? b.direccion.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
        horario: b.horario || '',
        fecha: b.fecha || '',
        fechaFin: b.fecha_fin || b.fecha || '',
        organizador: b.organizador || '',
        whatsapp: b.whatsapp || '',
        instagram: b.instagram || '',
        facebook: b.facebook || '',
        tiktok: b.tiktok || '',
        acepta_expositores: !!b.acepta_expositores,
        entrada: b.entrada || 'libre',
        imagen: b.imagen_url || '',
        imagen2: b.imagen2_url || '',
        imagen3: b.imagen3_url || '',
        imagenes: [b.imagen_url, b.imagen2_url, b.imagen3_url].filter(Boolean),
        plan: b.plan || 'basico',
        activo: b.status === 'activo',
        vencimiento: b.vencimiento ? new Date(b.vencimiento) : null,
        tags: b.tags || [],
        queEncontraras: b.que_encontraras || [],
        tipo: b.tipo || 'artesanal',
        publicado: b.publicado || '',
        destacado: b.plan === 'pro',
        badge: b.plan === 'pro' ? 'destacado' : '',
        recurrente: false,
      }))
      .filter((bazar: any) => {
        if (!bazar.vencimiento) return true; // Sin fecha = siempre activo
        const venc = new Date(bazar.vencimiento);
        venc.setHours(0, 0, 0, 0);
        return venc >= today;
      })
      .sort((a: any, b: any) => {
        // Orden: pro > promo > medio > basico
        const orden: Record<string, number> = { pro: 1, promo: 2, medio: 3, basico: 4 };
        return (orden[a.plan] || 5) - (orden[b.plan] || 5);
      });
  } catch (err) {
    console.error("Critical error in getBazares:", err);
    return [];
  }
}

export async function getBazarBySlug(slug: string) {
  if (!supabase) {
    console.error("Supabase client is not initialized.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('bazares')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error(`Error fetching bazar with slug ${slug}:`, error);
      return null;
    }

    return {
      id: data.id,
      nombre: data.nombre || '',
      slug: data.slug || '',
      descripcion: data.descripcion || '',
      ciudad: data.ciudad || '',
      colonia: data.colonia || '',
      direccion: data.direccion || '',
      colonias: data.colonia ? data.colonia.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
      direcciones: data.direccion ? data.direccion.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
      horario: data.horario || '',
      fecha: data.fecha || '',
      fechaFin: data.fecha_fin || data.fecha || '',
      organizador: data.organizador || '',
      whatsapp: data.whatsapp || '',
      instagram: data.instagram || '',
      facebook: data.facebook || '',
      tiktok: data.tiktok || '',
      acepta_expositores: !!data.acepta_expositores,
      entrada: data.entrada || 'libre',
      imagen: data.imagen_url || '',
      imagen2: data.imagen2_url || '',
      imagen3: data.imagen3_url || '',
      imagenes: [data.imagen_url, data.imagen2_url, data.imagen3_url].filter(Boolean),
      plan: data.plan || 'basico',
      activo: data.status === 'activo',
      vencimiento: data.vencimiento ? new Date(data.vencimiento) : null,
      tags: data.tags || [],
      queEncontraras: data.que_encontraras || [],
      tipo: data.tipo || 'artesanal',
      publicado: data.publicado || '',
      destacado: data.plan === 'pro',
      badge: data.plan === 'pro' ? 'destacado' : '',
      recurrente: false,
    };
  } catch (err) {
    console.error(`Critical error in getBazarBySlug for slug ${slug}:`, err);
    return null;
  }
}

export async function getExpositores() {
  if (!supabase) {
    console.error("Supabase client is not initialized.");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('expositores')
      .select('*')
      .eq('status', 'activo');

    if (error) {
      console.error("Error fetching expositores from Supabase:", error);
      return [];
    }

    return (data || [])
      .map((e: any) => ({
        id: e.id,
        slug: e.slug || '',
        nombreCompleto: e.nombre_completo || '',
        whatsapp: e.whatsapp || '',
        correo: e.email || '',
        nombreNegocio: e.nombre_negocio || '',
        giro: e.giro || '',
        descripcion: e.descripcion || '',
        ciudad: e.ciudad || '',
        disponibilidad: e.disponibilidad || '',
        instagram: e.instagram || '',
        facebook: e.facebook || '',
        tiktok: e.tiktok || '',
        planElegido: (e.plan === 'media' ? 'Media' : (e.plan === 'top' ? 'Top' : 'Básico')) as "Básico" | "Media" | "Top",
        mesGratis: !!e.mes_gratis,
        status: (e.status === 'activo' ? 'Activo' : (e.status === 'inactivo' ? 'Inactivo' : 'Pendiente pago')) as "Activo" | "Inactivo" | "Pendiente pago",
        badgeVerificado: !!e.badge_verificado,
        fotoPerfil: e.foto_perfil || '',
        fotosProductos: (e.galeria_urls || []) as string[],
        vencimiento: e.vencimiento ? new Date(e.vencimiento) : null,
        productos: [] as Producto[],
        vendimiaActiva: false,
        visitas: 0,
      }))
      .sort((a: any, b: any) => {
        // Orden: top > media > básico/basico
        const orden: Record<string, number> = { top: 1, media: 2, básico: 3, basico: 3 };
        const planA = (a.planElegido || 'básico').toLowerCase();
        const planB = (b.planElegido || 'básico').toLowerCase();
        return (orden[planA] || 4) - (orden[planB] || 4);
      });
  } catch (err) {
    console.error("Critical error in getExpositores:", err);
    return [];
  }
}

export async function getExpositorBySlug(slug: string) {
  if (!supabase) {
    console.error("Supabase client is not initialized.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('expositores')
      .select('*, productos(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error(`Error fetching expositor with slug ${slug}:`, error);
      return null;
    }

    return {
      id: data.id,
      slug: data.slug || '',
      nombreCompleto: data.nombre_completo || '',
      whatsapp: data.whatsapp || '',
      correo: data.email || '',
      nombreNegocio: data.nombre_negocio || '',
      giro: data.giro || '',
      descripcion: data.descripcion || '',
      ciudad: data.ciudad || '',
      disponibilidad: data.disponibilidad || '',
      instagram: data.instagram || '',
      facebook: data.facebook || '',
      tiktok: data.tiktok || '',
      planElegido: (data.plan === 'media' ? 'Media' : (data.plan === 'top' ? 'Top' : 'Básico')) as "Básico" | "Media" | "Top",
      mesGratis: !!data.mes_gratis,
      status: (data.status === 'activo' ? 'Activo' : (data.status === 'inactivo' ? 'Inactivo' : 'Pendiente pago')) as "Activo" | "Inactivo" | "Pendiente pago",
      badgeVerificado: !!data.badge_verificado,
      fotoPerfil: data.foto_perfil || '',
      fotosProductos: (data.galeria_urls || []) as string[],
      vencimiento: data.vencimiento ? new Date(data.vencimiento) : null,
      productos: (data.productos || []).map((p: any) => ({
        nombre: p.nombre || '',
        descripcion: p.descripcion || '',
        precio: parseFloat(p.precio) || 0,
        foto: p.imagen_url || '',
      })) as Producto[],
      vendimiaActiva: false,
      visitas: 0,
    };
  } catch (err) {
    console.error(`Critical error in getExpositorBySlug for slug ${slug}:`, err);
    return null;
  }
}

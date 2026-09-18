import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Admin client to bypass RLS
const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

export interface LogEventoProps {
  tipo: 'cron-avisos' | 'portal-actualizacion' | 'sync-sheets';
  entidadTipo?: 'bazar' | 'expositor' | null;
  entidadId?: string | null;
  entidadNombre?: string | null;
  accion: 'email_enviado' | 'datos_actualizados' | 'auto_desactivado' | 'sync_sheets';
  resultado: 'exito' | 'error';
  detalle?: string | null;
}

export async function logEvento({
  tipo,
  entidadTipo = null,
  entidadId = null,
  entidadNombre = null,
  accion,
  resultado,
  detalle = null,
}: LogEventoProps) {
  if (!supabaseAdmin) {
    console.error("No Supabase Admin client available to log event", { accion, resultado, detalle });
    return;
  }

  try {
    const { error } = await supabaseAdmin.from('logs_sistema').insert([{
      tipo,
      entidad_tipo: entidadTipo,
      entidad_id: entidadId,
      entidad_nombre: entidadNombre,
      accion,
      resultado,
      detalle,
    }]);

    if (error) {
      console.error("Failed to insert log into logs_sistema:", error);
    }
  } catch (err) {
    console.error("Exception thrown while logging event:", err);
  }
}

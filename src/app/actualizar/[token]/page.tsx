import { verifyToken } from '@/src/lib/security';
import { createClient } from '@supabase/supabase-js';
import UpdateFormClient from './UpdateFormClient';

export default async function ActualizarPage({ params }: { params: { token: string } }) {
  const token = params.token;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const decoded = secret ? verifyToken(token, secret) : null;

  if (!decoded) {
    const hasSecret = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    let decodedStr = '';
    let parts: any[] = [];
    try {
      decodedStr = Buffer.from(token, 'base64url').toString('utf8');
      parts = decodedStr.split(':');
    } catch (e: any) {
      decodedStr = e.message;
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-lg text-center border-t-4 border-red-500">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Enlace Inválido</h1>
          <p className="text-gray-600 mb-6">Este enlace no es válido o ha sido modificado. Si necesitas actualizar tus datos, por favor solicita un nuevo enlace.</p>
          <a href="mailto:contacto@bazaresmx.com.mx" className="text-[#1A7A52] font-semibold hover:underline">contacto@bazaresmx.com.mx</a>
          
          <div className="text-left text-xs text-gray-500 break-all bg-gray-100 p-4 mt-6 rounded overflow-auto">
            <p className="font-bold mb-2">DEBUG INFO (Para Diego):</p>
            <p>Token original: {token}</p>
            <p>Length: {token?.length}</p>
            <p>Secret present: {hasSecret ? 'Yes' : 'No'}</p>
            <p>Decoded base64url: {decodedStr}</p>
            <p>Parts count: {parts.length}</p>
            <p>Signature extracted: {parts[3] || 'none'}</p>
          </div>
        </div>
      </div>
    );
  }

  const now = Date.now();
  if (now > decoded.exp) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-lg text-center border-t-4 border-[#E8621A]">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Enlace Expirado</h1>
          <p className="text-gray-600 mb-6">Por seguridad, los enlaces de actualización expiran después de 15 días. Por favor solicita uno nuevo.</p>
          <a href="mailto:contacto@bazaresmx.com.mx" className="text-[#1A7A52] font-semibold hover:underline">contacto@bazaresmx.com.mx</a>
        </div>
      </div>
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return <div>Error de configuración.</div>;
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const table = decoded.type === 'bazar' ? 'bazares' : 'expositores';
  const { data, error } = await supabase.from(table).select('*').eq('id', decoded.id).single();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-lg text-center border-t-4 border-red-500">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Registro no encontrado</h1>
          <p className="text-gray-600 mb-6">No pudimos encontrar tus datos en el sistema. Es posible que hayan sido eliminados o desactivados.</p>
          <a href="mailto:contacto@bazaresmx.com.mx" className="text-[#1A7A52] font-semibold hover:underline">contacto@bazaresmx.com.mx</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <img src="/images/logo-bazaresmx.png" alt="BazaresMX" className="h-12 mx-auto mb-4" />
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Portal de Autoservicio</p>
        </div>
        <UpdateFormClient token={token} tipo={decoded.type} initialData={data} />
      </div>
    </div>
  );
}

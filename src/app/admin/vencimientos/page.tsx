import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import AdminClientPage from './AdminClientPage';

export const dynamic = 'force-dynamic';

export default async function VencimientosAdminPage() {
  const cookieStore = await cookies();
  const adminSecretCookie = cookieStore.get('admin_secret')?.value;
  const adminSecret = process.env.ADMIN_SECRET;

  const isAuthenticated = adminSecret && adminSecretCookie === adminSecret;

  if (!isAuthenticated) {
    // Return a page with the login form
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-emerald-50 text-[#1A7A52] rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Panel Admin</h1>
            <p className="text-sm text-slate-500 mt-1">Ingresa el secreto de administrador para continuar</p>
          </div>
          <LoginForm adminSecret={adminSecret || ''} />
        </div>
      </div>
    );
  }

  // Fetch all expositores directly from Supabase using service role (bypass RLS)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: expositores, error } = await supabase
    .from('expositores')
    .select('id, nombre_completo, nombre_negocio, slug, whatsapp, email, plan, status, vencimiento, ultimo_contacto, notas_admin')
    .order('vencimiento', { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <div className="p-8 text-red-600 bg-red-50 rounded-xl border border-red-200">
        <h2 className="font-bold text-lg">Error al conectar con Supabase</h2>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  const clabe = process.env.NEXT_PUBLIC_CLABE || '';
  const titular = process.env.NEXT_PUBLIC_TITULAR || '';

  return (
    <AdminClientPage 
      expositores={expositores || []} 
      adminSecret={adminSecret || ''} 
      clabe={clabe}
      titular={titular}
    />
  );
}

// Simple login form rendered inline (Client component is imported via sibling or written directly below as separate file)
import LoginForm from './LoginForm';

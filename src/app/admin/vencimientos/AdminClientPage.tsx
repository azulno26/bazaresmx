'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Expositor {
  id: string;
  nombre_completo: string;
  nombre_negocio: string;
  slug: string;
  whatsapp: string;
  email: string;
  plan: string;
  status: string;
  vencimiento: string | null;
  ultimo_contacto: string | null;
  notas_admin: string | null;
}

interface AdminClientPageProps {
  expositores: Expositor[];
  adminSecret: string;
  clabe: string;
  titular: string;
}

export default function AdminClientPage({ expositores, adminSecret, clabe, titular }: AdminClientPageProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Helper to format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin fecha';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // Helper to get today's date in YYYY-MM-DD local format
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  // Get date 8 days from today (tomorrow + 7 days)
  const getLimitStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 8);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const limitStr = getLimitStr();

  // Filter groups
  const vencidos = expositores.filter(
    (e) => e.status === 'activo' && e.vencimiento && e.vencimiento <= todayStr
  );

  const proximos = expositores.filter(
    (e) => e.status === 'activo' && e.vencimiento && e.vencimiento > todayStr && e.vencimiento <= limitStr
  );

  const inactivos = expositores.filter((e) => e.status === 'inactivo');

  const todosActivos = expositores.filter(
    (e) => e.status === 'activo' && (!e.vencimiento || e.vencimiento > limitStr)
  );

  // Clean phone number for WhatsApp Link (wa.me/52[whatsapp_cleaned])
  const getWhatsAppLink = (phone: string, text: string) => {
    const cleaned = (phone || '').replace(/\D/g, '');
    const finalPhone = cleaned.length === 10 ? `52${cleaned}` : cleaned;
    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
  };

  // Prefilled WhatsApp message templates
  const getWhatsAppText = (e: Expositor, type: 'vencido' | 'proximo') => {
    const formattedVenc = formatDate(e.vencimiento);
    if (type === 'vencido') {
      return `Hola ${e.nombre_completo} 👋 Tu perfil de ${e.nombre_negocio} en BazaresMX venció el ${formattedVenc}. Para seguir apareciendo:
• Básico: $99/mes
• Media: $199/mes
• Top: $349/mes

¿Con cuál seguimos? 💚
Transfiere a CLABE: ${clabe}
Concepto: ${e.nombre_negocio} + plan
Comprobante a: contacto@bazaresmx.com.mx`;
    } else {
      return `Hola ${e.nombre_completo} 👋 Tu primer mes en BazaresMX vence el ${formattedVenc}. Para seguir:
• Básico: $99/mes
• Media: $199/mes
• Top: $349/mes

¿Continuamos? 💚
Transfiere a CLABE: ${clabe}
Concepto: ${e.nombre_negocio} + plan
Comprobante a: contacto@bazaresmx.com.mx`;
    }
  };

  // Perform API call
  const handleAction = async (id: string, action: 'activar' | 'inactivar' | 'contactado') => {
    if (action === 'inactivar') {
      const confirmed = window.confirm('¿Inactivar este expositor? Desaparecerá del sitio al instante.');
      if (!confirmed) return;
    }

    setLoadingId(`${id}-${action}`);
    try {
      const response = await fetch('/api/admin/update-expositor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminSecret,
        },
        body: JSON.stringify({ id, action }),
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(`Error: ${errData.error || 'No se pudo completar la acción'}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al servidor');
    } finally {
      setLoadingId(null);
    }
  };

  const handleLogout = () => {
    document.cookie = 'admin_secret=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.refresh();
  };

  // Render Table Component helper
  const renderTable = (list: Expositor[], type: 'vencidos' | 'proximos' | 'inactivos' | 'activos') => {
    if (list.length === 0) {
      return (
        <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
          No hay expositores en esta sección.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Negocio</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vencimiento</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Último Contacto</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estatus</th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {list.map((e) => {
              const waText = getWhatsAppText(e, type === 'vencidos' ? 'vencido' : 'proximo');
              const waUrl = getWhatsAppLink(e.whatsapp, waText);

              return (
                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{e.nombre_negocio}</span>
                      <span className="text-xs text-slate-400">{e.nombre_completo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium capitalize">
                    {e.plan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                      type === 'vencidos' 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : type === 'proximos'
                          ? 'bg-amber-50 text-amber-600 border border-amber-100'
                          : 'bg-emerald-50 text-[#1A7A52] border border-emerald-100'
                    }`}>
                      {formatDate(e.vencimiento)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {e.ultimo_contacto ? formatDate(e.ultimo_contacto) : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      e.status === 'activo' 
                        ? 'bg-emerald-100 text-[#1A7A52]' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {/* WhatsApp Action */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-[#1D9C5F] hover:bg-[#157A49] text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                    >
                      📱 WhatsApp
                    </a>

                    {/* Contacted Action */}
                    <button
                      onClick={() => handleAction(e.id, 'contactado')}
                      disabled={loadingId === `${e.id}-contactado`}
                      className="inline-flex items-center px-3 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loadingId === `${e.id}-contactado` 
                        ? '...' 
                        : e.ultimo_contacto 
                          ? `Contactado ✓ (${formatDate(e.ultimo_contacto).substring(0,5)})`
                          : '✓ Contactado'
                      }
                    </button>

                    {/* Activar / Inactivar Actions */}
                    {e.status === 'inactivo' ? (
                      <button
                        onClick={() => handleAction(e.id, 'activar')}
                        disabled={loadingId === `${e.id}-activar`}
                        className="inline-flex items-center px-3 py-1.5 bg-[#1A7A52] hover:bg-[#156141] text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loadingId === `${e.id}-activar` ? '...' : '✅ Activar'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(e.id, 'inactivar')}
                        disabled={loadingId === `${e.id}-inactivar`}
                        className="inline-flex items-center px-3 py-1.5 bg-[#E8621A] hover:bg-[#C24E12] text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loadingId === `${e.id}-inactivar` ? '...' : '❌ Inactivar'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Vencimientos de Expositores</h1>
            <p className="text-slate-500 mt-1">Panel de control de planes, contacto y estatus en BazaresMX</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.refresh()}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-800 hover:border-slate-300 font-semibold text-sm transition-all cursor-pointer"
            >
              🔄 Sincronizar
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-50 border border-rose-100 hover:border-rose-200 rounded-xl text-rose-600 hover:text-rose-700 font-semibold text-sm transition-all cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Section 1 — Vencidos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold text-slate-800">🔴 VENCIDOS Y HOY ({vencidos.length})</h2>
          </div>
          {renderTable(vencidos, 'vencidos')}
        </div>

        {/* Section 2 — Próximos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
            <h2 className="text-xl font-bold text-slate-800">🟡 PRÓXIMOS 7 DÍAS ({proximos.length})</h2>
          </div>
          {renderTable(proximos, 'proximos')}
        </div>

        {/* Section 4 — Todos Activos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <h2 className="text-xl font-bold text-slate-800">🟢 TODOS ACTIVOS ({todosActivos.length})</h2>
          </div>
          {renderTable(todosActivos, 'activos')}
        </div>

        {/* Section 3 — Inactivos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
            <h2 className="text-xl font-bold text-slate-800">❌ INACTIVOS ({inactivos.length})</h2>
          </div>
          {renderTable(inactivos, 'inactivos')}
        </div>

      </div>
    </div>
  );
}

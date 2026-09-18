'use client';

import { useState } from 'react';

interface UpdateFormClientProps {
  token: string;
  tipo: 'bazar' | 'expositor';
  initialData: any;
}

export default function UpdateFormClient({ token, tipo, initialData }: UpdateFormClientProps) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Basic Validations
    if (tipo === 'bazar') {
      if (formData.fecha && formData.fecha_fin) {
        if (new Date(formData.fecha_fin) < new Date(formData.fecha)) {
          setError('La fecha de fin no puede ser anterior a la fecha de inicio.');
          setLoading(false);
          return;
        }
      }
    }
    
    if (formData.whatsapp) {
      const waTrim = formData.whatsapp.replace(/\D/g, '');
      if (waTrim.length < 10 || waTrim.length > 13) {
        setError('El número de WhatsApp debe tener entre 10 y 13 dígitos.');
        setLoading(false);
        return;
      }
    }
    
    if (formData.descripcion && formData.descripcion.length > 1000) {
      setError('La descripción no puede exceder los 1000 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, data: formData }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Error al actualizar los datos.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-lg mx-auto border border-[#1A7A52]/20">
        <h2 className="text-2xl font-bold text-[#1A7A52] mb-4">¡Actualización Exitosa! ✅</h2>
        <p className="text-gray-600 mb-6">Hemos guardado tus cambios correctamente. Recibirás un correo de confirmación con el resumen de los datos actualizados.</p>
        <p className="text-sm text-gray-500">¿Necesitas actualizar tus fotos? Escríbenos a contacto@bazaresmx.com.mx</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Actualizar datos de tu {tipo === 'bazar' ? 'Bazar' : 'Perfil'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
          {error} <br/> <span className="font-semibold">Si el problema persiste, escríbenos a contacto@bazaresmx.com.mx</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {tipo === 'bazar' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input type="date" name="fecha" value={formData.fecha || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin (Opcional)</label>
                <input type="date" name="fecha_fin" value={formData.fecha_fin || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horario (Ej. 10:00 - 19:00)</label>
              <input type="text" name="horario" value={formData.horario || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colonia(s)</label>
                <input type="text" name="colonia" value={formData.colonia || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección exacta</label>
                <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
              </div>
            </div>
          </>
        )}

        {tipo === 'expositor' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input type="text" name="ciudad" value={formData.ciudad || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad para envíos</label>
              <input type="text" name="disponibilidad" value={formData.disponibilidad || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea 
            name="descripcion" 
            value={formData.descripcion || ''} 
            onChange={handleChange} 
            rows={5} 
            className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]"
            placeholder="Máximo 1000 caracteres..."
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input type="text" name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
            <input type="url" name="instagram" value={formData.instagram || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input type="url" name="facebook" value={formData.facebook || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
          </div>
          {tipo === 'expositor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TikTok URL</label>
              <input type="url" name="tiktok" value={formData.tiktok || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            ¿Necesitas actualizar tus fotos?<br/> 
            Escríbenos a <a href="mailto:contacto@bazaresmx.com.mx" className="text-[#E8621A] hover:underline">contacto@bazaresmx.com.mx</a>
          </p>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto bg-[#E8621A] hover:bg-[#c95112] text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

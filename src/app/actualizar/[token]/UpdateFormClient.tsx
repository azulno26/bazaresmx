'use client';

import { useState } from 'react';

interface UpdateFormClientProps {
  token: string;
  tipo: 'bazar' | 'expositor';
  initialData: any;
}

export default function UpdateFormClient({ token, tipo, initialData }: UpdateFormClientProps) {
  const [formData, setFormData] = useState(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imagen_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('El formato de la imagen debe ser JPG, PNG o WEBP.');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('El tamaño de la imagen no puede exceder los 5MB.');
        e.target.value = '';
        return;
      }
      setError(null);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
      let finalData = { ...formData };
      
      if (tipo === 'bazar' && imageFile) {
        const cloudName = "duonm6wku";
        const preset = "bmx_social";
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        uploadData.append("upload_preset", preset);
        uploadData.append("folder", "bazaresmx/bazares");

        try {
          const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: uploadData,
          });

          if (uploadRes.ok) {
            const resData = await uploadRes.json();
            finalData.imagen_url = resData.secure_url;
          } else {
            // No bloqueamos el form, pero mostramos error y seguimos
            console.error("Fallo al subir a Cloudinary:", await uploadRes.text());
          }
        } catch (err) {
          console.error("Exception uploading image:", err);
        }
      }

      const res = await fetch('/api/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, data: finalData }),
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
        {tipo === 'expositor' && (
          <p className="text-sm text-gray-500">¿Necesitas actualizar tus fotos? Escríbenos a contacto@bazaresmx.com.mx</p>
        )}
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Principal del Bazar</label>
              {imagePreview && (
                <div className="mb-3">
                  <img src={imagePreview} alt="Preview" className="h-40 w-auto rounded-lg object-cover border border-gray-200" />
                </div>
              )}
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleImageChange} 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1A7A52]/10 file:text-[#1A7A52] hover:file:bg-[#1A7A52]/20"
              />
              <p className="text-xs text-gray-500 mt-1">Máximo 5MB (JPG, PNG, WEBP). Si no subes nada, se conservará la imagen actual.</p>
            </div>
            
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del lugar o sede</label>
                <input type="text" name="colonia" value={formData.colonia || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" placeholder="Ej. Gran Sur, Plaza Coacalco, Parque Toreo" />
                <p className="text-xs text-gray-500 mt-1">Como aparece en Google Maps. Si tienes varias sedes, sepáralas con punto y coma (;)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección completa</label>
                <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} className="w-full p-2 border rounded focus:ring-[#1A7A52] focus:border-[#1A7A52]" placeholder="Ej. Periférico Sur 5550, Pedregal de Carrasco, Coyoacán, 04700 CDMX" />
                <p className="text-xs text-gray-500 mt-1">Copia la dirección completa desde Google Maps</p>
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
          <div className="text-sm text-gray-500 text-center sm:text-left">
            {tipo === 'expositor' && (
              <>
                ¿Necesitas actualizar tus fotos?<br/> 
                Escríbenos a <a href="mailto:contacto@bazaresmx.com.mx" className="text-[#E8621A] hover:underline">contacto@bazaresmx.com.mx</a>
              </>
            )}
          </div>
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

"use client";

import { useState } from "react";
import Link from "next/link";

const estadosMexico = [
  "Ciudad de México", "Estado de México", "Aguascalientes", "Baja California", "Baja California Sur",
  "Campeche", "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero",
  "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
  "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas",
  "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

export default function PublishBazarForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombreBazar: "",
    ciudad: "Ciudad de México",
    colonia: "",
    direccion: "",
    fechaInicio: "",
    fechaFin: "",
    esRecurrente: false,
    frecuencia: "",
    horarioInicio: "",
    horarioFin: "",
    descripcion: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    otraRedSocial: "",
    plataformaOtraRed: "TikTok",
    aceptaExpositores: "Sí",
    entradaLibre: "Sí",
    nombreOrganizador: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nombreBazar ||
      !formData.colonia ||
      !formData.whatsapp ||
      !formData.nombreOrganizador
    ) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombreBazar,
          estado: formData.ciudad,
          colonia: formData.colonia,
          direccion: formData.direccion,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
          recurrente: formData.esRecurrente,
          frecuencia: formData.frecuencia,
          horarioInicio: formData.horarioInicio,
          horarioFin: formData.horarioFin,
          descripcion: formData.descripcion,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram,
          facebook: formData.facebook,
          otroTipo: formData.plataformaOtraRed,
          otro: formData.otraRedSocial,
          aceptaExpositores: formData.aceptaExpositores,
          entrada: formData.entradaLibre,
          organizador: formData.nombreOrganizador,
        }),
      });

      const result = await response.json();
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError("Hubo un error, intenta de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setError("Hubo un error, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFFAF5] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-gray-100">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-syne font-extrabold text-primary mb-4">
            ¡Recibimos tu solicitud!
          </h1>
          <p className="text-lg text-gray-600 mb-8 font-medium">
            Te contactamos por WhatsApp en menos de 24 horas para finalizar la publicación de tu bazar.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:brightness-110 transition shadow-xl shadow-primary/20"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF5] pb-20">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <Link href="/" className="text-primary font-bold hover:underline mb-8 inline-block">
          ← Volver al inicio
        </Link>
        <div className="inline-flex items-center bg-[#D1F2E8] text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          Gratis al inicio
        </div>
        <h1 className="text-4xl md:text-6xl font-syne font-extrabold text-[#1a1a1a] tracking-tight mb-4">
          Publica tu bazar
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-xl leading-relaxed">
          Llena el formulario y te contactamos en menos de 24 horas para dar visibilidad a tu evento.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* FORMULARIO */}
          <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold text-center border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Nombre del Bazar */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Nombre del bazar *</label>
                  <input
                    type="text"
                    name="nombreBazar"
                    required
                    value={formData.nombreBazar}
                    onChange={handleChange}
                    className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                    placeholder="Ej. Bazar Creativo Roma"
                  />
                </div>

                {/* Estado/Ciudad */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Estado *</label>
                  <select
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition bg-white"
                  >
                    {estadosMexico.map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </div>

                {/* Colonia */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Colonia *</label>
                  <input
                    type="text"
                    name="colonia"
                    required
                    value={formData.colonia}
                    onChange={handleChange}
                    className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                    placeholder="Ej. Colonia Roma Norte"
                  />
                </div>

                {/* Dirección */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Dirección completa</label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                    placeholder="Calle, número, CP"
                  />
                </div>
              </div>

              {/* Fechas */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Fecha inicio</label>
                    <input
                      type="date"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleChange}
                      className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Fecha fin (opcional)</label>
                    <input
                      type="date"
                      name="fechaFin"
                      value={formData.fechaFin}
                      onChange={handleChange}
                      className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Para eventos de un solo día, solo llena la fecha de inicio.
                </p>

                <div className="pt-4 flex flex-col md:flex-row gap-6">
                  {/* Recurrente */}
                  <div className="flex-1 flex flex-col justify-end">
                    <label className="flex items-center gap-3 cursor-pointer select-none py-3">
                      <input
                        type="checkbox"
                        name="esRecurrente"
                        checked={formData.esRecurrente}
                        onChange={handleChange}
                        className="w-6 h-6 accent-primary"
                      />
                      <span className="text-sm font-bold text-gray-700">Es recurrente (ej. semanal)</span>
                    </label>
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    {formData.esRecurrente && (
                      <>
                        <label className="text-sm font-bold text-gray-700">¿Con qué frecuencia?</label>
                        <input
                          type="text"
                          name="frecuencia"
                          value={formData.frecuencia}
                          onChange={handleChange}
                          className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                          placeholder="Ej. Todos los domingos"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Horario inicio</label>
                    <input
                      type="time"
                      name="horarioInicio"
                      value={formData.horarioInicio}
                      onChange={handleChange}
                      className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Horario fin</label>
                    <input
                      type="time"
                      name="horarioFin"
                      value={formData.horarioFin}
                      onChange={handleChange}
                      className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700">Descripción breve</label>
                  <span className={`text-xs font-bold ${formData.descripcion.length > 300 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.descripcion.length}/300
                  </span>
                </div>
                <textarea
                  name="descripcion"
                  maxLength={300}
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition resize-none"
                  placeholder="Cuéntanos de qué trata tu bazar..."
                ></textarea>
              </div>

              {/* Contacto y Redes */}
              <div className="pt-4 border-t border-gray-50 space-y-6">
                <label className="block text-lg font-bold text-[#1a1a1a]">Contacto y redes sociales</label>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">WhatsApp de contacto *</label>
                    <input
                      type="tel"
                      name="whatsapp"
                      required
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                      placeholder="521..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Instagram (opcional)</label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                      placeholder="@tuusuario"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Facebook (opcional)</label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                      placeholder="@tupagina"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Otro (opcional)</label>
                    <div className="flex gap-2">
                      <select
                        name="plataformaOtraRed"
                        value={formData.plataformaOtraRed}
                        onChange={handleChange}
                        className="w-1/3 border-2 border-gray-100 rounded-xl px-2 py-3 focus:border-primary outline-none transition bg-white text-sm"
                      >
                        <option value="TikTok">TikTok</option>
                        <option value="Twitter/X">Twitter/X</option>
                        <option value="Sitio web">Sitio web</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <input
                        type="text"
                        name="otraRedSocial"
                        value={formData.otraRedSocial}
                        onChange={handleChange}
                        className="w-2/3 border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                        placeholder="Usuario o enlace"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-gray-50">
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-bold text-gray-700">¿Aceptas expositores?</label>
                  <div className="flex gap-6">
                    {["Sí", "No"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="aceptaExpositores"
                          value={opt}
                          checked={formData.aceptaExpositores === opt}
                          onChange={handleChange}
                          className="w-5 h-5 accent-primary"
                        />
                        <span className="font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-sm font-bold text-gray-700">¿Entrada libre?</label>
                  <div className="flex flex-wrap gap-6">
                    {["Sí", "No", "Costo"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="entradaLibre"
                          value={opt}
                          checked={formData.entradaLibre === opt}
                          onChange={handleChange}
                          className="w-5 h-5 accent-primary"
                        />
                        <span className="font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                <label className="text-sm font-bold text-gray-700">Nombre del organizador *</label>
                <input
                  type="text"
                  name="nombreOrganizador"
                  required
                  value={formData.nombreOrganizador}
                  onChange={handleChange}
                  className="border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-primary outline-none transition"
                  placeholder="Tu nombre completo"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-primary text-white py-5 rounded-2xl font-extrabold text-xl transition shadow-xl shadow-primary/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110'}`}
              >
                {loading ? "Enviando solicitud..." : "Enviar solicitud"}
              </button>
            </form>
          </div>

          {/* COLUMNA DERECHA (INFO) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-primary p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <h3 className="text-2xl font-bold mb-8 relative z-10 tracking-tight">¿Qué incluye tu publicación?</h3>
              <ul className="space-y-5 relative z-10">
                {[
                  "Página propia con URL única",
                  "Aparece en el directorio de BazaresMX",
                  "Indexado en Google",
                  "Botón directo a tu WhatsApp",
                  "Link a tu Instagram",
                  "Gratis durante el lanzamiento"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-yellow-brand font-bold">✓</span>
                    <span className="font-medium text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-12 pt-8 border-t border-white/10 relative z-10">
                <p className="text-white/70 text-sm mb-4">¿Dudas? Escríbenos</p>
                <a 
                  href="https://wa.me/5215623194635" 
                  className="inline-flex items-center gap-2 font-bold hover:text-yellow-brand transition"
                >
                  <span className="text-xl">💬</span>
                  Soporte por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

type ExpositoresClientProps = {
  initialSpotsLeft: number;
};

interface ProductoForm {
  nombre: string;
  descripcion: string;
  precio: string;
  foto: string;
}

export default function ExpositoresClient({ initialSpotsLeft }: ExpositoresClientProps) {
  const formRef = useRef<HTMLDivElement>(null);
  
  // State for progressive form
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Cloudinary upload states
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingProd, setUploadingProd] = useState<Record<number, boolean>>({});

  // Form fields state
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    whatsapp: "",
    correo: "",
    nombreNegocio: "",
    giro: "",
    descripcion: "",
    ciudad: "",
    disponibilidad: [] as string[],
    instagram: "",
    facebook: "",
    tiktok: "",
    planElegido: "" as "Básico" | "Media" | "Top" | "",
    fotoPerfil: "",
  });

  // Dynamic products state (up to 3, only for Media/Top)
  const [productos, setProductos] = useState<ProductoForm[]>([
    { nombre: "", descripcion: "", precio: "", foto: "" },
    { nombre: "", descripcion: "", precio: "", foto: "" },
    { nombre: "", descripcion: "", precio: "", foto: "" },
  ]);

  const spotsLeft = initialSpotsLeft;

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Direct Unsigned Cloudinary Upload
  const handleCloudinaryUpload = async (
    file: File,
    type: "profile" | number
  ) => {
    const cloudName = "duonm6wku";
    const preset = "bmx_social";
    
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", preset);

    if (type === "profile") {
      setUploadingProfile(true);
    } else {
      setUploadingProd((prev) => ({ ...prev, [type]: true }));
    }

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        throw new Error("Fallo al subir imagen a Cloudinary");
      }

      const resData = await res.json();
      const imageUrl = resData.secure_url;

      if (type === "profile") {
        setFormData((prev) => ({ ...prev, fotoPerfil: imageUrl }));
      } else {
        setProductos((prev) => {
          const updated = [...prev];
          updated[type].foto = imageUrl;
          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      alert("Hubo un error al subir la imagen. Intenta de nuevo.");
    } finally {
      if (type === "profile") {
        setUploadingProfile(false);
      } else {
        setUploadingProd((prev) => ({ ...prev, [type]: false }));
      }
    }
  };

  // Step Navigations & Valdation
  const nextStep = () => {
    if (step === 1) {
      if (!formData.nombreCompleto || !formData.whatsapp || !formData.correo) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
      }
    } else if (step === 2) {
      if (!formData.nombreNegocio || !formData.giro || !formData.descripcion) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
      }
    } else if (step === 3) {
      if (!formData.ciudad || formData.disponibilidad.length === 0) {
        alert("Por favor completa tu ubicación y selecciona al menos una disponibilidad.");
        return;
      }
    } else if (step === 5) {
      if (!formData.planElegido) {
        alert("Por favor selecciona un plan.");
        return;
      }
    }
    
    // Skip Paso 6 (Vendimia) directly to Submit if Básico plan is selected
    if (step === 5 && formData.planElegido === "Básico") {
      setStep(7);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step === 7 && formData.planElegido === "Básico") {
      setStep(5);
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const handleCheckboxChange = (val: string) => {
    setFormData((prev) => {
      const active = prev.disponibilidad.includes(val)
        ? prev.disponibilidad.filter((d) => d !== val)
        : [...prev.disponibilidad, val];
      return { ...prev, disponibilidad: active };
    });
  };

  const handleProductChange = (idx: number, field: keyof ProductoForm, val: string) => {
    setProductos((prev) => {
      const updated = [...prev];
      updated[idx][field] = val;
      return updated;
    });
  };

  // Final Form Submit Action
  const handleSubmit = async () => {
    setErrorMsg("");
    setSubmitting(true);

    // Filter valid filled products only (skip empty rows)
    const validProducts = productos
      .filter((p) => p.nombre && p.precio)
      .map((p) => ({
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: parseFloat(p.precio) || 0,
        foto: p.foto,
      }));

    const payload = {
      ...formData,
      disponibilidad: formData.disponibilidad.join(", "),
      productos: validProducts,
    };

    try {
      const res = await fetch("/api/expositores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (resData.ok) {
        setSuccess(true);
      } else {
        setErrorMsg(resData.error || "Hubo un error en el envío. Intenta de nuevo.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error inesperado al enviar los datos.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* NAVBAR */}
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <Link href="/" className="text-2xl font-title font-extrabold text-[#1a1a1a] tracking-tight">
            Bazares<span className="text-accent">MX</span>
          </Link>
          <Link href="/" className="text-[#1A7A52] font-bold hover:underline">
            Ver Directorio
          </Link>
        </div>
      </nav>

      {/* SECCIÓN 1: HERO */}
      <section className="relative px-6 pt-20 pb-28 md:pt-28 md:pb-36 bg-gradient-to-b from-[#EBF7F2] to-[#FFFAF5] text-center overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex bg-[#D1F2E8] text-[#1A7A52] px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider mb-6">
            Para Emprendedores
          </span>
          <h1 className="font-syne font-extrabold text-5xl md:text-7xl tracking-tighter leading-none text-[#1a1a1a] mb-6">
            Lleva tu emprendimiento a los <span className="text-[#1A7A52]">mejores bazares</span> de México
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium">
            Publica tu perfil, muestra tus productos y deja que los organizadores te encuentren. Sin intermediarios ni comisiones.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto bg-[#1A7A52] text-white px-10 py-5 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-xl shadow-[#1A7A52]/20 cursor-pointer"
            >
              Regístrate gratis
            </button>
            <Link
              href="#planes"
              className="w-full sm:w-auto border-3 border-[#1A7A52] text-[#1A7A52] px-10 py-5 rounded-2xl font-extrabold text-lg hover:bg-[#1A7A52]/5 transition text-center"
            >
              Ver Planes
            </Link>
          </div>
          
          {/* Placeholder de Video Animado */}
          <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-neutral-200/60 rounded-[2.5rem] shadow-2xl relative flex items-center justify-center border border-neutral-300/40 backdrop-blur-sm overflow-hidden select-none">
            <div className="text-center p-6">
              <span className="text-5xl block mb-2">📹</span>
              <p className="font-bold text-gray-500">Video explicativo animado</p>
              <p className="text-xs text-gray-400 mt-1">Descubre cómo potenciar tu marca con BazaresMX</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: CÓMO FUNCIONA */}
      <section className="py-28 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-20">
          <span className="text-[#1A7A52] font-black tracking-widest uppercase text-sm">El Proceso</span>
          <h2 className="text-4xl md:text-5xl font-syne font-extrabold mt-4 tracking-tight text-[#1a1a1a]">
            ¿Cómo funciona para ti?
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "1️⃣", title: "Publicas tu perfil", desc: "Registra tu negocio, tu giro comercial, la ciudad de operación y sube fotos de tus mejores productos." },
            { step: "2️⃣", title: "Te encuentran", desc: "Los organizadores de bazares filtran la base de datos de expositores por giro y ciudad buscando marcas afines." },
            { step: "3️⃣", title: "Te invitan a su bazar", desc: "Te contactan directamente a tu WhatsApp para ofrecerte espacios en sus próximos eventos sin intermediarios." }
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-neutral-100/50 hover:shadow-2xl hover:shadow-neutral-200/40 transition-all duration-300">
              <div className="text-5xl mb-6">{item.step}</div>
              <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">{item.title}</h3>
              <p className="text-gray-500 text-base leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: PLANES */}
      <section id="planes" className="bg-[#EBF7F2] py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[#1A7A52] font-black tracking-widest uppercase text-sm">Planes de Suscripción</span>
            <h2 className="text-4xl md:text-5xl font-syne font-extrabold mt-4 tracking-tight text-[#1a1a1a]">
              Encuentra el plan perfecto para tu marca
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "Básico",
                price: "$99",
                desc: "Ideal para iniciar en el directorio.",
                features: ["Perfil público listado", "1 foto de perfil", "Enlace a tus redes sociales", "Contacto directo de organizadores"],
                badge: ""
              },
              {
                title: "Media",
                price: "$199",
                desc: "Recomendado para marcas activas.",
                features: ["Apareces prioritario en búsquedas", "Catálogo dinámico", "Hasta 5 fotos en galería", "Muestra tus 3 productos destacados", "Soporte vía correo"],
                badge: "POPULAR"
              },
              {
                title: "Top",
                price: "$349",
                desc: "Para marcas que quieren brillar.",
                features: ["Posicionamiento VIP destacado", "Sello de 'Expositor Verificado'", "Hasta 20 fotos en galería", "Estadísticas de visualizaciones", "WhatsApp de soporte prioritario"],
                badge: "MEJOR VALOR"
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`bg-white rounded-[2.5rem] p-10 border ${
                  plan.badge ? "border-[#1A7A52] relative shadow-2xl scale-105 z-10" : "border-gray-100 shadow-xl"
                } flex flex-col justify-between`}
              >
                <div>
                  {plan.badge && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 font-medium">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-extrabold text-[#1a1a1a]">{plan.price}</span>
                    <span className="text-gray-500 font-bold">/ mes</span>
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                        <span className="text-emerald-500 font-bold text-lg">✓</span>
                        <span className="text-sm">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, planElegido: plan.title as any }));
                    scrollToForm();
                  }}
                  className={`w-full py-4 rounded-2xl mt-10 font-bold text-center transition cursor-pointer ${
                    plan.badge
                      ? "bg-[#1A7A52] text-white hover:brightness-110 shadow-lg shadow-[#1A7A52]/20"
                      : "bg-[#1A7A52]/10 text-[#1A7A52] hover:bg-[#1A7A52]/15"
                  }`}
                >
                  Elegir {plan.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: PRIMEROS 10 GRATIS */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto bg-[#F5E6D3] rounded-[3rem] p-8 md:p-12 text-center border border-amber-900/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-800/5 rounded-full -mr-12 -mt-12"></div>
          <span className="bg-accent text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg mb-6 inline-block">
            OFERTA LIMITADA
          </span>
          <h2 className="font-syne font-extrabold text-3xl md:text-4xl text-gray-900 mb-4 leading-tight">
            ¡Los primeros 10 expositores tienen su PRIMER MES GRATIS!
          </h2>
          <p className="text-gray-700 font-medium text-lg mb-8 leading-relaxed">
            Elige el plan que quieras (Básico, Media o Top). Tu primer mes de suscripción corre por nuestra cuenta.
          </p>
          
          {/* Contador y barra visual */}
          <div className="max-w-sm mx-auto mb-4">
            <div className="flex justify-between font-bold text-gray-900 mb-2 text-sm">
              <span>{spotsLeft} lugares disponibles</span>
              <span>10 en total</span>
            </div>
            <div className="w-full bg-white/60 h-4 rounded-full overflow-hidden p-0.5 border border-amber-950/10">
              <div 
                className="bg-accent h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${(spotsLeft / 10) * 100}%` }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-amber-900/60 font-bold">
            *Válido únicamente para los primeros 10 expositores activos registrados.
          </p>
        </div>
      </section>

      {/* SECCIÓN 5: FORMULARIO PROGRESIVO */}
      <section ref={formRef} className="py-20 px-6 max-w-4xl mx-auto w-full scroll-mt-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:p-12 relative overflow-hidden">
          
          {success ? (
            <div className="text-center py-12">
              <span className="text-7xl block mb-6">🎉</span>
              <h2 className="font-syne font-black text-4xl text-gray-900 mb-4">
                ¡Registro Recibido con Éxito!
              </h2>
              <p className="text-xl text-gray-600 max-w-lg mx-auto mb-10 font-medium leading-relaxed">
                ¡Muchísimas gracias por registrarte! Hemos recibido la información de <strong>{formData.nombreNegocio}</strong>.
              </p>
              <div className="bg-[#EBF7F2] p-6 rounded-2xl max-w-md mx-auto mb-10 border border-[#1A7A52]/10 text-[#1A7A52] font-semibold text-lg">
                📱 Pronto nos pondremos en contacto contigo vía WhatsApp para finalizar la activación de tu perfil público.
              </div>
              <p className="text-gray-500 font-bold mb-6">
                Síguenos en Instagram para enterarte de eventos y novedades:
              </p>
              <a
                href="https://www.instagram.com/bazaresmx.com.mx/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-accent text-white px-8 py-4 rounded-full font-black text-lg shadow-lg hover:brightness-110 transition"
              >
                Síguenos en @bazaresmx.com.mx
              </a>
            </div>
          ) : (
            <>
              {/* Header formulario */}
              <div className="mb-10 text-center">
                <span className="text-[#1A7A52] text-xs font-black uppercase tracking-widest bg-[#EBF7F2] px-3.5 py-1.5 rounded-full">
                  Paso {step === 7 ? 6 : step} de {formData.planElegido === "Básico" ? 5 : 6}
                </span>
                <h3 className="font-syne font-extrabold text-3xl text-gray-900 mt-4 tracking-tight">
                  {step === 1 && "Identificación"}
                  {step === 2 && "Sobre tu Negocio"}
                  {step === 3 && "Ubicación y Disponibilidad"}
                  {step === 4 && "Tus Redes Sociales"}
                  {step === 5 && "Elige tu Plan"}
                  {step === 6 && "Productos Destacados"}
                  {step === 7 && "Revisión Final"}
                </h3>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-6 overflow-hidden">
                  <div
                    className="bg-[#1A7A52] h-full transition-all duration-300"
                    style={{
                      width: `${
                        formData.planElegido === "Básico"
                          ? ((step === 7 ? 5 : step) / 5) * 100
                          : (step / 6) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 font-bold mb-6 text-sm">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* PASOS DEL FORMULARIO */}
              <div className="space-y-6">
                
                {/* PASO 1: IDENTIFICACIÓN */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-800 font-bold mb-2 text-base">Nombre completo *</label>
                      <input
                        type="text"
                        placeholder="Ej: Sofía García"
                        value={formData.nombreCompleto}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nombreCompleto: e.target.value }))}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 font-bold mb-2 text-base">WhatsApp *</label>
                      <input
                        type="tel"
                        placeholder="Ej: 5512345678"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp: e.target.value }))}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 font-bold mb-2 text-base">Correo electrónico *</label>
                      <input
                        type="email"
                        placeholder="Ej: sofia@marca.com"
                        value={formData.correo}
                        onChange={(e) => setFormData((prev) => ({ ...prev, correo: e.target.value }))}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40"
                      />
                    </div>
                  </div>
                )}

                {/* PASO 2: TU NEGOCIO */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-800 font-bold mb-2 text-base">Nombre de tu marca/negocio *</label>
                      <input
                        type="text"
                        placeholder="Ej: Amore Mío Joyería"
                        value={formData.nombreNegocio}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nombreNegocio: e.target.value }))}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 font-bold mb-2 text-base">Giro del negocio *</label>
                      <select
                        value={formData.giro}
                        onChange={(e) => setFormData((prev) => ({ ...prev, giro: e.target.value }))}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40 bg-white"
                      >
                        <option value="">Selecciona un giro comercial</option>
                        <option value="Joyería">Joyería & Accesorios</option>
                        <option value="Ropa">Ropa & Moda</option>
                        <option value="Comida">Comida & Postres</option>
                        <option value="Cosméticos">Cosmética natural & Maquillaje</option>
                        <option value="Plantas">Plantas & Macetas</option>
                        <option value="Manualidades">Arte & Decoración</option>
                        <option value="Otro">Otro giro</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="block text-gray-800 font-bold text-base">Descripción de tu marca *</label>
                        <span className="text-xs text-gray-400 font-bold mt-1">
                          {formData.descripcion.length} / 150 caracteres
                        </span>
                      </div>
                      <textarea
                        maxLength={150}
                        placeholder="Cuéntanos brevemente qué vendes y qué hace especial a tu marca..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                        rows={4}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* PASO 3: UBICACIÓN Y DISPONIBILIDAD */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-800 font-bold mb-2 text-base">Ciudad/Zona donde vendes *</label>
                      <input
                        type="text"
                        placeholder="Ej: CDMX y Área Metropolitana, o Guadalajara"
                        value={formData.ciudad}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ciudad: e.target.value }))}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 font-bold mb-4 text-base">¿En qué días tienes disponibilidad para exponer? *</label>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {["Fines de semana", "Entre semana", "Ambos"].map((d) => {
                          const isSelected = formData.disponibilidad.includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => handleCheckboxChange(d)}
                              className={`p-4 rounded-xl border-2 font-bold transition text-center cursor-pointer text-sm sm:text-base ${
                                isSelected
                                  ? "border-[#1A7A52] bg-[#EBF7F2] text-[#1A7A52]"
                                  : "border-gray-100 bg-[#FFFAF5]/40 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {isSelected ? "✓ " : ""} {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* PASO 4: REDES SOCIALES */}
                {step === 4 && (
                  <div className="space-y-6">
                    <p className="text-gray-400 font-semibold text-sm">
                      ⚠️ Estos campos son opcionales, pero altamente recomendados para mejorar la confianza de los organizadores.
                    </p>
                    <div>
                      <label className="block text-gray-800 font-bold mb-2 text-base">Instagram</label>
                      <input
                        type="text"
                        placeholder="Ej: @tu_marca o link"
                        value={formData.instagram}
                        onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 font-bold mb-2 text-base">Facebook</label>
                      <input
                        type="text"
                        placeholder="Ej: fb.com/tu_pagina"
                        value={formData.facebook}
                        onChange={(e) => setFormData((prev) => ({ ...prev, facebook: e.target.value }))}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 font-bold mb-2 text-base">TikTok</label>
                      <input
                        type="text"
                        placeholder="Ej: @tu_marca"
                        value={formData.tiktok}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tiktok: e.target.value }))}
                        className="w-full border-2 border-gray-100 rounded-xl px-5 py-4 focus:border-[#1A7A52] outline-none transition text-lg bg-[#FFFAF5]/40"
                      />
                    </div>
                  </div>
                )}

                {/* PASO 5: ELIGE TU PLAN */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {["Básico", "Media", "Top"].map((p) => {
                        const isSelected = formData.planElegido === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, planElegido: p as any }))}
                            className={`p-6 rounded-2xl border-2 font-bold transition text-left cursor-pointer flex justify-between items-center ${
                              isSelected
                                ? "border-[#1A7A52] bg-[#EBF7F2] text-[#1A7A52] shadow-md"
                                : "border-gray-100 bg-[#FFFAF5]/40 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <div>
                              <div className="text-xl font-extrabold flex items-center gap-2">
                                {p === "Básico" && "🥉 Plan Básico ($99)"}
                                {p === "Media" && "🥈 Plan Media ($199)"}
                                {p === "Top" && "🥇 Plan Top ($349)"}
                                {isSelected && <span className="text-sm bg-[#1A7A52] text-white px-2 py-0.5 rounded-md font-black">ELEGIDO</span>}
                              </div>
                              <p className="text-xs text-gray-400 mt-1 font-medium">
                                {p === "Básico" && "Perfil público listado con 1 imagen."}
                                {p === "Media" && "Aparición prioritario en búsquedas, catálogo de hasta 3 productos y 5 fotos de galería."}
                                {p === "Top" && "Posicionamiento VIP prioritario en la cima de búsquedas, catálogo de 3 productos, 20 fotos de galería y sello verificado."}
                              </p>
                            </div>
                            <span className="text-2xl">{isSelected ? "💚" : "⚪"}</span>
                          </button>
                        );
                      })}
                    </div>
                    {spotsLeft > 0 && (
                      <div className="bg-[#FFF3EC] p-5 rounded-2xl border border-amber-500/10 text-accent font-black text-center text-base">
                        🎉 ¡Felicidades! Calificas para tu PRIMER MES GRATIS.
                      </div>
                    )}
                  </div>
                )}

                {/* PASO 6: VENDIMIA (Solo si Plan = Media o Top) */}
                {step === 6 && (
                  <div className="space-y-8">
                    <div className="bg-[#EBF7F2] p-5 rounded-2xl border border-[#1A7A52]/10 text-sm font-semibold text-[#1A7A52]">
                      🛍️ ¡Tu plan incluye Catálogo de productos! Agrega hasta 3 de tus mejores productos para atraer organizadores.
                    </div>
                    
                    {/* Subir foto de perfil comercial */}
                    <div className="border-b border-gray-100 pb-6 mb-6">
                      <label className="block text-gray-800 font-bold mb-3 text-base">Foto de Perfil Comercial / Logo *</label>
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 relative bg-neutral-100 border rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                          {formData.fotoPerfil ? (
                            <Image src={formData.fotoPerfil} alt="Perfil" fill className="object-cover" />
                          ) : (
                            <span className="text-3xl">📸</span>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCloudinaryUpload(file, "profile");
                            }}
                            className="hidden"
                            id="profile-upload"
                          />
                          <label
                            htmlFor="profile-upload"
                            className="inline-flex bg-[#1A7A52]/10 text-[#1A7A52] px-5 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-[#1A7A52]/15 transition text-sm"
                          >
                            {uploadingProfile ? "Subiendo..." : "Subir Foto"}
                          </label>
                          <p className="text-xs text-gray-400 mt-2 font-medium">Recomendado: Proporción 1:1 (cuadrada)</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-10">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="bg-neutral-50/50 border border-neutral-200/50 rounded-3xl p-6 relative">
                          <span className="absolute top-4 right-6 bg-neutral-200/80 text-neutral-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                            Producto {idx + 1}
                          </span>
                          <h4 className="font-syne font-extrabold text-xl text-gray-900 mb-5 tracking-tight">Detalles</h4>
                          
                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-2 space-y-4">
                              <div>
                                <label className="block text-gray-700 text-xs font-black uppercase mb-1">Nombre</label>
                                <input
                                  type="text"
                                  placeholder="Ej: Anillo de Plata 925"
                                  value={productos[idx].nombre}
                                  onChange={(e) => handleProductChange(idx, "nombre", e.target.value)}
                                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-base focus:border-[#1A7A52] outline-none transition bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-gray-700 text-xs font-black uppercase mb-1">Precio ($ MXN)</label>
                                <input
                                  type="number"
                                  placeholder="Ej: 350"
                                  value={productos[idx].precio}
                                  onChange={(e) => handleProductChange(idx, "precio", e.target.value)}
                                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-base focus:border-[#1A7A52] outline-none transition bg-white"
                                />
                              </div>
                            </div>
                            
                            <div className="sm:col-span-1 flex flex-col items-center justify-center">
                              <div className="w-24 h-24 relative bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center mb-3">
                                {productos[idx].foto ? (
                                  <Image src={productos[idx].foto} alt="Producto" fill className="object-cover" />
                                ) : (
                                  <span className="text-3xl">🛍️</span>
                                )}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleCloudinaryUpload(file, idx);
                                }}
                                className="hidden"
                                id={`product-upload-${idx}`}
                              />
                              <label
                                htmlFor={`product-upload-${idx}`}
                                className="inline-flex bg-neutral-200 text-neutral-700 px-4 py-2 rounded-xl font-bold cursor-pointer hover:bg-neutral-300 transition text-xs"
                              >
                                {uploadingProd[idx] ? "Subiendo..." : "Símbolo Foto"}
                              </label>
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-gray-700 text-xs font-black uppercase mb-1">Descripción</label>
                            <textarea
                              placeholder="Ej: Hecho a mano, incluye estuche de regalo."
                              value={productos[idx].descripcion}
                              onChange={(e) => handleProductChange(idx, "descripcion", e.target.value)}
                              rows={2}
                              className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-base focus:border-[#1A7A52] outline-none transition bg-white"
                            ></textarea>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PASO 7: REVISIÓN */}
                {step === 7 && (
                  <div className="space-y-6">
                    <p className="text-gray-400 font-semibold text-sm text-center">
                      🔬 Por favor revisa que tus datos sean correctos antes de confirmar el registro.
                    </p>
                    <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-200/50 space-y-4">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-400 font-bold text-sm">Emprendedor:</span>
                        <span className="text-gray-800 font-extrabold">{formData.nombreCompleto}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-400 font-bold text-sm">Negocio:</span>
                        <span className="text-gray-800 font-extrabold">{formData.nombreNegocio}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-400 font-bold text-sm">Giro:</span>
                        <span className="text-gray-800 font-extrabold">{formData.giro}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-400 font-bold text-sm">WhatsApp:</span>
                        <span className="text-gray-800 font-extrabold">{formData.whatsapp}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-400 font-bold text-sm">Plan Elegido:</span>
                        <span className="text-gray-800 font-extrabold text-[#1A7A52]">{formData.planElegido}</span>
                      </div>
                      {spotsLeft > 0 && (
                        <div className="flex justify-between text-accent font-extrabold">
                          <span>Oferta Aplicada:</span>
                          <span>🎁 1er Mes GRATIS</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de navegación del formulario */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={submitting}
                    className="bg-neutral-100 text-neutral-600 px-6 py-4 rounded-xl font-bold cursor-pointer hover:bg-neutral-200 transition text-sm sm:text-base disabled:opacity-50"
                  >
                    ← Atrás
                  </button>
                ) : (
                  <div></div>
                )}

                {step < (formData.planElegido === "Básico" ? 5 : 7) ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-[#1A7A52] text-white px-8 py-4 rounded-xl font-bold cursor-pointer hover:brightness-110 transition text-sm sm:text-base"
                  >
                    Continuar →
                  </button>
                ) : step === 5 && formData.planElegido === "Básico" ? (
                  <button
                    type="button"
                    onClick={() => setStep(7)}
                    className="bg-[#1A7A52] text-white px-8 py-4 rounded-xl font-bold cursor-pointer hover:brightness-110 transition text-sm sm:text-base"
                  >
                    Revisión →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-[#1A7A52] text-white px-10 py-5 rounded-2xl font-extrabold text-lg hover:brightness-110 transition shadow-xl shadow-[#1A7A52]/20 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Procesando..." : "Registrarme ahora"}
                  </button>
                )}
              </div>
              
              {step === (formData.planElegido === "Básico" ? 5 : 7) && (
                <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                  Al registrarte, aceptas nuestros términos de servicio y políticas de uso.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDisponibilidad } from "@/src/lib/formatters";

interface Expositor {
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
  fotoPerfil: string;
  badgeVerificado: boolean;
}

type ExpositoresDirectoryClientProps = {
  expositoresData: Expositor[];
};

export default function ExpositoresDirectoryClient({ expositoresData }: ExpositoresDirectoryClientProps) {
  const [search, setSearch] = useState("");
  const [giroFilter, setGiroFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  // Extract unique filter items
  const giros = useMemo(() => Array.from(new Set(expositoresData.map((e) => e.giro).filter(Boolean))), [expositoresData]);
  const cities = useMemo(() => {
    const states = expositoresData.map((e) => {
      const parts = e.ciudad.split(",");
      return parts[0].trim();
    }).filter(Boolean);
    return Array.from(new Set(states));
  }, [expositoresData]);

  // Filtering & Sorting Logic
  const filteredExpositores = useMemo(() => {
    const res = expositoresData.filter((exp) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        exp.nombreNegocio.toLowerCase().includes(q) ||
        exp.giro.toLowerCase().includes(q) ||
        exp.descripcion.toLowerCase().includes(q) ||
        exp.ciudad.toLowerCase().includes(q);
      const matchesGiro = giroFilter === "" || exp.giro === giroFilter;
      const matchesCity = cityFilter === "" || exp.ciudad.startsWith(cityFilter);

      return matchesSearch && matchesGiro && matchesCity;
    });

    // Plan sorting priority: Top -> Media -> Básico
    const planPriority: Record<string, number> = { Top: 1, Media: 2, Básico: 3 };
    return res.sort((a, b) => (planPriority[a.planElegido] || 4) - (planPriority[b.planElegido] || 4));
  }, [expositoresData, search, giroFilter, cityFilter]);

  const resetFilters = () => {
    setSearch("");
    setGiroFilter("");
    setCityFilter("");
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* NAVBAR */}
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/" className="text-xl sm:text-2xl font-title font-extrabold text-[#1a1a1a] tracking-tight">
            Bazares<span className="text-accent">MX</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/expositores" className="text-gray-600 hover:text-primary transition font-bold text-xs sm:text-base whitespace-nowrap">
              Vitrina Destacados
            </Link>
            <Link 
              href="/expositores/registro"
              className="bg-[#1A7A52] text-white px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold hover:brightness-110 transition text-xs sm:text-base shadow-md shadow-[#1A7A52]/20 whitespace-nowrap"
            >
              Publicar mi Perfil
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/expositores" className="text-[#1A7A52] font-bold hover:underline mb-6 inline-block">
            ← Volver a expositores
          </Link>
          <h1 className="text-4xl md:text-5xl font-syne font-extrabold text-[#1a1a1a] tracking-tight mb-2">
            Directorio de Expositores
          </h1>
          <p className="text-xl text-gray-500 font-medium mb-4">
            Encuentra marcas creativas y emprendimientos para tus eventos
          </p>
          <div className="inline-block bg-[#D1F2E8] text-[#1A7A52] px-4 py-1 rounded-full text-sm font-bold">
            {filteredExpositores.length} expositores encontrados
          </div>
        </div>
      </header>

      {/* FILTROS (STICKY) */}
      <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-center">
          {/* Búsqueda */}
          <div className="w-full lg:flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, giro, productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#1A7A52] outline-none transition"
            />
          </div>

          {/* Giro */}
          <select
            value={giroFilter}
            onChange={(e) => setGiroFilter(e.target.value)}
            className="w-full lg:w-48 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#1A7A52] outline-none transition bg-white text-gray-600 font-medium"
          >
            <option value="">Todos los giros</option>
            {giros.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Ciudad */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full lg:w-48 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-[#1A7A52] outline-none transition bg-white text-gray-600 font-medium"
          >
            <option value="">Todas las ciudades</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Limpiar */}
          <button
            onClick={resetFilters}
            className="w-full lg:w-auto text-accent font-bold hover:underline px-4 py-2"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* GRID DE RESULTADOS */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {filteredExpositores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExpositores.map((exp) => {
              const isBasic = exp.planElegido === "Básico";
              
              const CardContent = (
                <div 
                  className={`bg-white rounded-[2.5rem] overflow-hidden border ${
                    exp.planElegido === "Top" 
                      ? "border-[#1A7A52] shadow-2xl relative" 
                      : "border-gray-100 shadow-xl"
                  } hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full`}
                >
                  <div>
                    {/* Imagen de Perfil (Solo si no es Básico, o mostramos logo si tiene) */}
                    <div className="relative w-full aspect-square overflow-hidden bg-neutral-50 border-b border-gray-100">
                      {exp.fotoPerfil ? (
                        <Image
                          src={exp.fotoPerfil}
                          alt={exp.nombreNegocio}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-6xl">
                          📸
                        </div>
                      )}
                      
                      {/* Badges de Plan y Verificado */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {exp.planElegido === "Top" && (
                          <span className="bg-[#0B5E43] text-white px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                            ⭐ Destacado
                          </span>
                        )}
                        {exp.badgeVerificado && (
                          <span className="bg-blue-600 text-white px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                            ✓ Verificado
                          </span>
                        )}
                        <span className="bg-white/90 backdrop-blur-md text-[#1A7A52] px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                          Plan {exp.planElegido}
                        </span>
                      </div>
                    </div>

                    {/* Contenido Ficha */}
                    <div className="p-8">
                      <span className="bg-[#1A7A52]/10 text-[#1A7A52] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        {exp.giro}
                      </span>
                      <h3 className="text-2xl font-bold mt-5 mb-3 text-gray-900 leading-tight">
                        {exp.nombreNegocio}
                      </h3>
                      <p className="text-gray-500 font-medium text-sm line-clamp-3 leading-relaxed mb-4">
                        {exp.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* Footer de Tarjeta */}
                  <div className="px-8 pb-8 pt-0 flex flex-col gap-3 border-t border-gray-50 mt-auto">
                    <div className="flex flex-col gap-1.5 pt-4 text-xs font-bold text-gray-400">
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        <span className="truncate">{exp.ciudad}</span>
                      </div>
                      <div className="flex items-center gap-1 text-neutral-600">
                        <span>📅</span>
                        <span>Expone: <span className="text-[#1A7A52] font-black">{formatDisponibilidad(exp.disponibilidad)}</span></span>
                      </div>
                    </div>

                    {/* Acciones del Plan */}
                    {isBasic ? (
                      <div className="space-y-3 pt-2">
                        {/* Enlaces a redes si el básico las tiene */}
                        <div className="flex gap-3 justify-center">
                          {exp.instagram && (
                            <a
                              href={exp.instagram.startsWith("http") ? exp.instagram : `https://instagram.com/${exp.instagram.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-gray-400 hover:text-[#E1306C] transition"
                            >
                              Instagram
                            </a>
                          )}
                          {exp.facebook && (
                            <a
                              href={exp.facebook.startsWith("http") ? exp.facebook : `https://facebook.com/${exp.facebook.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-gray-400 hover:text-[#1877F2] transition"
                            >
                              Facebook
                            </a>
                          )}
                        </div>
                        <a
                          href={`https://wa.me/${exp.whatsapp}?text=Hola%20${encodeURIComponent(exp.nombreNegocio)},%20vi%20tu%20perfil%20en%20el%20directorio%20de%20BazaresMX%20y%20me%20gustar%C3%ADa%20invitarte%20a%20nuestro%20bazar.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full bg-[#1A7A52] text-white py-3 rounded-xl font-bold text-center block text-sm hover:brightness-110 transition shadow-md shadow-[#1A7A52]/10"
                        >
                          Contactar WhatsApp
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-gray-400 text-xs font-bold">Catálogo Disponible</span>
                        <span className="text-[#1A7A52] font-black text-sm group-hover:underline flex items-center gap-1">
                          Ver Catálogo →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );

              return isBasic ? (
                <div key={exp.id}>{CardContent}</div>
              ) : (
                <Link key={exp.id} href={`/expositores/${exp.slug}`} className="group">
                  {CardContent}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <span className="text-5xl block mb-4">🔍</span>
            <h3 className="font-syne font-extrabold text-2xl text-gray-800">No se encontraron resultados</h3>
            <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto">
              Prueba limpiando los filtros o realizando otra búsqueda de palabras clave.
            </p>
            <button
              onClick={resetFilters}
              className="bg-[#1A7A52] text-white px-8 py-3 rounded-xl font-bold mt-6 hover:brightness-110 transition cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

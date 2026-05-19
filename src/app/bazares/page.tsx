"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import bazaresData from "@/src/data/bazares.json";

export default function BazaresDirectory() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [freeEntryOnly, setFreeEntryOnly] = useState(false);
  const [acceptsExhibitorsOnly, setAcceptsExhibitorsOnly] = useState(false);

  // Extract unique values for filters
  const cities = useMemo(() => Array.from(new Set(bazaresData.map((b) => b.ciudad))), []);
  const types = useMemo(() => Array.from(new Set(bazaresData.map((b) => b.tipo))), []);

  // Filtering logic
  const filteredBazares = useMemo(() => {
    return bazaresData.filter((bazar) => {
      const matchesSearch = bazar.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === "" || bazar.ciudad === cityFilter;
      const matchesType = typeFilter === "" || bazar.tipo === typeFilter;
      const matchesFreeEntry = !freeEntryOnly || bazar.entrada === "libre";
      const matchesExhibitors = !acceptsExhibitorsOnly || bazar.acepta_expositores;

      return matchesSearch && matchesCity && matchesType && matchesFreeEntry && matchesExhibitors;
    });
  }, [search, cityFilter, typeFilter, freeEntryOnly, acceptsExhibitorsOnly]);

  const resetFilters = () => {
    setSearch("");
    setCityFilter("");
    setTypeFilter("");
    setFreeEntryOnly(false);
    setAcceptsExhibitorsOnly(false);
  };

  const formatDate = (bazar: any) => {
    if ("fechas" in bazar && Array.isArray(bazar.fechas)) {
      return bazar.fechas.map((f: string) => new Date(f + "T00:00:00").toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
      })).join(" · ");
    }
    return new Date(bazar.fecha + "T00:00:00").toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-primary font-bold hover:underline mb-6 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl md:text-5xl font-syne font-extrabold text-[#1a1a1a] tracking-tight mb-2">
            Todos los bazares
          </h1>
          <p className="text-xl text-gray-500 font-medium mb-4">
            Encuentra el bazar perfecto para ti
          </p>
          <div className="inline-block bg-[#D1F2E8] text-primary px-4 py-1 rounded-full text-sm font-bold">
            {filteredBazares.length} bazares encontrados
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
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-primary outline-none transition"
            />
          </div>

          {/* Ciudad */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full lg:w-48 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-primary outline-none transition bg-white"
          >
            <option value="">Todas las ciudades</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full lg:w-48 border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-primary outline-none transition bg-white"
          >
            <option value="">Todos los tipos</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={freeEntryOnly}
                onChange={(e) => setFreeEntryOnly(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-bold text-gray-700">Entrada libre</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptsExhibitorsOnly}
                onChange={(e) => setAcceptsExhibitorsOnly(e.target.checked)}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-bold text-gray-700">Acepta expositores</span>
            </label>
          </div>

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
        {filteredBazares.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBazares.map((bazar) => (
              <Link key={bazar.id} href={`/bazares/${bazar.slug}`}>
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-accent/5 hover:shadow-accent/10 transition-all duration-300 transform hover:-translate-y-1 group h-full flex flex-col">
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={bazar.imagen}
                      alt={bazar.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-700"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-md text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                        {bazar.tipo}
                      </span>
                      {(bazar as any).recurrente && (
                        <span className="bg-yellow-brand text-[#1a1a1a] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                          Semanal
                        </span>
                      )}
                    </div>
                    {bazar.entrada === "libre" && (
                      <div className="absolute bottom-4 right-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                          Entrada Libre
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition">
                        {bazar.nombre}
                      </h3>
                      {bazar.acepta_expositores && (
                        <span className="text-green-600 text-xl" title="Acepta expositores">✓</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 text-gray-500 font-medium text-sm mb-6 flex-1">
                      <span className="flex items-center gap-2">📍 {bazar.ciudad}, {bazar.colonia}</span>
                      <span className="flex items-center gap-2">📅 {formatDate(bazar)}</span>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-primary font-bold text-sm">Ver detalles →</span>
                      <span className="text-gray-400 text-xs font-bold uppercase">{bazar.horario}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              No encontramos bazares con esos filtros
            </h2>
            <p className="text-gray-500 text-lg">
              Prueba ajustando tu búsqueda o limpia los filtros para ver todos los resultados.
            </p>
            <button
              onClick={resetFilters}
              className="mt-8 bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:brightness-110 transition shadow-xl shadow-primary/20"
            >
              Ver todos los bazares
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

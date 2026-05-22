"use client";

import { useState } from "react";
import Image from "next/image";

type BazarCarruselProps = {
  imagenes: string[];
  nombre: string;
  tipo: string;
};

export default function BazarCarrusel({ imagenes, nombre, tipo }: BazarCarruselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-80 rounded-[2rem] overflow-hidden shadow-2xl mb-10 group">
      {/* Images container */}
      <div className="relative w-full h-full">
        {imagenes.map((img, idx) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={img}
              alt={`${nombre} - ${idx + 1}`}
              fill
              className="object-cover w-full h-full"
              priority={idx === 0}
            />
          </div>
        ))}
      </div>

      {/* Tipo Badge */}
      <div className="absolute top-6 left-6 z-20">
        <span className="bg-accent text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
          {tipo}
        </span>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-md transition duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center"
        aria-label="Imagen anterior"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-md transition duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center"
        aria-label="Siguiente imagen"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {imagenes.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "bg-white scale-125 shadow" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

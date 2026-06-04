import Link from "next/link";
import Image from "next/image";

function formatBazarDate(bazar: any) {
  if (!bazar.fecha) return "";
  const fInicio = new Date(bazar.fecha + "T00:00:00");
  const hasFechaFin = bazar.fechaFin && bazar.fechaFin !== "";
  
  if (hasFechaFin && bazar.fechaFin !== bazar.fecha) {
    const fFin = new Date(bazar.fechaFin + "T00:00:00");
    const dInicio = fInicio.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
    const dFin = fFin.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
    return `${dInicio} - ${dFin}`;
  }
  
  return fInicio.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface BazarCardProps {
  bazar: {
    id: string | number;
    nombre: string;
    ciudad: string;
    colonia?: string;
    colonias?: string[];
    fecha: string;
    fechaFin?: string;
    descripcion: string;
    slug: string;
    plan?: string;
    tipo?: string;
    imagen?: string;
  };
}

export default function BazarCard({ bazar }: BazarCardProps) {
  const isPremium = bazar.plan === "pro" || bazar.plan === "medio" || bazar.plan === "promo";
  
  return (
    <Link href={`/bazares/${bazar.slug}`} className="group block h-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between h-full">
        <div>
          {/* Image Header with Fallback */}
          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white">
            {bazar.imagen && bazar.imagen !== "" ? (
              <Image 
                src={bazar.imagen} 
                alt={bazar.nombre} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span className="text-lg font-bold text-center p-4">
                🎪 {bazar.nombre}
              </span>
            )}
            {isPremium && (
              <span className="absolute top-4 left-4 bg-green-50 text-[#1A7A52] text-xs font-semibold px-3 py-1 rounded-lg shadow-sm z-10">
                🏆 Destacado
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Tag for Tipo */}
            {bazar.tipo && (
              <span className="bg-[#1A7A52]/10 text-[#1A7A52] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md inline-block mb-3">
                {bazar.tipo}
              </span>
            )}

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#1A7A52] transition-colors">
              {bazar.nombre}
            </h3>

            {/* Location & Date */}
            <div className="text-xs text-gray-500 font-semibold mb-3 space-y-1">
              <p className="flex items-center gap-1.5">
                <span>📍</span> 
                <span>
                  {bazar.ciudad}
                  {bazar.colonia ? `, ${bazar.colonia}` : (bazar.colonias && bazar.colonias.length > 0 ? `, ${bazar.colonias[0]}` : "")}
                </span>
              </p>
              <p className="flex items-center gap-1.5">
                <span>📅</span> 
                <span>{formatBazarDate(bazar)}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
              {bazar.descripcion}
            </p>
          </div>
        </div>

        {/* CTA Button at Bottom */}
        <div className="px-5 pb-5">
          <span className="block w-full py-2.5 bg-[#1A7A52] text-white font-semibold text-sm rounded-lg hover:bg-[#156a46] transition-colors text-center shadow-sm hover:shadow">
            Ver detalles
          </span>
        </div>
      </div>
    </Link>
  );
}

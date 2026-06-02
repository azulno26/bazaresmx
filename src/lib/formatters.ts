/**
 * Formatea visualmente la disponibilidad de los expositores de forma que sea clara y atractiva para los visitantes.
 */
export function formatDisponibilidad(disp: string | undefined | null): string {
  if (!disp) return "No especificada";
  
  const cleanDisp = disp.trim();
  
  if (cleanDisp.toLowerCase() === "ambos") {
    return "Entre semana y fines de semana";
  }
  
  const parts = cleanDisp.split(",").map(p => p.trim().toLowerCase());
  
  const hasFines = parts.some(p => p.includes("fines"));
  const hasEntre = parts.some(p => p.includes("entre"));
  const hasAmbos = parts.some(p => p.includes("ambos"));
  
  if (hasAmbos || (hasFines && hasEntre)) {
    return "Entre semana y fines de semana";
  }
  
  return cleanDisp;
}

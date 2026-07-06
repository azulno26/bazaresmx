export function getPlanDisplayName(plan: string): string {
  if (!plan) return '';
  const normalized = plan.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const names: Record<string, string> = {
    basico: 'Presencia',
    media: 'Catálogo',
    top: 'Mi Tienda',
  };
  return names[normalized] || plan;
}

export function getPlanPrice(plan: string): string {
  if (!plan) return '';
  const normalized = plan.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const prices: Record<string, string> = {
    basico: '$99/mes',
    media: '$199/mes',
    top: '$349/mes',
  };
  return prices[normalized] || '';
}

export function getPlanInternalName(plan: string): string {
  if (!plan) return 'basico';
  const normalized = plan.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (normalized === 'presencia' || normalized === 'basico') {
    return 'basico';
  }
  if (normalized === 'catalogo' || normalized === 'media') {
    return 'media';
  }
  if (normalized === 'mi tienda' || normalized === 'mitienda' || normalized === 'top') {
    return 'top';
  }
  return 'basico';
}

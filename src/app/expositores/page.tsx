import { getExpositores } from "@/src/lib/supabase";
import { Expositor } from "@/src/lib/sheets-expositores";
import ExpositoresIndexClient from "./ExpositoresIndexClient";

export const revalidate = 60; // Cache 60s

export default async function Page() {
  let expositores: Expositor[] = [];
  let featuredExpositores: Expositor[] = [];

  try {
    expositores = await getExpositores();
    
    // Solo destacados (Plan = Top) activos para la vitrina Top 10
    featuredExpositores = expositores
      .filter((e) => e.planElegido === "Top" && e.status === "Activo")
      .slice(0, 10);
      
    // Todos para la nueva sección (ordenados por getExpositores: prioridad > plan, etc), limitamos a 12
    expositores = expositores.slice(0, 12);
  } catch (err) {
    console.error("Error loading exhibitors:", err);
  }

  return <ExpositoresIndexClient featuredExpositores={featuredExpositores} allExpositores={expositores} />;
}

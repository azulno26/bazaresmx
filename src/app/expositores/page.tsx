import { getExpositores } from "@/src/lib/supabase";
import { Expositor } from "@/src/lib/sheets-expositores";
import ExpositoresIndexClient from "./ExpositoresIndexClient";

export const revalidate = 60; // Cache 60s

export default async function Page() {
  let featuredExpositores: Expositor[] = [];

  try {
    const expositores = await getExpositores();
    // Only featured (Plan = Top) active exhibitors, capped at 10 (Top 10)
    featuredExpositores = expositores
      .filter((e) => e.planElegido === "Top" && e.status === "Activo")
      .slice(0, 10);
  } catch (err) {
    console.error("Error loading featured exhibitors:", err);
  }

  return <ExpositoresIndexClient featuredExpositores={featuredExpositores} />;
}

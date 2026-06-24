import { getExpositores } from "@/src/lib/supabase";
import ExpositoresRegistroClient from "./ExpositoresRegistroClient";

export const revalidate = 60;

export default async function Page() {
  let spotsLeft = 11;
  
  try {
    const expositores = await getExpositores();
    // Count active exhibitors who have the free month flag
    const activeUnderEleven = expositores.filter(
      (e: any) => e.status === 'Activo' && e.mesGratis
    ).length;
    spotsLeft = Math.max(0, 11 - activeUnderEleven);
  } catch (err) {
    console.error("Error calculating free spots:", err);
  }

  return <ExpositoresRegistroClient initialSpotsLeft={spotsLeft} />;
}


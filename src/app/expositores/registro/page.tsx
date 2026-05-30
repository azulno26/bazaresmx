import { getExpositoresTodas } from "@/src/lib/sheets-expositores";
import ExpositoresRegistroClient from "./ExpositoresRegistroClient";

export const revalidate = 86400; // Cache 24h

export default async function Page() {
  let spotsLeft = 11;
  
  try {
    const expositores = await getExpositoresTodas();
    // Count active exhibitors with ID <= 11
    const activeUnderEleven = expositores.filter(
      (e) => e.status === 'Activo' && e.id <= 11
    ).length;
    spotsLeft = Math.max(0, 11 - activeUnderEleven);
  } catch (err) {
    console.error("Error calculating free spots:", err);
  }

  return <ExpositoresRegistroClient initialSpotsLeft={spotsLeft} />;
}

import { getExpositoresTodas } from "@/src/lib/sheets-expositores";
import ExpositoresClient from "./ExpositoresClient";

export const revalidate = 86400; // Cache 24h

export default async function Page() {
  let spotsLeft = 10;
  
  try {
    const expositores = await getExpositoresTodas();
    // Count active exhibitors with ID <= 10 (since they qualify for free month)
    const activeUnderTen = expositores.filter(
      (e) => e.status === 'Activo' && e.id <= 10
    ).length;
    spotsLeft = Math.max(0, 10 - activeUnderTen);
  } catch (err) {
    console.error("Error calculating free spots:", err);
  }

  return <ExpositoresClient initialSpotsLeft={spotsLeft} />;
}

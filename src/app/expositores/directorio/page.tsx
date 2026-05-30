import { getExpositoresTodas, Expositor } from "@/src/lib/sheets-expositores";
import ExpositoresDirectoryClient from "./ExpositoresDirectoryClient";

export const revalidate = 86400; // Cache 24h

export default async function Page() {
  let expositores: Expositor[] = [];

  try {
    expositores = await getExpositoresTodas();
  } catch (err) {
    console.error("Error loading exhibitors directory:", err);
  }

  return <ExpositoresDirectoryClient expositoresData={expositores} />;
}

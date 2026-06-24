import { getExpositores } from "@/src/lib/supabase";
import ExpositoresDirectoryClient from "./ExpositoresDirectoryClient";

export const revalidate = 60;

export default async function Page() {
  let expositores: any[] = [];

  try {
    expositores = await getExpositores();
  } catch (err) {
    console.error("Error loading exhibitors directory:", err);
  }

  return <ExpositoresDirectoryClient expositoresData={expositores} />;
}


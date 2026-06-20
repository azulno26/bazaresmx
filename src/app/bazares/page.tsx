import { getBazares } from "@/src/lib/supabase";
import BazaresDirectoryClient from "./BazaresDirectoryClient";

export const revalidate = 86400;

export default async function Page() {
  const bazares = await getBazares();
  return <BazaresDirectoryClient bazaresData={bazares} />;
}

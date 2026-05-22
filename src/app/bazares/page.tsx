import { getBazaresFromSheets } from "@/src/lib/sheets";
import BazaresDirectoryClient from "./BazaresDirectoryClient";

export const revalidate = 0;

export default async function Page() {
  const bazares = await getBazaresFromSheets();
  return <BazaresDirectoryClient bazaresData={bazares} />;
}

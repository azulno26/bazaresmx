import ExpositoresRegistroClient from "./ExpositoresRegistroClient";

export const revalidate = 60;

export default function Page() {
  return <ExpositoresRegistroClient initialSpotsLeft={0} />;
}



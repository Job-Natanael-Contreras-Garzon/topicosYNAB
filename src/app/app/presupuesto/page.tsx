import { redirect } from "next/navigation";
import { currentMonth } from "@/lib/months";

export default function PresupuestoIndex() {
  redirect(`/app/presupuesto/${currentMonth()}`);
}

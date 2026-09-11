import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "La mia Card | CalcettoXP",
  description: "La tua carriera calcetto: crescita, record e statistiche.",
};

export default function StatsRedirectPage() {
  redirect("/dashboard");
}

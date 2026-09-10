import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PageContainer from "@/components/layout/PageContainer";
import RegisterMatchForm from "@/components/matches/RegisterMatchForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Registra partita | CalcettoXP",
  description: "Registra una nuova partita nella tua carriera CalcettoXP.",
  robots: { index: false, follow: false },
};

export default async function NewMatchPage() {
  const session = await auth();
  if (!session?.user?.userId) redirect("/signin");

  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.user.userId },
    select: { id: true, primaryRole: true, secondaryRole: true, nickname: true },
  });

  if (!player) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col bg-bgPrimary">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-bgCard/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4 md:px-6">
          <Link
            href="/matches"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-textPrimary hover:bg-white/10 transition"
            aria-label="Torna alle partite"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-black text-textPrimary">
              Registra partita
            </h1>
            <p className="truncate text-xs text-textMuted">
              {player.nickname} · Massimo 2 partite al giorno
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <PageContainer className="pb-32">
          <RegisterMatchForm defaultRole={player.primaryRole} />
        </PageContainer>
      </main>

      <MobileBottomNav />
    </div>
  );
}

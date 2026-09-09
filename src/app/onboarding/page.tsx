import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Crea la tua carta | CalcettoXP",
  description: "Configura il tuo profilo CalcettoXP.",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.userId) {
    redirect("/signin");
  }

  let profileExists = false;
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const existing = await prisma.playerProfile.findUnique({
      where: { userId: session.user.userId },
      select: { id: true },
    });
    profileExists = !!existing;
  } catch {
    profileExists = false;
  }

  if (profileExists) {
    redirect("/dashboard");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#070A08",
        paddingBottom: "2rem",
      }}
    >
      <OnboardingWizard />
    </main>
  );
}

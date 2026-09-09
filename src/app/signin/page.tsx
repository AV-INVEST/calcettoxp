import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Accedi | CalcettoXP",
  description: "Accedi a CalcettoXP con il tuo account Google.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main className="pitch-wrapper min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="relative w-full">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-greenElectric via-greenPrimary to-greenElectric/30 opacity-40 blur-2xl" />
          <div className="relative rounded-3xl bg-gradient-to-br from-bgSecondary/90 to-bgCard/90 backdrop-blur-sm border border-greenPrimary/15 calcetto-shadow-green p-8 sm:p-10">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center shadow-lg shadow-greenElectric/20">
                    <Zap className="w-5.5 h-5.5 text-bgPrimary" strokeWidth={3} />
                  </div>
                  <span className="font-bold text-greenElectric text-3xl tracking-tight">
                    CalcettoXP
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <h1 className="text-textPrimary text-2xl font-bold tracking-tight text-center">
                    Benvenuto in CalcettoXP
                  </h1>
                  <p className="text-textMuted text-sm text-center leading-relaxed max-w-xs">
                    Accedi per iniziare a costruire la tua carriera calcistica
                  </p>
                </div>
              </div>

              <div className="w-full pt-2">
                <GoogleSignInButton />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 pt-2">
                <Link
                  href="/termini"
                  className="text-xs text-textMuted hover:text-greenElectric transition-colors duration-200"
                >
                  Termini
                </Link>
                <span className="w-1 h-1 rounded-full bg-greenElectric/40" />
                <Link
                  href="/privacy"
                  className="text-xs text-textMuted hover:text-greenElectric transition-colors duration-200"
                >
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

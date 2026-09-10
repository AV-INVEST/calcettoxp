"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import CxpLogo from "@/../assets/LOGOCXP.jpg";

const HIDDEN_PATHS = ["/signin", "/onboarding"];

export default function AppHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [signOutLoading, setSignOutLoading] = useState(false);

  if (HIDDEN_PATHS.some(p => pathname === p || pathname?.startsWith(p + "/"))) {
    return null;
  }

  const isAuthenticated = status === "authenticated" && !!session?.user?.userId;

  const handleSignOut = async () => {
    if (signOutLoading) return;
    setSignOutLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      setSignOutLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-80 w-full bg-bgPrimary/70 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Home"
          title="Home"
          className="group inline-flex items-center gap-2 -ml-2 pl-2 pr-3 py-2 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenElectric/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimary"
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-greenElectric/15 to-greenPrimary/10 border border-greenElectric/20 flex items-center justify-center shadow-md shadow-greenElectric/10 transition-transform duration-200 group-hover:scale-[1.03]">
            <Image
              src={CxpLogo}
              alt="CalcettoXP"
              width={28}
              height={28}
              style={{ width: "28px", height: "28px", display: "block", objectFit: "cover" }}
              priority
            />
          </div>
          <span className="font-black text-greenElectric text-xl tracking-tight transition-all duration-200 group-hover:text-greenElectric/90">
            CalcettoXP
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          {status === "loading" ? (
            <div className="inline-flex h-10 items-center gap-2 px-4 rounded-xl border border-white/10 bg-bgCard text-textMuted text-sm font-bold">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Caricamento…</span>
            </div>
          ) : isAuthenticated ? (
            <>
              <Link href="/profile" aria-label="Profilo" title="Profilo">
                <Button
                  variant="secondary"
                  size="md"
                  className="!gap-2 !px-3 md:!px-4"
                  onClick={() => {}}
                >
                  <User size={16} strokeWidth={2.2} />
                  <span className="hidden md:inline">PROFILO</span>
                </Button>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signOutLoading}
                aria-label="Esci dall'account"
                title="Esci"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-bgCard text-textMuted transition-all hover:border-danger/30 hover:bg-danger/8 hover:text-danger active:scale-[0.97] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimary"
              >
                <LogOut
                  className={
                    signOutLoading ? "h-[17px] w-[17px] animate-spin" : "h-[17px] w-[17px]"
                  }
                  strokeWidth={2.2}
                />
              </button>
            </>
          ) : (
            <Link href="/signin" aria-label="Accedi" title="Accedi">
              <Button
                variant="secondary"
                size="md"
                className="!gap-2"
                onClick={() => {}}
              >
                <Image
                  src={CxpLogo}
                  alt=""
                  width={16}
                  height={16}
                  style={{ width: "16px", height: "16px", display: "block", objectFit: "cover", borderRadius: "4px" }}
                />
                <span>ACCEDI</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

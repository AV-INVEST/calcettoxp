"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  X, Play, HelpCircle, TrendingUp, Trophy, Crown,
  ScrollText, LogIn, LayoutDashboard, ClipboardList,
  BarChart3, Settings, LogOut, UserCircle, Zap,
} from "lucide-react";

type IconType = React.ComponentType<any>;

interface MenuItem {
  key: string;
  label: string;
  Icon: IconType;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

function lockBody() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  if (body.dataset.mobileMenuLocked) return;
  const scrollY = window.scrollY;
  body.style.top = `-${scrollY}px`;
  body.classList.add("body-locked", "body-locked-ios");
  html.dataset.scrollY = String(scrollY);
  body.dataset.mobileMenuLocked = "1";
}

function unlockBody() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  if (!body.dataset.mobileMenuLocked) return;
  const scrollY = Number(html.dataset.scrollY || "0");
  body.classList.remove("body-locked", "body-locked-ios");
  body.style.top = "";
  delete body.dataset.mobileMenuLocked;
  if (scrollY) window.scrollTo(0, scrollY);
  delete html.dataset.scrollY;
}

function MobileHeaderInner() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      unlockBody();
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSheet(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const openSheet = useCallback(() => {
    lockBody();
    setClosing(false);
    setOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setClosing(true);
    unlockBody();
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 220);
  }, []);

  const go = useCallback((href: string) => {
    closeSheet();
    window.setTimeout(() => router.push(href), 110);
  }, [router, closeSheet]);

  const scrollTo = useCallback((id: string) => {
    closeSheet();
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 110);
  }, [closeSheet]);

  const isAuthenticated = mounted && status === "authenticated" && !!session?.user?.userId;

  const guestItems: MenuItem[] = [
    { key: "inizia", label: "GIOCA ORA", Icon: Play, variant: "primary",
      onClick: () => go("/signin") },
    { key: "come-funziona", label: "COME FUNZIONA", Icon: HelpCircle,
      onClick: () => scrollTo("come-funziona") },
    { key: "carriera", label: "LA TUA CARRIERA", Icon: TrendingUp,
      onClick: () => scrollTo("career-index") },
    { key: "trofei", label: "TROFEI", Icon: Trophy,
      onClick: () => scrollTo("trofei") },
    { key: "pro", label: "CALCETTOXP PRO", Icon: Crown, variant: "secondary",
      onClick: () => scrollTo("pricing") },
    { key: "regole", label: "REGOLE", Icon: ScrollText,
      onClick: () => scrollTo("come-funziona") },
    { key: "accedi", label: "ACCEDI CON GOOGLE", Icon: LogIn, variant: "secondary",
      onClick: () => go("/signin") },
  ];

  const loggedItems: MenuItem[] = [
    { key: "dashboard", label: "DASHBOARD", Icon: LayoutDashboard, variant: "primary",
      onClick: () => go("/dashboard") },
    { key: "registra", label: "REGISTRA PARTITA", Icon: ClipboardList,
      onClick: () => go("/matches/new") },
    { key: "stats", label: "STATISTICHE", Icon: BarChart3,
      onClick: () => go("/stats") },
    { key: "profilo", label: "PROFILO", Icon: UserCircle,
      onClick: () => go("/profile") },
    { key: "settings", label: "IMPOSTAZIONI", Icon: Settings,
      onClick: () => go("/settings") },
    { key: "pro", label: "PASSAGGIO A PRO", Icon: Crown, variant: "secondary",
      onClick: () => scrollTo("pricing") },
    { key: "logout", label: "ESCI", Icon: LogOut, variant: "danger",
      onClick: () => {
        closeSheet();
        window.setTimeout(() => signOut({ callbackUrl: "/" }), 110);
      } },
  ];

  const items = isAuthenticated ? loggedItems : guestItems;

  return (
    <>
      {/* Compact sticky header bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-[80] pointer-events-none">
        <div className="safe-top pointer-events-auto bg-bgPrimary/90 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center shadow-[0_0_0_1px_rgba(124,255,107,0.25),0_2px_10px_rgba(124,255,107,0.18)]">
                <Zap className="w-3.5 h-3.5 text-bgPrimary" strokeWidth={3} />
              </div>
              <span className="font-black text-greenElectric text-[15px] tracking-tight leading-none">
                CalcettoXP
              </span>
            </div>
            <button
              type="button"
              onClick={openSheet}
              aria-label="Apri menu"
              className="relative w-9 h-9 rounded-xl bg-bgCard border border-greenElectric/20 flex items-center justify-center active:scale-[0.96] transition-all hover:border-greenElectric/40 hover:bg-greenElectric/5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
            >
              {mounted && isAuthenticated && session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profilo"
                  suppressHydrationWarning
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-greenElectric/30"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-[18px] h-[18px] text-greenElectric"
                >
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Offset spacer for fixed header */}
      <div className="md:hidden h-[52px] safe-top" aria-hidden />

      {/* Bottom Sheet overlay */}
      {open && mounted && (
        <div
          className="fixed inset-0 z-[200] isolate"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigazione"
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/90 backdrop-blur-sm ${
              closing ? "animate-fade-out" : "animate-fade-in"
            }`}
            onClick={closeSheet}
            aria-hidden
          />

          {/* Sheet */}
          <div className="absolute inset-x-0 bottom-0">
            <div
              className={`pointer-events-auto mx-auto w-full max-w-md bg-bgCard relative overflow-hidden rounded-t-3xl border-t border-x ${
                closing ? "animate-sheet-down" : "animate-sheet-up"
              }`}
              style={{
                borderColor: isAuthenticated
                  ? "rgba(124,255,107,0.22)"
                  : "rgba(124,255,107,0.20)",
                boxShadow:
                  "0 -4px 0 rgba(124, 255, 107, 0.20), 0 -24px 64px rgba(0,0,0,0.9), 0 0 0 1px rgba(124,255,107,0.08)",
                paddingBottom: "max(env(safe-area-inset-bottom), 14px)",
              }}
            >
              {/* Top hairline accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-greenElectric/45 to-transparent z-10 pointer-events-none" />

              {/* Drag handle + close */}
              <div className="relative px-4 pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-white/15 mx-auto" aria-hidden />
                <div className="flex items-center justify-end mt-1">
                  <button
                    type="button"
                    onClick={closeSheet}
                    aria-label="Chiudi menu"
                    className="w-8 h-8 rounded-lg bg-bgSecondary/80 border border-white/8 flex items-center justify-center active:scale-[0.96] transition-transform hover:bg-bgSecondary shrink-0 z-10"
                  >
                    <X className="w-4 h-4 text-textMuted" strokeWidth={2.4} />
                  </button>
                </div>
              </div>

              {/* User info bar when authenticated */}
              {isAuthenticated && (
                <div className="px-4 pt-1 pb-2">
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-greenElectric/10 via-greenPrimary/5 to-transparent border border-greenElectric/15 px-3 py-2.5">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-greenElectric/30 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center shrink-0">
                        <UserCircle className="w-[18px] h-[18px] text-greenElectric" strokeWidth={2.2} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-textPrimary font-black text-[13px] tracking-tight truncate leading-tight">
                        {session?.user?.name || "Giocatore"}
                      </div>
                      <div className="text-textMuted text-[10.5px] font-semibold tracking-wide truncate">
                        Sessione attiva
                      </div>
                    </div>
                    <div className="shrink-0 px-2 py-0.5 rounded-md bg-greenElectric/12 border border-greenElectric/25 text-greenElectric text-[9px] font-black tracking-[0.18em]">
                      ONLINE
                    </div>
                  </div>
                </div>
              )}

              {/* Menu list */}
              <div
                className="px-3 pb-2 pt-1 overflow-y-auto overscroll-contain"
                style={{
                  maxHeight: "min(calc(100dvh - 160px), 520px)",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <ul className="space-y-1.5">
                  {items.map((item) => {
                    const { Icon, label, variant = undefined } = item;
                    const baseRow =
                      "group w-full flex items-center gap-3 rounded-xl px-3 min-h-[50px] active:scale-[0.985] transition-all";

                    const variantCls = (() => {
                      switch (variant) {
                        case "primary":
                          return "bg-gradient-to-r from-greenElectric/15 via-greenPrimary/10 to-greenElectric/8 border border-greenElectric/30 text-greenElectric hover:from-greenElectric/20 hover:to-greenElectric/12";
                        case "secondary":
                          return "bg-yellow-500/8 border border-yellow-500/25 text-yellow-300 hover:bg-yellow-500/12";
                        case "danger":
                          return "bg-danger/8 border border-danger/25 text-danger hover:bg-danger/12";
                        default:
                          return "bg-bgSecondary/60 border border-white/6 text-textPrimary hover:bg-bgSecondary hover:border-greenElectric/20 hover:text-greenElectric";
                      }
                    })();

                    const iconWrap =
                      variant === "primary"
                        ? "bg-greenElectric/18 border-greenElectric/25 text-greenElectric"
                        : variant === "secondary"
                          ? "bg-yellow-500/15 border-yellow-500/30 text-yellow-300"
                          : variant === "danger"
                            ? "bg-danger/12 border-danger/25 text-danger"
                            : "bg-bgPrimary/65 border-white/5 text-textMuted group-hover:border-greenElectric/20 group-hover:text-greenElectric";

                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={item.onClick}
                          className={`${baseRow} ${variantCls}`}
                        >
                          <span className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${iconWrap}`}>
                            <Icon className="w-[17px] h-[17px]" strokeWidth={2.2} />
                          </span>
                          <span className="font-black text-[13px] tracking-[0.04em] no-text-wrap">
                            {label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-3 pt-2">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                  <p className="text-center text-[9.5px] text-textMuted/60 mt-2 font-bold tracking-[0.2em] leading-tight">
                    CALCETTOXP · STAGIONE 2026
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileHeader() {
  return (
    <Suspense fallback={null}>
      <MobileHeaderInner />
    </Suspense>
  );
}

export default MobileHeader;

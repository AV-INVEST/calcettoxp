"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  X,
  Play,
  HelpCircle,
  TrendingUp,
  Trophy,
  Crown,
  ScrollText,
  LogIn,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  UserCircle,
  Zap,
} from "lucide-react";
import { SmartCTA } from "@/components/cta/SmartCTA";

function lockBody() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY;
  body.style.top = `-${scrollY}px`;
  body.classList.add("body-locked", "body-locked-ios");
  html.dataset.scrollY = String(scrollY);
}

function unlockBody() {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const body = document.body;
  const scrollY = Number(html.dataset.scrollY || "0");
  body.classList.remove("body-locked", "body-locked-ios");
  body.style.top = "";
  if (scrollY) window.scrollTo(0, scrollY);
  delete html.dataset.scrollY;
}

interface MenuItem {
  key: string;
  label: string;
  Icon: any;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger" | "ghost";
  asSmartCTA?: {
    label: string;
    loggedInLabel?: string;
    variant?: "primary" | "secondary" | "yearly-gold";
  };
}

export function MobileHeader() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const scrollYBeforeOpen = useRef(0);
  const isAuthenticated = status === "authenticated" && !!session?.user?.userId;

  const openSheet = useCallback(() => {
    scrollYBeforeOpen.current = window.scrollY;
    lockBody();
    setOpen(true);
  }, []);

  const closeSheet = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => {
      unlockBody();
      setOpen(false);
      setClosing(false);
    }, 240);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSheet();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeSheet]);

  useEffect(() => {
    return () => {
      unlockBody();
    };
  }, []);

  const handleNavigate = (href: string) => {
    closeSheet();
    window.setTimeout(() => router.push(href), 120);
  };

  const handleScrollTo = (id: string) => {
    closeSheet();
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const guestItems: MenuItem[] = [
    {
      key: "inizia",
      label: "GIOCA ORA",
      Icon: Play,
      asSmartCTA: { label: "GIOCA ORA", variant: "primary" },
    },
    {
      key: "come-funziona",
      label: "COME FUNZIONA",
      Icon: HelpCircle,
      onClick: () => handleScrollTo("come-funziona"),
    },
    {
      key: "carriera",
      label: "LA TUA CARRIERA",
      Icon: TrendingUp,
      onClick: () => handleScrollTo("career-index"),
    },
    {
      key: "trofei",
      label: "TROFEI",
      Icon: Trophy,
      onClick: () => handleScrollTo("trofei"),
    },
    {
      key: "pro",
      label: "CALCETTOXP PRO",
      Icon: Crown,
      onClick: () => handleScrollTo("pricing"),
      variant: "primary",
    },
    {
      key: "regole",
      label: "REGOLE",
      Icon: ScrollText,
      onClick: () => handleScrollTo("come-funziona"),
    },
    {
      key: "accedi",
      label: "ACCEDI CON GOOGLE",
      Icon: LogIn,
      asSmartCTA: { label: "ACCEDI CON GOOGLE", variant: "secondary" },
    },
  ];

  const loggedItems: MenuItem[] = [
    {
      key: "dashboard",
      label: "DASHBOARD",
      Icon: LayoutDashboard,
      onClick: () => handleNavigate("/dashboard"),
    },
    {
      key: "registra",
      label: "REGISTRA PARTITA",
      Icon: ClipboardList,
      onClick: () => handleNavigate("/matches/new"),
    },
    {
      key: "stats",
      label: "STATISTICHE",
      Icon: BarChart3,
      onClick: () => handleNavigate("/stats"),
    },
    {
      key: "profilo",
      label: "PROFILO",
      Icon: UserCircle,
      onClick: () => handleNavigate("/profile"),
    },
    {
      key: "settings",
      label: "IMPOSTAZIONI",
      Icon: Settings,
      onClick: () => handleNavigate("/settings"),
    },
    {
      key: "logout",
      label: "ESCI",
      Icon: LogOut,
      variant: "danger",
      onClick: () => {
        closeSheet();
        window.setTimeout(() => signOut({ callbackUrl: "/" }), 120);
      },
    },
  ];

  const items = isAuthenticated ? loggedItems : guestItems;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-bgPrimary/85 backdrop-blur-md border-b border-white/5 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center shadow-lg shadow-greenElectric/20">
              <Zap className="w-4 h-4 text-bgPrimary" strokeWidth={3} />
            </div>
            <span className="font-black text-greenElectric text-lg tracking-tight">
              CalcettoXP
            </span>
          </div>
          <button
            type="button"
            onClick={openSheet}
            aria-label="Apri menu"
            className="relative w-11 h-11 rounded-2xl bg-bgCard border border-greenPrimary/20 flex items-center justify-center active:scale-95 transition-transform hover:border-greenElectric/40 hover:bg-greenElectric/5"
          >
            {isAuthenticated && session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Profilo"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-greenElectric/40"
              />
            ) : (
              <User className="w-5 h-5 text-greenElectric" strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
          <div
            className={`absolute inset-0 bg-black/70 backdrop-blur-sm ${
              closing ? "animate-fade-out" : "animate-fade-in"
            }`}
            onClick={closeSheet}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 safe-bottom pointer-events-none">
            <div
              className={`pointer-events-auto mx-auto w-full max-w-md rounded-t-3xl bg-bgCard border-t border-x border-greenElectric/20 shadow-[0_-8px_48px_rgba(0,0,0,0.6)] relative overflow-hidden ${
                closing ? "animate-sheet-down" : "animate-sheet-up"
              }`}
              style={{
                boxShadow:
                  "0 -4px 0 rgba(124, 255, 107, 0.25), 0 -20px 60px rgba(0,0,0,0.7)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-greenElectric/40 to-transparent" />
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="h-1 w-10 rounded-full bg-white/15 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                <div className="h-10 w-10" />
                <button
                  type="button"
                  onClick={closeSheet}
                  aria-label="Chiudi menu"
                  className="w-10 h-10 rounded-xl bg-bgSecondary border border-white/10 flex items-center justify-center active:scale-95 transition-transform hover:bg-bgSecondary/80"
                >
                  <X className="w-4.5 h-4.5 text-textMuted" strokeWidth={2.2} />
                </button>
              </div>
              <div className="px-3 pb-4 pt-2 max-h-[70vh] overflow-y-auto overscroll-contain">
                <ul className="space-y-1.5">
                  {items.map((item, idx) => {
                    const { Icon, label, variant = "default" } = item;
                    const baseRow =
                      "group w-full flex items-center gap-3.5 rounded-2xl px-4 min-h-[54px] active:scale-[0.98] transition-all";
                    const variants: Record<string, string> = {
                      default:
                        "bg-bgSecondary/60 border border-white/5 text-textPrimary hover:bg-bgSecondary hover:border-greenElectric/20 hover:text-greenElectric",
                      primary:
                        "bg-greenElectric/10 border border-greenElectric/30 text-greenElectric hover:bg-greenElectric/15",
                      danger:
                        "bg-danger/10 border border-danger/20 text-danger hover:bg-danger/15",
                      ghost:
                        "bg-transparent border border-transparent text-textMuted hover:bg-white/5",
                    };

                    if (item.asSmartCTA) {
                      return (
                        <li key={item.key} className={idx === 0 ? "pt-1" : ""}>
                          <div className="rounded-2xl overflow-hidden">
                            <SmartCTA
                              label={item.asSmartCTA.label}
                              icon={Icon}
                              variant={item.asSmartCTA.variant ?? "primary"}
                              size="lg"
                              fullWidth
                              loggedInLabel={item.asSmartCTA.loggedInLabel}
                              className={
                                item.asSmartCTA.variant === "secondary"
                                  ? "!min-h-[54px] !rounded-2xl"
                                  : "!min-h-[54px] !rounded-2xl shadow-lg shadow-greenElectric/20"
                              }
                            />
                          </div>
                        </li>
                      );
                    }

                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={item.onClick}
                          className={`${baseRow} ${variants[variant]}`}
                        >
                          <span className="w-9 h-9 rounded-xl bg-bgPrimary/60 border border-white/5 group-hover:border-greenElectric/20 flex items-center justify-center shrink-0">
                            <Icon
                              className="w-4.5 h-4.5"
                              strokeWidth={2.1}
                            />
                          </span>
                          <span className="font-black text-sm tracking-wide no-text-wrap">
                            {label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MobileHeader;

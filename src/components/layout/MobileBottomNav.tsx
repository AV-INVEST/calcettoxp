"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Trophy, CirclePlus, BarChart2, User } from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", icon: <Home size={22} strokeWidth={2} />, label: "Home" },
  { href: "/matches", icon: <Trophy size={22} strokeWidth={2} />, label: "Partite" },
  { href: "/stats", icon: <BarChart2 size={22} strokeWidth={2} />, label: "Statistiche" },
  { href: "/profile", icon: <User size={22} strokeWidth={2} />, label: "Profilo" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
      <div
        className="bg-bgCard/95 backdrop-blur-xl border-t border-white/5 px-2 pt-3"
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 0.5rem)`,
        }}
      >
        <div className="flex items-end justify-around">
          {navItems.slice(0, 2).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? "text-greenElectric"
                  : "text-textMuted hover:text-textPrimary"
              }`}
            >
              <div className={isActive(item.href) ? "scale-110 transition-transform" : ""}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold tracking-wide">
                {item.label}
              </span>
            </Link>
          ))}

          <button
            onClick={() => router.push("/matches/new")}
            className="relative flex flex-col items-center justify-center -mt-10"
            aria-label="Nuova partita"
          >
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-greenElectric to-greenPrimary shadow-xl shadow-greenElectric/40 border-4 border-bgCard active:scale-95 transition-transform duration-150">
              <CirclePlus size={32} strokeWidth={2.5} className="text-bgPrimary" />
            </div>
          </button>

          {navItems.slice(2).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? "text-greenElectric"
                  : "text-textMuted hover:text-textPrimary"
              }`}
            >
              <div className={isActive(item.href) ? "scale-110 transition-transform" : ""}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold tracking-wide">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

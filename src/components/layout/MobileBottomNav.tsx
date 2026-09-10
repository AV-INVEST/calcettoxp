"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, CirclePlus, BarChart2, User } from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function SoccerBallIcon({ size = 22, strokeWidth = 2 }: { size?: number; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3 L14.5 7.5 L19.5 8.5 L16 12.5 L17 17.5 L12 15 L7 17.5 L8 12.5 L4.5 8.5 L9.5 7.5 Z" />
      <path d="M12 3 L9.5 7.5 L4.5 8.5" opacity="0" />
      <path d="M14.5 7.5 L16 12.5 M9.5 7.5 L8 12.5 M19.5 8.5 L16 12.5 M4.5 8.5 L8 12.5 M16 12.5 L17 17.5 M8 12.5 L7 17.5" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: "/profile", icon: <User size={22} strokeWidth={2} />, label: "Profilo" },
  { href: "/matches", icon: <SoccerBallIcon size={22} strokeWidth={2} />, label: "Partite" },
  { href: "/achievements", icon: <Trophy size={22} strokeWidth={2} />, label: "Trofei" },
  { href: "/stats", icon: <BarChart2 size={22} strokeWidth={2} />, label: "Statistiche" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
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

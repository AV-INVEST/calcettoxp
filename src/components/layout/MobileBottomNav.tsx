"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, CirclePlus, IdCard, User } from "lucide-react";

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
      <path d="M12 3 C11 5.5, 10.5 8, 10.5 12 C10.5 16, 11 18.5, 12 21" />
      <path d="M12 3 C13 5.5, 13.5 8, 13.5 12 C13.5 16, 13 18.5, 12 21" />
      <path d="M3 12 C5.5 11, 8 10.5, 12 10.5 C16 10.5, 18.5 11, 21 12" />
      <path d="M3 12 C5.5 13, 8 13.5, 12 13.5 C16 13.5, 18.5 13, 21 12" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: "/profile", icon: <User size={22} strokeWidth={2} />, label: "Profilo" },
  { href: "/matches", icon: <SoccerBallIcon size={22} strokeWidth={2} />, label: "Partite" },
  { href: "/achievements", icon: <Trophy size={22} strokeWidth={2} />, label: "Trofei" },
  { href: "/dashboard", icon: <IdCard size={22} strokeWidth={2} />, label: "Card" },
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

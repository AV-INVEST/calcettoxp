"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

type SmartCTAVariant = "primary" | "secondary" | "ghost" | "yearly-gold";
type SmartCTASize = "sm" | "md" | "lg";

interface OnboardingStatus {
  ok: boolean;
  exists: boolean;
  playerId: string | null;
  primaryRole: string | null;
  secondaryRole: string | null;
  nickname: string | null;
}

export interface SmartCTAProps {
  label: string;
  icon?: LucideIcon;
  variant?: SmartCTAVariant;
  size?: SmartCTASize;
  callbackPath?: string;
  className?: string;
  fullWidth?: boolean;
  loggedInLabel?: string;
}

function getDestination(callbackPath: string | undefined, onboarding: OnboardingStatus | null) {
  if (onboarding?.exists) {
    return "/dashboard";
  }
  if (callbackPath) {
    return callbackPath;
  }
  return "/onboarding";
}

export function SmartCTA({
  label,
  icon: IconProp,
  variant = "primary",
  size = "lg",
  callbackPath,
  className,
  fullWidth = false,
  loggedInLabel,
}: SmartCTAProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);
  const [onboardingFetched, setOnboardingFetched] = useState(false);

  const isAuthenticated = status === "authenticated" && !!session?.user?.userId;
  const effectiveLabel = isAuthenticated && loggedInLabel ? loggedInLabel : label;

  useEffect(() => {
    if (!isAuthenticated) {
      setOnboardingFetched(false);
      setOnboarding(null);
      return;
    }

    let cancelled = false;
    setOnboardingFetched(false);

    fetch("/api/onboarding/status", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json().catch(() => ({ ok: false, exists: false })))
      .then((data: OnboardingStatus) => {
        if (!cancelled) {
          setOnboarding(data);
          setOnboardingFetched(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOnboarding({
            ok: false,
            exists: false,
            playerId: null,
            primaryRole: null,
            secondaryRole: null,
            nickname: null,
          });
          setOnboardingFetched(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, session?.user?.userId]);

  const handleClick = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!isAuthenticated) {
        const callback = callbackPath ? callbackPath : "/";
        await signIn("google", { callbackUrl: callback });
        return;
      }

      if (!onboardingFetched) {
        router.push("/onboarding");
        return;
      }

      const dest = getDestination(callbackPath, onboarding);
      router.push(dest);
    } catch (err) {
      console.error("SmartCTA error:", err);
      setLoading(false);
    }
  }, [loading, isAuthenticated, onboarding, onboardingFetched, callbackPath, router]);

  const Icon = IconProp;
  const iconEl = loading ? (
    <Loader2 size={size === "sm" ? 14 : size === "md" ? 16 : 18} className="animate-spin shrink-0" />
  ) : Icon ? (
    <Icon size={size === "sm" ? 14 : size === "md" ? 16 : 18} className="shrink-0" strokeWidth={2.2} />
  ) : null;

  if (variant === "yearly-gold") {
    return (
      <div className={fullWidth ? "w-full" : ""}>
        <button
          onClick={handleClick}
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-bgPrimary disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:-translate-y-0.5
            ${size === "sm" ? "h-9 px-3 rounded-lg text-sm" : size === "md" ? "h-11 px-5 rounded-xl text-base" : "h-14 px-7 rounded-2xl text-lg"}
            ${fullWidth ? "w-full" : ""}
            ${className ?? ""}
          `}
          style={{
            background: "linear-gradient(135deg, rgba(234,179,8,0.95) 0%, rgba(250,204,21,0.95) 100%)",
            color: "#070A08",
          }}
        >
          {iconEl}
          <span>{effectiveLabel}</span>
        </button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={`${fullWidth ? "w-full" : ""} ${className ?? ""}`}
    >
      {iconEl}
      <span>{effectiveLabel}</span>
    </Button>
  );
}

export default SmartCTA;

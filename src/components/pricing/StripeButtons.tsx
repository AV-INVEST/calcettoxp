"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type ResetFn = () => void;

function useResetOnReturn(reset: ResetFn) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) reset();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") reset();
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reset]);
}

export function FreeCTAButton({ className }: { className?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useResetOnReturn(() => setLoading(false));

  function handleClick() {
    setLoading(true);
    if (session?.user?.userId) {
      router.push("/dashboard");
    } else {
      router.push("/api/auth/signin");
    }
  }

  return (
    <Button
      variant="secondary"
      size="lg"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <>
          INIZIA GRATIS
          <ArrowRight size={16} />
        </>
      )}
    </Button>
  );
}

export function ProCheckoutButton({
  plan,
  variant = "primary",
  className,
  children,
}: {
  plan: "monthly" | "yearly";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  children?: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useResetOnReturn(() => {
    setLoading(false);
    setError(null);
  });

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      if (!session?.user?.userId) {
        router.push("/api/auth/signin?callbackUrl=/pricing");
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Errore nell'apertura del checkout");
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined") {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      setError("Errore di rete. Riprova.");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        variant={variant}
        size="lg"
        onClick={handleClick}
        disabled={loading}
        className="w-full"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin mr-2" />
        ) : null}
        {children ?? (
          <>
            <Crown size={16} className="mr-1" />
            SBLOCCA ORA
          </>
        )}
      </Button>
      {error && (
        <p className="text-danger text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

export function AlreadyProPortalButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useResetOnReturn(() => {
    setLoading(false);
    setError(null);
  });

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Errore nell'apertura del portale");
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined") {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      setError("Errore di rete. Riprova.");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <Button
        variant="secondary"
        size="md"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin mr-2" />
        ) : (
          <Crown size={16} className="mr-1.5" />
        )}
        Gestisci abbonamento
      </Button>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}

export function YearlyCheckoutButton({
  plan,
  className,
}: {
  plan: "monthly" | "yearly";
  className?: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useResetOnReturn(() => {
    setLoading(false);
    setError(null);
  });

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      if (!session?.user?.userId) {
        router.push("/api/auth/signin?callbackUrl=/pricing");
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Errore nell'apertura del checkout");
        setLoading(false);
        return;
      }
      if (typeof window !== "undefined") {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      setError("Errore di rete. Riprova.");
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full inline-flex items-center justify-center h-14 px-7 rounded-2xl text-lg font-bold transition-all duration-150 active:scale-[0.98] shadow-lg shadow-yellow-500/25 disabled:opacity-50 disabled:pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(234,179,8,0.95), rgba(250,204,21,0.95))",
          color: "#070A08",
        }}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin mr-2" />
        ) : (
          <Crown size={16} className="mr-1.5" />
        )}
        SBLOCCA ORA
      </button>
      {error && <p className="text-danger text-xs mt-2 text-center">{error}</p>}
    </div>
  );
}

export function AlreadyProBanner({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-greenElectric/15 via-greenPrimary/10 to-transparent border border-greenElectric/30 p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
        className ?? ""
      }`}
    >
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-greenElectric/20 border border-greenElectric/40 flex items-center justify-center shadow-lg shadow-greenElectric/10">
          <Crown size={22} className="text-greenElectric" />
        </div>
        <div>
          <Badge variant="elettrico" className="mb-1 text-[10px]">
            <Crown size={10} className="mr-0.5" /> HAI GIÀ PRO
          </Badge>
          <div className="font-black text-lg">Abbonamento attivo</div>
          <div className="text-textMuted text-xs">
            Gestisci fatturazione, metodo di pagamento o annulla.
          </div>
        </div>
      </div>
      <div className="sm:ml-auto shrink-0">
        <AlreadyProPortalButton />
      </div>
    </div>
  );
}

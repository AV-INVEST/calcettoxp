"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function DashboardLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } finally {
      // signOut happens;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label="Esci dall'account"
      title="Esci"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-bgCard text-textMuted transition-all hover:border-danger/30 hover:bg-danger/8 hover:text-danger active:scale-[0.97] disabled:opacity-60"
    >
      <LogOut className="h-[17px] w-[17px]" strokeWidth={2.2} />
    </button>
  );
}

export default DashboardLogoutButton;

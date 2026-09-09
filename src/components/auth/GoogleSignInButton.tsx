"use client";

import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { useState } from "react";

export default function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "0.875rem 1.25rem",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#000000",
        backgroundColor: "#22C55E",
        border: "none",
        borderRadius: "0.75rem",
        cursor: isLoading ? "not-allowed" : "pointer",
        opacity: isLoading ? 0.7 : 1,
        boxShadow:
          "0 0 0 1px rgba(34, 197, 94, 0.4), 0 0 24px rgba(34, 197, 94, 0.35)",
        transition: "transform 0.1s ease, box-shadow 0.2s ease",
      }}
      onMouseDown={(e) => {
        if (!isLoading) {
          e.currentTarget.style.transform = "scale(0.98)";
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <LogIn size={18} strokeWidth={2.5} />
      <span>
        {isLoading ? "Accesso in corso..." : "Continua con Google"}
      </span>
    </button>
  );
}

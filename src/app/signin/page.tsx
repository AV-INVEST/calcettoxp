import type { Metadata } from "next";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export const metadata: Metadata = {
  title: "Accedi | CalcettoXP",
  description: "Accedi a CalcettoXP con il tuo account Google.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#070A08",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <h1
            style={{
              color: "#ffffff",
              fontSize: "1.75rem",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            CALCETTOXP
          </h1>
          <p
            style={{
              color: "#9CA3AF",
              fontSize: "0.875rem",
              margin: 0,
              textAlign: "center",
            }}
          >
            Accedi per iniziare a giocare
          </p>
        </div>

        <GoogleSignInButton />

        <p
          style={{
            color: "#6B7280",
            fontSize: "0.75rem",
            textAlign: "center",
            margin: 0,
            maxWidth: "320px",
          }}
        >
          Continuando con Google, accetti i termini di servizio e la privacy
          policy di CALCETTOXP.
        </p>
      </div>
    </main>
  );
}

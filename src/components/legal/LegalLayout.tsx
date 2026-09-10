import Link from 'next/link';
import { Metadata } from 'next';
import { Home, FileText } from 'lucide-react';
import AppFooter from '@/components/layout/AppFooter';

export const legalMetaBase: Metadata = {
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'CalcettoXP',
  },
};

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function LegalLayout({ children, title, subtitle }: LegalLayoutProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-bgPrimary relative flex flex-col">
      <div className="absolute inset-0 pitch-wrapper opacity-20 pointer-events-none" aria-hidden />

      {/* Header interno CalcettoXP + Home: VISIBILE SOLO DESKTOP (>= md); mobile: solo AppHeader globale */}
      <header className="hidden md:block sticky top-0 z-20 w-full backdrop-blur-xl border-b border-white/5 bg-bgPrimary/80">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-textPrimary font-black tracking-tight"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-greenElectric via-greenPrimary to-emerald-600 flex items-center justify-center text-bgPrimary shadow-[0_0_20px_rgba(124,255,107,0.25)]">
              <span className="text-[13px] font-black leading-none">C</span>
            </div>
            <span className="text-lg tracking-tight">
              Calcetto<span className="text-greenElectric">XP</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-textMuted hover:text-textPrimary hover:border-white/20 transition"
          >
            <Home className="w-3.5 h-3.5" aria-hidden />
            Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-6 md:pt-10 pb-12 md:pb-16 space-y-8 flex-1">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 text-greenElectric text-[11px] md:text-xs uppercase tracking-[0.2em] font-bold">
            <FileText className="w-3.5 h-3.5" aria-hidden />
            Informazioni legali
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-textPrimary tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-sm md:text-base text-textMuted max-w-2xl">{subtitle}</p>}
        </header>

        <article className="space-y-6 md:space-y-8 text-textPrimary text-[15px] leading-relaxed">
          {children}
        </article>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs md:text-sm text-textMuted hover:text-textPrimary transition"
            aria-label="Torna alla home"
          >
            <Home className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden />
            Home
          </Link>
          <span className="text-[10px] md:text-xs text-textMuted/60 uppercase tracking-wider">
            CalcettoXP
          </span>
        </div>
      </main>

      <div className="relative z-10 w-full">
        <AppFooter />
      </div>
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 pt-2">
      <h2 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight">{title}</h2>
      <div className="space-y-3 text-[14.5px] text-textPrimary/90">{children}</div>
    </section>
  );
}

export function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 pt-2">
      <h3 className="font-extrabold text-textPrimary tracking-tight">{title}</h3>
      <div className="space-y-2 text-[14px] text-textPrimary/90">{children}</div>
    </div>
  );
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-textPrimary/90 leading-relaxed ${className ?? ""}`}>
      {children}
    </p>
  );
}

export function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2 pl-6 marker:text-greenElectric/70">{children}</ul>;
}

export function Blockquote({ children, accent = true }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <blockquote
      className={`border-l-4 ${
        accent ? 'border-greenElectric/70' : 'border-white/20'
      } bg-bgSecondary/60 rounded-r-2xl p-4 md:p-5 my-4 space-y-3`}
    >
      {children}
    </blockquote>
  );
}

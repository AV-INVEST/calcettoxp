import Link from 'next/link';
import { Metadata } from 'next';
import { Home, FileText } from 'lucide-react';

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
    <div className="min-h-[100dvh] w-full bg-bgPrimary pb-20 relative">
      <div className="absolute inset-0 pitch-wrapper opacity-20 pointer-events-none" aria-hidden />
      <header className="sticky top-0 z-30 bg-bgPrimary/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-greenElectric text-2xl font-black tracking-tight">
              CalcettoXP
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-textMuted hover:text-textPrimary transition"
            aria-label="Torna alla home"
          >
            <Home className="w-4 h-4" aria-hidden />
            Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-16 space-y-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 text-greenElectric text-xs uppercase tracking-[0.2em] font-bold">
            <FileText className="w-3.5 h-3.5" aria-hidden />
            Informazioni legali
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-textPrimary tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="text-textMuted max-w-2xl">{subtitle}</p>}
        </header>

        <article className="space-y-6 text-textPrimary text-[15px] leading-relaxed">
          {children}
        </article>

        <footer className="pt-6 border-t border-white/5 text-xs text-textMuted flex flex-wrap items-center gap-3">
          <Link href="/" className="hover:text-greenElectric transition">
            Torna alla home
          </Link>
          <span aria-hidden>·</span>
          <Link href="/settings" className="hover:text-greenElectric transition">
            Impostazioni
          </Link>
          <span aria-hidden>·</span>
          <Link href="/privacy" className="hover:text-greenElectric transition">
            Privacy
          </Link>
          <span aria-hidden>·</span>
          <Link href="/cookie-policy" className="hover:text-greenElectric transition">
            Cookie
          </Link>
        </footer>
      </main>
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
    <section className="space-y-3">
      <h2 className="text-xl md:text-2xl font-bold text-textPrimary">{title}</h2>
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
    <div className="space-y-2 pt-1">
      <h3 className="font-bold text-textPrimary">{title}</h3>
      <div className="space-y-2 text-[14px] text-textPrimary/90">{children}</div>
    </div>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-textPrimary/90 leading-relaxed">{children}</p>;
}

export function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1 pl-6 marker:text-greenElectric/70">{children}</ul>;
}

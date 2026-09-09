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
      <header className="sticky top-0 z-30 bg-bgPrimary/80 backdrop-blur-md border-b border-white/5 relative">
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

      <main className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-10 pb-12 md:pb-16 space-y-8 flex-1">
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

        <article className="space-y-6 md:space-y-8 text-textPrimary text-[15px] leading-relaxed">
          {children}
        </article>
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

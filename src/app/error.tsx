'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Home, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (typeof console !== 'undefined' && error) {
      console.error('[app error]', error);
    }
  }, [error]);

  return (
    <div className="min-h-[100dvh] w-full bg-bgPrimary">
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pitch-wrapper opacity-20 pointer-events-none" aria-hidden />
        <div className="relative z-10 max-w-md mx-auto space-y-6 py-16">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full border-[3px] border-danger/70 flex items-center justify-center bg-danger/10">
              <AlertTriangle className="w-10 h-10 text-danger" aria-hidden />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-textPrimary tracking-tight">
              Ops, qualcosa è andato storto.
            </h1>
            <p className="text-textMuted text-base">
              Riprova tra poco o torna alla home.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                try {
                  reset();
                } catch (e) {
                  if (typeof window !== 'undefined') window.location.reload();
                }
              }}
              aria-label="Riprova"
            >
              <RefreshCcw className="w-4 h-4 mr-2" aria-hidden />
              RIPROVA
            </Button>
            <Link href="/" prefetch>
              <Button variant="secondary" size="md" aria-label="Torna alla home">
                <Home className="w-4 h-4 mr-2" aria-hidden />
                TORNA ALLA HOME
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

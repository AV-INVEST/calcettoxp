import Link from 'next/link';
import { Home, Frown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full bg-bgPrimary flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 pitch-wrapper opacity-30 pointer-events-none" aria-hidden />
      <div className="relative z-10 max-w-md mx-auto space-y-8 py-20">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full border-[3px] border-danger/70 flex items-center justify-center bg-danger/10">
            <Frown className="w-12 h-12 text-danger" aria-hidden />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-5xl md:text-6xl font-black text-textPrimary tracking-tight">
            Fuori dal campo.
          </h1>
          <p className="text-textMuted text-base md:text-lg">
            La pagina che stai cercando non esiste o è stata spostata.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/" prefetch>
            <Button variant="primary" size="lg" aria-label="Torna alla home">
              <Home className="w-4 h-4 mr-2" aria-hidden />
              TORNA ALLA HOME
            </Button>
          </Link>
        </div>
        <p className="text-xs text-textMuted/70 pt-8">
          Se credi sia un errore, torna alla pagina precedente o alla home.
        </p>
      </div>
    </div>
  );
}

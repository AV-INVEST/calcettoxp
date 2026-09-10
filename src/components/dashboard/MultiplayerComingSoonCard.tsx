import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Lock, Users, Sparkles } from "lucide-react";

export default function MultiplayerComingSoonCard() {
  return (
    <Card className="overflow-hidden relative w-full max-w-full">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(124, 255, 107, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)",
          }}
        />
      </div>
      <CardContent className="px-5 py-5 md:p-6 relative w-full max-w-full">
        {/* Header: su mobile [icona + titolo] con badge a destra sulla stessa riga */}
        <div className="mb-4 md:mb-4 w-full max-w-full">
          <div className="flex items-start justify-between gap-2 md:gap-3 w-full max-w-full">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Users size={20} className="md:w-[24px] md:h-[24px] text-textMuted" />
                </div>
                <div className="absolute -top-1 -right-1 w-[18px] h-[18px] md:w-5 md:h-5 rounded-full bg-bgCard border border-white/10 flex items-center justify-center">
                  <Lock size={10} className="md:w-[11px] md:h-[11px] text-textMuted" />
                </div>
              </div>
              <div className="min-w-0 pt-1 flex-1">
                <h3 className="text-base md:text-lg font-bold text-textPrimary truncate">
                  Multiplayer
                </h3>
              </div>
            </div>
            <Badge
              variant="elettrico"
              className="shrink-0 px-3 py-1.5 md:px-3 md:py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest"
            >
              <span className="flex items-center gap-1 md:gap-1.5">
                <Sparkles size={10} className="md:w-[11px] md:h-[11px]" />
                IN ARRIVO
              </span>
            </Badge>
          </div>
          {/* Descrizione a tutta larghezza sotto l'header (mobile), accanto su desktop */}
          <p className="text-sm text-textMuted mt-3.5 md:mt-2 md:ml-[52px] md:pl-0 leading-relaxed w-full min-w-0">
            Sfida altri giocatori, partecipa a partite verificate e scala il
            ranking della tua città.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3.5 md:mb-4 w-full max-w-full">
          <div className="rounded-xl bg-white/5 px-3 py-3.5 md:p-3 text-center border border-white/5 flex flex-col items-center justify-center min-h-[96px] md:min-h-0 w-full min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-2 md:mb-2 shrink-0">
              <Lock size={14} className="text-textMuted" />
            </div>
            <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider truncate w-full">
              Rank
            </div>
            <div className="text-sm font-black text-textMuted tabular-nums mt-0.5">
              --
            </div>
          </div>
          <div className="rounded-xl bg-white/5 px-3 py-3.5 md:p-3 text-center border border-white/5 flex flex-col items-center justify-center min-h-[96px] md:min-h-0 w-full min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-2 md:mb-2 shrink-0">
              <Lock size={14} className="text-textMuted" />
            </div>
            <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider truncate w-full">
              Sfide
            </div>
            <div className="text-sm font-black text-textMuted tabular-nums mt-0.5">
              --
            </div>
          </div>
          <div className="rounded-xl bg-white/5 px-3 py-3.5 md:p-3 text-center border border-white/5 flex flex-col items-center justify-center min-h-[96px] md:min-h-0 w-full min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-2 md:mb-2 shrink-0">
              <Lock size={14} className="text-textMuted" />
            </div>
            <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider truncate w-full">
              Città
            </div>
            <div className="text-sm font-black text-textMuted tabular-nums mt-0.5">
              --
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-center gap-2 rounded-xl py-3 w-full max-w-full mx-auto"
          style={{
            background:
              "linear-gradient(90deg, rgba(124, 255, 107, 0.08) 0%, rgba(34, 197, 94, 0.08) 100%)",
            border: "1px dashed rgba(124, 255, 107, 0.3)",
          }}
        >
          <Sparkles size={14} className="text-greenElectric shrink-0" />
          <span className="text-xs font-semibold text-greenElectric truncate min-w-0">
            Disponibile prossimamente
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

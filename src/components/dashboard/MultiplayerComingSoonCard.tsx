import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Lock, Users, Sparkles } from "lucide-react";

export default function MultiplayerComingSoonCard() {
  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(124, 255, 107, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)",
          }}
        />
      </div>
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Users size={24} className="text-textMuted" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-bgCard border border-white/10 flex items-center justify-center">
                <Lock size={11} className="text-textMuted" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-textPrimary">Multiplayer</h3>
              <p className="text-sm text-textMuted mt-0.5 max-w-xs">
                Sfida altri giocatori, partecipa a partite verificate e scala il
                ranking della tua città.
              </p>
            </div>
          </div>
          <Badge
            variant="elettrico"
            className="shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={11} />
              IN ARRIVO
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
            <div className="w-8 h-8 mx-auto rounded-lg bg-white/5 flex items-center justify-center mb-2">
              <Lock size={14} className="text-textMuted" />
            </div>
            <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
              Rank
            </div>
            <div className="text-sm font-black text-textMuted tabular-nums mt-0.5">
              --
            </div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
            <div className="w-8 h-8 mx-auto rounded-lg bg-white/5 flex items-center justify-center mb-2">
              <Lock size={14} className="text-textMuted" />
            </div>
            <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
              Sfide
            </div>
            <div className="text-sm font-black text-textMuted tabular-nums mt-0.5">
              --
            </div>
          </div>
          <div className="rounded-xl bg-white/5 p-3 text-center border border-white/5">
            <div className="w-8 h-8 mx-auto rounded-lg bg-white/5 flex items-center justify-center mb-2">
              <Lock size={14} className="text-textMuted" />
            </div>
            <div className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">
              Città
            </div>
            <div className="text-sm font-black text-textMuted tabular-nums mt-0.5">
              --
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-center gap-2 rounded-xl py-2.5"
          style={{
            background:
              "linear-gradient(90deg, rgba(124, 255, 107, 0.08) 0%, rgba(34, 197, 94, 0.08) 100%)",
            border: "1px dashed rgba(124, 255, 107, 0.3)",
          }}
        >
          <Sparkles size={14} className="text-greenElectric" />
          <span className="text-xs font-semibold text-greenElectric">
            Disponibile prossimamente
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

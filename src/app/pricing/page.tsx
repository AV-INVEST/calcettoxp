import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { hasActivePro } from "@/lib/entitlements";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Crown,
  Check,
  Zap,
  BarChart3,
  LineChart,
  Shield,
  Award,
  Users,
  Sparkles,
  Lock,
  Flame,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  FreeCTAButton,
  ProCheckoutButton,
  AlreadyProBanner,
  YearlyCheckoutButton,
} from "@/components/pricing/StripeButtons";

const pricingFree = [
  { icon: Users, text: "Profilo giocatore personalizzato" },
  { icon: Trophy, text: "Card giocatore base" },
  { icon: Zap, text: "Partite illimitate registrate" },
  { icon: BarChart3, text: "Statistiche essenziali" },
  { icon: TrendingUp, text: "Career Index (ultimi 20 punti)" },
  { icon: Sparkles, text: "XP, livelli e progressione" },
  { icon: Award, text: "Trofei FREE" },
  { icon: LineChart, text: "Stagione corrente visibile" },
];

const pricingPro = [
  "Tutto incluso nel piano FREE",
  "Statistiche avanzate complete",
  "Storico completo Career Index illimitato",
  "Analisi 7 / 30 / 90 giorni",
  "Statistiche per ruolo e per periodo",
  "Record personali e migliori streak",
  "Andamento e confronto stagioni",
  "Card premium + personalizzazioni",
  "Trofei esclusivi PRO",
  "Insight sulla forma atletica",
  "Badge PRO su profilo e classifiche",
  "Tutte le novità in anteprima",
];

export default async function PricingPage() {
  const session = await auth();
  let isPro = false;

  if (session?.user?.userId) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.userId },
    });
    isPro = hasActivePro(subscription);
  }

  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary">
      <div className="max-w-7xl mx-auto px-5 py-10 md:py-16">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <Badge variant="elettrico" className="mb-4 text-[11px]">
            <Crown size={11} className="mr-1" /> PREZZI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Piani per ogni giocatore
          </h1>
          <p className="text-textMuted text-base md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Inizia gratis, costruisci la tua carriera. Passa a PRO quando vuoi
            sbloccare analisi avanzate, storico completo e achievement esclusivi.
          </p>
        </div>

        {isPro && (
          <div className="max-w-4xl mx-auto mb-10">
            <AlreadyProBanner />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {/* FREE */}
          <Card className="p-7 md:p-8 flex flex-col border-white/10 relative overflow-hidden">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Shield size={20} className="text-textMuted" />
                </div>
                <Badge variant="grigio" className="text-[10px]">FREE FOREVER</Badge>
              </div>
              <h3 className="text-2xl font-black tracking-tight">FREE</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-5xl font-black text-textPrimary tracking-tight">
                €0
                </span>
                <span className="text-textMuted">/mese</span>
              </div>
              <p className="text-textMuted text-sm mt-2">
                Perfetto per iniziare la tua carriera.
              </p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {pricingFree.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-textPrimary">
                  <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center">
                    <Check size={11} className="text-greenElectric" strokeWidth={3} />
                  </div>
                  <div className="flex items-center gap-2">
                    <b.icon size={14} className="text-greenElectric/70" />
                    <span>{b.text}</span>
                  </div>
                </li>
              ))}
            </ul>
            <FreeCTAButton className="w-full" />
            <p className="text-center text-[11px] text-textMuted mt-3">
              Nessuna carta richiesta
            </p>
          </Card>

          {/* PRO MENSILE */}
          <Card className="relative p-7 md:p-8 flex flex-col border-2 border-greenElectric shadow-2xl shadow-greenElectric/15">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1.5 rounded-full bg-greenElectric shadow-lg shadow-greenElectric/30">
                <span className="text-bgPrimary text-xs font-black tracking-wider flex items-center gap-1">
                  <Zap size={10} strokeWidth={3} /> PIÙ POPOLARE
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-greenElectric/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="mb-6 relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-greenElectric/30 to-greenPrimary/20 border border-greenElectric/40 flex items-center justify-center shadow-lg shadow-greenElectric/10">
                  <Crown size={20} className="text-greenElectric" />
                </div>
                <Badge variant="elettrico" className="text-[10px]">
                  <Crown size={9} className="mr-0.5" /> PIENO ACCESSO
                </Badge>
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                PRO <span className="text-greenElectric">Mensile</span>
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-5xl font-black text-textPrimary tracking-tight">
                  €3,90
                </span>
                <span className="text-textMuted">/mese</span>
              </div>
              <p className="text-textMuted text-sm mt-2">
                Flessibile, senza impegno. Disdici quando vuoi.
              </p>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1 relative">
              {pricingPro.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-textPrimary">
                  <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center">
                    <Check size={11} className="text-greenElectric" strokeWidth={3} />
                  </div>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {!isPro ? (
              <ProCheckoutButton plan="monthly">
                <Crown size={16} className="mr-1" />
                SBLOCCA ORA
              </ProCheckoutButton>
            ) : (
                <Badge variant="elettrico" className="w-full justify-center py-2.5 rounded-xl text-xs">
                  <Check size={14} className="mr-1.5" /> HAI GIÀ ATTIVO
                </Badge>
            )}
            <p className="text-center text-[11px] text-textMuted mt-3">
              Pagamento sicuro con Stripe
            </p>
          </Card>

          {/* PRO ANNUALE */}
          <Card className="p-7 md:p-8 flex flex-col relative border-greenPrimary/20">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
              <div className="px-4 py-1.5 rounded-full bg-yellow-500/95 shadow-xl shadow-yellow-500/25">
                <span className="text-bgPrimary text-xs font-black tracking-wider flex items-center gap-1">
                  <Flame size={10} strokeWidth={3} /> RISPARMIA ~36%
                </span>
              </div>
            </div>
            <div className="mb-6 mt-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/25 to-yellow-400/15 border border-yellow-500/40 flex items-center justify-center">
                  <Calendar size={20} className="text-yellow-400" />
                </div>
                <div
                  className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wide"
                  style={{
                    background: "rgba(234,179,8,0.15)",
                    border: "1px solid rgba(234,179,8,0.35)",
                    color: "#FACC15",
                  }}
                >
                  MIGLIOR RAPPORTO
                </div>
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                PRO <span className="text-yellow-400">Annuale</span>
              </h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-5xl font-black text-textPrimary tracking-tight">
                  €29,90
                </span>
                <span className="text-textMuted">/anno</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-textMuted text-sm line-through">€46,80</span>
                <Badge variant="grigio" className="text-[10px]">
                  ~€2,49/mese
                </Badge>
              </div>
              <p className="text-textMuted text-sm mt-2">
                Per chi gioca tutto l'anno. Il massimo del risparmio.
              </p>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1">
              {pricingPro.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-textPrimary">
                  <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center">
                    <Check size={11} className="text-greenElectric" strokeWidth={3} />
                  </div>
                  <span>{b}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-sm text-yellow-400 font-semibold">
                <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center">
                  <Sparkles size={11} />
                </div>
                <span>Bonus esclusivo: 2 mesi gratis ogni anno</span>
              </li>
            </ul>
            {!isPro ? (
              <YearlyCheckoutButton plan="yearly" />
            ) : (
              <Badge variant="elettrico" className="w-full justify-center py-2.5 rounded-xl text-xs">
                <Check size={14} className="mr-1.5" /> HAI GIÀ ATTIVO
              </Badge>
            )}
            <p className="text-center text-[11px] text-textMuted mt-3">
              14 giorni soddisfatti o rimborsati
            </p>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-14 md:mt-20">
          <div className="rounded-3xl bg-bgCard border border-white/5 p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-greenElectric/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="relative grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                  Domande frequenti
                </h2>
                <p className="text-textMuted mt-2">
                  Hai ancora dubbi? Ecco le risposte alle domande più comuni.
                </p>
              </div>
              <div className="space-y-5">
                <Faq
                  q="Posso cancellare l'abbonamento in qualsiasi momento?"
                  a="Sì. Nel piano mensile puoi disdire quando vuoi, senza penali. Nel piano annuale puoi disattivare il rinnovo automatico in qualsiasi momento."
                />
                <Faq
                  q="Cosa succede al mio account se torno FREE?"
                  a="Niente. Tutti i tuoi dati restano intatti. Torni semplicemente ad avere le limitazioni del piano FREE."
                />
                <Faq
                  q="Come posso pagare?"
                  a="Accettiamo tutte le principali carte di credito e debito, oltre a Google Pay e Apple Pay tramite Stripe."
                />
                <Faq
                  q="C'è un periodo di prova?"
                  a="Sì, il piano PRO include un periodo di prova. Inizia con FREE e vedi se PRO vale per te."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <div className="font-bold text-sm md:text-base mb-1">{q}</div>
      <div className="text-textMuted text-sm leading-relaxed">{a}</div>
    </div>
  );
}

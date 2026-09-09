"use client";

import {
  PlaySquare,
  ClipboardList,
  TrendingUp,
  Trophy,
  Flame,
  ShieldCheck,
  Target,
  Zap,
  Award,
  Crown,
  Star,
  ChevronRight,
  Check,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { InstallPWAButton } from "@/components/pwa/InstallPWAButton";
import AppFooter from "@/components/layout/AppFooter";

const ciData = [
  { m: 1, v: 980 },
  { m: 2, v: 1020 },
  { m: 3, v: 1080 },
  { m: 4, v: 1120 },
  { m: 5, v: 1190 },
  { m: 6, v: 1250 },
  { m: 7, v: 1280 },
  { m: 8, v: 1347 },
];

const steps = [
  {
    icon: PlaySquare,
    title: "GIoca",
    desc: "Gioca normalmente il tuo calcetto.",
  },
  {
    icon: ClipboardList,
    title: "REGISTRA",
    desc: "Inserisci risultato, gol, assist e ruolo.",
  },
  {
    icon: TrendingUp,
    title: "EVOLVI",
    desc: "Guadagna XP, migliora la tua card e fai crescere il tuo Career Index.",
  },
];

const evolutions = [
  { ovr: 61, lv: 3, label: "Novizio" },
  { ovr: 68, lv: 7, label: "Emergente" },
  { ovr: 74, lv: 12, label: "Affermato" },
  { ovr: 82, lv: 21, label: "Veterano" },
];

const achievements = [
  { icon: Target, name: "FIRST MATCH", desc: "Prima partita registrata" },
  { icon: Trophy, name: "HAT-TRICK", desc: "3 gol in una partita" },
  { icon: Flame, name: "ON FIRE", desc: "Gol in 5 partite consecutive" },
  { icon: ShieldCheck, name: "UNBEATEN", desc: "10 partite senza perdere" },
  { icon: Star, name: "CENTURION", desc: "100 partite" },
  { icon: Crown, name: "1500 CLUB", desc: "Career Index 1500" },
  { icon: Zap, name: "IRONMAN", desc: "20 partite in una stagione" },
];

const pricingFree = [
  "Profilo giocatore",
  "Card base",
  "Partite illimitate",
  "Statistiche essenziali",
  "Career Index",
  "XP e livelli",
  "Achievement base",
  "Grafico base",
  "Stagione corrente",
];

const pricingPro = [
  "Tutto ciò che è incluso nel piano FREE",
  "Statistiche avanzate",
  "Storico completo",
  "Grafici avanzati",
  "Analisi 7/30/90 giorni",
  "Record personali",
  "Stats per ruolo/periodo/risultato",
  "Migliori streak",
  "Andamento stagioni",
  "Card premium + personalizzazione",
  "Achievement PRO",
  "Insight forma",
  "Confronto stagioni",
  "Badge PRO",
];

function PitchLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-greenElectric/10 to-transparent" />
      <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-greenElectric/5 to-transparent" />
      <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-greenElectric/10 to-transparent" />
      <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-greenElectric/8 to-transparent" />
      <div
        className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-greenElectric/5"
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-greenElectric/10"
      />
    </div>
  );
}

function DemoPlayerCard() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-greenElectric via-greenPrimary to-greenElectric/30 opacity-60 blur-[1px]" />
      <div className="relative rounded-3xl bg-gradient-to-br from-bgSecondary to-bgCard p-4 border border-greenPrimary/20">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center border-2 border-greenElectric/40 shadow-lg shadow-greenElectric/20">
              <span className="text-bgPrimary font-black text-xl">74</span>
            </div>
            <span className="text-[10px] text-greenElectric font-bold mt-1">
              OVR
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className="px-2.5 py-1 rounded-md bg-greenElectric/15 border border-greenElectric/30">
            <span className="text-greenElectric text-xs font-black tracking-wider">
              ATT
            </span>
            </div>
            <span className="text-textMuted text-xs mt-1.5 font-medium">
              LV <span className="text-textPrimary font-bold">12</span>
            </span>
          </div>
        </div>

        <div className="my-4 flex justify-center">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-greenPrimary/20 via-greenElectric/10 to-transparent border border-greenElectric/20 flex items-center justify-center">
            <Users className="w-14 h-14 text-greenElectric/70" strokeWidth={1.5} />
          </div>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-textPrimary font-black text-2xl tracking-tight">
            ANDREA
          </h3>
          <div className="h-px w-16 mx-auto mt-1 bg-gradient-to-r from-transparent via-greenElectric/40 to-transparent" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["PAC", "82"],
            ["SHO", "76"],
            ["PAS", "65"],
            ["DRI", "71"],
            ["DEF", "38"],
            ["PHY", "74"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-greenElectric/10 pb-1">
              <span className="text-textMuted font-bold">{k}</span>
              <span className="text-textPrimary font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniCIIndex() {
  return (
    <div className="mx-auto mt-6 w-full max-w-[300px] rounded-2xl bg-bgCard/80 backdrop-blur border border-greenPrimary/15 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-textMuted text-xs font-semibold tracking-wider">
          CAREER INDEX
        </span>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-greenElectric" />
          <span className="text-greenElectric text-xs font-bold">+7.4%</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-textPrimary font-black text-2xl tracking-tight">
          1.347
        </span>
        <div className="w-32 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ciData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#7CFF6B"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function EvolutionCard({
  ovr,
  lv,
  label,
  last,
}: {
  ovr: number;
  lv: number;
  label: string;
  last?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 md:flex-col md:gap-0">
      <div className="relative shrink-0">
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-greenElectric/60 via-greenPrimary/40 to-greenElectric/20 opacity-60 blur-[1px]" />
        <div className="relative w-24 h-32 md:w-full md:h-40 rounded-2xl bg-gradient-to-br from-bgSecondary to-bgCard border border-greenPrimary/20 flex flex-col items-center justify-center p-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center border-2 border-greenElectric/40">
            <span className="text-bgPrimary font-black text-lg md:text-xl">
              {ovr}
            </span>
          </div>
          <span className="text-textPrimary font-black text-sm mt-2">
            OVR {ovr}
          </span>
          <span className="text-textMuted text-[11px] mt-0.5">
            LV {lv} · {label}
          </span>
        </div>
      </div>
      {!last && (
        <ChevronRight className="w-5 h-5 text-greenElectric/60 md:hidden shrink-0" />
      )}
      {!last && (
        <div className="hidden md:flex w-full justify-center py-2">
          <ChevronRight className="w-5 h-5 text-greenElectric/60 rotate-90" />
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary overflow-x-hidden">
      {/* HERO */}
      <section className="relative pt-6 pb-20 md:pt-10 md:pb-28">
        <PitchLines />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between mb-10 md:mb-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-bgPrimary" strokeWidth={3} />
              </div>
              <span className="font-bold text-greenElectric text-2xl tracking-tight">
                CalcettoXP
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-greenElectric/20 bg-greenElectric/5 px-3 py-1.5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-greenElectric opacity-40" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-greenElectric" />
                </span>
                <span className="text-greenElectric text-xs font-semibold tracking-wider">
                  NUOVA STAGIONE 2026
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black leading-[1.05] text-textPrimary tracking-tight">
                Trasforma ogni calcetto nella tua carriera.
              </h1>
              <p className="text-lg md:text-xl text-textMuted mt-4 md:mt-6 leading-relaxed max-w-lg">
                Registra le tue partite, fai evolvere la tua card e costruisci la
                tua carriera nel calcetto.
              </p>

              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 rounded-xl bg-greenElectric text-bgPrimary font-black text-sm md:text-base tracking-wider hover:bg-greenElectric/90 transition-all shadow-lg shadow-greenElectric/20 hover:shadow-greenElectric/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  CREA LA TUA CARRIERA GRATIS
                </a>
                <a
                  href="#come-funziona"
                  className="inline-flex items-center justify-center px-6 md:px-8 py-3.5 md:py-4 rounded-xl border border-textPrimary/20 text-textPrimary font-bold text-sm md:text-base tracking-wider hover:border-greenElectric/50 hover:text-greenElectric transition-all"
                >
                  SCOPRI COME FUNZIONA
                </a>
              </div>
            </div>

            <div>
              <DemoPlayerCard />
              <MiniCIIndex />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky CTAs */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gradient-to-t from-bgPrimary via-bgPrimary/95 to-transparent pt-6 pb-4 px-5">
        <div className="flex flex-col gap-2">
          <a
            href="#pricing"
            className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-greenElectric text-bgPrimary font-black text-sm tracking-wider shadow-lg shadow-greenElectric/25"
          >
            CREA LA TUA CARRIERA GRATIS
          </a>
        </div>
      </div>
      <div className="h-28 md:h-0" />

      {/* COME FUNZIONA */}
      <section id="come-funziona" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-greenElectric text-xs font-black tracking-[0.2em]">
              IL PROCESSO
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">
              Come funziona
            </h2>
            <p className="text-textMuted text-base md:text-lg mt-4 max-w-xl mx-auto">
              Tre semplici passaggi per trasformare ogni partita in progresso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-2xl bg-bgCard/60 border border-greenPrimary/10 p-6 md:p-8 hover:border-greenElectric/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center">
                    <s.icon className="w-5.5 h-5.5 text-greenElectric" strokeWidth={2.2} />
                  </div>
                  <span className="text-textMuted text-sm font-bold">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">
                  {s.title}
                </h3>
                <p className="text-textMuted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAMPLE PLAYER CAREER */}
      <section className="py-20 md:py-28 relative bg-bgSecondary/40">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-greenElectric text-xs font-black tracking-[0.2em]">
              CARRIERA DEMO
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">
              La carriera di Andrea
            </h2>
            <p className="text-textMuted text-base md:text-lg mt-4 max-w-xl mx-auto">
              Ecco cosa puoi costruire giocando regolarmente.
            </p>
          </div>

          <div className="rounded-3xl bg-bgCard/60 border border-greenPrimary/15 p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 mb-8 md:mb-10">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-greenPrimary/20 to-greenElectric/10 border border-greenElectric/25 flex items-center justify-center shrink-0">
                  <Users className="w-10 h-10 md:w-12 md:h-12 text-greenElectric/80" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                    ANDREA
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-greenElectric/15 border border-greenElectric/30 text-greenElectric text-xs font-black">
                      ATT
                    </span>
                    <span className="text-textMuted text-sm">
                      OVR{" "}
                      <span className="text-textPrimary font-bold">74</span> · LV{" "}
                      <span className="text-textPrimary font-bold">12</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:ml-auto flex items-center gap-3 bg-greenElectric/5 border border-greenElectric/20 rounded-2xl p-4 md:px-5 md:py-3.5 self-start md:self-auto">
                <div>
                  <div className="text-[11px] text-textMuted font-semibold tracking-wider">
                    CAREER INDEX
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-black text-textPrimary tracking-tight">
                      1,347
                    </span>
                    <span className="text-greenElectric text-xs font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +7.4%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
              {[
                ["28", "Partite"],
                ["17 V / 3 P / 8 S", "Risultati"],
                ["31 gol", "9 assist"],
                ["60.7%", "Win Rate"],
              ].map(([v, l]) => (
                <div
                  key={l}
                  className="rounded-xl bg-bgPrimary/50 border border-greenPrimary/10 p-4"
                >
                  <div className="text-textPrimary font-black text-lg md:text-xl tracking-tight">
                    {v}
                  </div>
                  <div className="text-textMuted text-xs mt-1 font-medium">
                    {l}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-bgPrimary/50 border border-greenPrimary/10 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-textMuted text-xs md:text-sm font-semibold tracking-wider">
                ANDAMENTO CAREER INDEX · ULTIME 8 SETTIMANE
              </span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-greenElectric" />
                  <span className="text-textMuted text-xs font-medium">
                    Career Index
                  </span>
                </div>
              </div>
              <div className="h-48 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ciData}>
                    <defs>
                      <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7CFF6B" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#7CFF6B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#7CFF6B"
                      strokeWidth={2.5}
                      fill="url(#ciGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLAYER CARD EVOLUTION */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-greenElectric text-xs font-black tracking-[0.2em]">
              PROGRESSIONE
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">
              L'evoluzione della tua card
            </h2>
            <p className="text-textMuted text-base md:text-lg mt-4 max-w-2xl mx-auto">
              Più giochi, più costruisci la tua carriera.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 md:gap-3 max-w-4xl mx-auto mb-8">
            {evolutions.map((e, i) => (
              <EvolutionCard
                key={e.ovr}
                ovr={e.ovr}
                lv={e.lv}
                label={e.label}
                last={i === evolutions.length - 1}
              />
            ))}
          </div>

          <div className="text-center max-w-lg mx-auto">
            <p className="text-textPrimary font-semibold text-lg">
              Più giochi, più costruisci la tua carriera.
            </p>
            <p className="text-textMuted text-sm mt-2 leading-relaxed">
              Anche la performance conta: OVR e Career Index possono salire o
              scendere. Il livello solo su.
            </p>
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="py-20 md:py-28 relative bg-bgSecondary/40">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-greenElectric text-xs font-black tracking-[0.2em]">
              TRAGUARDI
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">
              Achievement
            </h2>
            <p className="text-textMuted text-base md:text-lg mt-4 max-w-xl mx-auto">
              Sblocca badge esclusivi per ogni traguardo raggiunto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((a) => (
              <div
                key={a.name}
                className="rounded-xl bg-bgCard border border-greenPrimary/20 p-5 flex items-start gap-4 hover:border-greenElectric/35 transition-all"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-greenElectric/15 to-greenPrimary/10 border border-greenElectric/25 flex items-center justify-center">
                  <a.icon className="w-5.5 h-5.5 text-greenElectric" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-textPrimary font-black tracking-wide text-sm">
                    {a.name}
                  </div>
                  <div className="text-textMuted text-sm mt-1 leading-snug">
                    {a.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLO vs MULTIPLAYER */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-greenElectric text-xs font-black tracking-[0.2em]">
              MODALITÀ
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">
              Gioca come preferisci
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            <div className="rounded-3xl bg-bgCard border border-greenElectric/30 p-7 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-greenElectric/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-greenElectric/15 border border-greenElectric/30 mb-5">
                  <span className="text-greenElectric text-xs font-black tracking-wider">
                    DISPONIBILE ORA
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
                  SOLO CAREER
                </h3>
                <p className="text-textMuted leading-relaxed mb-7">
                  Costruisci la tua carriera personale, anche se sei l'unico dei
                  tuoi amici ad usare CalcettoXP.
                </p>
                <a
                  href="#pricing"
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-greenElectric text-bgPrimary font-black text-sm tracking-wider hover:bg-greenElectric/90 transition-all shadow-lg shadow-greenElectric/20"
                >
                  INIZIA ORA
                </a>
              </div>
            </div>

            <div className="rounded-3xl bg-bgCard/60 border border-textPrimary/10 p-7 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 mb-5">
                  <span className="text-yellow-400 text-xs font-black tracking-wider">
                    IN ARRIVO
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
                  MULTIPLAYER
                </h3>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "Partite verificate",
                    "Ranking locali",
                    "Matchmaking",
                    "Sfide",
                    "Squadre",
                    "Classifiche",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-textMuted">
                      <Check className="w-4 h-4 text-greenElectric/60 shrink-0" strokeWidth={3} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="inline-flex items-center px-6 py-3 rounded-xl bg-textPrimary/5 border border-textPrimary/10 text-textMuted font-black text-sm tracking-wider cursor-not-allowed"
                >
                  IN ARRIVO
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 md:py-28 relative bg-bgSecondary/40">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <span className="text-greenElectric text-xs font-black tracking-[0.2em]">
              PREZZI
            </span>
            <h2 className="text-3xl md:text-5xl font-black mt-3 tracking-tight">
              Piani per ogni giocatore
            </h2>
            <p className="text-textMuted text-base md:text-lg mt-4 max-w-xl mx-auto">
              Inizia gratis, passa a PRO quando vuoi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
            {/* FREE */}
            <div className="rounded-3xl bg-bgCard border border-greenPrimary/15 p-7 md:p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-black tracking-tight">FREE</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-textPrimary">
                    €0
                  </span>
                  <span className="text-textMuted text-sm">/mese</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {pricingFree.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-textMuted">
                    <div className="w-4 h-4 mt-0.5 shrink-0 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-greenElectric" strokeWidth={3} />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-textPrimary/20 text-textPrimary font-black text-sm tracking-wider hover:border-greenElectric/50 hover:text-greenElectric transition-all"
              >
                INIZIA GRATIS
              </a>
            </div>

            {/* PRO MENSILE */}
            <div className="relative rounded-3xl bg-bgCard border-2 border-greenElectric p-7 md:p-8 flex flex-col shadow-2xl shadow-greenElectric/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 rounded-full bg-greenElectric shadow-lg shadow-greenElectric/30">
                  <span className="text-bgPrimary text-xs font-black tracking-wider">
                    PIÙ POPOLARE
                  </span>
                </div>
              </div>
              <div className="mb-6 mt-1">
                <h3 className="text-xl font-black tracking-tight">
                  PRO <span className="text-greenElectric">Mensile</span>
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-textPrimary">
                    €3,90
                  </span>
                  <span className="text-textMuted text-sm">/mese</span>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {pricingPro.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-textMuted">
                    <div className="w-4 h-4 mt-0.5 shrink-0 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-greenElectric" strokeWidth={3} />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-greenElectric text-bgPrimary font-black text-sm tracking-wider hover:bg-greenElectric/90 transition-all shadow-lg shadow-greenElectric/25"
              >
                SBLOCCA PRO
              </a>
            </div>

            {/* PRO ANNUALE */}
            <div className="relative rounded-3xl bg-bgCard border border-greenPrimary/15 p-7 md:p-8 flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1.5 rounded-full bg-yellow-500/90 shadow-lg shadow-yellow-500/20">
                  <span className="text-bgPrimary text-xs font-black tracking-wider">
                    Risparmia ~36%
                  </span>
                </div>
              </div>
              <div className="mb-6 mt-1">
                <h3 className="text-xl font-black tracking-tight">
                  PRO <span className="text-yellow-400">Annuale</span>
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-textPrimary">
                    €29,90
                  </span>
                  <span className="text-textMuted text-sm">/anno</span>
                </div>
                <span className="text-textMuted text-xs mt-1 inline-block">
                  ~€2,49/mese
                </span>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {pricingPro.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-textMuted">
                    <div className="w-4 h-4 mt-0.5 shrink-0 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-greenElectric" strokeWidth={3} />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500/90 to-yellow-400/90 text-bgPrimary font-black text-sm tracking-wider hover:from-yellow-400 hover:to-yellow-300 transition-all shadow-lg shadow-yellow-500/20"
              >
                SBLOCCA PRO
              </a>
            </div>
          </div>
        </div>
      </section>

      <AppFooter />
      <InstallPWAButton />
    </main>
  );
}

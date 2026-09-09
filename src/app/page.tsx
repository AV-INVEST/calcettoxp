"use client";

import { useState, useEffect, useRef } from "react";
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
  Hand,
  Compass,
  Dices,
  Medal,
  Rocket,
  Mountain,
  Sparkles,
  ArrowRight,
  Goal,
  Swords,
  LogIn,
  Minus,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
import { InstallPWAButton } from "@/components/pwa/InstallPWAButton";
import AppFooter from "@/components/layout/AppFooter";
import { SmartCTA } from "@/components/cta/SmartCTA";
import {
  FreeCTAButton,
  ProCheckoutButton,
  YearlyCheckoutButton,
} from "@/components/pricing/StripeButtons";

const demoPlayers = [
  {
    id: "andrea",
    name: "ANDREA",
    role: "ATT",
    roleLabel: "Attaccante",
    ovr: 78,
    lv: 15,
    stats: [
      ["PAC", "85"],
      ["SHO", "82"],
      ["PAS", "68"],
      ["DRI", "76"],
      ["DEF", "35"],
      ["PHY", "72"],
    ],
    matches: "34",
    results: "21 V / 4 P / 9 S",
    goals: "47 gol",
    assists: "12 assist",
    winRate: "61.8%",
    ci: 1423,
    ciDelta: "+9.2%",
    ciData: [
      { m: 1, v: 960 },
      { m: 2, v: 1010 },
      { m: 3, v: 985 },
      { m: 4, v: 1070 },
      { m: 5, v: 1140 },
      { m: 6, v: 1105 },
      { m: 7, v: 1230 },
      { m: 8, v: 1310 },
      { m: 9, v: 1380 },
      { m: 10, v: 1423 },
    ],
  },
  {
    id: "federico",
    name: "FEDERICO",
    role: "CEN",
    roleLabel: "Centrocampista",
    ovr: 74,
    lv: 13,
    stats: [
      ["PAC", "74"],
      ["SHO", "65"],
      ["PAS", "84"],
      ["DRI", "78"],
      ["DEF", "62"],
      ["PHY", "70"],
    ],
    matches: "41",
    results: "24 V / 7 P / 10 S",
    goals: "18 gol",
    assists: "33 assist",
    winRate: "58.5%",
    ci: 1356,
    ciDelta: "+5.8%",
    ciData: [
      { m: 1, v: 1020 },
      { m: 2, v: 1085 },
      { m: 3, v: 1150 },
      { m: 4, v: 1120 },
      { m: 5, v: 1205 },
      { m: 6, v: 1275 },
      { m: 7, v: 1240 },
      { m: 8, v: 1315 },
      { m: 9, v: 1290 },
      { m: 10, v: 1356 },
    ],
  },
  {
    id: "riccardo",
    name: "RICCARDO",
    role: "DIF",
    roleLabel: "Difensore",
    ovr: 71,
    lv: 11,
    stats: [
      ["PAC", "68"],
      ["SHO", "38"],
      ["PAS", "62"],
      ["DRI", "55"],
      ["DEF", "86"],
      ["PHY", "80"],
    ],
    matches: "29",
    results: "16 V / 6 P / 7 S",
    goals: "5 gol",
    assists: "8 assist",
    winRate: "55.2%",
    cleanSheets: "12",
    ci: 1289,
    ciDelta: "+6.4%",
    ciData: [
      { m: 1, v: 940 },
      { m: 2, v: 995 },
      { m: 3, v: 1060 },
      { m: 4, v: 1030 },
      { m: 5, v: 1095 },
      { m: 6, v: 1175 },
      { m: 7, v: 1145 },
      { m: 8, v: 1220 },
      { m: 9, v: 1260 },
      { m: 10, v: 1289 },
    ],
  },
  {
    id: "marco",
    name: "MARCO",
    role: "POR",
    roleLabel: "Portiere",
    ovr: 76,
    lv: 14,
    stats: [
      ["PAC", "58"],
      ["SHO", "25"],
      ["PAS", "55"],
      ["DRI", "40"],
      ["DEF", "88"],
      ["PHY", "82"],
    ],
    matches: "37",
    results: "20 V / 9 P / 8 S",
    goals: "0 gol",
    saves: "142 parate",
    winRate: "54.1%",
    cleanSheets: "15",
    ci: 1368,
    ciDelta: "+7.1%",
    ciData: [
      { m: 1, v: 980 },
      { m: 2, v: 1045 },
      { m: 3, v: 1110 },
      { m: 4, v: 1075 },
      { m: 5, v: 1160 },
      { m: 6, v: 1225 },
      { m: 7, v: 1190 },
      { m: 8, v: 1280 },
      { m: 9, v: 1335 },
      { m: 10, v: 1368 },
    ],
  },
];

const steps = [
  {
    icon: PlaySquare,
    title: "GIOCA",
    desc: "Scendi in campo e vivi la tua partita solita. Niente cambiamenti alla tua routine.",
  },
  {
    icon: ClipboardList,
    title: "REGISTRA",
    desc: "Inserisci risultato, gol, assist, ruolo e performance in meno di 30 secondi.",
  },
  {
    icon: TrendingUp,
    title: "EVOLVI",
    desc: "Guadagna XP, sali di livello, migliora OVR e Career Index. La tua card prende vita.",
  },
];

const evolutions = [
  { ovr: 58, lv: 1, label: "Novizio", desc: "Le prime emozioni", accent: "from-gray-500/40" },
  { ovr: 66, lv: 5, label: "Emergente", desc: "Inizi a farti notare", accent: "from-greenPrimary/40" },
  { ovr: 73, lv: 12, label: "Affermato", desc: "Un punto di riferimento", accent: "from-greenElectric/50" },
  { ovr: 83, lv: 22, label: "Veterano", desc: "Una leggenda del rettangolo", accent: "from-yellow-400/60" },
];

const achievements = [
  { icon: Target, name: "DEBUTTO", desc: "Prima partita registrata", role: "Tutti" },
  { icon: Trophy, name: "HAT-TRICK", desc: "3 gol in una singola partita", role: "ATT/CEN" },
  { icon: Flame, name: "ON FIRE", desc: "Gol in 5 partite consecutive", role: "ATT/CEN" },
  { icon: Hand, name: "MURO", desc: "3 clean sheet di fila", role: "POR/DIF" },
  { icon: Compass, name: "PLAYMAKER", desc: "3 assist in una partita", role: "CEN/ATT" },
  { icon: ShieldCheck, name: "IMBATTIBILE", desc: "10 partite senza sconfitte", role: "Tutti" },
  { icon: Swords, name: "GLADIATORE", desc: "20 tackle vinti in una stagione", role: "DIF/CEN" },
  { icon: Goal, name: "ARRIVI STOPPATI", desc: "50 parate totali", role: "POR" },
  { icon: Star, name: "CENTURIONE", desc: "100 partite giocate", role: "Tutti" },
  { icon: Crown, name: "1500 CLUB", desc: "Career Index oltre 1500", role: "Tutti" },
  { icon: Zap, name: "IRONMAN", desc: "25 presenze in una stagione", role: "Tutti" },
  { icon: Medal, name: "CAPITANO", desc: "50% vittorie in carriera", role: "Tutti" },
  { icon: Rocket, name: "MOSTRO", desc: "OVR raggiunge 80", role: "Tutti" },
  { icon: Mountain, name: "MARATONETA", desc: "1000 minuti totali", role: "Tutti" },
];

const pricingFree = [
  "Profilo giocatore personale",
  "Card ufficiale CalcettoXP",
  "Partite illimitate sempre",
  "Statistiche essenziali",
  "Career Index base",
  "XP e progressioni livelli",
  "Achievement base",
  "Grafico CI sintetico",
  "Stagione corrente",
];

const pricingPro = [
  "Tutto incluso nel piano FREE",
  "Statistiche avanzate complete",
  "Storico completo illimitato",
  "Grafici evoluti e multi-periodo",
  "Analisi 7 / 30 / 90 giorni",
  "Record personali e streak",
  "Stats filtrate per ruolo, periodo e risultato",
  "Migliori streak da record",
  "Confronto tra stagioni",
  "Card premium con personalizzazioni",
  "Achievement esclusivi PRO",
  "Insight sulla forma fisica",
  "Badge PRO esclusivo",
  "Supporto prioritario",
];

function PitchLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/5 left-0 w-full h-px bg-gradient-to-r from-transparent via-greenElectric/15 to-transparent" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-greenPrimary/8 to-transparent" />
      <div className="absolute top-4/5 left-0 w-full h-px bg-gradient-to-r from-transparent via-greenElectric/15 to-transparent" />
      <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-greenElectric/10 to-transparent" />
      <div className="absolute left-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-greenElectric/5 to-transparent" />
      <div className="absolute left-2/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-greenElectric/5 to-transparent" />
      <div
        className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-greenElectric/5"
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-greenElectric/12"
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-greenElectric/18"
      />
    </div>
  );
}

function DemoPlayerCard({ player, animate }: { player: typeof demoPlayers[0]; animate?: boolean }) {
  const cardWrapClass =
    "relative mx-auto w-full max-w-[300px]" + (animate ? " animate-float-slow" : "");
  return (
    <div className={cardWrapClass}>
      <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-greenElectric via-greenPrimary to-greenElectric/20 opacity-70 blur-[2px]" />
      <div className="relative rounded-3xl bg-gradient-to-br from-bgSecondary to-bgCard p-5 border border-greenPrimary/25">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center border-2 border-greenElectric/50 shadow-lg shadow-greenElectric/25 animate-pulse-glow">
              <span className="text-bgPrimary font-black text-2xl">{player.ovr}</span>
            </div>
            <span className="text-[10px] text-greenElectric font-bold mt-1 tracking-wider">
              OVR
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="px-3 py-1 rounded-md bg-greenElectric/15 border border-greenElectric/35">
              <span className="text-greenElectric text-xs font-black tracking-widest">
                {player.role}
              </span>
            </div>
            <span className="text-textMuted text-xs mt-1 font-medium">
              LV <span className="text-textPrimary font-bold text-sm">{player.lv}</span>
            </span>
            <span className="text-textMuted/80 text-[10px] font-medium">
              {player.roleLabel}
            </span>
          </div>
        </div>

        <div className="my-5 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-greenPrimary/10 to-greenElectric/5 blur-xl opacity-60" />
            <div className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-greenPrimary/25 via-greenElectric/15 to-transparent border border-greenElectric/25 flex items-center justify-center">
              {player.role === "POR" ? (
                <Hand className="w-16 h-16 text-greenElectric/80" strokeWidth={1.5} />
              ) : player.role === "DIF" ? (
                <ShieldCheck className="w-16 h-16 text-greenElectric/80" strokeWidth={1.5} />
              ) : player.role === "CEN" ? (
                <Compass className="w-16 h-16 text-greenElectric/80" strokeWidth={1.5} />
              ) : (
                <Target className="w-16 h-16 text-greenElectric/80" strokeWidth={1.5} />
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-5">
          <h3 className="text-textPrimary font-black text-2xl tracking-tight">
            {player.name}
          </h3>
          <div className="h-px w-20 mx-auto mt-2 bg-gradient-to-r from-transparent via-greenElectric/50 to-transparent" />
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {player.stats.map(([k, v]) => (
            <div key={k} className="flex justify-between items-center border-b border-greenElectric/12 pb-1.5 last:border-b-0">
              <span className="text-textMuted font-black tracking-wide">{k}</span>
              <span className="text-textPrimary font-black text-sm">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ciSequence = [
  { step: 0, label: "START", delta: 0, value: 1000, type: "start" },
  { step: 1, label: "VITTORIA", delta: +18, value: 1018, type: "win" },
  { step: 2, label: "VITTORIA", delta: +16, value: 1034, type: "win" },
  { step: 3, label: "PAREGGIO", delta: 0, value: 1034, type: "draw" },
  { step: 4, label: "SCONFITTA", delta: -15, value: 1019, type: "loss" },
  { step: 5, label: "VITTORIA", delta: +23, value: 1042, type: "win" },
  { step: 6, label: "VITTORIA", delta: +18, value: 1060, type: "win" },
  { step: 7, label: "SCONFITTA", delta: -13, value: 1047, type: "loss" },
  { step: 8, label: "VITTORIA", delta: +28, value: 1075, type: "win" },
];

const pillBaseWin = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-greenElectric/12 border border-greenElectric/35 text-greenElectric text-[10px] font-black tracking-wider";
const pillBaseDraw = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-textPrimary/8 border border-textPrimary/20 text-textMuted text-[10px] font-black tracking-wider";
const pillBaseLoss = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/12 border border-danger/35 text-danger text-[10px] font-black tracking-wider";
const pillBaseStart = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-greenPrimary/10 border border-greenPrimary/30 text-greenPrimary/90 text-[10px] font-black tracking-wider";

const heroCIDemoWrap = "mx-auto mt-7 w-full max-w-[300px] rounded-2xl bg-bgCard/85 backdrop-blur-sm border border-greenPrimary/20 p-5 shadow-lg shadow-black/20";
const heroCIHeaderRow = "flex items-center justify-between mb-3";
const heroCITitle = "text-textMuted text-[11px] font-bold tracking-[0.18em]";
const heroCIDeltaRowWin = "flex items-center gap-1.5";
const heroCIDeltaRowLoss = "flex items-center gap-1.5";
const heroCIDeltaRowDraw = "flex items-center gap-1.5";
const heroCIDeltaTextWin = "text-greenElectric text-xs font-bold";
const heroCIDeltaTextLoss = "text-danger text-xs font-bold";
const heroCIDeltaTextDraw = "text-textMuted text-xs font-bold";
const heroCIMainRow = "flex items-end justify-between gap-3";
const heroCICounterWrap = "flex flex-col gap-1";
const heroCIPillRow = "flex flex-wrap gap-1.5 mt-3";
const heroCIChartWrap = "w-full h-20 mt-4";
const heroCIStatic = "mx-auto mt-7 w-full max-w-[300px] rounded-2xl bg-bgCard/85 backdrop-blur-sm border border-greenPrimary/20 p-5 shadow-lg shadow-black/20";

function HeroCILiveDemo() {
  const [stepIdx, setStepIdx] = useState(0);
  const [displayValue, setDisplayValue] = useState(ciSequence[0].value);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const counterRef = useRef<number>(ciSequence[0].value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else mql.removeListener(handler);
    };
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    const target = ciSequence[stepIdx].value;
    const from = counterRef.current;
    const diff = target - from;
    const duration = 520;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(from + diff * eased);
      setDisplayValue(v);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else counterRef.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stepIdx, prefersReduced]);

  useEffect(() => {
    if (prefersReduced) return;
    const isLast = stepIdx === ciSequence.length - 1;
    const delay = isLast ? 3200 : 1600;
    const id = setTimeout(() => {
      setStepIdx(isLast ? 0 : stepIdx + 1);
    }, delay);
    return () => clearTimeout(id);
  }, [stepIdx, prefersReduced]);

  if (prefersReduced) {
    const finalStep = ciSequence[ciSequence.length - 1];
    const visibleData = ciSequence.map((s, i) => ({ i, v: s.value }));
    return (
      <div className={heroCIStatic}>
        <div className={heroCIHeaderRow}>
          <span className={heroCITitle}>CAREER INDEX · LIVE</span>
          <div className={heroCIDeltaRowWin}>
            <TrendingUp className="w-4 h-4 text-greenElectric" strokeWidth={2.5} />
            <span className={heroCIDeltaTextWin}>+7.5%</span>
          </div>
        </div>
        <div className={heroCIMainRow}>
          <div className={heroCICounterWrap}>
            <span className="text-textPrimary font-black text-3xl tracking-tight">
              {finalStep.value.toLocaleString("it-IT")}
            </span>
            <div className="inline-flex items-center gap-1 text-greenElectric text-[11px] font-bold">
              <TrendingUp className="w-3 h-3" strokeWidth={2.5} /> +75 totali
            </div>
          </div>
          <div className="flex gap-0.5 flex-wrap justify-end max-w-[110px]">
            {ciSequence.slice(1).map((s, idx) => {
              const isActive = true;
              const pillClass =
                s.type === "win" ? pillBaseWin :
                s.type === "loss" ? pillBaseLoss :
                s.type === "draw" ? pillBaseDraw : pillBaseStart;
              return (
                <div key={idx} className={pillClass + (isActive ? " opacity-100" : " opacity-40")}>
                  {s.type === "win" && <TrendingUp className="w-2.5 h-2.5" strokeWidth={3} />}
                  {s.type === "loss" && <TrendingDown className="w-2.5 h-2.5" strokeWidth={3} />}
                  {s.type === "draw" && <Minus className="w-2.5 h-2.5" strokeWidth={3} />}
                  {s.delta > 0 ? "+" : ""}{s.delta}
                </div>
              );
            })}
          </div>
        </div>
        <div className={heroCIChartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visibleData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="#7CFF6B"
                strokeWidth={2.5}
                dot={false}
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  const current = ciSequence[stepIdx];
  const visibleSteps = ciSequence.slice(0, stepIdx + 1);
  const chartData = visibleSteps.map((s, i) => ({ i, v: s.value }));
  const totalDash = 500;
  const progress = stepIdx / (ciSequence.length - 1);
  const dashOffset = totalDash * (1 - progress);

  const deltaRowClass =
    current.type === "loss" ? heroCIDeltaRowLoss :
    current.type === "draw" ? heroCIDeltaRowDraw :
    heroCIDeltaRowWin;
  const deltaTextClass =
    current.type === "loss" ? heroCIDeltaTextLoss :
    current.type === "draw" ? heroCIDeltaTextDraw :
    heroCIDeltaTextWin;

  return (
    <div className={heroCIDemoWrap}>
      <div className={heroCIHeaderRow}>
        <span className={heroCITitle}>CAREER INDEX · LIVE</span>
        <div className={deltaRowClass}>
          {current.type === "loss" ? (
            <TrendingDown className="w-4 h-4 text-danger" strokeWidth={2.5} />
          ) : current.type === "draw" ? (
            <Minus className="w-4 h-4 text-textMuted" strokeWidth={2.5} />
          ) : (
            <TrendingUp className="w-4 h-4 text-greenElectric" strokeWidth={2.5} />
          )}
          <span className={deltaTextClass}>
            {current.type === "start" ? "BASE" : current.delta > 0 ? "+" : ""}{current.delta !== 0 || current.type !== "start" ? current.delta : ""}
          </span>
        </div>
      </div>
      <div className={heroCIMainRow}>
        <div className={heroCICounterWrap}>
          <span className="text-textPrimary font-black text-3xl tracking-tight tabular-nums">
            {displayValue.toLocaleString("it-IT")}
          </span>
          <div
            className={
              current.type === "loss"
                ? "inline-flex items-center gap-1 text-danger text-[11px] font-bold"
                : current.type === "draw"
                ? "inline-flex items-center gap-1 text-textMuted text-[11px] font-bold"
                : "inline-flex items-center gap-1 text-greenElectric text-[11px] font-bold"
            }
          >
            {current.type === "loss" ? (
              <TrendingDown className="w-3 h-3" strokeWidth={2.5} />
            ) : current.type === "draw" ? (
              <Minus className="w-3 h-3" strokeWidth={2.5} />
            ) : (
              <TrendingUp className="w-3 h-3" strokeWidth={2.5} />
            )}
            TAPPA {stepIdx + 1}/{ciSequence.length}
          </div>
        </div>
        <div className="flex gap-0.5 flex-wrap justify-end max-w-[110px]">
          {ciSequence.slice(1).map((s, idx) => {
            const isActive = idx < stepIdx;
            const isCurrent = idx === stepIdx - 1 || (stepIdx === 0 && idx === -1);
            const pillClass =
              s.type === "win" ? pillBaseWin :
              s.type === "loss" ? pillBaseLoss :
              s.type === "draw" ? pillBaseDraw : pillBaseStart;
            return (
              <div
                key={idx}
                className={pillClass + (isActive ? " opacity-100" : " opacity-30") + (isCurrent ? " animate-pulse-glow" : "")}
              >
                {s.type === "win" && <TrendingUp className="w-2.5 h-2.5" strokeWidth={3} />}
                {s.type === "loss" && <TrendingDown className="w-2.5 h-2.5" strokeWidth={3} />}
                {s.type === "draw" && <Minus className="w-2.5 h-2.5" strokeWidth={3} />}
                {s.delta > 0 ? "+" : ""}{s.delta}
              </div>
            );
          })}
        </div>
      </div>
      <div className={heroCIChartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 6, right: 6, bottom: 2, left: 6 }}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#7CFF6B"
              strokeWidth={2.5}
              dot={(props: any) => {
                const { cx, cy, payload, index } = props;
                const isLast = index === visibleSteps.length - 1;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isLast ? 4 : 0}
                    fill="#7CFF6B"
                    stroke="#070A08"
                    strokeWidth={2}
                    className={isLast ? "animate-pulse-glow" : ""}
                  />
                );
              }}
              activeDot={false}
              strokeLinecap="round"
              strokeDasharray={totalDash}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const evoCardOuter = "relative flex flex-col items-center z-10";
const evoTappaPill = "mb-2 md:mb-3 inline-flex items-center justify-center px-3 py-1 rounded-full border backdrop-blur-sm";
const evoTappaPill0 = evoTappaPill + " bg-gray-500/10 border-gray-500/30 text-gray-400";
const evoTappaPill1 = evoTappaPill + " bg-greenPrimary/10 border-greenPrimary/35 text-greenPrimary";
const evoTappaPill2 = evoTappaPill + " bg-greenElectric/12 border-greenElectric/40 text-greenElectric";
const evoTappaPill3 = evoTappaPill + " bg-yellow-400/15 border-yellow-400/45 text-yellow-400";
const evoTappaText = "text-[10px] md:text-[11px] font-black tracking-[0.2em]";

const evoCardShellBase = "relative w-28 h-40 md:w-full md:h-52 rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-300 group";
const evoCardShell0 = evoCardShellBase + " bg-gradient-to-br from-bgSecondary via-bgCard to-bgSecondary border border-greenPrimary/25 hover:border-greenElectric/40";
const evoCardShell1 = evoCardShellBase + " bg-gradient-to-br from-bgSecondary via-bgCard to-bgSecondary border border-greenPrimary/25 hover:border-greenElectric/40";
const evoCardShell2 = evoCardShellBase + " bg-gradient-to-br from-bgSecondary via-bgCard to-bgSecondary border border-greenElectric/30 hover:border-greenElectric/50";
const evoCardShell3 = evoCardShellBase + " bg-gradient-to-br from-bgSecondary via-bgCard to-bgSecondary border-2 border-yellow-400/40 hover:border-yellow-400/60 shadow-[0_0_0_1px_rgba(234,179,8,0.15),0_0_24px_rgba(234,179,8,0.1)]";

const evoAccentGlowBase = "absolute -inset-0.5 rounded-2xl opacity-80 blur-[1.5px]";
const evoAccentGlow0 = evoAccentGlowBase + " bg-gradient-to-br from-gray-500/40 via-greenPrimary/30 to-transparent";
const evoAccentGlow1 = evoAccentGlowBase + " bg-gradient-to-br from-greenPrimary/40 via-greenPrimary/30 to-transparent";
const evoAccentGlow2 = evoAccentGlowBase + " bg-gradient-to-br from-greenElectric/50 via-greenPrimary/30 to-transparent";
const evoAccentGlow3 = evoAccentGlowBase + " bg-gradient-to-br from-yellow-400/60 via-yellow-400/30 to-transparent";

const evoOvrBadge = "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 shadow-lg group-hover:scale-105 transition-transform";
const evoOvrBadge0 = evoOvrBadge + " bg-gradient-to-br from-gray-400 to-greenPrimary/70 border-greenPrimary/40 shadow-greenPrimary/15";
const evoOvrBadge1 = evoOvrBadge + " bg-gradient-to-br from-greenPrimary to-greenPrimary border-greenPrimary/50 shadow-greenPrimary/20";
const evoOvrBadge2 = evoOvrBadge + " bg-gradient-to-br from-greenElectric to-greenPrimary border-greenElectric/50 shadow-greenElectric/20";
const evoOvrBadge3 = evoOvrBadge + " bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-300/60 shadow-yellow-400/25";

const evoOvrText = "text-bgPrimary font-black text-xl md:text-2xl";

const evoInfoRow = "mt-3 text-center";
const evoOvrLabel = "text-textPrimary font-black text-base md:text-lg tracking-tight";
const evoLvlLabel0 = "text-gray-400 text-[11px] md:text-xs font-bold";
const evoLvlLabel1 = "text-greenPrimary text-[11px] md:text-xs font-bold";
const evoLvlLabel2 = "text-greenElectric text-[11px] md:text-xs font-bold";
const evoLvlLabel3 = "text-yellow-400 text-[11px] md:text-xs font-bold";
const evoDesc = "text-textMuted/70 text-[10px] md:text-[11px] leading-tight mt-1";

const evoMobileConnBase = "flex items-center justify-center my-2 md:hidden relative h-10";
const evoMobileConnLineBase = "w-px h-10";
const evoMobileConnLine01 = evoMobileConnLineBase + " bg-gradient-to-b from-gray-500/40 via-greenPrimary/40 to-greenPrimary/40";
const evoMobileConnLine12 = evoMobileConnLineBase + " bg-gradient-to-b from-greenPrimary/40 via-greenElectric/50 to-greenElectric/50";
const evoMobileConnLine23 = evoMobileConnLineBase + " bg-gradient-to-b from-greenElectric/50 via-yellow-400/60 to-yellow-400/60";

const evoTimelineSectionWrap = "relative max-w-5xl mx-auto";
const evoDesktopTimeline = "hidden md:block absolute left-0 right-0 top-[72px] h-12 pointer-events-none z-0";
const evoDesktopTrackRow = "relative w-full h-full flex items-center";
const evoDesktopTrack = "absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full overflow-hidden";
const evoDesktopTrack01 = "bg-gradient-to-r from-gray-500/30 via-greenPrimary/50 to-greenPrimary/50";
const evoDesktopTrack12 = "bg-gradient-to-r from-greenPrimary/50 via-greenElectric/60 to-greenElectric/60";
const evoDesktopTrack23 = "bg-gradient-to-r from-greenElectric/60 via-yellow-400/70 to-yellow-400/70";

const evoPulseBallBase = "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full";
const evoPulseBall01 = evoPulseBallBase + " bg-greenPrimary shadow-[0_0_12px_rgba(34,197,94,0.8),0_0_24px_rgba(124,255,107,0.5)]";
const evoPulseBall12 = evoPulseBallBase + " bg-greenElectric shadow-[0_0_12px_rgba(124,255,107,0.9),0_0_28px_rgba(124,255,107,0.6)]";
const evoPulseBall23 = evoPulseBallBase + " bg-yellow-400 shadow-[0_0_14px_rgba(234,179,8,0.9),0_0_28px_rgba(234,179,8,0.6)]";

function EvolutionCard({
  ovr,
  lv,
  label,
  desc,
  index,
}: {
  ovr: number;
  lv: number;
  label: string;
  desc: string;
  index: number;
}) {
  const tappaPill = [evoTappaPill0, evoTappaPill1, evoTappaPill2, evoTappaPill3][index];
  const cardShell = [evoCardShell0, evoCardShell1, evoCardShell2, evoCardShell3][index];
  const accentGlow = [evoAccentGlow0, evoAccentGlow1, evoAccentGlow2, evoAccentGlow3][index];
  const ovrBadge = [evoOvrBadge0, evoOvrBadge1, evoOvrBadge2, evoOvrBadge3][index];
  const lvlLabel = [evoLvlLabel0, evoLvlLabel1, evoLvlLabel2, evoLvlLabel3][index];
  const mobileConn = [evoMobileConnLine01, evoMobileConnLine12, evoMobileConnLine23, ""][index];
  const mobileColor = [
    "text-greenPrimary/60",
    "text-greenElectric/70",
    "text-yellow-400/70",
    "",
  ][index];

  return (
    <div className={evoCardOuter}>
      <div className={tappaPill}>
        <span className={evoTappaText}>TAPPA {index + 1}</span>
      </div>
      <div className="relative shrink-0">
        <div className={accentGlow} />
        <div className={cardShell}>
          <div className={ovrBadge}>
            <span className={evoOvrText}>{ovr}</span>
          </div>
          <div className={evoInfoRow}>
            <span className={evoOvrLabel}>OVR {ovr}</span>
            <div className="mt-1 space-y-0.5">
              <p className={lvlLabel}>
                LV {lv} · {label}
              </p>
              <p className={evoDesc}>{desc}</p>
            </div>
          </div>
        </div>
      </div>
      {index < 3 && (
        <div className={evoMobileConnBase}>
          <div className={mobileConn} />
          <ChevronRight
            className={"w-5 h-5 rotate-90 absolute bottom-0 " + mobileColor}
            strokeWidth={2.5}
          />
        </div>
      )}
    </div>
  );
}

function AchievementIcon({ icon: Icon }: { icon: any }) {
  return <Icon className="w-6 h-6 text-greenElectric" strokeWidth={2} />;
}

export default function LandingPage() {
  const [activePlayer, setActivePlayer] = useState("andrea");
  const currentPlayer = demoPlayers.find((p) => p.id === activePlayer) ?? demoPlayers[0];

  const handleScrollComeFunziona = () => {
    const el = document.getElementById("come-funziona");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const keyframesCss = `
    @keyframes evo-ball-travel {
      0% { left: -4%; opacity: 0; }
      10% { opacity: 1; }
      50% { left: 100%; opacity: 1; }
      60% { opacity: 0; }
      100% { left: -4%; opacity: 0; }
    }
  `;

  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary overflow-x-hidden pitch-wrapper">
      <style dangerouslySetInnerHTML={{ __html: keyframesCss }} />
      {/* HERO */}
      <section className="relative pt-6 pb-20 md:pt-12 md:pb-32">
        <PitchLines />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between mb-10 md:mb-18">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-greenElectric to-greenPrimary flex items-center justify-center shadow-lg shadow-greenElectric/25">
                <Zap className="w-5 h-5 text-bgPrimary" strokeWidth={3} />
              </div>
              <span className="font-black text-greenElectric text-2xl tracking-tight">
                CalcettoXP
              </span>
            </div>
            <div className="hidden sm:block">
              <SmartCTA
                label="ACCEDI"
                icon={LogIn}
                variant="secondary"
                size="md"
                loggedInLabel="DASHBOARD"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-14 md:gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-greenElectric/25 bg-greenElectric/8 px-4 py-2 mb-7 backdrop-blur-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-greenElectric opacity-50" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-greenElectric" />
                </span>
                <span className="text-greenElectric text-xs font-black tracking-[0.18em]">
                  STAGIONE 2026 · ATTIVA
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.02] text-textPrimary tracking-tight">
                Ogni partita.{" "}
                <span className="text-gradient-green">La tua carriera.</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-textMuted mt-5 md:mt-7 leading-relaxed max-w-xl">
                Trasforma il tuo calcetto settimanale in una carriera vera. Registra,
                cresci, colleziona achievement e guarda la tua card evolvere partita dopo partita.
              </p>

              <div className="mt-9 md:mt-11 flex flex-col sm:flex-row gap-3.5 md:gap-4">
                <SmartCTA
                  label="CREA LA TUA CARRIERA"
                  icon={Target}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="shadow-xl shadow-greenElectric/25 hover:shadow-greenElectric/40 hover:-translate-y-0.5"
                  loggedInLabel="VAI ALLA DASHBOARD"
                />
                <button
                  type="button"
                  onClick={handleScrollComeFunziona}
                  className="inline-flex items-center justify-center px-7 md:px-8 py-3.5 md:py-4 rounded-xl border border-textPrimary/20 text-textPrimary font-black text-sm md:text-base tracking-wider hover:border-greenElectric/50 hover:text-greenElectric hover:bg-greenElectric/5 transition-all group"
                >
                  SCOPRI COME FUNZIONA
                  <ChevronRight className="ml-1.5 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </button>
              </div>

              <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex -space-x-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-bgPrimary bg-gradient-to-br from-greenPrimary/40 to-greenElectric/30 flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 md:w-4.5 md:h-4.5 text-greenElectric/90" strokeWidth={2} />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-textPrimary font-bold text-sm md:text-base">
                    +2.400+ giocatori
                  </p>
                  <p className="text-textMuted text-xs md:text-sm">
                    stanno costruendo la propria carriera
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-greenElectric/10 blur-3xl" />
              <div className="absolute -bottom-8 -left-6 w-40 h-40 rounded-full bg-greenPrimary/10 blur-3xl" />
              <div className="relative animate-float-slower">
                <DemoPlayerCard player={currentPlayer} animate={false} />
                <HeroCILiveDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gradient-to-t from-bgPrimary via-bgPrimary/98 to-transparent pt-7 pb-4 px-5 safe-bottom">
        <SmartCTA
          label="INIZIA ORA"
          icon={PlaySquare}
          variant="primary"
          size="lg"
          fullWidth
          className="shadow-2xl shadow-greenElectric/30"
          loggedInLabel="VAI ALLA DASHBOARD"
        />
      </div>
      <div className="h-28 md:h-0" />

      {/* COME FUNZIONA */}
      <section id="come-funziona" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-5">
              <Sparkles className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2.5} />
              <span className="text-greenElectric text-[11px] font-black tracking-[0.2em]">
                IL PROCESSO
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mt-3 tracking-tight">
              Come <span className="text-gradient-green">funziona</span>
            </h2>
            <p className="text-textMuted text-base md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
              Tre mosse, zero complicazioni. La tua routine di sempre, ma con un obiettivo in più.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-5 md:gap-7">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="relative group rounded-3xl bg-bgCard/70 backdrop-blur-sm border border-greenPrimary/12 p-7 md:p-9 hover:border-greenElectric/35 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-greenElectric/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-greenElectric/20 to-greenPrimary/15 border border-greenElectric/35 flex items-center justify-center shadow-lg shadow-greenElectric/10 group-hover:scale-110 transition-transform duration-300">
                      <s.icon className="w-7 h-7 text-greenElectric" strokeWidth={2.3} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-greenElectric text-[11px] font-black tracking-widest">
                        PASSO 0{i + 1}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
                    {s.title}
                  </h3>
                  <p className="text-textMuted leading-relaxed text-base md:text-lg">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GIOCATORI DEMO CON TABS */}
      <section className="py-20 md:py-32 relative bg-bgSecondary/50">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-5">
              <Users className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2.5} />
              <span className="text-greenElectric text-[11px] font-black tracking-[0.2em]">
                CARRIERE DEMO
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mt-3 tracking-tight">
              Quattro giocatori,{" "}
              <span className="text-gradient-green">quattro carriere</span>
            </h2>
            <p className="text-textMuted text-base md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
              Ogni ruolo ha la sua storia. Sfoglia le carriere dei nostri giocatori testimonial.
            </p>
          </div>

          {/* Tabs giocatori */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-14">
            {demoPlayers.map((p) => {
              const isActive = activePlayer === p.id;
              const baseBtn =
                "px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-sm md:text-base tracking-wider transition-all duration-300 border";
              const btnClass = isActive
                ? baseBtn +
                  " bg-gradient-to-r from-greenElectric to-greenPrimary text-bgPrimary border-greenElectric shadow-xl shadow-greenElectric/25 scale-105"
                : baseBtn +
                  " bg-bgCard/60 text-textMuted border-greenPrimary/10 hover:border-greenElectric/30 hover:text-textPrimary";
              const roleClass = isActive
                ? "ml-2 font-black tracking-widest text-bgPrimary/80"
                : "ml-2 font-black tracking-widest text-greenElectric/70";
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePlayer(p.id)}
                  className={btnClass}
                >
                  <span className="hidden md:inline">{p.name}</span>
                  <span className="md:hidden">{p.name}</span>
                  <span
                    className={roleClass}
                    style={{ fontSize: "10px", lineHeight: 1 }}
                  >
                    <span className="hidden md:inline" style={{ fontSize: "12px" }}>
                      {p.role}
                    </span>
                    <span className="md:hidden">{p.role}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl bg-bgCard/70 backdrop-blur-sm border border-greenPrimary/18 p-6 md:p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-greenElectric/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="relative grid lg:grid-cols-[320px_1fr] gap-8 md:gap-12 items-start">
              <div className="flex justify-center lg:justify-start">
                <DemoPlayerCard player={currentPlayer} animate />
              </div>

              <div className="space-y-7 md:space-y-9">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-greenPrimary/25 to-greenElectric/12 border border-greenElectric/30 flex items-center justify-center shrink-0">
                      {currentPlayer.role === "POR" ? (
                        <Hand className="w-10 h-10 md:w-12 md:h-12 text-greenElectric/85" strokeWidth={1.5} />
                      ) : currentPlayer.role === "DIF" ? (
                        <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-greenElectric/85" strokeWidth={1.5} />
                      ) : currentPlayer.role === "CEN" ? (
                        <Compass className="w-10 h-10 md:w-12 md:h-12 text-greenElectric/85" strokeWidth={1.5} />
                      ) : (
                        <Target className="w-10 h-10 md:w-12 md:h-12 text-greenElectric/85" strokeWidth={1.5} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black tracking-tight">
                        {currentPlayer.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 rounded-md bg-greenElectric/15 border border-greenElectric/35 text-greenElectric text-xs font-black tracking-widest">
                          {currentPlayer.role}
                        </span>
                        <span className="text-textMuted text-sm md:text-base">
                          <span className="text-textPrimary font-bold">{currentPlayer.roleLabel}</span> · OVR{" "}
                          <span className="text-textPrimary font-bold">{currentPlayer.ovr}</span> · LV{" "}
                          <span className="text-textPrimary font-bold">{currentPlayer.lv}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:gap-4 bg-gradient-to-r from-greenElectric/12 via-greenPrimary/8 to-greenElectric/5 border border-greenElectric/25 rounded-2xl p-4 md:px-6 md:py-4.5 self-start md:self-auto md:ml-auto">
                    <div>
                      <div className="text-[11px] text-textMuted font-bold tracking-[0.2em]">
                        CAREER INDEX
                      </div>
                      <div className="flex items-baseline gap-2.5 mt-1">
                        <span className="text-3xl md:text-4xl font-black text-textPrimary tracking-tight">
                          {currentPlayer.ci.toLocaleString("it-IT")}
                        </span>
                        <span className="text-greenElectric text-sm font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} /> {currentPlayer.ciDelta}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4.5">
                  {[
                    [currentPlayer.matches, "Partite"],
                    [currentPlayer.results, "Risultati"],
                    [currentPlayer.goals, currentPlayer.assists],
                    [currentPlayer.winRate, "Win Rate"],
                  ].map(([v, l]) => (
                    <div
                      key={String(l)}
                      className="rounded-2xl bg-bgPrimary/60 border border-greenPrimary/12 p-4 md:p-5 hover:border-greenElectric/25 transition-colors"
                    >
                      <div className="text-textPrimary font-black text-lg md:text-2xl tracking-tight">
                        {v}
                      </div>
                      <div className="text-textMuted text-xs md:text-sm mt-1.5 font-medium">
                        {l}
                      </div>
                    </div>
                  ))}
                  {currentPlayer.cleanSheets && (
                    <div className="rounded-2xl bg-bgPrimary/60 border border-greenPrimary/12 p-4 md:p-5 hover:border-greenElectric/25 transition-colors col-span-2 md:col-span-4">
                      <div className="text-textPrimary font-black text-lg md:text-2xl tracking-tight">
                        {currentPlayer.cleanSheets} Clean Sheet
                      </div>
                      <div className="text-textMuted text-xs md:text-sm mt-1.5 font-medium">
                        Porta inviolata
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-bgPrimary/60 border border-greenPrimary/12 p-5 md:p-7">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-5 md:mb-6">
                  <span className="text-textMuted text-xs md:text-sm font-bold tracking-[0.18em]">
                    ANDAMENTO CAREER INDEX · ULTIME 10 SETTIMANE
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-greenElectric shadow-[0_0_8px_rgba(124,255,107,0.6)]" />
                    <span className="text-textMuted text-xs font-medium">
                      Career Index
                    </span>
                  </div>
                </div>
                <div className="h-52 md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentPlayer.ciData}>
                      <defs>
                        <linearGradient id={`ciGrad-${currentPlayer.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7CFF6B" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#7CFF6B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="m"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#8B968D", fontSize: 11 }}
                        tickFormatter={(v) => `S${v}`}
                        dy={8}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#111713",
                          border: "1px solid rgba(34, 197, 94, 0.25)",
                          borderRadius: "12px",
                          fontSize: "13px",
                          color: "#F8FAF8",
                        }}
                        labelFormatter={(v) => `Settimana ${v}`}
                        formatter={(value: any) => [`CI: ${Number(value).toLocaleString("it-IT")}`]}
                        cursor={{ stroke: "#7CFF6B", strokeWidth: 1, strokeDasharray: "4 4" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#7CFF6B"
                        strokeWidth={3}
                        fill={`url(#ciGrad-${currentPlayer.id})`}
                        strokeLinecap="round"
                        dot={{ r: 4, fill: "#7CFF6B", stroke: "#070A08", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#7CFF6B", stroke: "#070A08", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* EVOLUZIONE CARD */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-5">
              <Award className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2.5} />
              <span className="text-greenElectric text-[11px] font-black tracking-[0.2em]">
                LA PROGRESSIONE
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mt-3 tracking-tight">
              L'evoluzione della{" "}
              <span className="text-gradient-green">della tua card</span>
            </h2>
            <p className="text-textMuted text-base md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
              Ogni partita conta. Più scendi in campo, più la tua card si trasforma.
            </p>
          </div>

          <div className={evoTimelineSectionWrap}>
            <div className={evoDesktopTimeline}>
              <div className={evoDesktopTrackRow}>
                <div className={evoDesktopTrack + " " + evoDesktopTrack01} style={{ left: "12.5%", width: "25%" }}>
                  <div className={evoPulseBall01} style={{ animation: "evo-ball-travel 4s ease-in-out infinite 0s" }} />
                </div>
                <div className={evoDesktopTrack + " " + evoDesktopTrack12} style={{ left: "37.5%", width: "25%" }}>
                  <div className={evoPulseBall12} style={{ animation: "evo-ball-travel 4s ease-in-out infinite 1.33s" }} />
                </div>
                <div className={evoDesktopTrack + " " + evoDesktopTrack23} style={{ left: "62.5%", width: "25%" }}>
                  <div className={evoPulseBall23} style={{ animation: "evo-ball-travel 4s ease-in-out infinite 2.66s" }} />
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4 md:gap-6 mb-10 md:mb-12">
              {evolutions.map((e, i) => (
                <EvolutionCard
                  key={e.ovr}
                  ovr={e.ovr}
                  lv={e.lv}
                  label={e.label}
                  desc={e.desc}
                  index={i}
                />
              ))}
            </div>

            <div className="relative rounded-3xl bg-gradient-to-br from-greenElectric/10 via-greenPrimary/5 to-transparent border border-greenElectric/20 p-6 md:p-8 text-center max-w-3xl mx-auto">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-bgPrimary border border-greenElectric/25">
                <Dices className="w-3.5 h-3.5 text-greenElectric inline mr-1.5" strokeWidth={2.5} />
                <span className="text-greenElectric text-[11px] font-black tracking-wider">
                  COME FUNZIONA
                </span>
              </div>
              <h4 className="text-textPrimary font-black text-lg md:text-2xl mt-2 mb-2">
                Ogni partita plasma la tua carriera
              </h4>
              <p className="text-textMuted text-sm md:text-base leading-relaxed">
                L'<span className="text-textPrimary font-bold">OVR</span> e il <span className="text-textPrimary font-bold">Career Index</span> rispondono alle performance,
                possono salire ma anche scendere. Il <span className="text-textPrimary font-bold">livello</span> invece sale sempre,
                alimentato dalle XP guadagnate con ogni presenza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS */}
      <section className="py-20 md:py-32 relative bg-bgSecondary/50">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-5">
              <Medal className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2.5} />
              <span className="text-greenElectric text-[11px] font-black tracking-[0.2em]">
                I TRAGUARDI
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mt-3 tracking-tight">
              Achievement <span className="text-gradient-green">da collezione</span>
            </h2>
            <p className="text-textMuted text-base md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
              Ogni traguardo raggiunto, una storia da incidere sulla tua carriera.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {achievements.map((a) => (
              <div
                key={a.name}
                className="group relative rounded-2xl bg-bgCard border border-greenPrimary/18 p-5 flex items-start gap-4 hover:border-greenElectric/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-greenElectric/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-greenElectric/18 to-greenPrimary/12 border border-greenElectric/30 flex items-center justify-center shadow-md shadow-greenElectric/10 group-hover:scale-110 transition-transform duration-300">
                  <AchievementIcon icon={a.icon} />
                </div>
                <div className="relative flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="text-textPrimary font-black tracking-wider text-sm md:text-base truncate">
                      {a.name}
                    </div>
                  </div>
                  <div className="text-textMuted text-xs md:text-sm leading-snug">
                    {a.desc}
                  </div>
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-greenElectric/8 border border-greenElectric/20">
                    <span className="text-greenElectric/90 text-[10px] font-black tracking-widest">
                      {a.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 md:mt-14 text-center">
            <div className="inline-flex items-center gap-3 px-5 md:px-7 py-3 md:py-4 rounded-2xl bg-gradient-to-r from-greenElectric/10 via-greenPrimary/8 to-greenElectric/10 border border-greenElectric/25 backdrop-blur-sm">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-greenElectric" strokeWidth={2} />
              <p className="text-textPrimary font-black text-sm md:text-lg tracking-tight">
                + <span className="text-gradient-green">Molti altri da sbloccare</span> man mano che la tua carriera cresce
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MODALITÀ */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-5">
              <Dices className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2.5} />
              <span className="text-greenElectric text-[11px] font-black tracking-[0.2em]">
                LE MODALITÀ
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mt-3 tracking-tight">
              Gioca <span className="text-gradient-green">come preferisci</span>
            </h2>
            <p className="text-textMuted text-base md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
              Due modalità, una sola passione: il calcetto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="relative group rounded-3xl bg-bgCard border-2 border-greenElectric/35 p-8 md:p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-greenElectric/12 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-greenElectric/18 transition-all duration-500" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-greenPrimary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-greenElectric/20 to-greenPrimary/15 border border-greenElectric/40 mb-7 shadow-lg shadow-greenElectric/10">
                  <Zap className="w-4 h-4 text-greenElectric animate-pulse" strokeWidth={2.5} />
                  <span className="text-greenElectric text-xs font-black tracking-[0.18em]">
                    DISPONIBILE ORA
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-greenElectric/25 to-greenPrimary/15 border border-greenElectric/40 flex items-center justify-center shadow-lg shadow-greenElectric/15">
                    <Users className="w-8 h-8 text-greenElectric" strokeWidth={2} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-1">
                    SOLO CAREER
                  </h3>
                </div>
                <p className="text-textMuted leading-relaxed mb-8 text-base md:text-lg">
                  La tua carriera, le tue regole. Anche se sei l'unico dei tuoi amici
                  ad usare CalcettoXP, puoi iniziare subito a tracciare i tuoi progressi,
                  collezionare achievement e vedere la tua card crescere partita dopo partita.
                </p>
                <ul className="space-y-3 mb-9">
                  {[
                    "Statistiche e CI illimitate",
                    "Evoluzione card completa",
                    "100% autonomia sulle partite",
                    "Achievement sbloccabili",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-textPrimary text-base md:text-lg">
                      <div className="w-5 h-5 shrink-0 rounded-full bg-greenElectric/20 border border-greenElectric/40 flex items-center justify-center">
                        <Check className="w-3 h-3 text-greenElectric" strokeWidth={3.5} />
                      </div>
                      <span className="font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
                <SmartCTA
                  label="INIZIA ORA"
                  icon={PlaySquare}
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="shadow-xl shadow-greenElectric/30 hover:shadow-greenElectric/45"
                  loggedInLabel="CONTINUA LA TUA CARRIERA"
                />
              </div>
            </div>

            <div className="relative group rounded-3xl bg-bgCard/65 border border-textPrimary/12 p-8 md:p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/18 border border-yellow-500/35 mb-7">
                  <Rocket className="w-4 h-4 text-yellow-400" strokeWidth={2.5} />
                  <span className="text-yellow-400 text-xs font-black tracking-[0.18em]">
                    IN ARRIVO · PROSSIMAMENTE
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 border border-yellow-500/30 flex items-center justify-center">
                    <Swords className="w-8 h-8 text-yellow-400/90" strokeWidth={2} />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-1">
                    MULTIPLAYER
                  </h3>
                </div>
                <p className="text-textMuted leading-relaxed mb-8 text-base md:text-lg">
                  Gioca con gli amici, confrontati sul campo reale. Le partite verificate,
                  classifiche, squadre e tanto altro. La vera esperienza CalcettoXP con tutta la tua squadra.
                </p>
                <ul className="space-y-3 mb-9">
                  {[
                    "Partite verificate tra squadre",
                    "Ranking locali e nazionali",
                    "Squadre ufficiali con i tuoi amici",
                    "Sfide 1v1 e tornei",
                    "Badge esclusivi multiplayer",
                    "Matchmaking intelligente",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-textMuted text-base md:text-lg">
                      <div className="w-5 h-5 shrink-0 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center">
                        <Check className="w-3 h-3 text-yellow-400/80" strokeWidth={3.5} />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2.5 h-14 px-7 rounded-2xl text-lg font-bold bg-textPrimary/5 border border-textPrimary/15 text-textMuted cursor-not-allowed"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-40" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
                  </span>
                  SARÀ DISPONIBILE PRESTO
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 md:py-32 relative bg-bgSecondary/50">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-5">
              <Crown className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2.5} />
              <span className="text-greenElectric text-[11px] font-black tracking-[0.2em]">
                I PIANI
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mt-3 tracking-tight">
              Piani per ogni <span className="text-gradient-green">tipo di giocatore</span>
            </h2>
            <p className="text-textMuted text-base md:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
              In gratis, cresci in PRO. Nessun vincolo, disdici quando vuoi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-7 max-w-6xl mx-auto">
            {/* FREE */}
            <div className="relative rounded-3xl bg-bgCard border border-greenPrimary/20 p-7 md:p-9 flex flex-col hover:border-greenElectric/30 transition-all duration-300">
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-greenElectric/15 to-greenPrimary/10 border border-greenElectric/30 flex items-center justify-center">
                    <Star className="w-5 h-5 text-greenElectric" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">FREE</h3>
                </div>
                <div className="flex items-baseline gap-1.5 mt-3">
                  <span className="text-4xl md:text-5xl font-black text-textPrimary tracking-tight">
                    €0
                  </span>
                  <span className="text-textMuted text-base">/mese</span>
                </div>
                <p className="text-textMuted text-sm mt-2">
                  Perfetto per iniziare la tua carriera
                </p>
              </div>
              <ul className="space-y-3 mb-9 flex-1">
                {pricingFree.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm md:text-base text-textMuted">
                    <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-greenElectric" strokeWidth={3.5} />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <FreeCTAButton className="w-full" />
            </div>

            {/* PRO MENSILE */}
            <div className="relative rounded-3xl bg-bgCard border-2 border-greenElectric p-7 md:p-9 flex flex-col shadow-2xl shadow-greenElectric/15 -translate-y-2 md:-translate-y-4 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-5 py-2 rounded-full bg-gradient-to-r from-greenElectric to-greenPrimary shadow-xl shadow-greenElectric/30 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-bgPrimary" strokeWidth={2.5} />
                  <span className="text-bgPrimary text-xs font-black tracking-[0.18em]">
                    PIÙ SCELTO
                  </span>
                </div>
              </div>
              <div className="mb-7 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-greenElectric/25 to-greenPrimary/15 border border-greenElectric/45 flex items-center justify-center shadow-lg shadow-greenElectric/15">
                    <Crown className="w-5 h-5 text-greenElectric" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">
                    PRO <span className="text-gradient-green">Mensile</span>
                  </h3>
                </div>
                <div className="flex items-baseline gap-1.5 mt-3">
                  <span className="text-4xl md:text-5xl font-black text-textPrimary tracking-tight">
                    €3,90
                  </span>
                  <span className="text-textMuted text-base">/mese</span>
                </div>
                <p className="text-greenElectric text-sm mt-2 font-semibold">
                  Flessibile, senza pensieri
                </p>
              </div>
              <ul className="space-y-3 mb-9 flex-1">
                {pricingPro.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm md:text-base text-textMuted">
                    <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-greenElectric/20 border border-greenElectric/40 flex items-center justify-center">
                      <Check className="w-3 h-3 text-greenElectric" strokeWidth={3.5} />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <ProCheckoutButton plan="monthly">
                <>
                  <Crown size={17} className="mr-1" strokeWidth={2.2} />
                  SBLOCCA PRO ORA
                  <ArrowRight size={16} className="ml-1" strokeWidth={2.2} />
                </>
              </ProCheckoutButton>
            </div>

            {/* PRO ANNUALE */}
            <div className="relative rounded-3xl bg-bgCard border border-greenPrimary/20 p-7 md:p-9 flex flex-col hover:border-yellow-500/30 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500/95 to-yellow-400/95 shadow-xl shadow-yellow-500/25 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-bgPrimary" strokeWidth={2.5} />
                  <span className="text-bgPrimary text-xs font-black tracking-[0.18em]">
                    RISPARMI ~36%
                  </span>
                </div>
              </div>
              <div className="mb-7 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/25 to-yellow-400/15 border border-yellow-500/40 flex items-center justify-center shadow-lg shadow-yellow-500/15">
                    <Mountain className="w-5 h-5 text-yellow-400" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">
                    PRO <span className="text-yellow-400">Annuale</span>
                  </h3>
                </div>
                <div className="flex items-baseline gap-1.5 mt-3">
                  <span className="text-4xl md:text-5xl font-black text-textPrimary tracking-tight">
                    €29,90
                  </span>
                  <span className="text-textMuted text-base">/anno</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-400 text-xs font-black">
                  ~€2,49/mese
                  </span>
                  <span className="text-textMuted/70 text-xs line-through">
                    €46,80
                  </span>
                </div>
              </div>
              <ul className="space-y-3 mb-9 flex-1">
                {pricingPro.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm md:text-base text-textMuted">
                    <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-yellow-500/15 border border-yellow-500/35 flex items-center justify-center">
                      <Check className="w-3 h-3 text-yellow-400/90" strokeWidth={3.5} />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <YearlyCheckoutButton plan="yearly" />
            </div>
          </div>

          <div className="mt-10 md:mt-14 text-center max-w-2xl mx-auto">
            <p className="text-textMuted text-sm md:text-base leading-relaxed">
              🔒 Pagamenti sicuri con <span className="text-textPrimary font-semibold">Stripe</span>.
              Il piano FREE è per sempre. PRO si disdice in un click.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="relative rounded-[28px] md:rounded-[36px] overflow-hidden border border-greenElectric/30 p-8 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-greenElectric/18 via-greenPrimary/10 to-transparent" />
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-greenElectric/20 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-greenPrimary/15 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-greenElectric/15 border border-greenElectric/35 mb-7 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-greenElectric animate-pulse" strokeWidth={2.5} />
                <span className="text-greenElectric text-xs font-black tracking-[0.2em]">
                  PRONTO A INIZIARE?
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-[1.1]">
                La tua carriera inizia <span className="text-gradient-green">dalla prossima partita.</span>
              </h2>
              <p className="text-textMuted text-lg md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Non serve altro. Entra subito, è gratis. Poi, quando vorrai, passerai a PRO.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                <SmartCTA
                  label="INIZIA LA TUA CARRIERA GRATIS"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="shadow-2xl shadow-greenElectric/35 hover:shadow-greenElectric/50"
                  loggedInLabel="VAI ALLA DASHBOARD"
                />
              </div>
              <p className="text-textMuted/80 text-xs md:text-sm mt-6">
                ⚽ Oltre 2.400 giocatori stanno già tracciando la propria carriera
              </p>
            </div>
          </div>
        </div>
      </section>

      <AppFooter />
      <InstallPWAButton />
    </main>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  PlaySquare, ClipboardList, TrendingUp, Trophy, Flame, ShieldCheck,
  Target, Zap, Award, Crown, Star, ChevronRight, Check, Users,
  Hand, Compass, Dices, Medal, Rocket, Mountain, Sparkles, ArrowRight,
  Goal, Swords, Minus, TrendingDown, Lock,
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip,
} from "recharts";
import { InstallPWAButton } from "@/components/pwa/InstallPWAButton";
import AppFooter from "@/components/layout/AppFooter";
import { SmartCTA } from "@/components/cta/SmartCTA";
import {
  FreeCTAButton, ProCheckoutButton, YearlyCheckoutButton,
} from "@/components/pricing/StripeButtons";
import AndreaImg from "@/../assets/Andrea.jpg";
import FedericoImg from "@/../assets/Federico.jpg";
import RiccardoImg from "@/../assets/Riccardo.jpg";
import MarcoImg from "@/../assets/Marco.jpg";
import { formatCI } from "@/lib/career-index";

const demoPlayers = [{ id:"andrea", name:"ANDREA", role:"ATT", roleLabel:"Attaccante", ovr:78, lv:15,
  image: AndreaImg, imageAlt:"Andrea - Attaccante CalcettoXP",
  stats:[["PAC","85"],["SHO","82"],["PAS","68"],["DRI","76"],["DEF","35"],["PHY","72"]],
  matches:"34", results:"21 V / 4 P / 9 S", goals:"47 gol", assists:"12 assist", winRate:"61.8%", ci:1423, ciDelta:"+9.2%",
  ciData:[{m:1,v:920},{m:2,v:1050},{m:3,v:990},{m:4,v:1180},{m:5,v:1080},{m:6,v:1260},{m:7,v:1190},{m:8,v:1350},{m:9,v:1300},{m:10,v:1423}]},
  { id:"federico", name:"FEDERICO", role:"CEN", roleLabel:"Centrocampista", ovr:74, lv:13,
  image: FedericoImg, imageAlt:"Federico - Centrocampista CalcettoXP",
  stats:[["PAC","74"],["SHO","65"],["PAS","84"],["DRI","78"],["DEF","62"],["PHY","70"]],
  matches:"41", results:"24 V / 7 P / 10 S", goals:"18 gol", assists:"33 assist", winRate:"58.5%", ci:1356, ciDelta:"+5.8%",
  ciData:[{m:1,v:1000},{m:2,v:1040},{m:3,v:1095},{m:4,v:1130},{m:5,v:1175},{m:6,v:1210},{m:7,v:1255},{m:8,v:1290},{m:9,v:1325},{m:10,v:1356}]},
  { id:"riccardo", name:"RICCARDO", role:"DIF", roleLabel:"Difensore", ovr:71, lv:11,
  image: RiccardoImg, imageAlt:"Riccardo - Difensore CalcettoXP",
  stats:[["PAC","68"],["SHO","38"],["PAS","62"],["DRI","55"],["DEF","86"],["PHY","80"]],
  matches:"29", results:"16 V / 6 P / 7 S", goals:"5 gol", assists:"8 assist", winRate:"55.2%", cleanSheets:"12", ci:1289, ciDelta:"+6.4%",
  ciData:[{m:1,v:960},{m:2,v:990},{m:3,v:1025},{m:4,v:1005},{m:5,v:1065},{m:6,v:1100},{m:7,v:1075},{m:8,v:1195},{m:9,v:1240},{m:10,v:1289}]},
  { id:"marco", name:"MARCO", role:"POR", roleLabel:"Portiere", ovr:76, lv:14,
  image: MarcoImg, imageAlt:"Marco - Portiere CalcettoXP",
  stats:[["PAC","58"],["SHO","25"],["PAS","55"],["DRI","40"],["DEF","88"],["PHY","82"]],
  matches:"37", results:"20 V / 9 P / 8 S", goals:"0 gol", saves:"142 parate", winRate:"54.1%", cleanSheets:"15", ci:1368, ciDelta:"+7.1%",
  ciData:[{m:1,v:990},{m:2,v:995},{m:3,v:1000},{m:4,v:1140},{m:5,v:1145},{m:6,v:1150},{m:7,v:1290},{m:8,v:1295},{m:9,v:1300},{m:10,v:1368}]}];

const steps = [
  { icon:PlaySquare, title:"GIOCA", desc:"Scendi in campo come sempre." },
  { icon:ClipboardList, title:"REGISTRA", desc:"Inserisci i dati in 30 secondi." },
  { icon:TrendingUp, title:"EVOLVI", desc:"La tua card cresce partita dopo partita." },
];
const evolutions = [
  { ovr:58, lv:1, label:"Novizio", desc:"Le prime emozioni" },
  { ovr:66, lv:5, label:"Emergente", desc:"Inizi a farti notare" },
  { ovr:73, lv:12, label:"Affermato", desc:"Un punto di riferimento" },
  { ovr:83, lv:22, label:"Veterano", desc:"Una leggenda del rettangolo" },
];
const trofeiLanding = [
  { icon:Star, name:"PRIMA VITTORIA", desc:"Prima partita vinta" },
  { icon:Target, name:"BOMBER", desc:"3 gol in una partita" },
  { icon:ShieldCheck, name:"MURO", desc:"3 clean sheet di fila" },
  { icon:ShieldCheck, name:"IMBATTIBILE", desc:"10 partite senza sconfitte" },
];
const pricingFree = [
  "Profilo giocatore personale", "Card ufficiale CalcettoXP",
  "Partite illimitate", "Career Index base",
  "XP e livelli", "Trofei base",
];
const pricingPro = [
  "Tutto incluso nel FREE", "Statistiche avanzate", "Storico completo illimitato",
  "Grafici evoluti", "Analisi 7 / 30 / 90 giorni",
  "Record personali e streak", "Card premium personalizzate",
  "Trofei esclusivi PRO", "Badge PRO esclusivo", "Supporto prioritario",
];
const ciSimpleSequence = [
  { label:"START", delta:0, value:1000, type:"start" as const },
  { label:"VITTORIA", delta:+22, value:1022, type:"win" as const },
  { label:"SCONFITTA", delta:-18, value:1004, type:"loss" as const },
  { label:"PAREGGIO", delta:+3, value:1007, type:"draw" as const },
  { label:"VITTORIA", delta:+35, value:1042, type:"win" as const },
  { label:"VITTORIA", delta:+19, value:1061, type:"win" as const },
  { label:"SCONFITTA", delta:-18, value:1043, type:"loss" as const },
  { label:"VITTORIA", delta:+37, value:1080, type:"win" as const },
];
const ciLegacySequence = [
  { step:0, label:"START", delta:0, value:1000, type:"start" },
  { step:1, label:"VITTORIA", delta:+22, value:1022, type:"win" },
  { step:2, label:"VITTORIA", delta:+31, value:1053, type:"win" },
  { step:3, label:"SCONFITTA", delta:-20, value:1033, type:"loss" },
  { step:4, label:"PAREGGIO", delta:+3, value:1036, type:"draw" },
  { step:5, label:"VITTORIA", delta:+38, value:1074, type:"win" },
  { step:6, label:"SCONFITTA", delta:-20, value:1054, type:"loss" },
  { step:7, label:"VITTORIA", delta:+29, value:1083, type:"win" },
  { step:8, label:"VITTORIA", delta:+40, value:1123, type:"win" },
];
const allAchievements = [
  { icon:Star, name:"DEBUTTO", desc:"Prima partita registrata", role:"Tutti" },
  { icon:Trophy, name:"HAT-TRICK", desc:"3 gol in una singola partita", role:"ATT/CEN" },
  { icon:Flame, name:"ON FIRE", desc:"Gol in 5 partite consecutive", role:"ATT/CEN" },
  { icon:Hand, name:"MURO", desc:"3 clean sheet di fila", role:"POR/DIF" },
  { icon:Compass, name:"PLAYMAKER", desc:"3 assist in una partita", role:"CEN/ATT" },
  { icon:ShieldCheck, name:"IMBATTIBILE", desc:"10 partite senza sconfitte", role:"Tutti" },
  { icon:Swords, name:"GLADIATORE", desc:"20 tackle vinti in una stagione", role:"DIF/CEN" },
  { icon:Goal, name:"ARRIVI STOPPATI", desc:"50 parate totali", role:"POR" },
  { icon:Star, name:"CENTURIONE", desc:"100 partite giocate", role:"Tutti" },
  { icon:Crown, name:"1500 CLUB", desc:"Career Index oltre 1500", role:"Tutti" },
  { icon:Zap, name:"IRONMAN", desc:"25 presenze in una stagione", role:"Tutti" },
  { icon:Medal, name:"CAPITANO", desc:"50% vittorie in carriera", role:"Tutti" },
  { icon:Rocket, name:"MOSTRO", desc:"OVR raggiunge 80", role:"Tutti" },
  { icon:Mountain, name:"MARATONETA", desc:"1000 minuti totali", role:"Tutti" },
];

function PitchLines(){ return (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/5 left-0 w-full h-px bg-gradient-to-r from-transparent via-greenElectric/15 to-transparent"/>
    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-greenPrimary/8 to-transparent"/>
    <div className="absolute top-4/5 left-0 w-full h-px bg-gradient-to-r from-transparent via-greenElectric/15 to-transparent"/>
    <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-greenElectric/10 to-transparent"/>
    <div className="absolute left-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-greenElectric/5 to-transparent"/>
    <div className="absolute left-2/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-greenElectric/5 to-transparent"/>
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-greenElectric/12"/>
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-greenElectric/18"/>
  </div>
);}

function DemoPlayerCard({ player, animate }: { player:typeof demoPlayers[0]; animate?:boolean }) {
  var isPremium = player.id === "andrea";
  var wrap = "relative mx-auto w-full max-w-[300px]" + (animate ? " animate-float-slow" : "");
  var RoleIcon = player.role==="POR"?Hand : player.role==="DIF"?ShieldCheck : player.role==="CEN"?Compass : Target;
  var borderGlow = isPremium
    ? "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 opacity-90"
    : "bg-gradient-to-br from-greenElectric via-greenPrimary to-greenElectric/20 opacity-70";
  var cardBorder = isPremium ? "border-yellow-400/50" : "border-greenPrimary/25";
  var cardBg = isPremium
    ? "bg-gradient-to-br from-bgSecondary via-[#1A160B] to-bgCard"
    : "bg-gradient-to-br from-bgSecondary to-bgCard";
  var ovrGrad = isPremium
    ? "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600"
    : "bg-gradient-to-br from-greenElectric to-greenPrimary";
  var ovrBorder = isPremium ? "border-yellow-300/60 shadow-yellow-500/35" : "border-greenElectric/50 shadow-greenElectric/25";
  var ovrLabel = isPremium ? "text-yellow-300" : "text-greenElectric";
  var roleBg = isPremium ? "bg-yellow-400/18 border-yellow-400/45" : "bg-greenElectric/15 border-greenElectric/35";
  var roleText = isPremium ? "text-yellow-300" : "text-greenElectric";
  var imgBorder = isPremium ? "border-yellow-400/45 shadow-yellow-500/20" : "border-greenElectric/25 shadow-greenElectric/10";
  var imgOverlayTop = isPremium ? "border-yellow-400/50" : "border-greenElectric/40";
  var imgIcon = isPremium ? "text-yellow-400" : "text-greenElectric";
  var shineClass = isPremium ? "shine-effect" : "";
  var roleBadgeClass = "px-3 py-1 rounded-md " + roleBg + " border";
  var ovrBadgeClass = "w-16 h-16 rounded-full " + ovrGrad + " flex items-center justify-center border-2 " + ovrBorder + " shadow-lg animate-pulse-glow";
  var ovrLabelClass = "text-[10px] " + ovrLabel + " font-bold mt-1 tracking-wider";
  var roleSpanClass = roleText + " text-xs font-black tracking-widest";
  var cardWrapClass = "relative rounded-3xl " + cardBg + " p-5 border " + cardBorder + " " + shineClass;
  var glowWrapClass = "absolute -inset-0.5 rounded-3xl " + borderGlow + " blur-[2px]";
  var ambientPhoto = isPremium
    ? "bg-gradient-to-br from-yellow-500/18 via-yellow-400/10 to-transparent"
    : "bg-gradient-to-br from-greenPrimary/10 to-greenElectric/5";
  var photoOverlay = isPremium ? "to-yellow-400/12" : "to-greenElectric/10";
  var ambientPhotoClass = "absolute -inset-2 rounded-2xl " + ambientPhoto + " blur-xl opacity-70";
  var photoFrame = "relative w-32 h-32 rounded-2xl overflow-hidden border " + imgBorder + " shadow-2xl";
  var photoBadgeClass = "absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-bgPrimary/80 backdrop-blur-[2px] border " + imgOverlayTop + " flex items-center justify-center shadow-md";
  var iconClass = "w-3.5 h-3.5 " + imgIcon;
  var titleClass = "font-black text-2xl tracking-tight text-textPrimary";
  var divider = isPremium ? "via-yellow-400/60" : "via-greenElectric/50";
  var dividerClass = "h-px w-20 mx-auto mt-2 bg-gradient-to-r from-transparent " + divider + " to-transparent";
  var statBorder = isPremium ? "border-yellow-400/15" : "border-greenElectric/12";
  var gradientTop = "from-bgCard/90 via-bgSecondary/30 " + photoOverlay;
  var photoTint = "absolute inset-0 bg-gradient-to-t " + gradientTop;
  var titleStyle = isPremium ? {textShadow:"0 0 20px rgba(250, 204, 21, 0.25)"} : undefined;
  return (
    <div className={wrap}>
      <div className={glowWrapClass}/>
      <div className={cardWrapClass}>
        {isPremium ? (
          <div className="flex justify-center mb-2 relative z-20 shrink-0">
            <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30 flex items-center gap-1">
              <Crown className="w-3 h-3 text-bgPrimary" strokeWidth={2.5}/>
              <span className="text-bgPrimary text-[9px] font-black tracking-[0.18em]">PRO</span>
            </div>
          </div>
        ) : null}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col items-center">
            <div className={ovrBadgeClass}><span className="text-bgPrimary font-black text-2xl tabular-nums">{player.ovr}</span></div>
            <span className={ovrLabelClass}>OVR</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className={roleBadgeClass}><span className={roleSpanClass}>{player.role}</span></div>
            <span className="text-textMuted text-xs mt-1 font-medium">LV <span className="text-textPrimary font-bold text-sm">{player.lv}</span></span>
          </div>
        </div>
        <div className="my-5 flex justify-center">
          <div className="relative">
            <div className={ambientPhotoClass}/>
            <div className={photoFrame}>
              <Image src={player.image} alt={player.imageAlt} fill sizes="128px" className="object-cover object-center"/>
              <div className={photoTint}/>
              <div className={photoBadgeClass}><RoleIcon className={iconClass} strokeWidth={2}/></div>
            </div>
          </div>
        </div>
        <div className="text-center mb-5">
          <h3 className={titleClass} style={titleStyle}>{player.name}</h3>
          <div className={dividerClass}/>
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {player.stats.map(function(s){
            var k=s[0], v=s[1];
            var rowCls = "flex justify-between items-center border-b " + statBorder + " pb-1.5 last:border-b-0";
            return (
              <div key={k} className={rowCls}>
                <span className="text-textMuted font-black tracking-wide">{k}</span>
                <span className="text-textPrimary font-black text-sm tabular-nums">{v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MobilePlayerFlipCard() {
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const autoId = useRef<number | null>(null);
  const player = demoPlayers[selectedIdx];

  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);
    const h = (e:MediaQueryListEvent) => setPrefersReduced(e.matches);
    if(mql.addEventListener) mql.addEventListener("change",h); else mql.addListener(h);
    return () => { if(mql.removeEventListener) mql.removeEventListener("change",h); else mql.removeListener(h); };
  }, []);

  const startAuto = () => {
    if(autoId.current) window.clearInterval(autoId.current);
    autoId.current = window.setInterval(() => setFlipped(f => !f), 4500);
  };

  useEffect(() => {
    if(!mounted || prefersReduced) return;
    startAuto();
    return () => { if(autoId.current) window.clearInterval(autoId.current); };
  }, [mounted, prefersReduced]);

  const handleTap = () => {
    if(autoId.current) window.clearInterval(autoId.current);
    setFlipped(f => !f);
    if(!prefersReduced){
      window.setTimeout(startAuto, 7000);
    }
  };

  const isPremium = player.id === "andrea";
  const RoleIcon = player.role==="POR"?Hand : player.role==="DIF"?ShieldCheck : player.role==="CEN"?Compass : Target;
  const goalsVal = (player as any).goals ?? "0 gol";
  const assistsVal = (player as any).assists ?? "0 assist";

  const frontBorder = isPremium
    ? "bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 opacity-95"
    : "bg-gradient-to-br from-greenElectric via-greenPrimary/80 via-yellow-500/10 to-greenElectric/30 opacity-80";
  const frontCard = isPremium
    ? "bg-gradient-to-br from-bgSecondary via-[#1A160B] to-bgSecondary border-yellow-400/55"
    : "bg-gradient-to-br from-bgSecondary via-bgCard to-bgSecondary border-greenElectric/30";
  const frontOvrGrad = isPremium
    ? "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600"
    : "bg-gradient-to-br from-greenElectric to-greenPrimary";
  const frontOvrBorder = isPremium
    ? "border-yellow-300/65 shadow-yellow-500/40"
    : "border-greenElectric/50 shadow-greenElectric/30";
  const frontOvrTxt = isPremium ? "text-yellow-200" : "text-greenElectric";
  const frontRoleBg = isPremium
    ? "bg-yellow-400/22 border-yellow-400/50"
    : "bg-greenElectric/18 border-greenElectric/40";
  const frontRoleTxt = isPremium ? "text-yellow-200" : "text-greenElectric";
  const frontAmb1 = isPremium ? "bg-yellow-400/18" : "bg-greenElectric/15";
  const frontAmb2 = isPremium ? "bg-yellow-500/12" : "bg-greenPrimary/10";
  const frontPhotoBg = isPremium
    ? "bg-gradient-to-br from-yellow-500/25 via-yellow-400/15 to-transparent"
    : "bg-gradient-to-br from-greenPrimary/15 via-greenElectric/10 to-transparent";
  const frontPhotoBorder = isPremium
    ? "border-yellow-400/50 shadow-yellow-500/25"
    : "border-greenElectric/35 shadow-greenElectric/15";
  const frontPhotoOverlay = isPremium ? "to-yellow-400/15" : "to-greenElectric/12";
  const frontPhotoBadgeBorder = isPremium ? "border-yellow-400/55" : "border-greenElectric/40";
  const frontPhotoBadgeIcon = isPremium ? "text-yellow-400" : "text-greenElectric";
  const frontDivider = isPremium
    ? "via-yellow-400/65"
    : "via-greenElectric/50";

  const backBorder = isPremium
    ? "bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-700 opacity-95"
    : "bg-gradient-to-br from-greenElectric via-greenPrimary/80 to-greenElectric/30 opacity-80";
  const backCard = isPremium
    ? "bg-gradient-to-br from-bgSecondary via-[#1A160B] to-bgSecondary border-yellow-400/55"
    : "bg-gradient-to-br from-bgCard via-bgSecondary to-bgCard border-greenElectric/25";
  const backAmb1 = isPremium ? "bg-yellow-400/18" : "bg-yellow-500/10";
  const backAmb2 = isPremium ? "bg-yellow-500/14" : "bg-greenElectric/12";
  const backStatsIcon = isPremium ? "text-yellow-300" : "text-greenElectric";
  const backStatsLabel = isPremium ? "text-yellow-300" : "text-greenElectric";
  const backStatsBadge = isPremium
    ? "border-yellow-400/35 bg-yellow-400/10 text-yellow-300"
    : "border-greenElectric/20 bg-bgPrimary/60 text-greenElectric";
  const backStatCard = isPremium
    ? "bg-bgPrimary/60 border-yellow-400/20"
    : "bg-bgPrimary/60 border-greenPrimary/15";
  const backCIShell = isPremium
    ? "bg-gradient-to-br from-yellow-400/18 via-yellow-500/10 to-transparent border-yellow-400/35"
    : "bg-gradient-to-br from-greenElectric/15 via-greenPrimary/8 to-transparent border-greenElectric/25";
  const backCIAccent = isPremium
    ? "bg-yellow-400/18 border-yellow-400/35 text-yellow-300"
    : "bg-greenElectric/15 border-greenElectric/30 text-greenElectric";
  const backCIBar = isPremium
    ? "bg-gradient-to-r from-yellow-400 to-yellow-300"
    : "bg-gradient-to-r from-greenPrimary to-greenElectric";
  const backCIIcon = isPremium ? "text-yellow-300" : "text-greenElectric";
  const backDivider = isPremium
    ? "via-yellow-400/40"
    : "via-greenElectric/30";

  return (
    <div className="w-full max-w-xs mx-auto pt-2">
      <div className="flex items-center justify-center gap-2 mb-4">
        {demoPlayers.map((p, i) => {
          const active = i === selectedIdx;
          const pPremium = p.id === "andrea";
          const RI = p.role==="POR"?Hand : p.role==="DIF"?ShieldCheck : p.role==="CEN"?Compass : Target;
          const activeCls = pPremium
            ? "scale-110 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]"
            : "scale-110 border-greenElectric shadow-[0_0_12px_rgba(124,255,107,0.5)]";
          const activeBg = pPremium ? "bg-yellow-400/12" : "bg-greenElectric/10";
          const activeIcon = pPremium ? "text-yellow-400" : "text-greenElectric";
          const activeBdr = pPremium ? "border-yellow-400" : "border-greenElectric";
          return (
            <button key={p.id} type="button" onClick={() => { setSelectedIdx(i); setFlipped(false); }}
              aria-label={`Seleziona ${p.name}`}
              className={`group relative rounded-full border-2 transition-all duration-200 ${active ? activeCls : "border-greenPrimary/20 hover:border-greenElectric/40"} ${pPremium && !active ? "border-yellow-500/30" : ""}`}>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden relative">
                <Image src={p.image} alt={p.imageAlt} fill sizes="40px" className="object-cover object-center"/>
                <div className={`absolute inset-0 transition-opacity ${active ? activeBg : "bg-bgPrimary/40 group-hover:bg-bgPrimary/15"}`}/>
                {pPremium && (
                  <div className="absolute -top-1 -left-1 w-[14px] h-[14px] rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-md">
                    <Crown className="w-[9px] h-[9px] text-bgPrimary" strokeWidth={3}/>
                  </div>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-bgPrimary flex items-center justify-center border ${active ? activeBdr : "border-white/10"} shadow-md`}>
                <RI className={`w-3 h-3 ${active ? activeIcon : "text-greenElectric"}`} strokeWidth={2.5}/>
              </div>
            </button>
          );
        })}
      </div>
      <div className="card-flip-perspective w-full" style={{height:"420px"}}>
        <button type="button" onClick={handleTap} aria-label="Tocca per girare la carta"
          className={`card-flip-inner w-full h-full block ${mounted && flipped ? "is-flipped" : ""}`}>
          <div className="card-flip-face rounded-[26px] overflow-hidden">
            <div className={`absolute -inset-0.5 rounded-[26px] ${frontBorder} blur-[2px]`}/>
            <div className={`relative w-full h-full rounded-[25px] ${frontCard} p-4 flex flex-col overflow-hidden border ${isPremium ? "shine-effect" : ""}`}>
              {isPremium && (
                <div className="flex justify-center mb-1 relative z-20 shrink-0">
                  <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-bgPrimary" strokeWidth={2.5}/>
                    <span className="text-bgPrimary text-[9px] font-black tracking-[0.18em]">PRO</span>
                  </div>
                </div>
              )}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${frontAmb1} blur-3xl`}/>
              <div className={`absolute -bottom-20 -left-16 w-40 h-40 rounded-full ${frontAmb2} blur-3xl`}/>
              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full ${frontOvrGrad} flex items-center justify-center border-2 ${frontOvrBorder} shadow-lg ${mounted ? "animate-pulse-glow" : ""}`}>
                    <span className="text-bgPrimary font-black text-2xl tabular-nums">{player.ovr}</span>
                  </div>
                  <span className={`text-[10px] ${frontOvrTxt} font-black mt-1 tracking-[0.2em]`}>OVR</span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className={`px-3 py-1 rounded-md ${frontRoleBg} border`}>
                    <span className={`${frontRoleTxt} text-xs font-black tracking-[0.25em]`}>{player.role}</span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-bgPrimary/70 border border-white/5 text-[10px] font-black text-textPrimary tracking-wide">LV {player.lv}</div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center relative z-10 my-3">
                <div className="relative">
                  <div className={`absolute -inset-4 rounded-3xl ${frontPhotoBg} blur-2xl`}/>
                  <div className={`relative w-40 h-40 rounded-[28px] overflow-hidden border ${frontPhotoBorder} shadow-2xl`}>
                    <Image src={player.image} alt={player.imageAlt} fill sizes="160px" className="object-cover object-center"/>
                    <div className={`absolute inset-0 bg-gradient-to-t from-bgCard/85 via-bgSecondary/20 ${frontPhotoOverlay}`}/>
                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-bgPrimary/85 backdrop-blur-[2px] border ${frontPhotoBadgeBorder} flex items-center justify-center shadow-md`}>
                      <RoleIcon className={`w-4 h-4 ${frontPhotoBadgeIcon}`} strokeWidth={2.2}/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center relative z-10 pb-1">
                <h3 className="text-textPrimary font-black text-3xl tracking-[0.15em]" style={isPremium ? {textShadow:"0 0 22px rgba(250, 204, 21, 0.3)"} : undefined}>{player.name}</h3>
                <div className={`h-px w-28 mx-auto mt-3 bg-gradient-to-r from-transparent ${frontDivider} to-transparent`}/>
              </div>
            </div>
          </div>
          <div className="card-flip-face card-flip-back rounded-[26px] overflow-hidden">
            <div className={`absolute -inset-0.5 rounded-[26px] ${backBorder} blur-[2px]`}/>
            <div className={`relative w-full h-full rounded-[25px] ${backCard} p-4 flex flex-col overflow-hidden border ${isPremium ? "shine-effect" : ""}`}>
              <div className={`absolute -top-20 -left-20 w-44 h-44 rounded-full ${backAmb1} blur-3xl`}/>
              <div className={`absolute -bottom-24 -right-20 w-48 h-48 rounded-full ${backAmb2} blur-3xl`}/>
              {isPremium && (
                <div className="flex justify-center mb-1 relative z-20 shrink-0">
                  <div className="px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-bgPrimary" strokeWidth={2.5}/>
                    <span className="text-bgPrimary text-[9px] font-black tracking-[0.18em]">PRO</span>
                  </div>
                </div>
              )}
              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className={`w-4 h-4 ${backStatsIcon}`} strokeWidth={2.2}/>
                  <span className={`text-[10px] ${backStatsLabel} font-black tracking-[0.2em]`}>STATISTICHE</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black tracking-wider ${backStatsBadge}`}>LV {player.lv}</span>
              </div>
              <div className="relative z-10 grid grid-cols-2 gap-2.5 mb-3">
                {[
                  ["Partite", player.matches], ["Risultati", player.results],
                  ["Gol", goalsVal], ["Assist", assistsVal],
                ].map(([l,v]) => (
                  <div key={l} className={`rounded-xl border p-3 ${backStatCard}`}>
                    <div className="text-[10px] text-textMuted font-bold tracking-widest uppercase mb-0.5">{l}</div>
                    <div className="text-textPrimary font-black text-lg tabular-nums">{v}</div>
                  </div>
                ))}
              </div>
              <div className={`relative z-10 rounded-2xl p-3 mb-3 border ${backCIShell}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[9px] text-textMuted font-black tracking-[0.2em] mb-1">CAREER INDEX</div>
                    <div className="text-textPrimary font-black text-2xl tracking-tight tabular-nums">{formatCI(player.ci)}</div>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${backCIAccent}`}>
                    <TrendingUp className={`w-3.5 h-3.5 ${backCIIcon}`} strokeWidth={2.5}/>
                    <span className={`text-[11px] font-black ${backCIIcon}`}>{player.ciDelta}</span>
                  </div>
                </div>
                <div className="mt-2.5 h-1 rounded-full bg-bgPrimary/50 overflow-hidden">
                  <div className={`h-full w-[68%] rounded-full ${backCIBar}`}/>
                </div>
                <p className="text-[10px] text-textMuted/80 mt-2 leading-tight">In progressione costante. Continua a vincere.</p>
              </div>
              <div className="relative z-10 mt-auto">
                <div className={`h-px w-full bg-gradient-to-r from-transparent ${backDivider} to-transparent mb-2`}/>
                <p className="text-center text-[10px] text-textMuted font-bold tracking-[0.2em]">· COLLEZIONABILE ·</p>
              </div>
            </div>
          </div>
        </button>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className={`w-2 h-2 rounded-full transition-all duration-300 ${mounted && !flipped ? (isPremium ? "bg-yellow-400 scale-125 shadow-[0_0_8px_rgba(250,204,21,0.7)]" : "bg-greenElectric scale-125 shadow-[0_0_8px_rgba(124,255,107,0.7)]") : "bg-textMuted/40"}`} aria-hidden/>
        <span className={`w-2 h-2 rounded-full transition-all duration-300 ${mounted && flipped ? (isPremium ? "bg-yellow-400 scale-125 shadow-[0_0_8px_rgba(250,204,21,0.7)]" : "bg-greenElectric scale-125 shadow-[0_0_8px_rgba(124,255,107,0.7)]") : "bg-textMuted/40"}`} aria-hidden/>
      </div>
      <p className="text-center text-[11px] text-textMuted/70 mt-2 font-medium">Tocca la carta per vedere il retro</p>
    </div>
  );
}

function SimpleCIDemo() {
  const [mounted, setMounted] = useState(false);
  const [stepIdx, setStepIdx] = useState(1);
  const [displayValue, setDisplayValue] = useState(ciSimpleSequence[1].value);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const counterRef = useRef<number>(ciSimpleSequence[1].value);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);
    const h = (e:MediaQueryListEvent) => setPrefersReduced(e.matches);
    if(mql.addEventListener) mql.addEventListener("change",h); else mql.addListener(h);
    return () => { if(mql.removeEventListener) mql.removeEventListener("change",h); else mql.removeListener(h); };
  }, []);
  useEffect(() => {
    if(!mounted || prefersReduced) return;
    const target = ciSimpleSequence[stepIdx].value;
    const from = counterRef.current;
    const diff = target - from;
    const duration = 520;
    const start = performance.now();
    const tick = (now:number) => {
      const t = Math.min(1, (now-start)/duration);
      const eased = 1 - Math.pow(1-t, 3);
      const v = Math.round(from + diff * eased);
      setDisplayValue(v);
      if(t < 1) rafRef.current = requestAnimationFrame(tick);
      else counterRef.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if(rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stepIdx, prefersReduced, mounted]);
  useEffect(() => {
    if(!mounted || prefersReduced) return;
    const isLast = stepIdx === ciSimpleSequence.length - 1;
    const id = setTimeout(() => setStepIdx(isLast ? 1 : stepIdx + 1), 2000);
    return () => clearTimeout(id);
  }, [stepIdx, prefersReduced, mounted]);
  const current = ciSimpleSequence[stepIdx];
  const chartData = ciSimpleSequence.slice(0, stepIdx + 1).map((s,i) => ({i, v:s.value}));
  const colors = {
    win:{t:"text-greenElectric", bg:"bg-greenElectric/15", bd:"border-greenElectric/35", s:"#7CFF6B"},
    loss:{t:"text-danger", bg:"bg-danger/12", bd:"border-danger/35", s:"#EF4444"},
    draw:{t:"text-textMuted", bg:"bg-textPrimary/8", bd:"border-textPrimary/18", s:"#8B968D"},
    start:{t:"text-greenPrimary", bg:"bg-greenPrimary/10", bd:"border-greenPrimary/30", s:"#22C55E"},
  }[current.type];
  const Delta = current.type==="loss"?TrendingDown : current.type==="draw"?Minus : TrendingUp;
  const changePct = Math.round(((ciSimpleSequence[ciSimpleSequence.length-1].value - ciSimpleSequence[0].value) / ciSimpleSequence[0].value) * 100 * 10) / 10;
  if(prefersReduced){
    const final = ciSimpleSequence[ciSimpleSequence.length - 1];
    return (
      <div className="w-full max-w-sm mx-auto rounded-3xl bg-bgCard/90 backdrop-blur-sm border border-greenPrimary/20 p-5 hud-bg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-textMuted font-black tracking-[0.18em]">CAREER INDEX · IN TEMPO REALE</span>
          <span className="text-greenElectric text-xs font-bold">+{changePct}%</span>
        </div>
        <div className="text-textPrimary font-black text-4xl tabular-nums tracking-tight mb-4">{formatCI(final.value)}</div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ciSimpleSequence.map((s,i)=>({i,v:s.value}))}>
              <Line type="monotone" dataKey="v" stroke="#7CFF6B" strokeWidth={2.5} dot={false} strokeLinecap="round"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full max-w-sm mx-auto rounded-3xl bg-bgCard/90 backdrop-blur-sm border border-greenPrimary/20 p-5 relative overflow-hidden hud-bg">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-40 bg-greenElectric/10 rounded-full blur-3xl pointer-events-none"/>
      <div className="relative z-10 flex items-center justify-between mb-3">
        <span className="text-[10px] text-textMuted font-black tracking-[0.16em]">CAREER INDEX · IN TEMPO REALE</span>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${colors.bg} ${colors.bd}`}>
          <Delta className={`w-3 h-3 ${colors.t}`} strokeWidth={2.5}/>
        </div>
      </div>
      <div className="relative z-10 mb-3">
        <div className="text-textPrimary font-black text-4xl tabular-nums tracking-tight">{formatCI(displayValue)}</div>
      </div>
      <div key={stepIdx} className={`relative z-10 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border ${colors.bg} ${colors.bd} mb-4 animate-fade-in`}>
        <Delta className={`w-4 h-4 ${colors.t}`} strokeWidth={2.5}/>
        <span className={`text-sm font-black tracking-wider ${colors.t}`}>
          {current.label}
          {current.delta !== 0 && <span className="ml-1.5 tabular-nums">{current.delta>0?"+":""}{current.delta}</span>}
        </span>
      </div>
      <div className="relative z-10 h-24 bg-bgPrimary/40 rounded-2xl p-2 border border-white/5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{top:8, right:8, bottom:4, left:8}}>
            <defs>
              <linearGradient id="ciStroke2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={colors.s}/>
                <stop offset="100%" stopColor={colors.s} stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            <Line type="monotone" dataKey="v" stroke="url(#ciStroke2)" strokeWidth={2.8} dot={false} activeDot={false} strokeLinecap="round"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegacyHeroCILiveDemo() {
  const [mounted, setMounted] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [displayValue, setDisplayValue] = useState(ciLegacySequence[0].value);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const counterRef = useRef<number>(ciLegacySequence[0].value);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);
    const h = (e:MediaQueryListEvent) => setPrefersReduced(e.matches);
    if(mql.addEventListener) mql.addEventListener("change",h); else mql.addListener(h);
    return () => { if(mql.removeEventListener) mql.removeEventListener("change",h); else mql.removeListener(h); };
  }, []);
  useEffect(() => {
    if(!mounted || prefersReduced) return;
    const target = ciLegacySequence[stepIdx].value;
    const from = counterRef.current;
    const diff = target - from;
    const duration = 520;
    const start = performance.now();
    const tick = (now:number) => {
      const t = Math.min(1, (now-start)/duration);
      const eased = 1 - Math.pow(1-t, 3);
      const v = Math.round(from + diff * eased);
      setDisplayValue(v);
      if(t < 1) rafRef.current = requestAnimationFrame(tick);
      else counterRef.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if(rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stepIdx, prefersReduced, mounted]);
  useEffect(() => {
    if(!mounted || prefersReduced) return;
    const isLast = stepIdx === ciLegacySequence.length - 1;
    const id = setTimeout(() => setStepIdx(isLast ? 0 : stepIdx + 1), isLast ? 3200 : 1600);
    return () => clearTimeout(id);
  }, [stepIdx, prefersReduced, mounted]);
  if(prefersReduced){
    const fs = ciLegacySequence[ciLegacySequence.length - 1];
    return (
      <div className="mx-auto mt-7 w-full max-w-[300px] rounded-2xl bg-bgCard/85 backdrop-blur-sm border border-greenPrimary/20 p-5">
        <span className="text-textMuted text-[11px] font-bold tracking-[0.18em]">CAREER INDEX · IN TEMPO REALE</span>
        <div className="text-textPrimary font-black text-3xl tracking-tight mt-2">{formatCI(fs.value)}</div>
      </div>
    );
  }
  const current = ciLegacySequence[stepIdx];
  const cd = ciLegacySequence.slice(0, stepIdx+1).map((s,i)=>({i, v:s.value}));
  const color = current.type==="loss"?"text-danger":current.type==="draw"?"text-textMuted":"text-greenElectric";
  const DI = current.type==="loss"?TrendingDown : current.type==="draw"?Minus : TrendingUp;
  return (
    <div className="mx-auto mt-7 w-full max-w-[300px] rounded-2xl bg-bgCard/85 backdrop-blur-sm border border-greenPrimary/20 p-5">
      <div className="flex items-center justify-between">
        <span className="text-textMuted text-[11px] font-bold tracking-[0.16em]">CAREER INDEX · IN TEMPO REALE</span>
        <div className="flex items-center gap-1.5">
          <DI className={`w-4 h-4 ${color}`} strokeWidth={2.5}/>
          <span className={`text-xs font-bold ${color}`}>
            {current.type==="start"?"BASE":current.delta>0?`+${current.delta}`:current.delta || 0}
          </span>
        </div>
      </div>
      <div className="text-textPrimary font-black text-3xl tracking-tight tabular-nums mt-2">{formatCI(displayValue)}</div>
      <div className="w-full h-16 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={cd} margin={{top:4, right:4, bottom:2, left:4}}>
            <Line type="monotone" dataKey="v" stroke="#7CFF6B" strokeWidth={2.5} dot={false} strokeLinecap="round"/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const evoShell = [
  "bg-gradient-to-br from-bgSecondary via-bgCard to-bgSecondary border border-greenPrimary/15",
  "bg-gradient-to-br from-bgSecondary via-bgCard to-bgSecondary border border-greenPrimary/35 shadow-[0_0_16px_rgba(34,197,94,0.12)]",
  "bg-gradient-to-br from-bgSecondary via-bgCard to-bgSecondary border-2 border-greenElectric/50 shadow-[0_0_24px_rgba(124,255,107,0.2)] shine-effect",
  "bg-gradient-to-br from-bgSecondary via-bgCard to-bgSecondary border-2 border-yellow-400/60 shadow-[0_0_0_1px_rgba(234,179,8,0.2),0_0_32px_rgba(234,179,8,0.18)] shine-effect",
];
const evoBadge = [
  "bg-gradient-to-br from-gray-400/80 to-greenPrimary/60 border-greenPrimary/40",
  "bg-gradient-to-br from-greenPrimary to-greenPrimary/90 border-greenPrimary/60",
  "bg-gradient-to-br from-greenElectric to-greenPrimary border-greenElectric/70",
  "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-yellow-300/70",
];
const evoLbl = ["text-gray-400", "text-greenPrimary", "text-greenElectric", "text-yellow-400"];

export default function LandingPage() {
  const [activePlayer, setActivePlayer] = useState("andrea");
  const currentPlayer = demoPlayers.find(p => p.id===activePlayer) ?? demoPlayers[0];
  const scrollTo = (id:string) => {
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior:"smooth", block:"start"});
  };
  return (
    <main className="min-h-screen bg-bgPrimary text-textPrimary overflow-x-hidden pitch-wrapper">
      <style>{`@keyframes evo-ball-travel{0%{left:-4%;opacity:0}10%{opacity:1}50%{left:100%;opacity:1}60%{opacity:0}100%{left:-4%;opacity:0}}`}</style>

      {/* HERO */}
      <section className="relative pt-4 md:pt-10 md:pb-28 pb-10">
        <PitchLines/>
        <div className="relative max-w-5xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 md:gap-10 gap-8 items-start">
            <div className="md:pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-greenElectric/25 bg-greenElectric/8 px-3.5 py-1.5 mb-5 backdrop-blur-sm md:mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-greenElectric opacity-50"/>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-greenElectric"/>
                </span>
                <span className="text-greenElectric text-[10px] md:text-xs font-black tracking-[0.18em]">STAGIONE 2026 · ATTIVA</span>
              </div>
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-black leading-[1.05] md:leading-[1.02] text-textPrimary tracking-tight">
                Ogni partita. <span className="text-gradient-green">La tua carriera.</span>
              </h1>
              <p className="text-base md:text-2xl text-textMuted mt-3 md:mt-7 leading-relaxed max-w-xl">
                Trasforma il tuo calcetto settimanale in una carriera vera. Registra, cresci, colleziona trofei.
              </p>
              <div className="mt-6 md:mt-11 flex flex-col sm:flex-row gap-3">
                <SmartCTA label="INIZIA GRATIS" icon={PlaySquare} variant="primary" size="lg" fullWidth
                  className="shadow-xl shadow-greenElectric/25 hover:shadow-greenElectric/40 !min-h-[56px]"
                  loggedInLabel="VAI ALLA DASHBOARD"/>
                <button type="button" onClick={() => scrollTo("come-funziona")}
                  className="inline-flex items-center justify-center px-6 md:px-7 min-h-[56px] rounded-2xl border border-textPrimary/20 text-textPrimary font-black text-sm md:text-base tracking-wider hover:border-greenElectric/50 hover:text-greenElectric hover:bg-greenElectric/5 transition-all group">
                  SCOPRI
                  <ChevronRight className="ml-1.5 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5}/>
                </button>
              </div>
              <div className="mt-5 md:mt-10 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex -space-x-2">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="w-7 h-7 md:w-9 md:h-9 rounded-full border-2 border-bgPrimary bg-gradient-to-br from-greenPrimary/40 to-greenElectric/30 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-greenElectric/90" strokeWidth={2}/>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-textPrimary font-bold text-sm md:text-base">+2.400 giocatori</p>
                  <p className="text-textMuted text-[11px] md:text-sm">in carriera</p>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block md:pt-1">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-greenElectric/10 blur-3xl"/>
              <div className="absolute -bottom-8 -left-6 w-40 h-40 rounded-full bg-greenPrimary/10 blur-3xl"/>
              <div className="relative animate-float-slower">
                <DemoPlayerCard player={currentPlayer}/>
                <LegacyHeroCILiveDemo/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE ONLY: Flip card after hero */}
      <section className="md:hidden pb-4">
        <div className="max-w-4xl mx-auto px-4">
          <MobilePlayerFlipCard/>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section id="come-funziona" className="py-10 md:py-24 relative">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-3 md:mb-5">
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-greenElectric" strokeWidth={2.5}/>
              <span className="text-greenElectric text-[10px] md:text-[11px] font-black tracking-[0.2em]">IL PROCESSO</span>
            </div>
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-black mt-2 md:mt-3 tracking-tight">
              Come <span className="text-gradient-green">funziona</span>
            </h2>
            <p className="hidden md:block text-textMuted text-xl mt-5 max-w-2xl mx-auto leading-relaxed">Tre mosse, zero complicazioni.</p>
          </div>
          {/* Mobile compact */}
          <div className="md:hidden">
            <div className="grid grid-cols-3 gap-2 relative">
              {steps.map((s, i) => {
                const Ic = s.icon;
                return (
                  <div key={s.title} className="flex flex-col items-center text-center relative z-10">
                    <div className={`rounded-2xl flex items-center justify-center mb-2.5 border shadow-md ${
                      i===0?"bg-greenPrimary/15 border-greenPrimary/40 shadow-greenPrimary/10":
                      i===1?"bg-greenElectric/15 border-greenElectric/50 shadow-greenElectric/15":
                      "bg-yellow-500/12 border-yellow-500/40 shadow-yellow-500/10"
                    }`} style={{width:"52px", height:"52px"}}>
                      <Ic className={`w-5.5 h-5.5 ${i===0?"text-greenPrimary":i===1?"text-greenElectric":"text-yellow-400"}`} strokeWidth={2.3}/>
                    </div>
                    <h3 className={`text-sm font-black tracking-[0.15em] ${i===2?"text-yellow-400":"text-textPrimary"}`}>{s.title}</h3>
                    <p className="text-[11px] text-textMuted/85 leading-snug mt-1 px-0.5">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Desktop cards */}
          <div className="hidden md:grid relative md:grid-cols-3 gap-7">
            {steps.map((s, i) => (
              <div key={s.title} className="relative group rounded-3xl bg-bgCard/70 backdrop-blur-sm border border-greenPrimary/12 p-9 hover:border-greenElectric/35 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-greenElectric/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-greenElectric/20 to-greenPrimary/15 border border-greenElectric/35 flex items-center justify-center shadow-lg shadow-greenElectric/10 group-hover:scale-110 transition-transform duration-300">
                      <s.icon className="w-7 h-7 text-greenElectric" strokeWidth={2.3}/>
                    </div>
                    <span className="text-greenElectric text-[11px] font-black tracking-widest">PASSO 0{i+1}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">{s.title}</h3>
                  <p className="text-textMuted leading-relaxed text-base md:text-lg">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESKTOP ONLY: Players tabs */}
      <section className="hidden md:block py-20 md:py-24 relative bg-bgSecondary/50">
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="text-center mb-14 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-5">
              <Users className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2.5}/>
              <span className="text-greenElectric text-[11px] font-black tracking-[0.2em]">CARRIERE DEMO</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mt-3 tracking-tight">
              Quattro giocatori, <span className="text-gradient-green">quattro carriere</span>
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {demoPlayers.map(p => {
              const active = activePlayer === p.id;
              const base = "px-6 py-3 rounded-xl font-black text-base tracking-wider transition-all duration-300 border";
              const cls = active
                ? base + " bg-gradient-to-r from-greenElectric to-greenPrimary text-bgPrimary border-greenElectric shadow-xl shadow-greenElectric/25 scale-105"
                : base + " bg-bgCard/60 text-textMuted border-greenPrimary/10 hover:border-greenElectric/30 hover:text-textPrimary";
              const rc = active ? "ml-2 font-black tracking-widest text-bgPrimary/80" : "ml-2 font-black tracking-widest text-greenElectric/70";
              return (
                <button key={p.id} onClick={() => setActivePlayer(p.id)} className={cls}>
                  {p.name}<span className={rc} style={{fontSize:"12px"}}>{p.role}</span>
                </button>
              );
            })}
          </div>
          <div className="rounded-3xl bg-bgCard/70 backdrop-blur-sm border border-greenPrimary/18 p-10 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-greenElectric/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"/>
            <div className="relative grid lg:grid-cols-[320px_1fr] gap-12 items-start">
              <DemoPlayerCard player={currentPlayer} animate/>
              <div className="space-y-9">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-greenElectric/30 shadow-lg shadow-greenElectric/10 shrink-0">
                      <Image src={currentPlayer.image} alt={currentPlayer.imageAlt} fill sizes="96px" className="object-cover object-center"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-bgCard/60 via-transparent to-greenElectric/10"/>
                      <div className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-bgPrimary/85 backdrop-blur-[2px] border border-greenElectric/40 flex items-center justify-center shadow-md">
                        {currentPlayer.role==="POR"?<Hand className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2}/>
                        :currentPlayer.role==="DIF"?<ShieldCheck className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2}/>
                        :currentPlayer.role==="CEN"?<Compass className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2}/>
                        :<Target className="w-3.5 h-3.5 text-greenElectric" strokeWidth={2}/>}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-4xl font-black tracking-tight">{currentPlayer.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 rounded-md bg-greenElectric/15 border border-greenElectric/35 text-greenElectric text-xs font-black tracking-widest">{currentPlayer.role}</span>
                        <span className="text-textMuted text-base"><span className="text-textPrimary font-bold">{currentPlayer.roleLabel}</span> · OVR <span className="text-textPrimary font-bold">{currentPlayer.ovr}</span> · LV <span className="text-textPrimary font-bold">{currentPlayer.lv}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-greenElectric/12 via-greenPrimary/8 to-greenElectric/5 border border-greenElectric/25 rounded-2xl px-6 py-4.5">
                    <div>
                      <div className="text-[11px] text-textMuted font-bold tracking-[0.2em]">CAREER INDEX</div>
                      <div className="flex items-baseline gap-2.5 mt-1">
                        <span className="text-4xl font-black text-textPrimary tracking-tight">{formatCI(currentPlayer.ci)}</span>
                        <span className="text-greenElectric text-sm font-bold flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5}/> {currentPlayer.ciDelta}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4.5">
                  {[[currentPlayer.matches,"Partite"],[currentPlayer.results,"Risultati"],[currentPlayer.goals,currentPlayer.assists],[currentPlayer.winRate,"Win Rate"]].map(([v,l]) => (
                    <div key={String(l)} className="rounded-2xl bg-bgPrimary/60 border border-greenPrimary/12 p-5 hover:border-greenElectric/25 transition-colors">
                      <div className="text-textPrimary font-black text-2xl tracking-tight">{v}</div>
                      <div className="text-textMuted text-sm mt-1.5 font-medium">{l}</div>
                    </div>
                  ))}
                  {currentPlayer.cleanSheets && (
                    <div className="rounded-2xl bg-bgPrimary/60 border border-greenPrimary/12 p-5 hover:border-greenElectric/25 transition-colors col-span-2 md:col-span-4">
                      <div className="text-textPrimary font-black text-2xl tracking-tight">{currentPlayer.cleanSheets} Clean Sheet</div>
                      <div className="text-textMuted text-sm mt-1.5 font-medium">Porta inviolata</div>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl bg-bgPrimary/60 border border-greenPrimary/12 p-7">
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentPlayer.ciData}>
                        <defs>
                          <linearGradient id={`ciG-${currentPlayer.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7CFF6B" stopOpacity={0.35}/>
                            <stop offset="100%" stopColor="#7CFF6B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{fill:"#8B968D", fontSize:11}} tickFormatter={v=>`S${v}`} dy={8}/>
                        <Tooltip contentStyle={{backgroundColor:"#111713",border:"1px solid rgba(34,197,94,0.25)",borderRadius:"12px",fontSize:"13px",color:"#F8FAF8"}}
                          labelFormatter={v=>`Settimana ${v}`} formatter={(v:any)=>[`CI: ${formatCI(Number(v))}`]}
                          cursor={{stroke:"#7CFF6B",strokeWidth:1,strokeDasharray:"4 4"}}/>
                        <Area type="monotone" dataKey="v" stroke="#7CFF6B" strokeWidth={3} fill={`url(#ciG-${currentPlayer.id})`} strokeLinecap="round"
                          dot={{r:4,fill:"#7CFF6B",stroke:"#070A08",strokeWidth:2}} activeDot={{r:6,fill:"#7CFF6B",stroke:"#070A08",strokeWidth:2}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAREER INDEX SIMPLE */}
      <section id="career-index" className="py-12 md:py-20 relative">
        <div className="absolute inset-0 hud-bg pointer-events-none"/>
        <div className="relative max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-3 md:mb-5">
              <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 text-greenElectric" strokeWidth={2.5}/>
              <span className="text-greenElectric text-[10px] md:text-[11px] font-black tracking-[0.2em]">CAREER INDEX</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black mt-2 md:mt-3 tracking-tight">
              Ogni partita muove la <span className="text-gradient-green">tua carriera</span>
            </h2>
            <div className="mt-4 md:mt-8 grid grid-cols-3 gap-2 md:gap-6 max-w-md md:max-w-2xl mx-auto">
              {[
                {k:"VITTORIA", v:"SALE", c:"text-greenElectric", b:"border-greenElectric/30", bg:"bg-greenElectric/10", i:TrendingUp},
                {k:"SCONFITTA", v:"SCENDE", c:"text-danger", b:"border-danger/30", bg:"bg-danger/10", i:TrendingDown},
                {k:"PAREGGIO", v:"STABILE", c:"text-textMuted", b:"border-textPrimary/15", bg:"bg-textPrimary/5", i:Minus},
              ].map(r => {
                const I = r.i;
                return (
                  <div key={r.k} className={`rounded-xl md:rounded-2xl ${r.bg} border ${r.b} px-2 py-3 md:px-5 md:py-4 text-center`}>
                    <I className={`w-3.5 h-3.5 md:w-5 md:h-5 mx-auto mb-1.5 md:mb-2 ${r.c}`} strokeWidth={2.5}/>
                    <div className={`text-[10px] md:text-xs font-black tracking-wider md:tracking-[0.15em] ${r.c}`}>{r.k}</div>
                    <div className="text-[10px] md:text-sm text-textMuted mt-0.5 md:mt-1 font-medium">{r.v}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <SimpleCIDemo/>
          <div className="md:hidden mt-7 text-center">
            <button type="button" onClick={()=>scrollTo("trofei")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-textMuted hover:text-greenElectric hover:border-greenElectric/30 transition-all text-sm font-bold tracking-wider">
              <Trophy className="w-4 h-4" strokeWidth={2}/>
              Scopri i Trofei
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5}/>
            </button>
          </div>
        </div>
      </section>

      {/* EVOLUZIONE green -> gold */}
      <section className="py-12 md:py-24 relative progression-tunnel-bg overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-3 md:mb-5">
              <Award className="w-3 h-3 md:w-3.5 md:h-3.5 text-greenElectric" strokeWidth={2.5}/>
              <span className="text-greenElectric text-[10px] md:text-[11px] font-black tracking-[0.2em]">PROGRESSIONE</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black mt-2 md:mt-3 tracking-tight">
              Da <span className="text-greenPrimary">Novizio</span> a <span className="text-gradient-gold">Veterano</span>
            </h2>
            <p className="md:hidden text-textMuted/85 text-sm mt-3 max-w-md mx-auto leading-relaxed">
              Verde → Verde acceso → Elettrico → Oro
            </p>
          </div>
          {/* Mobile: griglia 2x2 percorso serpente */}
          <div className="md:hidden relative max-w-sm mx-auto">
            {/* Connectori grafici (z=0, pointer-events none) */}
            {/* 1) 1→2 orizzontale alto (verde grigio→primary) */}
            <div aria-hidden className="absolute pointer-events-none z-0" style={{ left: "calc(50% + 2px)", right: "calc(50% + 2px)", top: "50px", height: "3px" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(to right, rgba(156,163,175,0.35) 0%, rgba(34,197,94,0.85) 100%)" }}/>
              <div className="absolute top-1/2" style={{ right: "-2px", transform: "translateY(-50%) rotate(45deg)", width: "7px", height: "7px", borderTop: "3px solid #22C55E", borderRight: "3px solid #22C55E", boxShadow: "0 0 10px rgba(34,197,94,0.85)" }}/>
            </div>
            {/* 2) 2↓3 verticale dx (verde primary→elettrico) */}
            <div aria-hidden className="absolute pointer-events-none z-0" style={{ right: "calc(25% - 1px)", top: "calc(50px + 10px)", bottom: "calc(50px + 10px)", width: "3px" }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(34,197,94,0.9) 0%, rgba(124,255,107,0.9) 100%)" }}/>
              <div className="absolute left-1/2" style={{ bottom: "-2px", transform: "translateX(-50%) rotate(45deg)", width: "7px", height: "7px", borderBottom: "3px solid #7CFF6B", borderRight: "3px solid #7CFF6B", boxShadow: "0 0 10px rgba(124,255,107,0.9)" }}/>
            </div>
            {/* 3) 3→4 orizzontale basso DX→SX (elettrico→oro) */}
            <div aria-hidden className="absolute pointer-events-none z-0" style={{ left: "calc(50% + 2px)", right: "calc(50% + 2px)", bottom: "50px", height: "3px" }}>
              <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(to left, rgba(124,255,107,0.9) 0%, rgba(234,179,8,0.85) 100%)" }}/>
              <div className="absolute top-1/2" style={{ left: "-2px", transform: "translateY(-50%) rotate(45deg)", width: "7px", height: "7px", borderBottom: "3px solid #EAB308", borderLeft: "3px solid #EAB308", boxShadow: "0 0 10px rgba(234,179,8,0.9)" }}/>
            </div>
            {/* Griglia card 2x2, z=10 sopra connector */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              {/* LV 1 · Novizio (top left) */}
              <div className="relative">
                <div className={`relative rounded-2xl p-3 flex flex-col items-center justify-center transition-all duration-300 ${evoShell[0]}`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shadow-md ${evoBadge[0]}`}>
                    <span className="text-bgPrimary font-black text-base tabular-nums">{evolutions[0].ovr}</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-[10px] font-black tracking-[0.15em] ${evoLbl[0]}`}>LV {evolutions[0].lv} · {evolutions[0].label.toUpperCase()}</p>
                    <p className="text-[10px] text-textMuted/80 leading-snug mt-1">{evolutions[0].desc}</p>
                  </div>
                </div>
              </div>
              {/* LV 5 · Emergente (top right) */}
              <div className="relative">
                <div className={`relative rounded-2xl p-3 flex flex-col items-center justify-center transition-all duration-300 ${evoShell[1]}`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shadow-md ${evoBadge[1]}`}>
                    <span className="text-bgPrimary font-black text-base tabular-nums">{evolutions[1].ovr}</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-[10px] font-black tracking-[0.15em] ${evoLbl[1]}`}>LV {evolutions[1].lv} · {evolutions[1].label.toUpperCase()}</p>
                    <p className="text-[10px] text-textMuted/80 leading-snug mt-1">{evolutions[1].desc}</p>
                  </div>
                </div>
              </div>
              {/* LV 22 · Veterano (bottom left) */}
              <div className="relative">
                <div className={`relative rounded-2xl p-3 flex flex-col items-center justify-center transition-all duration-300 ${evoShell[3]}`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shadow-md ${evoBadge[3]}`}>
                    <span className="text-bgPrimary font-black text-base tabular-nums">{evolutions[3].ovr}</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-[10px] font-black tracking-[0.15em] ${evoLbl[3]}`}>LV {evolutions[3].lv} · {evolutions[3].label.toUpperCase()}</p>
                    <p className="text-[10px] text-textMuted/80 leading-snug mt-1">{evolutions[3].desc}</p>
                  </div>
                </div>
              </div>
              {/* LV 12 · Affermato (bottom right) */}
              <div className="relative">
                <div className={`relative rounded-2xl p-3 flex flex-col items-center justify-center transition-all duration-300 ${evoShell[2]}`}>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shadow-md ${evoBadge[2]}`}>
                    <span className="text-bgPrimary font-black text-base tabular-nums">{evolutions[2].ovr}</span>
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-[10px] font-black tracking-[0.15em] ${evoLbl[2]}`}>LV {evolutions[2].lv} · {evolutions[2].label.toUpperCase()}</p>
                    <p className="text-[10px] text-textMuted/80 leading-snug mt-1">{evolutions[2].desc}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden md:block relative max-w-5xl mx-auto">
            <div className="absolute left-0 right-0 top-[72px] h-12 pointer-events-none z-0">
              {[
                {l:"12.5%", w:"25%", c:"linear-gradient(to right, rgba(156,163,175,0.3) 0%, rgba(34,197,94,0.5) 100%)", bc:"rgba(34,197,94,0.9)", d:"0s"},
                {l:"37.5%", w:"25%", c:"linear-gradient(to right, rgba(34,197,94,0.5) 0%, rgba(124,255,107,0.6) 100%)", bc:"rgba(124,255,107,0.9)", d:"1.33s"},
                {l:"62.5%", w:"25%", c:"linear-gradient(to right, rgba(124,255,107,0.6) 0%, rgba(234,179,8,0.7) 100%)", bc:"rgba(234,179,8,0.9)", d:"2.66s"},
              ].map((t,i) => (
                <div key={i} className="relative w-full h-full flex items-center">
                  <div className="absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full overflow-hidden" style={{left:t.l, width:t.w, background:t.c}}>
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                      style={{background:t.bc, boxShadow:`0 0 12px ${t.bc}`, animation:`evo-ball-travel 4s ease-in-out infinite ${t.d}`}}/>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {evolutions.map((e,i) => (
                <div key={e.ovr} className="relative flex flex-col items-center z-10">
                  <div className={`mb-3 inline-flex items-center justify-center px-3 py-1 rounded-full border backdrop-blur-sm ${
                    [
                      "bg-gray-500/10 border-gray-500/30 text-gray-400",
                      "bg-greenPrimary/10 border-greenPrimary/35 text-greenPrimary",
                      "bg-greenElectric/12 border-greenElectric/40 text-greenElectric",
                      "bg-yellow-400/15 border-yellow-400/45 text-yellow-400",
                    ][i]
                  }`}>
                    <span className="text-[11px] font-black tracking-[0.2em]">TAPPA {i+1}</span>
                  </div>
                  <div className="relative shrink-0 w-full">
                    <div className={`relative w-full h-52 rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-300 group ${evoShell[i]}`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-lg group-hover:scale-105 transition-transform ${evoBadge[i]}`}>
                        <span className="text-bgPrimary font-black text-2xl">{e.ovr}</span>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-textPrimary font-black text-lg tracking-tight">OVR {e.ovr}</span>
                        <p className={`mt-1 ${evoLbl[i]} text-xs font-bold`}>LV {e.lv} · {e.label}</p>
                        <p className="text-textMuted/70 text-[11px] leading-tight mt-1">{e.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TROFEI */}
      <section id="trofei" className="py-12 md:py-24 relative trophy-room-bg overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/12 border border-yellow-500/30 mb-3 md:mb-5">
              <Trophy className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-400" strokeWidth={2.5}/>
              <span className="text-yellow-400 text-[10px] md:text-[11px] font-black tracking-[0.2em]">TROPHY ROOM</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black mt-2 md:mt-3 tracking-tight">
              <span className="text-gradient-gold">Trofei</span> da collezione
            </h2>
            <p className="md:hidden text-textMuted/85 text-sm mt-3 max-w-md mx-auto leading-relaxed">Ogni traguardo, una storia.</p>
          </div>
          {/* Mobile compact */}
          <div className="md:hidden grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {trofeiLanding.map((t,i) => {
              const Ic = t.icon;
              const style = i===3
                ? {b:"border-yellow-500/40", g:"from-yellow-500/18 via-yellow-400/8 to-transparent", tc:"text-yellow-300", glow:true}
                : i>=1
                ? {b:"border-greenElectric/30", g:"from-greenElectric/15 via-greenPrimary/8 to-transparent", tc:"text-greenElectric", glow:false}
                : {b:"border-greenPrimary/25", g:"from-greenPrimary/12 via-greenPrimary/5 to-transparent", tc:"text-greenPrimary", glow:false};
              return (
                <div key={t.name} className={`relative rounded-2xl bg-gradient-to-br ${style.g} border ${style.b} p-4 flex flex-col items-center text-center overflow-hidden ${style.glow?"animate-trophy-glow":""}`}>
                  <div className="w-12 h-12 rounded-xl bg-bgPrimary/50 border border-white/5 flex items-center justify-center mb-2.5 shadow-inner">
                    <Ic className={`w-6 h-6 ${style.tc}`} strokeWidth={2}/>
                  </div>
                  <h3 className={`text-[11px] font-black tracking-[0.12em] ${style.tc} mb-1`}>{t.name}</h3>
                  <p className="text-[10px] text-textMuted/85 leading-snug">{t.desc}</p>
                </div>
              );
            })}
            <div className="col-span-2 relative rounded-2xl bg-gradient-to-br from-bgSecondary/80 via-bgCard/60 to-bgSecondary/80 border border-dashed border-yellow-500/25 p-4 flex items-center gap-4 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none"/>
              <div className="relative w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 border border-yellow-500/30 flex items-center justify-center animate-trophy-glow">
                <Lock className="w-6 h-6 text-yellow-400" strokeWidth={2.2}/>
              </div>
              <div className="relative flex-1 min-w-0 text-left">
                <h3 className="text-sm font-black tracking-wider text-gradient-gold mb-1">MOLTI ALTRI...</h3>
                <p className="text-[11px] text-textMuted/85 leading-snug">E molti altri Trofei da sbloccare...</p>
              </div>
            </div>
          </div>
          {/* Desktop grid */}
          <div className="hidden md:block max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {allAchievements.map((a,idx) => {
                const gold = idx===5 || idx===9 || idx===12;
                const Ic = a.icon;
                return (
                  <div key={a.name} className={`group relative rounded-2xl bg-bgCard border p-5 flex items-start gap-4 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${
                    gold ? "border-yellow-500/30 hover:border-yellow-500/50 animate-trophy-glow"
                         : "border-greenPrimary/18 hover:border-greenElectric/40"
                  }`}>
                    <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gold?"bg-yellow-500/8":"bg-greenElectric/5"}`}/>
                    <div className={`relative shrink-0 w-14 h-14 rounded-2xl border flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 ${
                      gold ? "bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 border-yellow-500/35 shadow-yellow-500/10"
                           : "bg-gradient-to-br from-greenElectric/18 to-greenPrimary/12 border-greenElectric/30 shadow-greenElectric/10"
                    }`}>
                      <Ic className={`w-6 h-6 ${gold?"text-yellow-400":"text-greenElectric"}`} strokeWidth={2}/>
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <div className="text-textPrimary font-black tracking-wider text-sm md:text-base truncate mb-1.5">{a.name}</div>
                      <div className="text-textMuted text-xs md:text-sm leading-snug mb-2">{a.desc}</div>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-md border ${
                        gold ? "bg-yellow-500/8 border-yellow-500/20 text-yellow-400/90"
                             : "bg-greenElectric/8 border-greenElectric/20 text-greenElectric/90"
                      }`}>
                        <span className="text-[10px] font-black tracking-widest">{a.role}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-14 text-center">
              <div className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-yellow-500/10 via-greenPrimary/8 to-yellow-500/10 border border-yellow-500/25 backdrop-blur-sm">
                <Sparkles className="w-5 h-6 text-yellow-400" strokeWidth={2}/>
                <p className="text-textPrimary font-black text-lg tracking-tight">+ <span className="text-gradient-gold">Molti altri da sbloccare</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLO / MULTIPLAYER compact */}
      <section className="py-12 md:py-24 relative stadium-bg overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-greenElectric/10 border border-greenElectric/25 mb-3 md:mb-5">
              <Dices className="w-3 h-3 md:w-3.5 md:h-3.5 text-greenElectric" strokeWidth={2.5}/>
              <span className="text-greenElectric text-[10px] md:text-[11px] font-black tracking-[0.2em]">MODALITÀ</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black mt-2 md:mt-3 tracking-tight">
              Gioca <span className="text-gradient-green">come preferisci</span>
            </h2>
          </div>
          {/* Mobile */}
          <div className="md:hidden space-y-3.5 max-w-sm mx-auto">
            <div className="relative rounded-2xl bg-bgCard border-2 border-greenElectric/40 p-5 overflow-hidden shine-effect">
              <div className="absolute top-0 right-0 w-32 h-32 bg-greenElectric/12 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"/>
              <div className="relative flex items-center gap-3.5 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-greenElectric/25 to-greenPrimary/15 border border-greenElectric/45 flex items-center justify-center shrink-0 shadow-lg shadow-greenElectric/15">
                  <Zap className="w-5 h-5 text-greenElectric animate-pulse" strokeWidth={2.5}/>
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-textPrimary">CARRIERA SOLO</h3>
                  <span className="text-[10px] text-greenElectric font-black tracking-[0.18em]">DISPONIBILE ORA</span>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {["Statistiche e CI illimitate","Evoluzione card completa","Trofei sbloccabili"].map(it => (
                  <div key={it} className="flex items-center gap-2 text-[12px] text-textMuted">
                    <Check className="w-3.5 h-3.5 text-greenElectric shrink-0" strokeWidth={3}/>
                    <span>{it}</span>
                  </div>
                ))}
              </div>
              <SmartCTA label="GIOCA ORA" icon={PlaySquare} variant="primary" size="lg" fullWidth
                className="!min-h-[54px]" loggedInLabel="CONTINUA"/>
            </div>
            <div className="relative rounded-2xl bg-bgCard/70 border border-textPrimary/12 p-5 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"/>
              <div className="relative flex items-center gap-3.5 mb-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 border border-yellow-500/35 flex items-center justify-center shrink-0">
                  <Swords className="w-5 h-5 text-yellow-400" strokeWidth={2}/>
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-textPrimary">MULTIPLAYER</h3>
                  <span className="text-[10px] text-yellow-400 font-black tracking-[0.18em]">IN ARRIVO</span>
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {["Partite verificate","Ranking","Squadre e tornei",{l:"+ molto altro", muted:true} as const].map((it,idx) => {
                  const text = typeof it==="string"?it:it.l;
                  const muted = typeof it!=="string" && it.muted;
                  return (
                    <div key={idx} className={`flex items-center gap-2 text-[12px] ${muted?"text-yellow-400/80 font-black":"text-textMuted/75"}`}>
                      <Check className={`w-3.5 h-3.5 shrink-0 ${muted?"text-yellow-400/80":"text-textMuted/60"}`} strokeWidth={3}/>
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
              <button disabled type="button"
                className="w-full inline-flex items-center justify-center gap-2.5 min-h-[54px] rounded-2xl text-sm font-bold bg-textPrimary/5 border border-textPrimary/15 text-textMuted cursor-not-allowed">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-40"/>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"/>
                </span>
                IN ARRIVO
              </button>
            </div>
          </div>
          {/* Desktop full */}
          <div className="hidden md:grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="relative group rounded-3xl bg-bgCard border-2 border-greenElectric/35 p-9 overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-greenElectric/12 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-greenElectric/18 transition-all duration-500"/>
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-greenElectric/20 to-greenPrimary/15 border border-greenElectric/40 mb-7 shadow-lg shadow-greenElectric/10">
                  <Zap className="w-4 h-4 text-greenElectric animate-pulse" strokeWidth={2.5}/>
                  <span className="text-greenElectric text-xs font-black tracking-[0.18em]">DISPONIBILE ORA</span>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-greenElectric/25 to-greenPrimary/15 border border-greenElectric/40 flex items-center justify-center shadow-lg shadow-greenElectric/15">
                    <Users className="w-8 h-8 text-greenElectric" strokeWidth={2}/>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight mb-1">CARRIERA SOLO</h3>
                </div>
                <p className="text-textMuted leading-relaxed mb-8 text-lg">La tua carriera, le tue regole.</p>
                <ul className="space-y-3 mb-9">
                  {["Statistiche e CI illimitate","Evoluzione card completa","100% autonomia","Achievement sbloccabili"].map(item => (
                    <li key={item} className="flex items-center gap-3 text-textPrimary text-lg">
                      <div className="w-5 h-5 shrink-0 rounded-full bg-greenElectric/20 border border-greenElectric/40 flex items-center justify-center">
                        <Check className="w-3 h-3 text-greenElectric" strokeWidth={3.5}/>
                      </div>
                      <span className="font-semibold">{item}</span>
                    </li>
                  ))}
                </ul>
                <SmartCTA label="INIZIA ORA" icon={PlaySquare} variant="primary" size="lg" fullWidth
                  className="shadow-xl shadow-greenElectric/30 hover:shadow-greenElectric/45" loggedInLabel="RIPRENDI CARRIERA"/>
              </div>
            </div>
            <div className="relative group rounded-3xl bg-bgCard/65 border border-textPrimary/12 p-9 overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"/>
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/18 border border-yellow-500/35 mb-7">
                  <Rocket className="w-4 h-4 text-yellow-400" strokeWidth={2.5}/>
                  <span className="text-yellow-400 text-xs font-black tracking-[0.18em]">IN ARRIVO · PROSSIMAMENTE</span>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 border border-yellow-500/30 flex items-center justify-center">
                    <Swords className="w-8 h-8 text-yellow-400/90" strokeWidth={2}/>
                  </div>
                  <h3 className="text-4xl font-black tracking-tight mb-1">MULTIPLAYER</h3>
                </div>
                <p className="text-textMuted leading-relaxed mb-8 text-lg">Gioca con gli amici, confrontati sul campo.</p>
                <ul className="space-y-3 mb-9">
                  {["Partite verificate tra squadre","Ranking locali e nazionali","Squadre ufficiali","Sfide 1v1 e tornei","Badge esclusivi multiplayer"].map(item => (
                    <li key={item} className="flex items-center gap-3 text-textMuted text-lg">
                      <div className="w-5 h-5 shrink-0 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center">
                        <Check className="w-3 h-3 text-yellow-400/80" strokeWidth={3.5}/>
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button disabled className="w-full inline-flex items-center justify-center gap-2.5 h-14 px-7 rounded-2xl text-lg font-bold bg-yellow-500/5 border border-yellow-500/20 text-yellow-400/90 cursor-not-allowed">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-40"/>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400"/>
                  </span>
                  IN ARRIVO
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PRO */}
      <section id="pricing" className="py-12 md:py-24 relative pro-gold-bg overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/12 border border-yellow-500/30 mb-3 md:mb-5">
              <Crown className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-400" strokeWidth={2.5}/>
              <span className="text-yellow-400 text-[10px] md:text-[11px] font-black tracking-[0.2em]">I PIANI</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black mt-2 md:mt-3 tracking-tight">
              Piani per ogni <span className="text-gradient-green-gold">tipo di giocatore</span>
            </h2>
          </div>
          {/* Mobile */}
          <div className="md:hidden space-y-3.5 max-w-sm mx-auto">
            <div className="relative rounded-2xl bg-bgCard border border-greenPrimary/20 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-greenElectric/15 to-greenPrimary/10 border border-greenElectric/30 flex items-center justify-center">
                    <Star className="w-4 h-4 text-greenElectric" strokeWidth={2.2}/>
                  </div>
                  <h3 className="text-base font-black tracking-tight">FREE</h3>
                </div>
                <div className="flex items-baseline gap-1"><span className="text-2xl font-black text-textPrimary tracking-tight">€0</span><span className="text-textMuted text-xs">/mese</span></div>
              </div>
              <p className="text-textMuted text-[11px] mb-3">Per iniziare la carriera</p>
              <ul className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-4">
                {pricingFree.slice(0,6).map(b => (
                  <li key={b} className="flex items-start gap-1.5 text-[10px] text-textMuted/90 leading-tight">
                    <Check className="w-3 h-3 mt-0.5 shrink-0 text-greenElectric" strokeWidth={3.5}/><span>{b}</span>
                  </li>
                ))}
              </ul>
              <FreeCTAButton className="w-full !min-h-[52px] !rounded-xl !text-sm"/>
            </div>
            <div className="relative rounded-2xl bg-bgCard border-2 border-greenElectric p-4 shadow-2xl shadow-greenElectric/15 flex flex-col z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 rounded-full bg-gradient-to-r from-greenElectric to-greenPrimary shadow-lg shadow-greenElectric/30 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-bgPrimary" strokeWidth={2.5}/>
                  <span className="text-bgPrimary text-[10px] font-black tracking-[0.18em]">PIÙ SCELTO</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-greenElectric/25 to-greenPrimary/15 border border-greenElectric/45 flex items-center justify-center shadow-md shadow-greenElectric/15">
                    <Crown className="w-4 h-4 text-greenElectric" strokeWidth={2.2}/>
                  </div>
                  <h3 className="text-base font-black tracking-tight">PRO <span className="text-gradient-green">Mensile</span></h3>
                </div>
                <div className="flex items-baseline gap-1"><span className="text-2xl font-black text-textPrimary tracking-tight">€3,90</span><span className="text-textMuted text-xs">/mese</span></div>
              </div>
              <p className="text-greenElectric text-[11px] mb-3 font-semibold">Flessibile</p>
              <ul className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-4">
                {pricingPro.slice(0,8).map(b => (
                  <li key={b} className="flex items-start gap-1.5 text-[10px] text-textMuted/90 leading-tight">
                    <Check className="w-3 h-3 mt-0.5 shrink-0 text-greenElectric" strokeWidth={3.5}/><span>{b}</span>
                  </li>
                ))}
              </ul>
              <ProCheckoutButton plan="monthly" className="w-full !min-h-[54px] !rounded-xl !text-sm">
                <><Crown size={15} className="mr-0.5 shrink-0" strokeWidth={2.2}/> SBLOCCA ORA <ArrowRight size={14} className="ml-0.5 shrink-0" strokeWidth={2.2}/></>
              </ProCheckoutButton>
            </div>
            <div className="relative rounded-2xl bg-gradient-to-br from-yellow-500/8 via-bgCard to-bgCard border border-yellow-500/40 p-4 flex flex-col shine-effect shadow-xl shadow-yellow-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="px-4 py-1 rounded-full bg-gradient-to-r from-yellow-500/95 to-yellow-400/95 shadow-lg shadow-yellow-500/25 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-bgPrimary" strokeWidth={2.5}/>
                  <span className="text-bgPrimary text-[10px] font-black tracking-[0.18em]">MEGLIO · ~36%</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/25 to-yellow-400/15 border border-yellow-500/45 flex items-center justify-center shadow-md shadow-yellow-500/15">
                    <Mountain className="w-4 h-4 text-yellow-400" strokeWidth={2.2}/>
                  </div>
                  <h3 className="text-base font-black tracking-tight">PRO <span className="text-yellow-400">Annuale</span></h3>
                </div>
                <div className="flex items-baseline gap-1"><span className="text-2xl font-black text-textPrimary tracking-tight">€29,90</span><span className="text-textMuted text-xs">/anno</span></div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400 text-[11px] font-black">~€2,49/mese</span>
                <span className="text-textMuted/70 text-[11px] line-through">€46,80</span>
              </div>
              <ul className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-4">
                {pricingPro.slice(0,8).map(b => (
                  <li key={b} className="flex items-start gap-1.5 text-[10px] text-textMuted/90 leading-tight">
                    <Check className="w-3 h-3 mt-0.5 shrink-0 text-yellow-400/90" strokeWidth={3.5}/><span>{b}</span>
                  </li>
                ))}
              </ul>
              <YearlyCheckoutButton plan="yearly" className="w-full !min-h-[54px] !rounded-xl !text-sm"/>
            </div>
          </div>
          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-7 max-w-5xl mx-auto">
            <div className="relative rounded-3xl bg-bgCard border border-greenPrimary/20 p-9 flex flex-col hover:border-greenElectric/30 transition-all duration-300">
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-greenElectric/15 to-greenPrimary/10 border border-greenElectric/30 flex items-center justify-center">
                    <Star className="w-5 h-5 text-greenElectric" strokeWidth={2.2}/>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">FREE</h3>
                </div>
                <div className="flex items-baseline gap-1.5 mt-3"><span className="text-5xl font-black text-textPrimary tracking-tight">€0</span><span className="text-textMuted text-base">/mese</span></div>
                <p className="text-textMuted text-sm mt-2">Perfetto per iniziare</p>
              </div>
              <ul className="space-y-3 mb-9 flex-1">
                {pricingFree.map(b => (
                  <li key={b} className="flex items-start gap-3 text-base text-textMuted">
                    <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-greenElectric/15 border border-greenElectric/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-greenElectric" strokeWidth={3.5}/>
                    </div><span>{b}</span>
                  </li>
                ))}
              </ul>
              <FreeCTAButton className="w-full"/>
            </div>
            <div className="relative rounded-3xl bg-bgCard border-2 border-greenElectric p-9 flex flex-col shadow-2xl shadow-greenElectric/15 -translate-y-4 z-10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-5 py-2 rounded-full bg-gradient-to-r from-greenElectric to-greenPrimary shadow-xl shadow-greenElectric/30 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-bgPrimary" strokeWidth={2.5}/>
                  <span className="text-bgPrimary text-xs font-black tracking-[0.18em]">PIÙ SCELTO</span>
                </div>
              </div>
              <div className="mb-7 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-greenElectric/25 to-greenPrimary/15 border border-greenElectric/45 flex items-center justify-center shadow-lg shadow-greenElectric/15">
                    <Crown className="w-5 h-5 text-greenElectric" strokeWidth={2.2}/>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">PRO <span className="text-gradient-green">Mensile</span></h3>
                </div>
                <div className="flex items-baseline gap-1.5 mt-3"><span className="text-5xl font-black text-textPrimary tracking-tight">€3,90</span><span className="text-textMuted text-base">/mese</span></div>
                <p className="text-greenElectric text-sm mt-2 font-semibold">Flessibile, senza pensieri</p>
              </div>
              <ul className="space-y-3 mb-9 flex-1">
                {pricingPro.map(b => (
                  <li key={b} className="flex items-start gap-3 text-base text-textMuted">
                    <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-greenElectric/20 border border-greenElectric/40 flex items-center justify-center">
                      <Check className="w-3 h-3 text-greenElectric" strokeWidth={3.5}/>
                    </div><span>{b}</span>
                  </li>
                ))}
              </ul>
              <ProCheckoutButton plan="monthly">
                <><Crown size={17} className="mr-1" strokeWidth={2.2}/> SBLOCCA ORA <ArrowRight size={16} className="ml-1" strokeWidth={2.2}/></>
              </ProCheckoutButton>
            </div>
            <div className="relative rounded-3xl bg-bgCard border border-yellow-500/30 p-9 flex flex-col hover:border-yellow-500/50 transition-all duration-300 shine-effect shadow-xl shadow-yellow-500/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500/95 to-yellow-400/95 shadow-xl shadow-yellow-500/25 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-bgPrimary" strokeWidth={2.5}/>
                  <span className="text-bgPrimary text-xs font-black tracking-[0.18em]">RISPARMI ~36%</span>
                </div>
              </div>
              <div className="mb-7 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/25 to-yellow-400/15 border border-yellow-500/40 flex items-center justify-center shadow-lg shadow-yellow-500/15">
                    <Mountain className="w-5 h-5 text-yellow-400" strokeWidth={2.2}/>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">PRO <span className="text-yellow-400">Annuale</span></h3>
                </div>
                <div className="flex items-baseline gap-1.5 mt-3"><span className="text-5xl font-black text-textPrimary tracking-tight">€29,90</span><span className="text-textMuted text-base">/anno</span></div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-yellow-400 text-xs font-black">~€2,49/mese</span>
                  <span className="text-textMuted/70 text-xs line-through">€46,80</span>
                </div>
              </div>
              <ul className="space-y-3 mb-9 flex-1">
                {pricingPro.map(b => (
                  <li key={b} className="flex items-start gap-3 text-base text-textMuted">
                    <div className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-yellow-500/15 border border-yellow-500/35 flex items-center justify-center">
                      <Check className="w-3 h-3 text-yellow-400/90" strokeWidth={3.5}/>
                    </div><span>{b}</span>
                  </li>
                ))}
              </ul>
              <YearlyCheckoutButton plan="yearly"/>
            </div>
          </div>
          <div className="mt-6 md:mt-14 text-center max-w-2xl mx-auto">
            <p className="text-textMuted text-xs md:text-base leading-relaxed">
              🔒 Pagamenti sicuri con <span className="text-textPrimary font-semibold">Stripe</span>. FREE è per sempre. PRO si disdice in un click.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-12 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="relative rounded-[24px] md:rounded-[36px] overflow-hidden border border-greenElectric/25 p-6 md:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-greenElectric/15 via-greenPrimary/8 via-yellow-500/5 to-transparent"/>
            <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full bg-greenElectric/20 blur-3xl"/>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-yellow-500/15 blur-3xl"/>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-greenElectric/15 border border-greenElectric/35 mb-5 md:mb-7 backdrop-blur-sm">
                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-greenElectric animate-pulse" strokeWidth={2.5}/>
                <span className="text-greenElectric text-[10px] md:text-xs font-black tracking-[0.2em]">PRONTO A INIZIARE?</span>
              </div>
              <h2 className="text-2xl md:text-5xl font-black tracking-tight mb-3 md:mb-5 leading-[1.15] md:leading-[1.1]">
                La tua carriera inizia <span className="text-gradient-green-gold">dalla prossima partita.</span>
              </h2>
              <p className="text-textMuted text-sm md:text-xl mb-7 md:mb-10 max-w-xl mx-auto leading-relaxed">
                Entra subito, è gratis. Poi passerai a PRO quando vorrai.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <SmartCTA label="INIZIA GRATIS" icon={Zap} variant="primary" size="lg" fullWidth
                  className="shadow-2xl shadow-greenElectric/35 hover:shadow-greenElectric/50 !min-h-[56px]" loggedInLabel="VAI ALLA DASHBOARD"/>
              </div>
              <p className="text-textMuted/80 text-[11px] md:text-sm mt-5 md:mt-6">⚽ Oltre 2.400 giocatori stanno già tracciando la propria carriera</p>
            </div>
          </div>
        </div>
      </section>

      <AppFooter/>
      <InstallPWAButton/>
    </main>
  );
}

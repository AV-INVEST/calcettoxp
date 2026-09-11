import type { Role } from "@prisma/client";

export type AchievementCategory =
  | "inizio_carriera"
  | "social_community"
  | "partite"
  | "vittorie"
  | "serie"
  | "career_index"
  | "livello_xp"
  | "specialista"
  | "stagioni"
  | "prestige_pro";

export type RequirementKind =
  | "FIRST_CONTRIBUTION"
  | "LIFETIME_MATCHES"
  | "LIFETIME_WINS"
  | "LIFETIME_LEVEL"
  | "LIFETIME_CI"
  | "LIFETIME_XP"
  | "STREAK_UNBEATEN"
  | "STREAK_WIN"
  | "SHARE_VALID_DAYS"
  | "REFERRAL_CONFIRMED"
  | "SEASONS_DISTINCT"
  | "ROLE_AGGREGATE";

export type RoleAggregatePath = {
  role: "ATT" | "CEN" | "DIF" | "POR";
  metric: "ATT_GOALS" | "CEN_ASSISTS" | "DIF_MATCHES_LE1_AGAINST" | "POR_CLEAN_SHEETS";
  target: number;
};

export type AchievementCatalogEntry = {
  key: string;
  name: string;
  description: string;
  tier: "FREE" | "PRO";
  category: AchievementCategory;
  order: number;
  requirement: {
    kind: RequirementKind;
    target: number;
    rolePaths?: RoleAggregatePath[];
  };
  icon: string;
  legacyKey?: string;
};

export const ACHIEVEMENT_CATEGORIES_META: Record<
  AchievementCategory,
  { label: string; description: string; order: number }
> = {
  inizio_carriera: {
    label: "INIZIO CARRIERA",
    description: "I primi passi sul campo",
    order: 1,
  },
  social_community: {
    label: "SOCIAL / COMMUNITY",
    description: "Condividi, invita, costruisci community",
    order: 2,
  },
  partite: {
    label: "PARTITE",
    description: "Costanza e presenza sotto i pali",
    order: 3,
  },
  vittorie: {
    label: "VITTORIE",
    description: "Conta i trionfi nella carriera",
    order: 4,
  },
  serie: {
    label: "SERIE",
    description: "Imbattibilità e strisce vincenti",
    order: 5,
  },
  career_index: {
    label: "CAREER INDEX",
    description: "Punteggio complessivo di carriera",
    order: 6,
  },
  livello_xp: {
    label: "LIVELLO / XP",
    description: "Progressione e longevità",
    order: 7,
  },
  specialista: {
    label: "SPECIALISTA",
    description: "Perfino nel tuo ruolo",
    order: 8,
  },
  stagioni: {
    label: "STAGIONI",
    description: "Anni sul campo, non solo settimane",
    order: 9,
  },
  prestige_pro: {
    label: "PRESTIGE PRO",
    description: "Le vette più alte della carriera · PRO",
    order: 10,
  },
};

export const ACHIEVEMENT_CATALOG: AchievementCatalogEntry[] = [
  // ===== 1. INIZIO CARRIERA =====
  {
    key: "PRIMO_PASSO",
    name: "Primo Passo",
    description: "Registra la tua prima partita.",
    tier: "FREE",
    category: "inizio_carriera",
    order: 1,
    requirement: { kind: "LIFETIME_MATCHES", target: 1 },
    icon: "Footprints",
    legacyKey: "FIRST_MATCH",
  },
  {
    key: "PRIMA_VITTORIA",
    name: "Prima Vittoria",
    description: "Vinci la tua prima partita.",
    tier: "FREE",
    category: "inizio_carriera",
    order: 2,
    requirement: { kind: "LIFETIME_WINS", target: 1 },
    icon: "Trophy",
    legacyKey: "FIRST_WIN",
  },
  {
    key: "PRIMO_CONTRIBUTO",
    name: "Primo Contributo",
    description: "Fai la differenza: primo gol, primo assist, primo clean sheet o primo rigore parato.",
    tier: "FREE",
    category: "inizio_carriera",
    order: 3,
    requirement: { kind: "FIRST_CONTRIBUTION", target: 1 },
    icon: "Sparkles",
  },

  // ===== 2. SOCIAL / COMMUNITY =====
  {
    key: "MOSTRA_LA_CARD",
    name: "Mostra la Card",
    description: "Condividi la tua Player Card con il mondo.",
    tier: "FREE",
    category: "social_community",
    order: 4,
    requirement: { kind: "SHARE_VALID_DAYS", target: 1 },
    icon: "Share2",
  },
  {
    key: "PASSAPAROLA",
    name: "Passaparola",
    description: "Condividi la card in 5 giorni distinti.",
    tier: "FREE",
    category: "social_community",
    order: 5,
    requirement: { kind: "SHARE_VALID_DAYS", target: 5 },
    icon: "MessageCircle",
  },
  {
    key: "PRIMO_COMPAGNO",
    name: "Primo Compagno",
    description: "Invita un amico che completa l'onboarding.",
    tier: "FREE",
    category: "social_community",
    order: 6,
    requirement: { kind: "REFERRAL_CONFIRMED", target: 1 },
    icon: "UserPlus",
  },
  {
    key: "SPOGLIATOIO",
    name: "Spogliatoio",
    description: "Porta 3 amici a completare l'onboarding.",
    tier: "FREE",
    category: "social_community",
    order: 7,
    requirement: { kind: "REFERRAL_CONFIRMED", target: 3 },
    icon: "Users",
  },
  {
    key: "COMMUNITY_BUILDER",
    name: "Community Builder",
    description: "5 referral confermati nella tua rete.",
    tier: "PRO",
    category: "social_community",
    order: 8,
    requirement: { kind: "REFERRAL_CONFIRMED", target: 5 },
    icon: "UsersRound",
  },
  {
    key: "CAPITANO",
    name: "Capitano",
    description: "10 amici si iscrivono grazie a te.",
    tier: "PRO",
    category: "social_community",
    order: 9,
    requirement: { kind: "REFERRAL_CONFIRMED", target: 10 },
    icon: "Crown",
  },
  {
    key: "TALENT_SCOUT",
    name: "Talent Scout",
    description: "25 referral completano l'onboarding.",
    tier: "PRO",
    category: "social_community",
    order: 10,
    requirement: { kind: "REFERRAL_CONFIRMED", target: 25 },
    icon: "Search",
  },
  {
    key: "AMBASCIATORE",
    name: "Ambasciatore",
    description: "50 giorni distinti di condivisione valida.",
    tier: "PRO",
    category: "social_community",
    order: 11,
    requirement: { kind: "SHARE_VALID_DAYS", target: 50 },
    icon: "Megaphone",
  },

  // ===== 3. PARTITE =====
  {
    key: "CI_STO_PRENDENDO_GUSTO",
    name: "Ci Sto Prendendo Gusto",
    description: "5 partite in carriera.",
    tier: "FREE",
    category: "partite",
    order: 12,
    requirement: { kind: "LIFETIME_MATCHES", target: 5 },
    icon: "Zap",
  },
  {
    key: "APPASSIONATO",
    name: "Appassionato",
    description: "10 partite in carriera.",
    tier: "FREE",
    category: "partite",
    order: 13,
    requirement: { kind: "LIFETIME_MATCHES", target: 10 },
    icon: "Flame",
    legacyKey: "MATCHES_10",
  },
  {
    key: "PRESENZA_FISSA",
    name: "Presenza Fissa",
    description: "25 partite in carriera.",
    tier: "FREE",
    category: "partite",
    order: 14,
    requirement: { kind: "LIFETIME_MATCHES", target: 25 },
    icon: "CalendarDays",
  },
  {
    key: "CALCIATORE_NAVETTA",
    name: "Calciatore Navetta",
    description: "50 partite in carriera.",
    tier: "FREE",
    category: "partite",
    order: 15,
    requirement: { kind: "LIFETIME_MATCHES", target: 50 },
    icon: "Car",
    legacyKey: "MATCHES_50",
  },
  {
    key: "VETERANO",
    name: "Veterano",
    description: "75 partite nel pallone.",
    tier: "PRO",
    category: "partite",
    order: 16,
    requirement: { kind: "LIFETIME_MATCHES", target: 75 },
    icon: "Medal",
  },
  {
    key: "CENTENARIO",
    name: "Centenario",
    description: "100 partite in carriera.",
    tier: "PRO",
    category: "partite",
    order: 17,
    requirement: { kind: "LIFETIME_MATCHES", target: 100 },
    icon: "Target",
    legacyKey: "MATCHES_100",
  },
  {
    key: "INSTANCABILE",
    name: "Instancabile",
    description: "150 partite e non abbassare la testa.",
    tier: "PRO",
    category: "partite",
    order: 18,
    requirement: { kind: "LIFETIME_MATCHES", target: 150 },
    icon: "BatteryFull",
  },
  {
    key: "STAGIONATO",
    name: "Stagionato",
    description: "250 partite registrate.",
    tier: "PRO",
    category: "partite",
    order: 19,
    requirement: { kind: "LIFETIME_MATCHES", target: 250 },
    icon: "Leaf",
  },
  {
    key: "GLADIATORE",
    name: "Gladiatore",
    description: "500 partite in carriera. Il massimo del sistema.",
    tier: "PRO",
    category: "partite",
    order: 20,
    requirement: { kind: "LIFETIME_MATCHES", target: 500 },
    icon: "Swords",
  },

  // ===== 4. VITTORIE =====
  {
    key: "VINCITORE_NATO",
    name: "Vincitore Nato",
    description: "10 vittorie in carriera.",
    tier: "FREE",
    category: "vittorie",
    order: 21,
    requirement: { kind: "LIFETIME_WINS", target: 10 },
    icon: "Trophy",
    legacyKey: "TEN_WINS",
  },
  {
    key: "MENTALITA_VINCENTE",
    name: "Mentalità Vincente",
    description: "25 vittorie.",
    tier: "FREE",
    category: "vittorie",
    order: 22,
    requirement: { kind: "LIFETIME_WINS", target: 25 },
    icon: "Award",
  },
  {
    key: "CAMPIONE",
    name: "Campione",
    description: "50 vittorie in carriera.",
    tier: "PRO",
    category: "vittorie",
    order: 23,
    requirement: { kind: "LIFETIME_WINS", target: 50 },
    icon: "Trophy",
    legacyKey: "FIFTY_WINS",
  },
  {
    key: "DOMINATORE",
    name: "Dominatore",
    description: "100 vittorie.",
    tier: "PRO",
    category: "vittorie",
    order: 24,
    requirement: { kind: "LIFETIME_WINS", target: 100 },
    icon: "Crown",
  },
  {
    key: "SERIAL_WINNER",
    name: "Serial Winner",
    description: "150 vittorie registrate.",
    tier: "PRO",
    category: "vittorie",
    order: 25,
    requirement: { kind: "LIFETIME_WINS", target: 150 },
    icon: "Repeat",
  },
  {
    key: "RE_DEL_CAMPO",
    name: "Re del Campo",
    description: "250 vittorie.",
    tier: "PRO",
    category: "vittorie",
    order: 26,
    requirement: { kind: "LIFETIME_WINS", target: 250 },
    icon: "Crown",
  },

  // ===== 5. SERIE =====
  {
    key: "MURO_DIFENSIVO",
    name: "Muro Difensivo",
    description: "5 partite consecutive senza sconfitte.",
    tier: "FREE",
    category: "serie",
    order: 27,
    requirement: { kind: "STREAK_UNBEATEN", target: 5 },
    icon: "Shield",
    legacyKey: "UNBEATEN_5",
  },
  {
    key: "INVINCIBILE",
    name: "Invincibile",
    description: "10 partite consecutive senza sconfitte.",
    tier: "PRO",
    category: "serie",
    order: 28,
    requirement: { kind: "STREAK_UNBEATEN", target: 10 },
    icon: "ShieldCheck",
    legacyKey: "UNBEATEN_10",
  },
  {
    key: "INARRESTABILE",
    name: "Inarrestabile",
    description: "10 vittorie consecutive.",
    tier: "PRO",
    category: "serie",
    order: 29,
    requirement: { kind: "STREAK_WIN", target: 10 },
    icon: "Flame",
  },
  {
    key: "IMBATTIBILE",
    name: "Imbattibile",
    description: "20 partite consecutive senza sconfitte.",
    tier: "PRO",
    category: "serie",
    order: 30,
    requirement: { kind: "STREAK_UNBEATEN", target: 20 },
    icon: "ShieldAlert",
  },
  {
    key: "MACCHINA_PERFETTA",
    name: "Macchina Perfetta",
    description: "15 vittorie consecutive.",
    tier: "PRO",
    category: "serie",
    order: 31,
    requirement: { kind: "STREAK_WIN", target: 15 },
    icon: "Bot",
  },

  // ===== 6. CAREER INDEX =====
  {
    key: "GIOCATORE_DI_SERIE",
    name: "Giocatore di Serie",
    description: "Career Index ≥ 1200.",
    tier: "FREE",
    category: "career_index",
    order: 32,
    requirement: { kind: "LIFETIME_CI", target: 1200 },
    icon: "TrendingUp",
    legacyKey: "CAREER_INDEX_1200",
  },
  {
    key: "TOP_PLAYER",
    name: "Top Player",
    description: "Career Index ≥ 1500.",
    tier: "FREE",
    category: "career_index",
    order: 33,
    requirement: { kind: "LIFETIME_CI", target: 1500 },
    icon: "ArrowUpRight",
    legacyKey: "CAREER_INDEX_1500",
  },
  {
    key: "FUORICLASSE",
    name: "Fuoriclasse",
    description: "Career Index ≥ 1600.",
    tier: "PRO",
    category: "career_index",
    order: 34,
    requirement: { kind: "LIFETIME_CI", target: 1600 },
    icon: "Sparkles",
  },

  // ===== 7. LIVELLO / XP =====
  {
    key: "IN_CRESCITA",
    name: "In Crescita",
    description: "Raggiungi Livello 10.",
    tier: "FREE",
    category: "livello_xp",
    order: 35,
    requirement: { kind: "LIFETIME_LEVEL", target: 10 },
    icon: "Star",
    legacyKey: "LEVEL_10",
  },
  {
    key: "AFFERMATO",
    name: "Affermato",
    description: "Raggiungi Livello 25.",
    tier: "FREE",
    category: "livello_xp",
    order: 36,
    requirement: { kind: "LIFETIME_LEVEL", target: 25 },
    icon: "Milestone",
    legacyKey: "LEVEL_25",
  },

  // ===== 8. SPECIALISTA =====
  {
    key: "SPECIALISTA_I",
    name: "Specialista I",
    description: "Brilla nel tuo ruolo. Un percorso su 4 è sufficiente.",
    tier: "FREE",
    category: "specialista",
    order: 37,
    requirement: {
      kind: "ROLE_AGGREGATE",
      target: 1,
      rolePaths: [
        { role: "ATT", metric: "ATT_GOALS", target: 10 },
        { role: "CEN", metric: "CEN_ASSISTS", target: 10 },
        { role: "DIF", metric: "DIF_MATCHES_LE1_AGAINST", target: 10 },
        { role: "POR", metric: "POR_CLEAN_SHEETS", target: 5 },
      ],
    },
    icon: "Briefcase",
  },
  {
    key: "SPECIALISTA_II",
    name: "Specialista II",
    description: "Punti chiave raddoppiati nel ruolo.",
    tier: "FREE",
    category: "specialista",
    order: 38,
    requirement: {
      kind: "ROLE_AGGREGATE",
      target: 1,
      rolePaths: [
        { role: "ATT", metric: "ATT_GOALS", target: 25 },
        { role: "CEN", metric: "CEN_ASSISTS", target: 25 },
        { role: "DIF", metric: "DIF_MATCHES_LE1_AGAINST", target: 25 },
        { role: "POR", metric: "POR_CLEAN_SHEETS", target: 10 },
      ],
    },
    icon: "Award",
  },
  {
    key: "SPECIALISTA_III",
    name: "Specialista III",
    description: "Dominio nel ruolo · PRO.",
    tier: "PRO",
    category: "specialista",
    order: 39,
    requirement: {
      kind: "ROLE_AGGREGATE",
      target: 1,
      rolePaths: [
        { role: "ATT", metric: "ATT_GOALS", target: 50 },
        { role: "CEN", metric: "CEN_ASSISTS", target: 50 },
        { role: "DIF", metric: "DIF_MATCHES_LE1_AGAINST", target: 50 },
        { role: "POR", metric: "POR_CLEAN_SHEETS", target: 25 },
      ],
    },
    icon: "BadgePlus",
  },
  {
    key: "SPECIALISTA_IV",
    name: "Specialista IV",
    description: "Numeri da top player nel tuo reparto.",
    tier: "PRO",
    category: "specialista",
    order: 40,
    requirement: {
      kind: "ROLE_AGGREGATE",
      target: 1,
      rolePaths: [
        { role: "ATT", metric: "ATT_GOALS", target: 100 },
        { role: "CEN", metric: "CEN_ASSISTS", target: 100 },
        { role: "DIF", metric: "DIF_MATCHES_LE1_AGAINST", target: 100 },
        { role: "POR", metric: "POR_CLEAN_SHEETS", target: 50 },
      ],
    },
    icon: "Gem",
  },
  {
    key: "MAESTRO_DEL_RUOLO",
    name: "Maestro del Ruolo",
    description: "Cifre monumentali nel ruolo che hai scelto.",
    tier: "PRO",
    category: "specialista",
    order: 41,
    requirement: {
      kind: "ROLE_AGGREGATE",
      target: 1,
      rolePaths: [
        { role: "ATT", metric: "ATT_GOALS", target: 250 },
        { role: "CEN", metric: "CEN_ASSISTS", target: 250 },
        { role: "DIF", metric: "DIF_MATCHES_LE1_AGAINST", target: 200 },
        { role: "POR", metric: "POR_CLEAN_SHEETS", target: 100 },
      ],
    },
    icon: "Award",
  },

  // ===== 9. STAGIONI =====
  {
    key: "SECONDO_CAPITOLO",
    name: "Secondo Capitolo",
    description: "Almeno una partita in 2 stagioni diverse.",
    tier: "PRO",
    category: "stagioni",
    order: 42,
    requirement: { kind: "SEASONS_DISTINCT", target: 2 },
    icon: "BookOpen",
  },
  {
    key: "VETERANO_DELLE_STAGIONI",
    name: "Veterano delle Stagioni",
    description: "Almeno una partita in 3 stagioni diverse.",
    tier: "PRO",
    category: "stagioni",
    order: 43,
    requirement: { kind: "SEASONS_DISTINCT", target: 3 },
    icon: "BookMarked",
  },
  {
    key: "UNA_VITA_SUL_CAMPO",
    name: "Una Vita sul Campo",
    description: "Almeno una partita in 5 stagioni diverse.",
    tier: "PRO",
    category: "stagioni",
    order: 44,
    requirement: { kind: "SEASONS_DISTINCT", target: 5 },
    icon: "Infinity",
  },

  // ===== 10. PRESTIGE PRO =====
  {
    key: "ELITE",
    name: "Elite",
    description: "Career Index ≥ 1800.",
    tier: "PRO",
    category: "prestige_pro",
    order: 45,
    requirement: { kind: "LIFETIME_CI", target: 1800 },
    icon: "Diamond",
  },
  {
    key: "WORLD_CLASS",
    name: "World Class",
    description: "Career Index ≥ 2000.",
    tier: "PRO",
    category: "prestige_pro",
    order: 46,
    requirement: { kind: "LIFETIME_CI", target: 2000 },
    icon: "Globe",
  },
  {
    key: "FENOMENO",
    name: "Fenomeno",
    description: "Career Index ≥ 2200.",
    tier: "PRO",
    category: "prestige_pro",
    order: 47,
    requirement: { kind: "LIFETIME_CI", target: 2200 },
    icon: "Sparkles",
  },
  {
    key: "LEGGENDA_VIVENTE",
    name: "Leggenda Vivente",
    description: "Raggiungi il Livello 50.",
    tier: "PRO",
    category: "prestige_pro",
    order: 48,
    requirement: { kind: "LIFETIME_LEVEL", target: 50 },
    icon: "Crown",
    legacyKey: "LEVEL_50",
  },
  {
    key: "OLTRE_IL_LIVELLO",
    name: "Oltre il Livello",
    description: "75.000 XP accumulati nella carriera.",
    tier: "PRO",
    category: "prestige_pro",
    order: 49,
    requirement: { kind: "LIFETIME_XP", target: 75000 },
    icon: "Rocket",
  },
  {
    key: "ETERNO",
    name: "Eterno",
    description: "100.000 XP lifetime. Imprescindibile.",
    tier: "PRO",
    category: "prestige_pro",
    order: 50,
    requirement: { kind: "LIFETIME_XP", target: 100000 },
    icon: "Infinity",
  },
];

export const ACHIEVEMENT_CATALOG_KEY_SET = new Set(
  ACHIEVEMENT_CATALOG.map((e) => e.key)
);

export function countCatalogByTier(): { total: number; free: number; pro: number } {
  let free = 0;
  let pro = 0;
  for (const e of ACHIEVEMENT_CATALOG) {
    if (e.tier === "FREE") free++;
    else pro++;
  }
  return { total: free + pro, free, pro };
}

export function findCatalogEntryByKey(
  key: string
): AchievementCatalogEntry | undefined {
  return ACHIEVEMENT_CATALOG.find((e) => e.key === key);
}

export function getCatalogEntriesByCategory(
  category: AchievementCategory
): AchievementCatalogEntry[] {
  return ACHIEVEMENT_CATALOG.filter((e) => e.category === category).sort(
    (a, b) => a.order - b.order
  );
}

export function roleLabelForRole(role: Role | string): string {
  switch (role) {
    case "ATT":
      return "Attaccante";
    case "CEN":
      return "Centrocampista";
    case "DIF":
      return "Difensore";
    case "POR":
      return "Portiere";
    default:
      return String(role);
  }
}

export function formatRoleAggregateForPath(path: {
  role: "ATT" | "CEN" | "DIF" | "POR";
  metric: string;
  target: number;
}): { roleLabel: string; metricLabel: string; target: number } {
  const roleLabel = roleLabelForRole(path.role);
  let metricLabel = "";
  switch (path.metric) {
    case "ATT_GOALS":
      metricLabel = "gol";
      break;
    case "CEN_ASSISTS":
      metricLabel = "assist";
      break;
    case "DIF_MATCHES_LE1_AGAINST":
      metricLabel = "partite DIF con ≤1 gol subito";
      break;
    case "POR_CLEAN_SHEETS":
      metricLabel = "clean sheet da POR";
      break;
    default:
      metricLabel = String(path.metric);
  }
  return { roleLabel, metricLabel, target: path.target };
}

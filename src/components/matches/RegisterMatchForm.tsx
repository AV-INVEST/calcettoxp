"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, AlertCircle, Shield, Target, Goal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import MatchResultScreen from "./MatchResultScreen";
import { type PlayerStatus } from "@/lib/xp-levels";

type Role = "POR" | "DIF" | "CEN" | "ATT";
type MatchResult = "WIN" | "DRAW" | "LOSS";
type Team = "T1" | "T2";

type UnlockedAchievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string | null;
  tier: "FREE" | "PRO";
  unlockedAt: Date | null;
};

type MatchResultData = {
  id: string;
  playedAt: string;
  result: MatchResult;
  goalsFor: number;
  goalsAgainst: number;
  role: Role;
  goals: number;
  assists: number;
  penaltiesSaved?: number;
  keySaves?: number;
  cleanSheet: boolean;
  notes: string | null;
  careerIndexBefore: number;
  careerIndexAfter: number;
  careerIndexChange: number;
  xpEarned: number;
  seasonKey: string | null;
};

type ApiSuccessResponse = {
  ok: true;
  match: MatchResultData;
  xpEarned: number;
  oldXp: number;
  newXp: number;
  careerIndexChange: number;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  oldStatus: PlayerStatus;
  newStatus: PlayerStatus;
  oldOverall: number;
  newOverall: number;
  oldCI: number;
  newCI: number;
  unlockedAchievements: UnlockedAchievement[];
  seasonKey: string;
};

type RegisterMatchFormProps = {
  defaultRole?: Role;
};

const ROLE_LABELS: Record<Role, string> = {
  POR: "Portiere",
  DIF: "Difensore",
  CEN: "Centrocampista",
  ATT: "Attaccante",
};

export default function RegisterMatchForm({ defaultRole }: RegisterMatchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ApiSuccessResponse | null>(null);

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const defaultDate = today.toISOString().slice(0, 16);

  const [playedAt, setPlayedAt] = useState<string>(defaultDate);
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  const [team, setTeam] = useState<Team>("T1");
  const [role, setRole] = useState<Role>(defaultRole ?? "ATT");
  const [goals, setGoals] = useState<number>(0);
  const [assists, setAssists] = useState<number>(0);
  const [penaltiesSaved, setPenaltiesSaved] = useState<number>(0);
  const [keySaves, setKeySaves] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const isGoalkeeper = role === "POR";

  const goalsFor = team === "T1" ? team1Score : team2Score;
  const goalsAgainst = team === "T1" ? team2Score : team1Score;

  const derivedResult: MatchResult = useMemo(() => {
    if (goalsFor > goalsAgainst) return "WIN";
    if (goalsFor === goalsAgainst) return "DRAW";
    return "LOSS";
  }, [goalsFor, goalsAgainst]);

  const derivedResultLabel: Record<MatchResult, string> = {
    WIN: "VITTORIA",
    DRAW: "PAREGGIO",
    LOSS: "SCONFITTA",
  };

  const derivedCleanSheet = useMemo(() => {
    return isGoalkeeper && goalsAgainst === 0;
  }, [isGoalkeeper, goalsAgainst]);

  useEffect(() => {
    if (!defaultRole) {
      fetch("/api/onboarding/status")
        .then((r) => r.json())
        .then((data) => {
          if (data?.ok && data?.primaryRole) {
            setRole(data.primaryRole);
          }
        })
        .catch(() => {});
    }
  }, [defaultRole]);

  const resetForm = () => {
    setResultData(null);
    setError(null);
    const t = new Date();
    t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
    setPlayedAt(t.toISOString().slice(0, 16));
    setTeam1Score(0);
    setTeam2Score(0);
    setTeam("T1");
    setRole(defaultRole ?? "ATT");
    setGoals(0);
    setAssists(0);
    setPenaltiesSaved(0);
    setKeySaves(0);
    setNotes("");
  };

  const step = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    delta: number,
    min: number,
    max: number
  ) => {
    setter(Math.max(min, Math.min(max, value + delta)));
  };

  const canSubmit = !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        playedAt: new Date(playedAt).toISOString(),
        team1Score,
        team2Score,
        team,
        role,
        notes: notes.trim() || null,
      };

      if (isGoalkeeper) {
        payload.penaltiesSaved = penaltiesSaved;
        payload.keySaves = keySaves;
        payload.cleanSheet = derivedCleanSheet;
      } else {
        payload.goals = goals;
        payload.assists = assists;
      }

      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Errore nella registrazione della partita");
        setLoading(false);
        return;
      }

      setResultData(data as ApiSuccessResponse);
    } catch (err) {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  if (resultData) {
    return (
      <MatchResultScreen
        match={resultData.match}
        xpEarned={resultData.xpEarned}
        oldXp={resultData.oldXp}
        newXp={resultData.newXp}
        oldCI={resultData.oldCI}
        newCI={resultData.newCI}
        oldOverall={resultData.oldOverall}
        newOverall={resultData.newOverall}
        oldLevel={resultData.oldLevel}
        newLevel={resultData.newLevel}
        oldStatus={resultData.oldStatus}
        newStatus={resultData.newStatus}
        unlockedAchievements={resultData.unlockedAchievements}
        onClose={() => router.push("/dashboard")}
        onReset={resetForm}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-textPrimary">
              Data e ora
            </label>
            <Input
              type="datetime-local"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              max={defaultDate}
              required
            />
            <p className="mt-1 text-xs text-textMuted">
              Solo partite delle ultime 72 ore
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-textPrimary">
              Punteggio partita
            </label>
            <Badge
              variant={
                derivedResult === "WIN"
                  ? "verde"
                  : derivedResult === "DRAW"
                  ? "grigio"
                  : "rosso"
              }
            >
              {derivedResultLabel[derivedResult]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="mb-2 block text-center text-xs font-bold uppercase tracking-wider text-textMuted">
                Squadra 1
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => step(setTeam1Score, team1Score, -1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Minus size={18} />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={team1Score}
                  onChange={(e) => setTeam1Score(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                  className="text-center text-2xl font-black tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => step(setTeam1Score, team1Score, +1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-center text-xs font-bold uppercase tracking-wider text-textMuted">
                Squadra 2
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => step(setTeam2Score, team2Score, -1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Minus size={18} />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={team2Score}
                  onChange={(e) => setTeam2Score(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                  className="text-center text-2xl font-black tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => step(setTeam2Score, team2Score, +1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <label className="mb-2 block text-sm font-semibold text-textPrimary">
              In che squadra hai giocato?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTeam("T1")}
                className={`rounded-xl border px-3 py-3.5 text-sm font-bold transition-all ${
                  team === "T1"
                    ? "border-greenElectric/50 bg-greenElectric/15 text-greenElectric ring-2 ring-greenElectric/40"
                    : "border-white/10 bg-bgSecondary text-textMuted hover:bg-white/5"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-widest opacity-70 mb-0.5">
                  La tua squadra
                </span>
                Squadra 1 · {team1Score} gol
              </button>
              <button
                type="button"
                onClick={() => setTeam("T2")}
                className={`rounded-xl border px-3 py-3.5 text-sm font-bold transition-all ${
                  team === "T2"
                    ? "border-greenElectric/50 bg-greenElectric/15 text-greenElectric ring-2 ring-greenElectric/40"
                    : "border-white/10 bg-bgSecondary text-textMuted hover:bg-white/5"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-widest opacity-70 mb-0.5">
                  La tua squadra
                </span>
                Squadra 2 · {team2Score} gol
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-bgSecondary/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <Goal size={14} className="text-greenElectric" />
                <span className="text-xs text-textMuted">
                  Gol fatti: <span className="font-bold text-textPrimary">{goalsFor}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-danger/80" />
                <span className="text-xs text-textMuted">
                  Gol subiti: <span className="font-bold text-textPrimary">{goalsAgainst}</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-textPrimary">
              Ruolo
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border px-2 py-3 text-xs font-bold transition-all ${
                    role === r
                      ? "border-greenElectric/50 bg-greenElectric/15 text-greenElectric ring-2 ring-greenElectric/40"
                      : "border-white/10 bg-bgSecondary text-textMuted hover:bg-white/5"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="mt-1 text-center text-xs text-textMuted">
              {ROLE_LABELS[role]}
            </p>
          </div>

          {isGoalkeeper ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-greenElectric/20 bg-greenElectric/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-greenElectric" />
                  <div>
                    <p className="text-xs font-bold text-greenElectric uppercase tracking-wider">
                      Clean Sheet
                    </p>
                    <p className="text-[11px] text-textMuted">
                      {derivedCleanSheet
                        ? "Nessun gol subito ✓"
                        : goalsAgainst > 0
                        ? "Non disponibile (gol subiti > 0)"
                        : "0 gol subiti nella partita"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={derivedCleanSheet ? "elettrico" : "grigio"}
                  className="shrink-0"
                >
                  {derivedCleanSheet ? "ATTIVO" : "—"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-bgSecondary px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-textPrimary uppercase tracking-wider">
                      Gol subiti
                    </p>
                    <p className="text-[11px] text-textMuted">
                      Calcolato automaticamente dal punteggio
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tabular-nums text-textPrimary w-10 text-center">
                      {goalsAgainst}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-textPrimary">
                    <Target size={14} className="text-amber-400" />
                    Rigori parati
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => step(setPenaltiesSaved, penaltiesSaved, -1, 0, 20)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                    >
                      <Minus size={18} />
                    </button>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      value={penaltiesSaved}
                      onChange={(e) => setPenaltiesSaved(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                      className="text-center text-xl font-bold tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => step(setPenaltiesSaved, penaltiesSaved, +1, 0, 20)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-textPrimary">
                    <Shield size={14} className="text-cyan-400" />
                    Parate decisive
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => step(setKeySaves, keySaves, -1, 0, 30)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                    >
                      <Minus size={18} />
                    </button>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={keySaves}
                      onChange={(e) => setKeySaves(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                      className="text-center text-xl font-bold tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => step(setKeySaves, keySaves, +1, 0, 30)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-center text-sm font-semibold text-textPrimary">
                  Tuoi gol
                </label>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => step(setGoals, goals, -1, 0, Math.min(15, goalsFor))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                  >
                    <Minus size={18} />
                  </button>
                  <Input
                    type="number"
                    min={0}
                    max={Math.min(15, goalsFor)}
                    value={goals}
                    onChange={(e) => setGoals(Math.max(0, Math.min(15, Math.min(goalsFor, parseInt(e.target.value) || 0))))}
                    className="text-center text-xl font-bold tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => step(setGoals, goals, +1, 0, Math.min(15, goalsFor))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {goals > goalsFor && (
                  <p className="mt-1 text-center text-[11px] text-danger font-semibold">
                    Non puoi aver fatto più gol della tua squadra
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-center text-sm font-semibold text-textPrimary">
                  Assist
                </label>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => step(setAssists, assists, -1, 0, 10)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                  >
                    <Minus size={18} />
                  </button>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={assists}
                    onChange={(e) => setAssists(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                    className="text-center text-xl font-bold tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={() => step(setAssists, assists, +1, 0, 10)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-textPrimary">
              Note
            </label>
            <span className={`text-xs ${notes.length > 230 ? "text-danger" : "text-textMuted"}`}>
              {notes.length}/250
            </span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 250))}
            maxLength={250}
            rows={3}
            placeholder="Avversari, condizioni di gioco, note personali..."
            className="w-full resize-none rounded-lg border border-white/10 bg-bgSecondary p-3 text-sm text-textPrimary placeholder:text-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary"
          />
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
        {loading ? "Registrazione in corso..." : "Registra Partita"}
      </Button>
    </form>
  );
}

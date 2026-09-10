"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import MatchResultScreen from "./MatchResultScreen";
import { type PlayerStatus } from "@/lib/xp-levels";

type Role = "POR" | "DIF" | "CEN" | "ATT";
type MatchResult = "WIN" | "DRAW" | "LOSS";

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
  const [goalsFor, setGoalsFor] = useState<number>(0);
  const [goalsAgainst, setGoalsAgainst] = useState<number>(0);
  const [role, setRole] = useState<Role>(defaultRole ?? "ATT");
  const [goals, setGoals] = useState<number>(0);
  const [assists, setAssists] = useState<number>(0);
  const [cleanSheet, setCleanSheet] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

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

  const effectiveCleanSheet = useMemo(() => {
    if (role !== "POR") return false;
    if (goalsAgainst > 0) return false;
    return cleanSheet;
  }, [role, goalsAgainst, cleanSheet]);

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
    setGoalsFor(0);
    setGoalsAgainst(0);
    setRole(defaultRole ?? "ATT");
    setGoals(0);
    setAssists(0);
    setCleanSheet(false);
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
      const payload = {
        playedAt: new Date(playedAt).toISOString(),
        result: derivedResult,
        goalsFor,
        goalsAgainst,
        role,
        goals,
        assists,
        cleanSheet: effectiveCleanSheet,
        notes: notes.trim() || null,
      };

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
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-textPrimary">
              Punteggio
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

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="mb-2 block text-center text-sm font-semibold text-textPrimary">
                Gol fatti
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => step(setGoalsFor, goalsFor, -1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Minus size={18} />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={goalsFor}
                  onChange={(e) => setGoalsFor(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                  className="text-center text-xl font-bold"
                />
                <button
                  type="button"
                  onClick={() => step(setGoalsFor, goalsFor, +1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-center text-sm font-semibold text-textPrimary">
                Gol subiti
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => step(setGoalsAgainst, goalsAgainst, -1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Minus size={18} />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={goalsAgainst}
                  onChange={(e) => setGoalsAgainst(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                  className="text-center text-xl font-bold"
                />
                <button
                  type="button"
                  onClick={() => step(setGoalsAgainst, goalsAgainst, +1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Plus size={18} />
                </button>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-center text-sm font-semibold text-textPrimary">
                Tuoi gol
              </label>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => step(setGoals, goals, -1, 0, 15)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Minus size={18} />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={15}
                  value={goals}
                  onChange={(e) => setGoals(Math.max(0, Math.min(15, parseInt(e.target.value) || 0)))}
                  className="text-center text-xl font-bold"
                />
                <button
                  type="button"
                  onClick={() => step(setGoals, goals, +1, 0, 15)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
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
                  className="text-center text-xl font-bold"
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

          {role === "POR" && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-bgSecondary p-4">
              <div>
                <p className="text-sm font-semibold text-textPrimary">Clean Sheet</p>
                <p className="text-xs text-textMuted">
                  {goalsAgainst > 0
                    ? "Non disponibile (gol subiti > 0)"
                    : "Nessun gol subito"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCleanSheet(!cleanSheet)}
                disabled={goalsAgainst > 0}
                className={`relative flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${
                  goalsAgainst > 0
                    ? "bg-white/10 opacity-60 cursor-not-allowed"
                    : effectiveCleanSheet
                    ? "bg-greenPrimary"
                    : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    effectiveCleanSheet ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
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

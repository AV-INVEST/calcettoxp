"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Role = "POR" | "DIF" | "CEN" | "ATT";
type MatchResult = "WIN" | "DRAW" | "LOSS";

const ROLE_LABELS: Record<Role, string> = {
  POR: "Portiere",
  DIF: "Difensore",
  CEN: "Centrocampista",
  ATT: "Attaccante",
};

type Props = {
  matchId: string;
  initialResult: MatchResult;
  initialGoalsFor: number;
  initialGoalsAgainst: number;
  initialRole: Role;
  initialGoals: number;
  initialAssists: number;
  initialCleanSheet: boolean;
  initialNotes: string;
  minutesLeft: number;
};

export default function MatchEditForm(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [result, setResult] = useState<MatchResult>(props.initialResult);
  const [goalsFor, setGoalsFor] = useState<number>(props.initialGoalsFor);
  const [goalsAgainst, setGoalsAgainst] = useState<number>(props.initialGoalsAgainst);
  const [role, setRole] = useState<Role>(props.initialRole);
  const [goals, setGoals] = useState<number>(props.initialGoals);
  const [assists, setAssists] = useState<number>(props.initialAssists);
  const [cleanSheet, setCleanSheet] = useState<boolean>(props.initialCleanSheet);
  const [notes, setNotes] = useState<string>(props.initialNotes);

  const step = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    delta: number,
    min: number,
    max: number
  ) => {
    setter(Math.max(min, Math.min(max, value + delta)));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: Record<string, any> = {};
      if (result !== props.initialResult) payload.result = result;
      if (goalsFor !== props.initialGoalsFor) payload.goalsFor = goalsFor;
      if (goalsAgainst !== props.initialGoalsAgainst) payload.goalsAgainst = goalsAgainst;
      if (role !== props.initialRole) payload.role = role;
      if (goals !== props.initialGoals) payload.goals = goals;
      if (assists !== props.initialAssists) payload.assists = assists;
      if (cleanSheet !== props.initialCleanSheet) payload.cleanSheet = cleanSheet;
      if (notes !== props.initialNotes) payload.notes = notes.trim() || null;

      if (Object.keys(payload).length === 0) {
        setError("Nessuna modifica da salvare");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/matches/${props.matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Errore durante la modifica");
        setLoading(false);
        return;
      }

      setSuccess("Modifiche salvate con successo");
      setIsEditing(false);
      setTimeout(() => {
        router.refresh();
      }, 900);
    } catch (err) {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-textPrimary">
                Modifica partita
              </h3>
              <p className="mt-0.5 text-xs text-textMuted">
                Puoi correggere eventuali errori per altri {props.minutesLeft} minuti
              </p>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={16} />
              Modifica
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-textPrimary">
                Modifica partita
              </h3>
              <p className="mt-0.5 text-xs text-textMuted">
                Puoi modificare i dati della partita entro {props.minutesLeft} minuti
              </p>
            </div>
            <Badge variant="elettrico" className="shrink-0">
              MODIFICA
            </Badge>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/10 p-3 text-danger">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-greenPrimary/30 bg-greenPrimary/10 p-3 text-greenPrimary">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-textPrimary">
              Risultato
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: "WIN" as const, label: "VITTORIA", cls: "bg-greenPrimary/20 border-greenPrimary/40 text-greenPrimary data-[sel=true]:bg-greenPrimary data-[sel=true]:text-bgPrimary data-[sel=true]:ring-2 data-[sel=true]:ring-greenPrimary/60" },
                { v: "DRAW" as const, label: "PAREGGIO", cls: "bg-white/5 border-white/15 text-textMuted data-[sel=true]:bg-white/15 data-[sel=true]:text-textPrimary data-[sel=true]:ring-2 data-[sel=true]:ring-white/40" },
                { v: "LOSS" as const, label: "SCONFITTA", cls: "bg-danger/15 border-danger/30 text-danger data-[sel=true]:bg-danger data-[sel=true]:text-white data-[sel=true]:ring-2 data-[sel=true]:ring-danger/50" },
              ].map((b) => (
                <button
                  key={b.v}
                  type="button"
                  data-sel={result === b.v}
                  onClick={() => setResult(b.v)}
                  className={`rounded-xl border px-2 py-3 text-xs font-bold transition-all ${b.cls}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <Minus size={16} />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={goalsFor}
                  onChange={(e) => setGoalsFor(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={() => step(setGoalsFor, goalsFor, +1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Plus size={16} />
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
                  <Minus size={16} />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={goalsAgainst}
                  onChange={(e) => setGoalsAgainst(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={() => step(setGoalsAgainst, goalsAgainst, +1, 0, 30)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

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
                  className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition-all ${
                    role === r
                      ? "border-greenElectric/50 bg-greenElectric/15 text-greenElectric ring-2 ring-greenElectric/40"
                      : "border-white/10 bg-bgSecondary text-textMuted hover:bg-white/5"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
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
                  <Minus size={16} />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={15}
                  value={goals}
                  onChange={(e) => setGoals(Math.max(0, Math.min(15, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={() => step(setGoals, goals, +1, 0, 15)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Plus size={16} />
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
                  <Minus size={16} />
                </button>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={assists}
                  onChange={(e) => setAssists(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                  className="text-center text-lg font-bold"
                />
                <button
                  type="button"
                  onClick={() => step(setAssists, assists, +1, 0, 10)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bgSecondary text-textPrimary hover:bg-white/10 active:scale-95 transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {role === "POR" && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-bgSecondary p-3">
              <div>
                <p className="text-sm font-semibold text-textPrimary">Clean Sheet</p>
              </div>
              <button
                type="button"
                onClick={() => setCleanSheet(!cleanSheet)}
                className={`relative flex h-7 w-14 shrink-0 items-center rounded-full transition-colors ${
                  cleanSheet ? "bg-greenPrimary" : "bg-white/15"
                }`}
              >
                <span
                  className={`absolute h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    cleanSheet ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          )}

          <div>
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
              rows={2}
              placeholder="Note opzionali..."
              className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-bgSecondary p-3 text-sm text-textPrimary placeholder:text-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={loading}
              onClick={() => setIsEditing(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Salvando..." : "Salva modifiche"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

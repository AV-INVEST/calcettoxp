"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Role, PreferredFoot } from "@prisma/client";
import { addDays, format, differenceInDays } from "date-fns";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  initial: {
    username: string;
    nickname: string;
    country?: string | null;
    city?: string | null;
    preferredFoot?: PreferredFoot | null;
    primaryRole: Role;
    secondaryRole?: Role | null;
    birthDate?: Date | string | null;
    lastPrimaryRoleChangeAt?: Date | string | null;
    lastUsernameChangeAt?: Date | string | null;
    isPro: boolean;
  };
  onSuccess?: (updated: any) => void;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "POR", label: "Portiere" },
  { value: "DIF", label: "Difensore" },
  { value: "CEN", label: "Centrocampista" },
  { value: "ATT", label: "Attaccante" },
];

const FOOT_OPTIONS: { value: PreferredFoot; label: string }[] = [
  { value: "RIGHT", label: "Destro" },
  { value: "LEFT", label: "Sinistro" },
  { value: "BOTH", label: "Entrambi" },
];

export default function EditProfileModal({
  open,
  onClose,
  initial,
  onSuccess,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(initial.username ?? "");
  const [country, setCountry] = useState(initial.country ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [preferredFoot, setPreferredFoot] = useState<PreferredFoot | "">(
    (initial.preferredFoot as PreferredFoot) ?? ""
  );
  const [primaryRole, setPrimaryRole] = useState<Role>(initial.primaryRole);
  const [secondaryRole, setSecondaryRole] = useState<Role | "">(
    (initial.secondaryRole as Role) ?? ""
  );
  const [birthDateStr, setBirthDateStr] = useState(
    initial.birthDate ? format(new Date(initial.birthDate), "yyyy-MM-dd") : ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleCooldownInfo = (() => {
    if (!initial.lastPrimaryRoleChangeAt) return null;
    const last = new Date(initial.lastPrimaryRoleChangeAt);
    const now = new Date();
    const daysSince = differenceInDays(now, last);
    if (daysSince < 30) {
      const next = addDays(last, 30);
      return {
        nextDate: next,
        daysLeft: 30 - daysSince,
      };
    }
    return null;
  })();

  const usernameCooldownInfo = (() => {
    if (!initial.isPro) return null;
    if (!initial.lastUsernameChangeAt) return null;
    const last = new Date(initial.lastUsernameChangeAt);
    const now = new Date();
    const daysSince = differenceInDays(now, last);
    if (daysSince < 30) {
      const next = addDays(last, 30);
      return {
        nextDate: next,
        daysLeft: 30 - daysSince,
      };
    }
    return null;
  })();

  const roleDisabled = !!roleCooldownInfo;
  const usernameDisabled = !initial.isPro || !!usernameCooldownInfo;

  useEffect(() => {
    if (open) {
      setUsername(initial.username ?? "");
      setCountry(initial.country ?? "");
      setCity(initial.city ?? "");
      setPreferredFoot((initial.preferredFoot as PreferredFoot) ?? "");
      setPrimaryRole(initial.primaryRole);
      setSecondaryRole((initial.secondaryRole as Role) ?? "");
      setBirthDateStr(
        initial.birthDate ? format(new Date(initial.birthDate), "yyyy-MM-dd") : ""
      );
      setError(null);
    }
  }, [open, initial]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body: any = {};
      if (initial.isPro && username.trim() && username !== initial.username) {
        body.username = username.trim();
      }
      if (birthDateStr !== (initial.birthDate ? format(new Date(initial.birthDate), "yyyy-MM-dd") : "")) {
        body.birthDate = birthDateStr || null;
      }
      if (country !== (initial.country ?? "")) body.country = country || null;
      if (city !== (initial.city ?? "")) body.city = city || null;
      if ((preferredFoot || "") !== ((initial.preferredFoot as PreferredFoot) ?? ""))
        body.preferredFoot = preferredFoot || null;
      if (primaryRole !== initial.primaryRole && !roleDisabled) body.primaryRole = primaryRole;
      if ((secondaryRole || "") !== ((initial.secondaryRole as Role) ?? ""))
        body.secondaryRole = secondaryRole || null;

      if (Object.keys(body).length === 0) {
        setError("Nessuna modifica da salvare");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.error) {
          setError(data.error);
        } else {
          setError("Errore durante il salvataggio");
        }
        setLoading(false);
        return;
      }
      onSuccess?.(data?.player);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full md:max-w-lg max-h-[92vh] overflow-y-auto bg-bgCard border border-white/10 md:rounded-3xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95">
        <div className="sticky top-0 z-10 bg-bgCard/95 backdrop-blur border-b border-white/5 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">Modifica profilo</h2>
            <p className="text-textMuted text-xs mt-0.5">
              Aggiorna i tuoi dati giocatore
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-textMuted hover:text-textPrimary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold flex items-center gap-1.5">
                Username<span className="text-danger ml-1">*</span>
              </label>
              {!initial.isPro && (
                <Badge variant="grigio" className="text-[10px] flex items-center gap-1">
                  <Crown size={10} /> Cambio con PRO
                </Badge>
              )}
              {initial.isPro && usernameCooldownInfo && (
                <Badge variant="grigio" className="text-[10px]">
                  Cambio disponibile il {format(usernameCooldownInfo.nextDate, "dd/MM/yy")}
                </Badge>
              )}
            </div>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              placeholder="Il tuo username pubblico"
              disabled={usernameDisabled}
              required
            />
            {!initial.isPro ? (
              <p className="text-[11px] text-textMuted mt-1">
                Con PRO puoi personalizzare il tuo username.
              </p>
            ) : usernameCooldownInfo ? (
              <p className="text-[11px] text-danger mt-1">
                Potrai modificare nuovamente lo username dal {format(usernameCooldownInfo.nextDate, "dd/MM/yyyy")}.
              </p>
            ) : (
              <p className="text-[11px] text-textMuted mt-1">
                3-20 caratteri minuscoli, lettere, numeri o underscore.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nazionalità">
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Italia"
                maxLength={50}
              />
            </Field>
            <Field label="Città">
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Milano"
                maxLength={50}
              />
            </Field>
          </div>

          <Field label="Data di nascita">
            <Input
              type="date"
              value={birthDateStr}
              onChange={(e) => setBirthDateStr(e.target.value)}
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </Field>

          <Field label="Piede preferito">
            <Select
              value={preferredFoot}
              onChange={(e) => setPreferredFoot(e.target.value as PreferredFoot | "")}
            >
              <option value="">Non specificato</option>
              {FOOT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold">Ruolo primario</label>
              {roleCooldownInfo && (
                <Badge variant="grigio" className="text-[10px]">
                  Cambio disponibile il {format(roleCooldownInfo.nextDate, "dd/MM/yy")}
                </Badge>
              )}
            </div>
            <Select
              value={primaryRole}
              onChange={(e) => setPrimaryRole(e.target.value as Role)}
              disabled={roleDisabled}
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            {roleCooldownInfo && (
              <p className="text-[11px] text-danger mt-1">
                Puoi cambiare ruolo tra {roleCooldownInfo.daysLeft} giorni
              </p>
            )}
          </div>

          <Field label="Ruolo secondario (opzionale)">
            <Select
              value={secondaryRole}
              onChange={(e) => setSecondaryRole(e.target.value as Role | "")}
            >
              <option value="">Nessuno</option>
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>

          {error && (
            <Card className="border-danger/30 bg-danger/10">
              <CardContent className="p-3">
                <p className="text-danger text-sm font-semibold">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Salvataggio...
                </>
              ) : (
                "Salva modifiche"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

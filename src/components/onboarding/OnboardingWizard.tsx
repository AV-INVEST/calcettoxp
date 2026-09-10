"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import CxpLogo from "@/../assets/LOGOCXP.jpg";

const ROLE_LABELS: Record<string, string> = {
  POR: "Portiere",
  DIF: "Difensore",
  CEN: "Centrocampista",
  ATT: "Attaccante",
};

const FOOT_LABELS: Record<string, string> = {
  RIGHT: "Destro",
  LEFT: "Sinistro",
  BOTH: "Entrambi",
};

const COUNTRY_OPTIONS = [
  { value: "IT", label: "Italia" },
  { value: "FR", label: "Francia" },
  { value: "ES", label: "Spagna" },
  { value: "DE", label: "Germania" },
  { value: "PT", label: "Portogallo" },
  { value: "NL", label: "Paesi Bassi" },
  { value: "UK", label: "Regno Unito" },
  { value: "AR", label: "Argentina" },
  { value: "BR", label: "Brasile" },
  { value: "US", label: "Stati Uniti" },
  { value: "CH", label: "Svizzera" },
  { value: "AT", label: "Austria" },
  { value: "BE", label: "Belgio" },
  { value: "SE", label: "Svezia" },
  { value: "NO", label: "Norvegia" },
  { value: "DK", label: "Danimarca" },
  { value: "PL", label: "Polonia" },
  { value: "RO", label: "Romania" },
  { value: "HU", label: "Ungheria" },
  { value: "CZ", label: "Repubblica Ceca" },
  { value: "GR", label: "Grecia" },
  { value: "TR", label: "Turchia" },
  { value: "MA", label: "Marocco" },
  { value: "TN", label: "Tunisia" },
  { value: "EG", label: "Egitto" },
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "SN", label: "Senegal" },
  { value: "CM", label: "Camerun" },
  { value: "CI", label: "Costa d'Avorio" },
  { value: "MX", label: "Messico" },
  { value: "CO", label: "Colombia" },
  { value: "UY", label: "Uruguay" },
  { value: "CL", label: "Cile" },
  { value: "PE", label: "Perù" },
  { value: "VE", label: "Venezuela" },
  { value: "JP", label: "Giappone" },
  { value: "KR", label: "Corea del Sud" },
  { value: "CN", label: "Cina" },
  { value: "IN", label: "India" },
  { value: "AU", label: "Australia" },
  { value: "NZ", label: "Nuova Zelanda" },
  { value: "CA", label: "Canada" },
  { value: "RU", label: "Russia" },
  { value: "UA", label: "Ucraina" },
  { value: "RS", label: "Serbia" },
  { value: "HR", label: "Croazia" },
  { value: "SI", label: "Slovenia" },
  { value: "SK", label: "Slovacchia" },
  { value: "BG", label: "Bulgaria" },
  { value: "ME", label: "Montenegro" },
  { value: "MK", label: "Macedonia del Nord" },
  { value: "AL", label: "Albania" },
  { value: "BA", label: "Bosnia-Erzegovina" },
  { value: "XK", label: "Kosovo" },
  { value: "MD", label: "Moldavia" },
  { value: "BY", label: "Bielorussia" },
  { value: "LT", label: "Lituania" },
  { value: "LV", label: "Lettonia" },
  { value: "EE", label: "Estonia" },
  { value: "IS", label: "Islanda" },
  { value: "FI", label: "Finlandia" },
  { value: "IE", label: "Irlanda" },
  { value: "LU", label: "Lussemburgo" },
  { value: "MC", label: "Monaco" },
  { value: "SM", label: "San Marino" },
  { value: "VA", label: "Città del Vaticano" },
  { value: "AD", label: "Andorra" },
  { value: "LI", label: "Liechtenstein" },
];

const STEPS = [
  { id: 1, title: "Username" },
  { id: 2, title: "Nascita" },
  { id: 3, title: "Nazionalità" },
  { id: 4, title: "Città" },
  { id: 5, title: "Piede" },
  { id: 6, title: "Ruolo" },
];

type WizardData = {
  username: string;
  birthDate: string;
  ageMode: "date" | "age";
  age: string;
  country: string;
  city: string;
  preferredFoot: "" | "RIGHT" | "LEFT" | "BOTH";
  primaryRole: "" | "POR" | "DIF" | "CEN" | "ATT";
  secondaryRole: "" | "POR" | "DIF" | "CEN" | "ATT";
  communityAccepted: boolean;
};

const initialData: WizardData = {
  username: "",
  birthDate: "",
  ageMode: "date",
  age: "",
  country: "IT",
  city: "",
  preferredFoot: "",
  primaryRole: "",
  secondaryRole: "",
  communityAccepted: false,
};

function calcBirthDateFromAge(ageStr: string): string {
  const age = parseInt(ageStr, 10);
  if (isNaN(age) || age < 14) return "";
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  return d.toISOString().slice(0, 10);
}

function calcAge(birthDateStr: string): number {
  if (!birthDateStr) return 0;
  const b = new Date(birthDateStr);
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof WizardData | "community", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/onboarding/status");
        if (!res.ok) return;
        const j = await res.json();
        if (!cancelled && j.exists) {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.warn("onboarding status check failed:", err);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    if ((errors as Record<string, unknown>)[key]) {
      setErrors((e) => {
        const n = { ...e };
        delete (n as Record<string, unknown>)[key];
        return n;
      });
    }
  };

  const validateStep = (s: number): boolean => {
    const e: Partial<Record<keyof WizardData | "community", string>> = {};
    if (s === 1) {
      if (!data.username.trim()) (e as Record<string, string>).username = "Inserisci un username";
      else if (!/^[a-z0-9_]{3,20}$/.test(data.username.toLowerCase().trim())) {
        (e as Record<string, string>).username = "Solo lettere minuscole, numeri o underscore (3-20 caratteri)";
      }
      if (!data.communityAccepted) (e as Record<string, string>).community = "Devi confermare le linee guida della community";
    }
    if (s === 2) {
      if (data.ageMode === "date") {
        if (!data.birthDate) (e as Record<string, string>).birthDate = "Seleziona una data";
        else if (calcAge(data.birthDate) < 14) (e as Record<string, string>).birthDate = "Devi avere almeno 14 anni";
      } else {
        const a = parseInt(data.age, 10);
        if (!data.age || isNaN(a)) (e as Record<string, string>).age = "Inserisci un'età valida";
        else if (a < 14) (e as Record<string, string>).age = "Devi avere almeno 14 anni";
        else if (a > 99) (e as Record<string, string>).age = "Età non valida";
      }
    }
    if (s === 3) {
      if (!data.country) (e as Record<string, string>).country = "Seleziona una nazionalità";
    }
    if (s === 4) {
      if (!data.city.trim()) (e as Record<string, string>).city = "Inserisci la città";
    }
    if (s === 5) {
      if (!data.preferredFoot) (e as Record<string, string>).preferredFoot = "Seleziona un piede";
    }
    if (s === 6) {
      if (!data.primaryRole) (e as Record<string, string>).primaryRole = "Seleziona un ruolo primario";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validateStep(step)) return;
    if (step === 1) {
      const candidate = data.username.toLowerCase().trim();
      try {
        const res = await fetch(`/api/username-check?u=${encodeURIComponent(candidate)}`);
        const j = await res.json().catch(() => ({}));
        if (!j.ok || !j.available) {
          setErrors({ username: j?.message || j?.error || "Username non disponibile" });
          return;
        }
      } catch {
        setErrors({ username: "Errore nel controllo dell'username" });
        return;
      }
    }
    if (step === 6) handleSubmit();
    else setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const birthDate =
        data.ageMode === "age" ? calcBirthDateFromAge(data.age) : data.birthDate || null;

      const payload: Record<string, unknown> = {
        username: data.username.toLowerCase().trim(),
        birthDate,
        country: data.country || null,
        city: data.city.trim() || null,
        preferredFoot: data.preferredFoot,
        primaryRole: data.primaryRole,
        secondaryRole: data.secondaryRole || null,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) {
        throw new Error(j?.error || "Errore nella creazione del profilo");
      }
      setFinished(true);
    } catch (err) {
      setErrors({ username: err instanceof Error ? err.message : "Errore" });
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const overall = 60;
  const level = 1;
  const userImage = session?.user?.image;
  const userName = session?.user?.name;

  const handleLogout = () => signOut({ callbackUrl: "/" });

  if (checking) {
    return <LoadingShell />;
  }

  if (finished) {
    return (
      <FinishScreen
        nickname={data.username}
        primaryRole={data.primaryRole as "POR" | "DIF" | "CEN" | "ATT"}
        overall={overall}
        level={level}
        avatarImage={userImage ?? null}
        onContinue={() => router.push("/dashboard")}
      />
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <LogoHeader userImage={userImage} userName={userName} onLogout={handleLogout} />
        <Stepper step={step} total={STEPS.length} labels={STEPS} />

        <div style={styles.card}>
          <div style={styles.stepHeader}>
            <h2 style={styles.stepTitle}>{STEPS[step - 1].title}</h2>
            <span style={styles.stepCounter}>
              Passo {step} di {STEPS.length}
            </span>
          </div>

          <div style={styles.stepBody}>
            {step === 1 && (
              <StepUsername
                value={data.username}
                error={errors.username}
                communityAccepted={data.communityAccepted}
                communityError={(errors as Record<string, string>).community}
                onChange={(v) => update("username", v.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                onCommunityChange={(v) => update("communityAccepted", v)}
              />
            )}
            {step === 2 && (
              <StepBirth
                mode={data.ageMode}
                birthDate={data.birthDate}
                age={data.age}
                errDate={errors.birthDate}
                errAge={errors.age}
                onMode={(m) => update("ageMode", m)}
                onDate={(v) => update("birthDate", v)}
                onAge={(v) => update("age", v)}
              />
            )}
            {step === 3 && (
              <StepCountry
                value={data.country}
                error={errors.country}
                onChange={(v) => update("country", v)}
              />
            )}
            {step === 4 && (
              <StepCity
                value={data.city}
                error={errors.city}
                onChange={(v) => update("city", v)}
              />
            )}
            {step === 5 && (
              <StepFoot
                value={data.preferredFoot}
                error={errors.preferredFoot}
                onChange={(v) => update("preferredFoot", v)}
              />
            )}
            {step === 6 && (
              <StepRole
                primary={data.primaryRole}
                secondary={data.secondaryRole}
                errPrimary={errors.primaryRole}
                onPrimary={(v) => update("primaryRole", v)}
                onSecondary={(v) => update("secondaryRole", v)}
              />
            )}
          </div>

          <div style={styles.navRow}>
            {step > 1 ? (
              <Button variant="ghost" onClick={prev} disabled={submitting}>
                <ArrowLeft size={16} strokeWidth={2.4} style={{ marginRight: 6 }} />
                Indietro
              </Button>
            ) : (
              <button
                type="button"
                onClick={handleLogout}
                style={styles.logoutSoft}
                title="Torna alla home"
              >
                <LogOut size={14} strokeWidth={2.2} />
              </button>
            )}
            <Button variant="primary" onClick={next} disabled={submitting} loading={submitting && step === 6}>
              {step === 6 ? (submitting ? "Creazione..." : "Completa profilo") : "Avanti"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingShell() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={{ padding: "4rem 0", textAlign: "center", color: "#9CA3AF" }}>
          Caricamento...
        </div>
      </div>
    </div>
  );
}

function LogoHeader({
  userImage,
  userName,
  onLogout,
}: {
  userImage?: string | null;
  userName?: string | null;
  onLogout: () => void;
}) {
  return (
    <div style={styles.logoHeader}>
      <div style={styles.logoBadge}>
        <Image
          src={CxpLogo}
          alt="CalcettoXP"
          width={40}
          height={40}
          style={{
            width: "40px",
            height: "40px",
            display: "block",
            borderRadius: "10px",
            objectFit: "cover",
          }}
          priority
        />
      </div>
      <h1 style={styles.logoTitle}>CALCETTOXP</h1>
      <p style={styles.logoSubtitle}>Inizia l&apos;avventura da giocatore</p>
      {userImage && (
        <div style={styles.userRow}>
          <img src={userImage} alt="" style={styles.userAvatar} />
          <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
            <div style={styles.userName}>{userName || "Giocatore"}</div>
            <div style={styles.userHint}>Account Google connesso</div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            style={styles.logoutPill}
            title="Esci dall'account"
            aria-label="Esci"
          >
            <LogOut size={13} strokeWidth={2.4} />
          </button>
        </div>
      )}
    </div>
  );
}

function Stepper({
  step,
  total,
  labels,
}: {
  step: number;
  total: number;
  labels: { id: number; title: string }[];
}) {
  const pct = ((step - 1) / (total - 1)) * 100;
  return (
    <div style={styles.stepperWrap}>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${pct}%` }} />
      </div>
      <div style={styles.stepperDots}>
        {labels.map((l) => (
          <div key={l.id} style={styles.stepperDotCol}>
            <div
              style={{
                ...styles.stepperDot,
                backgroundColor: l.id <= step ? "#22C55E" : "#1F2937",
                borderColor: l.id <= step ? "#22C55E" : "#374151",
                color: l.id <= step ? "#070A08" : "#9CA3AF",
              }}
            >
              {l.id < step ? "✓" : l.id}
            </div>
            <span
              style={{
                ...styles.stepperLabel,
                color: l.id <= step ? "#E5E7EB" : "#6B7280",
              }}
            >
              {l.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <span style={styles.fieldError}>{children}</span>;
}

function StepUsername({
  value,
  error,
  communityAccepted,
  communityError,
  onChange,
  onCommunityChange,
}: {
  value: string;
  error?: string;
  communityAccepted: boolean;
  communityError?: string;
  onChange: (v: string) => void;
  onCommunityChange: (v: boolean) => void;
}) {
  return (
    <div style={styles.fieldStack}>
      <label style={styles.label}>Username pubblico</label>
      <div style={{ position: "relative" }}>
        <span style={styles.prefixLabel}>calcettoxp.com/p/</span>
        <Input
          placeholder="andreavivace"
          value={value}
          onChange={onChange}
          error={!!error}
          style={{ paddingLeft: "136px" }}
          maxLength={20}
        />
      </div>
      <div style={styles.hintRow}>
        <span style={styles.hint}>3-20 caratteri • minuscole, numeri, underscore</span>
        <span style={styles.counter}>{value.length}/20</span>
      </div>
      <FieldError>{error}</FieldError>

      <label style={styles.communityBox}>
        <input
          type="checkbox"
          checked={communityAccepted}
          onChange={(e) => onCommunityChange(e.target.checked)}
          style={styles.communityCheckbox}
        />
        <span style={styles.communityText}>
          Confermo che il mio username rispetta le linee guida della community. I nomi
          offensivi possono comportare la rimozione dell&apos;account.
        </span>
      </label>
      <FieldError>{communityError}</FieldError>
    </div>
  );
}

function StepBirth({
  mode,
  birthDate,
  age,
  errDate,
  errAge,
  onMode,
  onDate,
  onAge,
}: {
  mode: "date" | "age";
  birthDate: string;
  age: string;
  errDate?: string;
  errAge?: string;
  onMode: (m: "date" | "age") => void;
  onDate: (v: string) => void;
  onAge: (v: string) => void;
}) {
  return (
    <div style={styles.fieldStack}>
      <label style={styles.label}>Nascita</label>
      <div style={styles.segWrap}>
        <SegButton active={mode === "date"} onClick={() => onMode("date")}>
          Data
        </SegButton>
        <SegButton active={mode === "age"} onClick={() => onMode("age")}>
          Età
        </SegButton>
      </div>
      {mode === "date" ? (
        <>
          <Input type="date" value={birthDate} onChange={onDate} error={!!errDate} />
          <FieldError>{errDate}</FieldError>
        </>
      ) : (
        <>
          <Input
            type="number"
            min={14}
            max={99}
            placeholder="Inserisci la tua età"
            value={age}
            onChange={onAge}
            error={!!errAge}
          />
          <FieldError>{errAge}</FieldError>
        </>
      )}
      <span style={styles.hint}>Devi avere almeno 14 anni</span>
    </div>
  );
}

function StepCountry({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={styles.fieldStack}>
      <label style={styles.label}>Nazionalità</label>
      <Select value={value} onChange={onChange} options={COUNTRY_OPTIONS} error={!!error} />
      <FieldError>{error}</FieldError>
    </div>
  );
}

function StepCity({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={styles.fieldStack}>
      <label style={styles.label}>Città</label>
      <Input placeholder="es. Milano" value={value} onChange={onChange} error={!!error} />
      <FieldError>{error}</FieldError>
    </div>
  );
}

function StepFoot({
  value,
  error,
  onChange,
}: {
  value: "" | "RIGHT" | "LEFT" | "BOTH";
  error?: string;
  onChange: (v: "RIGHT" | "LEFT" | "BOTH") => void;
}) {
  const opts: Array<{ v: "RIGHT" | "LEFT" | "BOTH"; label: string; icon: string }> = [
    { v: "RIGHT", label: "Destro", icon: "🦶" },
    { v: "LEFT", label: "Sinistro", icon: "🦶" },
    { v: "BOTH", label: "Entrambi", icon: "⚡" },
  ];
  return (
    <div style={styles.fieldStack}>
      <label style={styles.label}>Piede</label>
      <div style={styles.optionGrid3}>
        {opts.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            style={{
              ...styles.optionCard,
              borderColor: value === o.v ? "#22C55E" : "#374151",
              backgroundColor: value === o.v ? "rgba(34,197,94,0.10)" : "#111827",
            }}
          >
            <div
              style={{
                ...styles.optionIcon,
                transform: o.v === "RIGHT" ? "scaleX(-1)" : "none",
              }}
            >
              {o.icon}
            </div>
            <div style={styles.optionLabel}>{o.label}</div>
          </button>
        ))}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
}

function StepRole({
  primary,
  secondary,
  errPrimary,
  onPrimary,
  onSecondary,
}: {
  primary: string;
  secondary: string;
  errPrimary?: string;
  onPrimary: (v: "POR" | "DIF" | "CEN" | "ATT") => void;
  onSecondary: (v: "" | "POR" | "DIF" | "CEN" | "ATT") => void;
}) {
  const roles: Array<{ v: "POR" | "DIF" | "CEN" | "ATT"; label: string; sub: string }> = [
    { v: "POR", label: "POR", sub: "Portiere" },
    { v: "DIF", label: "DIF", sub: "Difensore" },
    { v: "CEN", label: "CEN", sub: "Centrocampista" },
    { v: "ATT", label: "ATT", sub: "Attaccante" },
  ];
  return (
    <div style={{ ...styles.fieldStack, gap: "1.5rem" }}>
      <div>
        <label style={styles.label}>Ruolo primario</label>
        <div style={styles.optionGrid4}>
          {roles.map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => onPrimary(r.v)}
              style={{
                ...styles.roleCard,
                borderColor: primary === r.v ? "#22C55E" : "#374151",
                backgroundColor: primary === r.v ? "rgba(34,197,94,0.10)" : "#111827",
              }}
            >
              <span
                style={{
                  ...styles.roleTag,
                  backgroundColor:
                    r.v === "POR"
                      ? "#F59E0B"
                      : r.v === "DIF"
                      ? "#3B82F6"
                      : r.v === "CEN"
                      ? "#10B981"
                      : "#EF4444",
                }}
              >
                {r.label}
              </span>
              <span style={styles.roleSub}>{r.sub}</span>
            </button>
          ))}
        </div>
        <FieldError>{errPrimary}</FieldError>
      </div>

      <div>
        <div style={styles.labelRow}>
          <label style={styles.label}>Ruolo secondario</label>
          <span style={styles.optionalTag}>opzionale</span>
        </div>
        <div style={styles.optionGrid4}>
          {roles.map((r) => (
            <button
              key={r.v}
              type="button"
              disabled={primary === r.v}
              onClick={() => onSecondary(secondary === r.v ? "" : r.v)}
              style={{
                ...styles.roleCard,
                opacity: primary === r.v ? 0.3 : 1,
                cursor: primary === r.v ? "not-allowed" : "pointer",
                borderColor: secondary === r.v ? "#60A5FA" : "#374151",
                backgroundColor: secondary === r.v ? "rgba(96,165,250,0.10)" : "#111827",
              }}
            >
              <span
                style={{
                  ...styles.roleTag,
                  backgroundColor:
                    r.v === "POR"
                      ? "#F59E0B"
                      : r.v === "DIF"
                      ? "#3B82F6"
                      : r.v === "CEN"
                      ? "#10B981"
                      : "#EF4444",
                }}
              >
                {r.label}
              </span>
              <span style={styles.roleSub}>{r.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FinishScreen({
  nickname,
  primaryRole,
  overall,
  level,
  avatarImage,
  onContinue,
}: {
  nickname: string;
  primaryRole: "POR" | "DIF" | "CEN" | "ATT";
  overall: number;
  level: number;
  avatarImage: string | null;
  onContinue: () => void;
}) {
  const [reveal, setReveal] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReveal(true), 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={styles.finishWrap}>
      <div style={styles.finishInner}>
        <div style={{ animation: reveal ? "fadeUp 0.8s ease forwards" : "none", opacity: 0 }}>
          <div style={styles.finishSparkles}>✨🌟✨</div>
          <h1 style={styles.finishTitle}>LA TUA CARRIERA</h1>
          <h1 style={{ ...styles.finishTitle, color: "#22C55E" }}>INIZIA ORA</h1>
        </div>

        <div
          style={{
            ...styles.playerCardWrap,
            opacity: reveal ? 1 : 0,
            transform: reveal ? "translateY(0) scale(1)" : "translateY(30px) scale(0.92)",
            transition: "all 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s",
          }}
        >
          <PlayerCard
            nickname={nickname}
            role={primaryRole}
            overall={overall}
            level={level}
            avatarImage={avatarImage}
          />
        </div>

        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            opacity: reveal ? 1 : 0,
            transition: "opacity 0.6s ease 1.1s",
          }}
        >
          <div style={styles.finishHint}>
            Il tuo profilo è stato creato. Inizia subito a tracciare le tue partite!
          </div>
          <Button variant="primary" size="lg" onClick={onContinue}>
            VAI ALLA DASHBOARD →
          </Button>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

function PlayerCard({
  nickname,
  role,
  overall,
  level,
  avatarImage,
}: {
  nickname: string;
  role: "POR" | "DIF" | "CEN" | "ATT";
  overall: number;
  level: number;
  avatarImage: string | null;
}) {
  const roleColor =
    role === "POR"
      ? "#F59E0B"
      : role === "DIF"
      ? "#3B82F6"
      : role === "CEN"
      ? "#10B981"
      : "#EF4444";

  const [imgError, setImgError] = useState(false);
  const effectiveAvatar = avatarImage && !imgError ? avatarImage : null;

  return (
    <div style={styles.cardShell}>
      <div style={{ ...styles.cardShine, backgroundSize: "200% 100%", animation: "shine 3s ease infinite" }} />
      <div style={styles.cardTop}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ ...styles.cardOverall, color: roleColor }}>{overall}</span>
          <span style={styles.cardOverallLabel}>OVR</span>
        </div>
        <div style={{ ...styles.cardRoleBadge, backgroundColor: roleColor }}>{role}</div>
      </div>

      <div style={styles.cardAvatar}>
        {effectiveAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={effectiveAvatar}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
              display: "block",
            }}
          />
        ) : (
          <span style={{ fontSize: "3.5rem" }}>
            {role === "POR" ? "🧤" : role === "DIF" ? "🛡️" : role === "CEN" ? "🎯" : "⚡"}
          </span>
        )}
      </div>

      <div style={styles.cardName}>{nickname}</div>
      <div style={styles.cardRoleName}>{ROLE_LABELS[role]}</div>

      <div style={styles.cardDivider} />

      <div style={styles.cardStatsRow}>
        <div style={styles.cardStat}>
          <span style={styles.cardStatLabel}>Livello</span>
          <span style={styles.cardStatValue}>{level}</span>
        </div>
        <div style={styles.cardStat}>
          <span style={styles.cardStatLabel}>XP</span>
          <span style={styles.cardStatValue}>0</span>
        </div>
        <div style={styles.cardStat}>
          <span style={styles.cardStatLabel}>CI</span>
          <span style={styles.cardStatValue}>1000</span>
        </div>
      </div>

      <div style={styles.cardLevelBar}>
        <div style={{ ...styles.cardLevelFill, width: "0%" }} />
      </div>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  min,
  max,
  error,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  error?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <input
      type={type}
      value={value}
      maxLength={maxLength}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...styles.input,
        borderColor: error ? "#EF4444" : "#374151",
        ...style,
      }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...styles.input,
        ...styles.select,
        borderColor: error ? "#EF4444" : "#374151",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  loading,
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  size?: "md" | "lg";
}) {
  const base =
    variant === "primary"
      ? {
          background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
          color: "#070A08",
          fontWeight: 700,
          boxShadow: "0 8px 24px rgba(34,197,94,0.25)",
        }
      : {
          background: "transparent",
          color: "#D1D5DB",
          fontWeight: 500,
          border: "1px solid #374151",
        };
  const pad = size === "lg" ? { padding: "1rem 2rem", fontSize: "1rem" } : { padding: "0.7rem 1.25rem", fontSize: "0.9rem" };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles.button,
        ...base,
        ...pad,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? <span style={{ marginRight: "0.5rem" }}>⏳</span> : null}
      {children}
    </button>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "0.6rem 1rem",
        borderRadius: "0.5rem",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "0.875rem",
        color: active ? "#070A08" : "#9CA3AF",
        backgroundColor: active ? "#22C55E" : "#111827",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: "100%",
    minHeight: "100vh",
    padding: "1.25rem 0.75rem 3rem",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    background: "linear-gradient(180deg, #070A08 0%, #0B120D 100%)",
  },
  container: {
    width: "100%",
    maxWidth: "520px",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  logoHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem",
    paddingTop: "0.25rem",
  },
  logoBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: "rgba(34,197,94,0.15)",
    border: "1px solid rgba(34,197,94,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  logoTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "1.35rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  logoSubtitle: {
    margin: 0,
    color: "#9CA3AF",
    fontSize: "0.8rem",
  },
  userRow: {
    marginTop: "0.75rem",
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    padding: "0.55rem 0.75rem",
    borderRadius: "12px",
    backgroundColor: "rgba(34,197,94,0.06)",
    border: "1px solid rgba(34,197,94,0.18)",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
    border: "2px solid rgba(34,197,94,0.3)",
  },
  userName: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#F3F4F6",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userHint: {
    fontSize: "0.65rem",
    color: "#6B7280",
    fontWeight: 500,
  },
  logoutPill: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    border: "1px solid rgba(239,68,68,0.25)",
    background: "rgba(239,68,68,0.08)",
    color: "#F87171",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  logoutSoft: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "1px solid #374151",
    background: "transparent",
    color: "#9CA3AF",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  stepperWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  progressTrack: {
    height: "5px",
    borderRadius: "999px",
    backgroundColor: "#1F2937",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #22C55E, #4ADE80)",
    transition: "width 0.4s ease",
  },
  stepperDots: {
    display: "flex",
    justifyContent: "space-between",
  },
  stepperDotCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.3rem",
    flex: 1,
  },
  stepperDot: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    fontWeight: 700,
    border: "2px solid",
    transition: "all 0.3s",
  },
  stepperLabel: {
    fontSize: "0.62rem",
    fontWeight: 600,
    transition: "color 0.3s",
    textAlign: "center",
    lineHeight: 1.1,
  },
  card: {
    backgroundColor: "#0F1411",
    border: "1px solid #1F2937",
    borderRadius: "16px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  stepHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  stepTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "1.15rem",
    fontWeight: 700,
  },
  stepCounter: {
    color: "#6B7280",
    fontSize: "0.75rem",
  },
  stepBody: {
    minHeight: "180px",
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.75rem",
    marginTop: "0.25rem",
  },
  fieldStack: {
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem",
  },
  label: {
    color: "#D1D5DB",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.6rem",
  },
  optionalTag: {
    fontSize: "0.65rem",
    padding: "0.15rem 0.5rem",
    borderRadius: "999px",
    backgroundColor: "rgba(107,114,128,0.2)",
    color: "#9CA3AF",
  },
  prefixLabel: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6B7280",
    fontSize: "12.5px",
    fontWeight: 600,
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.9rem",
    borderRadius: "10px",
    backgroundColor: "#070A08",
    border: "1.5px solid #374151",
    color: "#F3F4F6",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  select: {
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239CA3AF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
    paddingRight: "2.5rem",
    cursor: "pointer",
  },
  hintRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  hint: {
    fontSize: "0.72rem",
    color: "#6B7280",
  },
  counter: {
    fontSize: "0.72rem",
    color: "#6B7280",
    fontWeight: 600,
  },
  fieldError: {
    color: "#F87171",
    fontSize: "0.78rem",
    fontWeight: 500,
  },
  communityBox: {
    marginTop: "0.4rem",
    padding: "0.7rem 0.85rem",
    borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    cursor: "pointer",
    userSelect: "none",
  },
  communityCheckbox: {
    marginTop: "2px",
    width: "16px",
    height: "16px",
    accentColor: "#22C55E",
    flexShrink: 0,
    cursor: "pointer",
  },
  communityText: {
    fontSize: "0.75rem",
    color: "#9CA3AF",
    lineHeight: 1.45,
  },
  segWrap: {
    display: "flex",
    gap: "0.5rem",
    padding: "4px",
    backgroundColor: "#070A08",
    borderRadius: "10px",
    border: "1px solid #1F2937",
  },
  optionGrid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.6rem",
  },
  optionGrid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.5rem",
  },
  optionCard: {
    border: "1.5px solid",
    borderRadius: "12px",
    padding: "0.85rem 0.4rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.45rem",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "none",
    color: "inherit",
    fontFamily: "inherit",
  },
  optionIcon: {
    fontSize: "1.35rem",
  },
  optionLabel: {
    color: "#E5E7EB",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  roleCard: {
    border: "1.5px solid",
    borderRadius: "12px",
    padding: "0.8rem 0.25rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.3rem",
    cursor: "pointer",
    transition: "all 0.2s",
    background: "none",
    color: "inherit",
    fontFamily: "inherit",
  },
  roleTag: {
    padding: "0.18rem 0.5rem",
    borderRadius: "6px",
    color: "#070A08",
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
  },
  roleSub: {
    color: "#9CA3AF",
    fontSize: "0.68rem",
  },
  button: {
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.15s, opacity 0.2s",
    fontFamily: "inherit",
  },
  finishWrap: {
    width: "100%",
    minHeight: "100vh",
    padding: "1.5rem 1rem 3rem",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #070A08 0%, #0B120D 100%)",
  },
  finishInner: {
    width: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.75rem",
  },
  finishSparkles: {
    textAlign: "center",
    fontSize: "1.75rem",
    marginBottom: "0.4rem",
  },
  finishTitle: {
    margin: 0,
    textAlign: "center",
    color: "#ffffff",
    fontSize: "clamp(1.6rem, 6vw, 2.25rem)",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  finishHint: {
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: "0.85rem",
    maxWidth: "360px",
  },
  playerCardWrap: {
    marginTop: "0.75rem",
  },
  cardShell: {
    position: "relative",
    width: "260px",
    borderRadius: "18px",
    padding: "1.1rem 1.1rem 1.35rem",
    background: "linear-gradient(160deg, #111827 0%, #0F1411 50%, #070A08 100%)",
    border: "1.5px solid #22C55E",
    boxShadow: "0 24px 60px rgba(34,197,94,0.15), 0 0 0 1px rgba(34,197,94,0.08) inset",
    overflow: "hidden",
  },
  cardShine: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
    pointerEvents: "none",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardOverall: {
    fontSize: "2.4rem",
    fontWeight: 900,
    lineHeight: 1,
  },
  cardOverallLabel: {
    color: "#9CA3AF",
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
  },
  cardRoleBadge: {
    padding: "0.3rem 0.55rem",
    borderRadius: "8px",
    color: "#070A08",
    fontSize: "0.75rem",
    fontWeight: 800,
  },
  cardAvatar: {
    margin: "0.65rem auto 0.4rem",
    width: "96px",
    height: "96px",
    borderRadius: "50%",
    backgroundColor: "rgba(34,197,94,0.08)",
    border: "2px solid rgba(34,197,94,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: {
    textAlign: "center",
    color: "#ffffff",
    fontSize: "1.05rem",
    fontWeight: 800,
    letterSpacing: "-0.01em",
  },
  cardRoleName: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: "0.75rem",
    marginTop: "2px",
  },
  cardDivider: {
    height: "1px",
    backgroundColor: "#1F2937",
    margin: "0.85rem 0",
  },
  cardStatsRow: {
    display: "flex",
    justifyContent: "space-around",
  },
  cardStat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  cardStatLabel: {
    color: "#6B7280",
    fontSize: "0.62rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  cardStatValue: {
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 800,
  },
  cardLevelBar: {
    marginTop: "0.85rem",
    height: "4px",
    borderRadius: "999px",
    backgroundColor: "#1F2937",
    overflow: "hidden",
  },
  cardLevelFill: {
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: "999px",
    transition: "width 1s ease",
  },
};

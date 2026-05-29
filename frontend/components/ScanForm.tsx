import { useState, useRef } from "react";
import { X, Search, Zap } from "lucide-react";
import type { ScanRequest, SkillEntry } from "@/lib/types";

const SUGGESTIONS = [
  "React", "TypeScript", "Python", "Node.js", "Next.js",
  "Figma", "SEO", "Copywriting", "Data Analysis", "WordPress",
  "Vue.js", "Django", "GraphQL", "DevOps", "iOS",
];

const EXP_OPTS = [
  { value: "junior", label: "Junior",   sub: "0–2 yrs" },
  { value: "mid",    label: "Mid",      sub: "2–5 yrs" },
  { value: "senior", label: "Senior",   sub: "5+ yrs"  },
] as const;

const LEVELS: SkillEntry["level"][] = ["beginner", "competent", "expert"];

const LEVEL_LABEL: Record<SkillEntry["level"], string> = {
  beginner:  "Beg",
  competent: "Mid",
  expert:    "Pro",
};

const LEVEL_COLOR: Record<SkillEntry["level"], string> = {
  beginner:  "var(--text-3)",
  competent: "var(--text-2)",
  expert:    "var(--gold)",
};

interface Props {
  onSubmit: (r: ScanRequest) => void;
  loading: boolean;
  defaultSkills?: string[];
  defaultRate?: number;
  defaultExp?: "junior" | "mid" | "senior";
  defaultNiche?: string;
}

export default function ScanForm({
  onSubmit, loading,
  defaultSkills = [], defaultRate = 0,
  defaultExp = "mid", defaultNiche = "",
}: Props) {
  const [input, setInput]   = useState("");
  const [skills, setSkills] = useState<SkillEntry[]>(
    defaultSkills.map(name => ({ name, level: "competent" }))
  );
  const [rate, setRate]     = useState(defaultRate ? String(defaultRate) : "");
  const [exp, setExp]       = useState<"junior" | "mid" | "senior">(defaultExp);
  const [niche, setNiche]   = useState(defaultNiche);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(name: string) {
    const t = name.trim();
    if (t && !skills.find(s => s.name === t) && skills.length < 8) {
      setSkills(prev => [...prev, { name: t, level: "competent" }]);
      setInput("");
      inputRef.current?.focus();
    }
  }

  function cycleLevel(name: string) {
    setSkills(prev => prev.map(s => {
      if (s.name !== name) return s;
      const next = LEVELS[(LEVELS.indexOf(s.level) + 1) % LEVELS.length];
      return { ...s, level: next };
    }));
  }

  function remove(name: string) {
    setSkills(prev => prev.filter(s => s.name !== name));
  }

  const disabled = loading || skills.length === 0 || !rate || parseFloat(rate) <= 0;

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!disabled) onSubmit({ skills, hourly_rate: parseFloat(rate), experience: exp, niche: niche.trim() || undefined });
      }}
      className="card card-p-lg"
      style={{ maxWidth: 640 }}
    >
      {/* Header */}
      <div className="scan-form-hd">
        <div className="scan-form-hd-icon">
          <Zap size={22} color="#fff" />
        </div>
        <p className="scan-form-hd-title">Find your next win</p>
        <p className="scan-form-hd-sub">AI-powered scan across Upwork, Freelancer, Guru, PeoplePerHour & Toptal</p>
      </div>

      {/* Skills */}
      <div className="form-group" style={{ marginBottom: 20 }}>
        <label className="input-label">
          Your skills
          <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: 0, color: "var(--text-3)", marginLeft: 6 }}>up to 8 · tap level badge to adjust</span>
        </label>

        {skills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {skills.map(s => (
              <span key={s.name} className="skill-chip" style={{ fontSize: 12, padding: "4px 8px 4px 12px", display: "flex", alignItems: "center", gap: 0 }}>
                {s.name}
                <button
                  type="button"
                  onClick={() => cycleLevel(s.name)}
                  title="Click to change proficiency: Beg → Mid → Pro"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                    textTransform: "uppercase", padding: "0 5px",
                    color: LEVEL_COLOR[s.level],
                    transition: "opacity 0.15s",
                  }}
                >
                  {LEVEL_LABEL[s.level]}
                </button>
                <button type="button" className="skill-chip-x" onClick={() => remove(s.name)}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div style={{ position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
          <input
            ref={inputRef}
            type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); } }}
            placeholder="Type a skill and press Enter..."
            className="input" style={{ paddingLeft: 34 }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
          {SUGGESTIONS.filter(s => !skills.find(x => x.name === s)).slice(0, 8).map(s => (
            <button key={s} type="button" className="sugg-btn" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      </div>

      {/* Niche */}
      <div className="form-group" style={{ marginBottom: 20 }}>
        <label className="input-label">
          Your niche
          <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: 0, color: "var(--text-3)", marginLeft: 6 }}>optional — personalises your score</span>
        </label>
        <input
          type="text"
          value={niche}
          onChange={e => setNiche(e.target.value.slice(0, 100))}
          placeholder="e.g. React dashboards for fintech startups"
          className="input"
        />
      </div>

      {/* Rate + Level */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginBottom: 24 }}>
        <div className="form-group">
          <label className="input-label">Hourly rate (USD)</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--text-3)", fontWeight: 500 }}>$</span>
            <input type="number" value={rate} onChange={e => setRate(e.target.value)}
              placeholder="45" min="1" max="999" className="input" style={{ paddingLeft: 24 }} />
          </div>
        </div>
        <div className="form-group">
          <label className="input-label">Experience level</label>
          <div style={{ display: "flex", gap: 6 }}>
            {EXP_OPTS.map(o => (
              <button
                key={o.value} type="button"
                onClick={() => setExp(o.value)}
                style={{
                  flex: 1, padding: "9px 8px", border: `1px solid ${exp === o.value ? "var(--gold-border)" : "var(--border)"}`,
                  borderRadius: "var(--radius)", background: exp === o.value ? "var(--gold-muted)" : "var(--bg-soft)",
                  cursor: "pointer", transition: "all 0.15s", textAlign: "center",
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: exp === o.value ? "var(--gold)" : "var(--text-2)", marginBottom: 1 }}>{o.label}</p>
                <p style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 300 }}>{o.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" disabled={disabled} className="btn btn-primary btn-lg" style={{ width: "100%", fontSize: 13, padding: "14px 0", letterSpacing: "0.06em" }}>
        {loading
          ? <><div className="spinner-sm" /> Scanning live listings...</>
          : <><Zap size={15} /> Scan for opportunities</>}
      </button>

      {disabled && !loading && (
        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginTop: 8, fontWeight: 300 }}>
          {!skills.length ? "Add at least one skill to scan" : "Enter your hourly rate to continue"}
        </p>
      )}
    </form>
  );
}

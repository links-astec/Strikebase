import { useState, useRef } from "react";
import { X, Search, Zap } from "lucide-react";
import type { ScanRequest } from "@/lib/types";

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

interface Props {
  onSubmit: (r: ScanRequest) => void;
  loading: boolean;
  defaultSkills?: string[];
  defaultRate?: number;
  defaultExp?: "junior" | "mid" | "senior";
}

export default function ScanForm({ onSubmit, loading, defaultSkills = [], defaultRate = 0, defaultExp = "mid" }: Props) {
  const [input, setInput] = useState("");
  const [skills, setSkills] = useState<string[]>(defaultSkills);
  const [rate, setRate]     = useState(defaultRate ? String(defaultRate) : "");
  const [exp, setExp]       = useState<"junior" | "mid" | "senior">(defaultExp);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(s: string) {
    const t = s.trim();
    if (t && !skills.includes(t) && skills.length < 8) {
      setSkills(prev => [...prev, t]);
      setInput("");
      inputRef.current?.focus();
    }
  }

  const disabled = loading || skills.length === 0 || !rate || parseFloat(rate) <= 0;

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (!disabled) onSubmit({ skills, hourly_rate: parseFloat(rate), experience: exp }); }}
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
          <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: 0, color: "var(--text-3)", marginLeft: 6 }}>up to 8</span>
        </label>

        {skills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {skills.map(s => (
              <span key={s} className="skill-chip" style={{ fontSize: 12, padding: "4px 12px" }}>
                {s}
                <button type="button" className="skill-chip-x" onClick={() => setSkills(prev => prev.filter(x => x !== s))}>
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
          {SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
            <button key={s} type="button" className="sugg-btn" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
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

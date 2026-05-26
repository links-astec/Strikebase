import { useState, useRef } from "react";
import { X, Search, Zap, Loader2 } from "lucide-react";
import type { ScanRequest } from "@/lib/types";

const SUGGESTIONS = [
  "React", "TypeScript", "Python", "Node.js", "Next.js",
  "Figma", "SEO", "Copywriting", "Data Analysis", "WordPress",
  "Vue.js", "Django", "GraphQL", "DevOps", "iOS",
];

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

  const disabled = loading || skills.length === 0 || !rate;

  return (
    <form
      onSubmit={e => { e.preventDefault(); if (!disabled) onSubmit({ skills, hourly_rate: parseFloat(rate), experience: exp }); }}
      className="card card-p stack"
    >
      {/* Skills */}
      <div className="form-group">
        <label className="input-label">Skills <span style={{ fontWeight: 300, textTransform: "none", letterSpacing: 0, color: "var(--text-3)" }}>(up to 8)</span></label>

        {skills.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {skills.map(s => (
              <span key={s} className="skill-chip">
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
            placeholder="Type a skill, press Enter..."
            className="input" style={{ paddingLeft: 32 }}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
          {SUGGESTIONS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
            <button key={s} type="button" className="sugg-btn" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      </div>

      {/* Rate + Level */}
      <div className="col-2">
        <div className="form-group">
          <label className="input-label">Rate $/hr</label>
          <input type="number" value={rate} onChange={e => setRate(e.target.value)}
            placeholder="45" min="1" max="999" className="input" />
        </div>
        <div className="form-group">
          <label className="input-label">Level</label>
          <select value={exp} onChange={e => setExp(e.target.value as "junior" | "mid" | "senior")}
            className="input" style={{ cursor: "pointer" }}>
            <option value="junior">Junior</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
          </select>
        </div>
      </div>

      <button type="submit" disabled={disabled} className="btn btn-primary" style={{ width: "100%", padding: "12px 0" }}>
        {loading
          ? <><div className="spinner-sm" /> Scanning...</>
          : <><Zap size={14} /> Find opportunities</>}
      </button>
    </form>
  );
}

import { useState } from "react";
import Head from "next/head";
import { Link2, FileText, Loader2, CheckCircle, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import StrikeScore from "@/components/StrikeScore";
import MarketRates from "@/components/MarketRates";
import ClientProfile from "@/components/ClientProfile";
import { useAuth } from "@/lib/auth";
import { analyzeJob } from "@/lib/api";
import type { AnalysisResponse } from "@/lib/types";

type Mode = "url" | "text";

export default function AnalyzePage() {
  const { profile } = useAuth();
  const [mode, setMode]           = useState<Mode>("url");
  const [url, setUrl]             = useState("");
  const [description, setDesc]    = useState("");
  const [title, setTitle]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<AnalysisResponse | null>(null);
  const [error, setError]         = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const r = await analyzeJob({
        url:         mode === "url" ? url.trim() || undefined : undefined,
        description: mode === "text" ? description.trim() || undefined : undefined,
        title:       title.trim() || undefined,
        skills:      profile?.skills || [],
        hourly_rate: profile?.hourly_rate || 0,
        experience:  profile?.experience || "mid",
      });
      setResult(r);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = mode === "url" ? !!url.trim() : !!description.trim();

  return (
    <AuthGuard>
      <Head><title>Analyze Job — Strikebase</title></Head>
      <AppShell>
        <div className="page-header">
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontSize: 26, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              Analyze a Job
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 300 }}>
              Paste a URL or job description — our AI agents will score it against your profile
            </p>
          </div>
        </div>

        <div className="page-body">
          <div style={{ maxWidth: 700 }}>
            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button
                className={`btn${mode === "url" ? " btn-primary" : " btn-ghost"}`}
                onClick={() => setMode("url")}
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                <Link2 size={13} /> Job URL
              </button>
              <button
                className={`btn${mode === "text" ? " btn-primary" : " btn-ghost"}`}
                onClick={() => setMode("text")}
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
                <FileText size={13} /> Paste description
              </button>
            </div>

            <form onSubmit={handleSubmit} className="card card-p stack">
              {mode === "url" ? (
                <div className="form-group">
                  <label className="input-label">Job URL</label>
                  <input
                    type="url" value={url} onChange={e => setUrl(e.target.value)}
                    placeholder="https://www.upwork.com/jobs/~..."
                    className="input" autoFocus
                  />
                  <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6, fontWeight: 300 }}>
                    Supports Upwork, Freelancer, Guru, PeoplePerHour, and Toptal
                  </p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="input-label">Job title (optional)</label>
                    <input
                      type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Senior React Developer for SaaS Dashboard"
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">Job description</label>
                    <textarea
                      value={description} onChange={e => setDesc(e.target.value)}
                      placeholder="Paste the full job description here..."
                      rows={8} className="input" style={{ resize: "vertical" }}
                      autoFocus
                    />
                  </div>
                </>
              )}

              {!profile?.skills?.length && (
                <div style={{ padding: "9px 12px", background: "var(--warn-bg)", border: "1px solid var(--warn-border)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--warn)" }}>
                  Add your skills in Settings for a more accurate analysis
                </div>
              )}

              {error && (
                <div style={{ padding: "9px 12px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--danger)" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !canSubmit} className="btn btn-primary" style={{ width: "100%", padding: "12px 0" }}>
                {loading ? (
                  <><Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> Analyzing...</>
                ) : "Analyze opportunity"}
              </button>
            </form>

            {result && <AnalysisResult r={result} />}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function AnalysisResult({ r }: { r: AnalysisResponse }) {
  const VIcon = r.verdict === "go" ? CheckCircle : r.verdict === "risky" ? AlertTriangle : XCircle;
  const vColor = r.verdict === "go" ? "var(--go)" : r.verdict === "risky" ? "var(--warn)" : "var(--danger)";
  const vBg    = r.verdict === "go" ? "rgba(61,171,120,0.12)" : r.verdict === "risky" ? "var(--warn-bg)" : "var(--danger-bg)";
  const vBorder = r.verdict === "go" ? "var(--go-border)" : r.verdict === "risky" ? "var(--warn-border)" : "var(--danger-border)";

  return (
    <div className="stack" style={{ marginTop: 24 }}>
      {/* Header card */}
      <div className="card card-p" style={{ borderLeft: `3px solid ${vColor}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 16 }}>
          <StrikeScore score={r.strike_score} size="lg" />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <span style={{ background: vBg, color: vColor, border: `1px solid ${vBorder}`, borderRadius: "var(--radius)", padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                <VIcon size={11} /> {r.verdict.toUpperCase()}
              </span>
              <span style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "3px 10px", fontSize: 11, fontWeight: 500 }}>
                {r.opportunity.platform}
              </span>
            </div>
            <h2 style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontWeight: 600, fontSize: 20, color: "var(--text-1)", lineHeight: 1.3, marginBottom: 8 }}>
              {r.opportunity.title || "Analyzed opportunity"}
            </h2>
            {r.opportunity.url && (
              <a href={r.opportunity.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--gold)", display: "flex", alignItems: "center", gap: 4 }}>
                View original posting <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        {/* Reasons */}
        {r.reasons.length > 0 && (
          <div className="stack-sm" style={{ marginBottom: r.red_flags.length > 0 ? 14 : 0 }}>
            {r.reasons.map((reason, i) => (
              <div key={i} className="reason-row">
                <CheckCircle size={12} color="var(--go)" className="reason-icon" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 300, lineHeight: 1.5 }}>{reason}</p>
              </div>
            ))}
          </div>
        )}

        {/* Red flags */}
        {r.red_flags.length > 0 && (
          <div className="stack-sm">
            {r.red_flags.map((flag, i) => (
              <div key={i} className="reason-row">
                <AlertTriangle size={12} color="var(--danger)" className="reason-icon" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 300, lineHeight: 1.5 }}>{flag}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proposal angle */}
      {r.proposal_angle && (
        <div className="card card-p" style={{ borderLeft: "3px solid var(--gold)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
            Proposal opening line
          </p>
          <p style={{ fontSize: 13, color: "var(--text-2)", fontStyle: "italic", lineHeight: 1.7, fontWeight: 300 }}>
            &ldquo;{r.proposal_angle}&rdquo;
          </p>
        </div>
      )}

      {/* Market rates + client profile */}
      <div className="col-2" style={{ alignItems: "flex-start" }}>
        {r.market_rates && <MarketRates rates={r.market_rates} />}
        {r.client_profile && <ClientProfile profile={r.client_profile} />}
      </div>
    </div>
  );
}

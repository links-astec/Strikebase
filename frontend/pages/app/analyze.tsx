import React, { useState } from "react";
import Head from "next/head";
import { Link2, FileText, Loader2, CheckCircle, AlertTriangle, XCircle, ExternalLink, DollarSign } from "lucide-react";
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
          <div className="analyze-wrap">
            {/* Mode toggle */}
            <div className="seg-control">
              <button className={mode === "url" ? "seg-active" : "seg-btn"} type="button" onClick={() => setMode("url")}>
                <Link2 size={13} /> Job URL
              </button>
              <button className={mode === "text" ? "seg-active" : "seg-btn"} type="button" onClick={() => setMode("text")}>
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
  const VIcon   = r.verdict === "go" ? CheckCircle : r.verdict === "risky" ? AlertTriangle : XCircle;
  const vColor  = r.verdict === "go" ? "var(--go)"     : r.verdict === "risky" ? "var(--warn)"        : "var(--danger)";
  const vBg     = r.verdict === "go" ? "var(--go-bg)"  : r.verdict === "risky" ? "var(--warn-bg)"     : "var(--danger-bg)";
  const vBorder = r.verdict === "go" ? "var(--go-border)" : r.verdict === "risky" ? "var(--warn-border)" : "var(--danger-border)";
  const heroBg  = r.verdict === "go" ? "rgba(16,185,129,0.07)" : r.verdict === "risky" ? "rgba(245,158,11,0.07)" : "rgba(239,68,68,0.06)";

  return (
    <div className="stack" style={{ marginTop: 24 }}>
      {/* Cinematic hero — mirrors opp-detail-v2 */}
      <div className="opp-detail-v2">
        <div className="opp-detail-hd" style={{ "--hero-bg": `linear-gradient(160deg, ${heroBg} 0%, transparent 70%)` } as React.CSSProperties}>
          <div className="opp-detail-hd-inner">
            {/* Verdict + platform + link row */}
            <div className="opp-verdict-row">
              <span style={{ background: vBg, color: vColor, border: `1px solid ${vBorder}`, borderRadius: "var(--radius)", padding: "4px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                <VIcon size={11} /> {r.verdict.toUpperCase()}
              </span>
              <span style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "4px 12px", fontSize: 11, fontWeight: 400, textTransform: "capitalize" }}>
                {r.opportunity.platform}
              </span>
              {r.opportunity.url && (
                <a href={r.opportunity.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--gold)", fontWeight: 500, textDecoration: "none" }}>
                  View listing <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Score + title */}
            <div className="opp-detail-score-row">
              <div className="opp-detail-score-wrap">
                <StrikeScore score={r.strike_score} size="lg" />
                <span className="opp-detail-score-label">Strike score</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="opp-detail-title-v2">{r.opportunity.title || "Analyzed opportunity"}</h2>
                {r.opportunity.budget_max != null && (
                  <div className="opp-detail-meta-row">
                    <span className="opp-detail-meta-item" style={{ color: "var(--go)", fontWeight: 600 }}>
                      <DollarSign size={13} color="var(--go)" />
                      {r.opportunity.budget_min != null
                        ? `$${r.opportunity.budget_min}–$${r.opportunity.budget_max}`
                        : `$${r.opportunity.budget_max}`}/hr
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reasons + red flags grid */}
        {(r.reasons.length > 0 || r.red_flags.length > 0) && (
          <div className="opp-detail-insights">
            {r.reasons.length > 0 && (
              <div className="insight-col">
                <div className="insight-col-lbl" style={{ color: "var(--go)" }}>
                  <CheckCircle size={12} color="var(--go)" /> Why bid
                </div>
                {r.reasons.map((reason, i) => (
                  <div key={i} className="insight-row">
                    <div className="insight-ico insight-ico-go">
                      <CheckCircle size={11} color="var(--go)" />
                    </div>
                    <p className="insight-txt">{reason}</p>
                  </div>
                ))}
              </div>
            )}
            {r.red_flags.length > 0 && (
              <div className="insight-col">
                <div className="insight-col-lbl" style={{ color: "var(--danger)" }}>
                  <AlertTriangle size={12} color="var(--danger)" /> Red flags
                </div>
                {r.red_flags.map((flag, i) => (
                  <div key={i} className="insight-row">
                    <div className="insight-ico insight-ico-danger">
                      <AlertTriangle size={11} color="var(--danger)" />
                    </div>
                    <p className="insight-txt">{flag}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Proposal angle */}
      {r.proposal_angle && (
        <div className="proposal-block">
          <div className="proposal-block-hd">
            <span className="proposal-block-lbl">How to open your proposal</span>
            <span className="proposal-block-sub">— paste this as your first line</span>
          </div>
          <p className="proposal-block-text">&ldquo;{r.proposal_angle}&rdquo;</p>
        </div>
      )}

      {/* Market rates + client profile */}
      {r.market_rates && r.client_profile ? (
        <div className="col-2" style={{ alignItems: "flex-start" }}>
          <MarketRates rates={r.market_rates} />
          <ClientProfile profile={r.client_profile} />
        </div>
      ) : r.market_rates ? (
        <MarketRates rates={r.market_rates} />
      ) : r.client_profile ? (
        <ClientProfile profile={r.client_profile} />
      ) : null}
    </div>
  );
}

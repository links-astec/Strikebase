import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, ExternalLink, DollarSign, Users, Clock } from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import StrikeScore from "@/components/StrikeScore";
import MarketRates from "@/components/MarketRates";
import ClientProfile from "@/components/ClientProfile";
import { getOpportunities } from "@/lib/api";
import type { Opportunity, MarketRates as MR, ClientProfile as CP } from "@/lib/types";

interface DetailData {
  opp: Opportunity;
  market: MR | null;
  client: CP | null;
}

export default function OpportunityDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData]     = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!id) return;
    const scanId = router.query.scan as string | undefined;
    if (!scanId) { setError("Missing scan context"); setLoading(false); return; }

    getOpportunities(scanId)
      .then(r => {
        const opp = r.opportunities.find(o => o.id === id);
        if (!opp) { setError("Opportunity not found"); return; }
        setData({ opp, market: r.market_rates || null, client: null });
      })
      .catch(() => setError("Failed to load opportunity"))
      .finally(() => setLoading(false));
  }, [id, router.query.scan]);

  const vColor  = data?.opp ? (data.opp.verdict === "go" ? "var(--go)" : data.opp.verdict === "risky" ? "var(--warn)" : "var(--danger)") : "var(--border)";
  const vBg     = data?.opp ? (data.opp.verdict === "go" ? "rgba(61,171,120,0.12)" : data.opp.verdict === "risky" ? "var(--warn-bg)" : "var(--danger-bg)") : "transparent";
  const vBorder = data?.opp ? (data.opp.verdict === "go" ? "var(--go-border)" : data.opp.verdict === "risky" ? "var(--warn-border)" : "var(--danger-border)") : "var(--border)";
  const VIcon   = data?.opp?.verdict === "go" ? CheckCircle : data?.opp?.verdict === "risky" ? AlertTriangle : XCircle;

  return (
    <AuthGuard>
      <Head><title>{data?.opp?.title ?? "Opportunity"} — Strikebase</title></Head>
      <AppShell>
        <div className="page-header">
          <button
            className="btn btn-ghost"
            onClick={() => router.back()}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}
          >
            <ArrowLeft size={13} /> Back
          </button>
        </div>

        <div className="page-body">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
              <div className="spinner" />
            </div>
          ) : error ? (
            <div className="card card-p empty-state">
              <p style={{ color: "var(--danger)", fontSize: 14, marginBottom: 8 }}>{error}</p>
              <Link href="/app/scan"><button className="btn btn-ghost">Start new scan</button></Link>
            </div>
          ) : data ? (
            <div className="stack" style={{ maxWidth: 760 }}>
              {/* Hero card */}
              <div className="card card-p" style={{ borderLeft: `3px solid ${vColor}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 20 }}>
                  <StrikeScore score={data.opp.strike_score} size="lg" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                      <span style={{ background: vBg, color: vColor, border: `1px solid ${vBorder}`, borderRadius: "var(--radius)", padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                        <VIcon size={11} /> {data.opp.verdict.toUpperCase()}
                      </span>
                      <span style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "3px 10px", fontSize: 11, fontWeight: 500 }}>
                        {data.opp.platform}
                      </span>
                      {data.opp.is_demo && (
                        <span style={{ background: "var(--gold-muted)", color: "var(--gold)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius)", padding: "3px 10px", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em" }}>
                          DEMO
                        </span>
                      )}
                    </div>
                    <h1 style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontWeight: 600, fontSize: 22, color: "var(--text-1)", lineHeight: 1.35, marginBottom: 12 }}>
                      {data.opp.title}
                    </h1>

                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {data.opp.budget_max != null && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-2)" }}>
                          <DollarSign size={12} color="var(--gold)" />
                          {data.opp.budget_min != null ? `$${data.opp.budget_min}–$${data.opp.budget_max}` : `$${data.opp.budget_max}`}/hr
                        </span>
                      )}
                      {data.opp.bid_count != null && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: data.opp.bid_count > 20 ? "var(--danger)" : "var(--go)" }}>
                          <Users size={12} />
                          {data.opp.bid_count} competing bids
                        </span>
                      )}
                      {data.opp.posted_at && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-3)" }}>
                          <Clock size={12} />
                          {timeAgo(data.opp.posted_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {data.opp.url && (
                    <a href={data.opp.url} target="_blank" rel="noopener noreferrer">
                      <button className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, flexShrink: 0 }}>
                        View listing <ExternalLink size={12} />
                      </button>
                    </a>
                  )}
                </div>

                <div className="gold-line" style={{ margin: "16px 0" }} />

                <div className="detail-grid">
                  {/* Why bid */}
                  {data.opp.reasons.length > 0 && (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--go)", marginBottom: 10 }}>
                        Why bid
                      </p>
                      <div className="stack-sm">
                        {data.opp.reasons.map((r, i) => (
                          <div key={i} className="reason-row">
                            <CheckCircle size={12} color="var(--go)" className="reason-icon" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 300, lineHeight: 1.55 }}>{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Red flags */}
                  {data.opp.red_flags.length > 0 && (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--danger)", marginBottom: 10 }}>
                        Red flags
                      </p>
                      <div className="stack-sm">
                        {data.opp.red_flags.map((f, i) => (
                          <div key={i} className="reason-row">
                            <AlertTriangle size={12} color="var(--danger)" className="reason-icon" style={{ flexShrink: 0, marginTop: 2 }} />
                            <p style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 300, lineHeight: 1.55 }}>{f}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Proposal angle */}
              {data.opp.proposal_angle && (
                <div className="card card-p" style={{ borderLeft: "3px solid var(--gold)" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10 }}>
                    AI proposal angle
                  </p>
                  <p style={{ fontSize: 14, color: "var(--text-2)", fontStyle: "italic", lineHeight: 1.75, fontWeight: 300 }}>
                    &ldquo;{data.opp.proposal_angle}&rdquo;
                  </p>
                </div>
              )}

              {/* Market rates + client */}
              <div className="col-2" style={{ alignItems: "flex-start" }}>
                {data.market && <MarketRates rates={data.market} />}
                {data.client && <ClientProfile profile={data.client} />}
              </div>
            </div>
          ) : null}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function timeAgo(ts: string): string {
  try {
    const h = Math.floor((Date.now() - new Date(ts).getTime()) / 3_600_000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return ""; }
}

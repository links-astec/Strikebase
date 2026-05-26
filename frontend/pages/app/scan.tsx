import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { SlidersHorizontal, ArrowUpDown, Filter } from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import ScanForm from "@/components/ScanForm";
import LoadingState from "@/components/LoadingState";
import OpportunityCard from "@/components/OpportunityCard";
import MarketRates from "@/components/MarketRates";
import { useAuth } from "@/lib/auth";
import { useDemo } from "@/lib/demo";
import { startScan, getOpportunities } from "@/lib/api";
import type { Opportunity, MarketRates as MR, ScanRequest } from "@/lib/types";

type Verdict = "go" | "risky" | "skip";
type SortKey = "score" | "rate" | "bids";

export default function ScanPage() {
  const { profile } = useAuth();
  const { demo } = useDemo();
  const router = useRouter();
  const resumeId = router.query.id as string | undefined;

  const [scanId, setScanId]         = useState<string | null>(resumeId || null);
  const [status, setStatus]         = useState<string>("idle");
  const [progress, setProgress]     = useState("");
  const [opps, setOpps]             = useState<Opportunity[]>([]);
  const [market, setMarket]         = useState<MR | null>(null);
  const [error, setError]           = useState("");

  const [sortKey, setSortKey]   = useState<SortKey>("score");
  const [sortAsc, setSortAsc]   = useState(false);
  const [filter, setFilter]     = useState<Verdict | "all">("all");
  const [platform, setPlatform] = useState<string>("all");

  const poll = useCallback(async (id: string) => {
    try {
      const r = await getOpportunities(id);
      setProgress(r.message || "");
      if (r.status === "complete") {
        setOpps(r.opportunities);
        setMarket(r.market_rates || null);
        setStatus("complete");
      } else if (r.status === "error") {
        setError(r.message || "Scan failed");
        setStatus("error");
      } else {
        setTimeout(() => poll(id), 2500);
      }
    } catch {
      setError("Failed to fetch results");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (resumeId) {
      setStatus("processing");
      poll(resumeId);
    }
  }, [resumeId, poll]);

  async function handleSubmit(req: ScanRequest) {
    setError("");
    setOpps([]);
    setMarket(null);
    setStatus("processing");

    if (demo) {
      setProgress("Loading demo results...");
      setTimeout(async () => {
        try {
          const r = await getOpportunities("demo");
          setOpps(r.opportunities);
          setMarket(r.market_rates || null);
          setStatus("complete");
        } catch {
          setError("Failed to load demo data — make sure demo rows are seeded in Supabase.");
          setStatus("error");
        }
      }, 900);
      return;
    }

    setProgress("Starting scan...");
    try {
      const r = await startScan(req);
      setScanId(r.scan_id);
      router.replace({ query: { id: r.scan_id } }, undefined, { shallow: true });
      poll(r.scan_id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start scan");
      setStatus("error");
    }
  }

  const platforms = ["all", ...Array.from(new Set(opps.map(o => o.platform))).sort()];

  const visible = opps
    .filter(o => filter === "all" || o.verdict === filter)
    .filter(o => platform === "all" || o.platform === platform)
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "score") diff = a.strike_score - b.strike_score;
      else if (sortKey === "rate") diff = (a.budget_max ?? 0) - (b.budget_max ?? 0);
      else if (sortKey === "bids") diff = (a.bid_count ?? 999) - (b.bid_count ?? 999);
      return sortAsc ? diff : -diff;
    });

  const goCnt   = opps.filter(o => o.verdict === "go").length;
  const riskyCnt = opps.filter(o => o.verdict === "risky").length;

  return (
    <AuthGuard>
      <Head><title>New Scan — Strikebase</title></Head>
      <AppShell>
        <div className="page-header">
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontSize: 26, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              New Scan
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 300 }}>
              Live bid intelligence across Upwork, Freelancer, Guru, PeoplePerHour and Toptal
            </p>
          </div>
        </div>

        <div className="page-body">
          {status === "idle" || status === "error" ? (
            <>
              <ScanForm
                onSubmit={handleSubmit}
                loading={false}
                defaultSkills={profile?.skills}
                defaultRate={profile?.hourly_rate}
                defaultExp={profile?.experience}
              />
              {error && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--danger)" }}>
                  {error}
                </div>
              )}
            </>
          ) : status === "processing" ? (
            <LoadingState message={progress} />
          ) : (
            <>
              {/* Summary bar */}
              <div className="summary-bar" style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>{opps.length} opportunities found</span>
                <span style={{ color: "var(--go)", fontSize: 12, fontWeight: 600 }}>{goCnt} GO</span>
                <span style={{ color: "var(--warn)", fontSize: 12, fontWeight: 600 }}>{riskyCnt} RISKY</span>
                <span style={{ color: "var(--danger)", fontSize: 12, fontWeight: 600 }}>{opps.length - goCnt - riskyCnt} SKIP</span>
              </div>

              {/* Controls */}
              <div className="controls-row" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Filter size={13} color="var(--text-3)" />
                  {(["all", "go", "risky", "skip"] as const).map(v => (
                    <button key={v} className={`filter-pill${filter === v ? ` fp-${v}-active` : ""}`} onClick={() => setFilter(v)}>
                      {v === "all" ? "All" : v.toUpperCase()}
                    </button>
                  ))}
                </div>
                {platforms.length > 2 && (
                  <div style={{ display: "flex", gap: 6 }}>
                    {platforms.map(p => (
                      <button key={p} className={`filter-pill${platform === p ? " fp-platform-active" : ""}`} onClick={() => setPlatform(p)}>
                        {p === "all" ? "All platforms" : p}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
                  <ArrowUpDown size={13} color="var(--text-3)" style={{ alignSelf: "center" }} />
                  {(["score", "rate", "bids"] as SortKey[]).map(k => (
                    <button
                      key={k}
                      className={`sort-btn${sortKey === k ? " sort-btn-active" : ""}`}
                      onClick={() => { if (sortKey === k) setSortAsc(a => !a); else { setSortKey(k); setSortAsc(false); } }}
                    >
                      {k === "score" ? "Score" : k === "rate" ? "Rate" : "Bids"}
                      {sortKey === k && <span style={{ marginLeft: 3, opacity: 0.6 }}>{sortAsc ? "↑" : "↓"}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {market && <div style={{ marginBottom: 20 }}><MarketRates rates={market} userRate={profile?.hourly_rate} /></div>}

              {visible.length === 0 ? (
                <div className="card card-p empty-state">
                  <SlidersHorizontal size={24} color="var(--text-3)" style={{ marginBottom: 10 }} />
                  <p style={{ color: "var(--text-2)", fontSize: 13 }}>No results match this filter</p>
                </div>
              ) : (
                <div className="stack-sm">
                  {visible.map((opp, i) => (
                    <OpportunityCard key={opp.id} opp={opp} best={i === 0 && filter === "all"} scanId={scanId ?? undefined} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

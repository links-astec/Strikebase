import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Zap, TrendingUp, Clock, Sparkles, ChevronRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import StrikeScore from "@/components/StrikeScore";
import { useAuth } from "@/lib/auth";
import { getUserScans, getSuggestions } from "@/lib/api";
import type { Scan, Suggestion } from "@/lib/types";

const SCANS_KEY  = "sb_scans_v1";
const SUGG_KEY   = "sb_sugg_v1";
const SCANS_TTL  = 30_000;

function suggProfileKey(skills: string[], rate: number | undefined, exp: string | undefined) {
  return `${[...skills].sort().join(",")}|${rate ?? ""}|${exp ?? ""}`;
}

interface ScansCache { ts: number; data: Scan[] }
interface SuggCache  { key: string; data: Suggestion[] }

function readCache<T>(k: string): T | null {
  try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; }
}
function writeCache(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [scans, setScans]           = useState<Scan[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [loadingSugg, setLoadingSugg]   = useState(false);
  const sugg = useRef<AbortController | null>(null);

  // Scans — show cache immediately, refresh in background if stale
  useEffect(() => {
    const cached = readCache<ScansCache>(SCANS_KEY);
    if (cached) {
      setScans(cached.data);
      setLoadingScans(false);
      if (Date.now() - cached.ts < SCANS_TTL) return;
    }
    getUserScans()
      .then(r => {
        setScans(r.scans);
        writeCache(SCANS_KEY, { ts: Date.now(), data: r.scans } satisfies ScansCache);
      })
      .catch(() => {})
      .finally(() => setLoadingScans(false));
  }, []);

  // Suggestions — cache by profile key; only re-fetch if skills/rate/exp changed
  useEffect(() => {
    if (!profile?.skills?.length) return;
    const profileKey = suggProfileKey(profile.skills, profile.hourly_rate, profile.experience);

    const cached = readCache<SuggCache>(SUGG_KEY);
    if (cached && cached.key === profileKey) {
      setSuggestions(cached.data);
      return;
    }

    sugg.current?.abort();
    sugg.current = new AbortController();
    setLoadingSugg(true);
    getSuggestions({ skills: profile.skills, experience: profile.experience, hourly_rate: profile.hourly_rate })
      .then(r => {
        const data = r.suggestions.slice(0, 3);
        setSuggestions(data);
        writeCache(SUGG_KEY, { key: profileKey, data } satisfies SuggCache);
      })
      .catch(() => {})
      .finally(() => setLoadingSugg(false));
  }, [profile?.skills?.join(","), profile?.hourly_rate, profile?.experience]); // eslint-disable-line

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const name = profile?.display_name || "there";
  const recentScans = scans.slice(0, 3);

  return (
    <AuthGuard>
      <Head><title>Dashboard — Strikebase</title></Head>
      <AppShell>
        <div className="page-header">
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontSize: 26, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              {greeting()}, {name}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 300 }}>
              {profile?.skills?.length
                ? `Scanning for ${profile.skills.slice(0, 3).join(", ")}${profile.skills.length > 3 ? ` +${profile.skills.length - 3} more` : ""}`
                : "Complete your profile to get started"}
            </p>
          </div>
          <Link href="/app/scan">
            <button className="btn btn-primary">
              New Scan <Zap size={13} />
            </button>
          </Link>
        </div>

        <div className="page-body">
          {/* Quick stats */}
          <div className="stat-grid" style={{ marginBottom: 28 }}>
            <div className="stat-tile">
              <p className="stat-lbl">Total scans</p>
              <p className="stat-val">{loadingScans ? "—" : scans.length}</p>
            </div>
            <div className="stat-tile">
              <p className="stat-lbl">Skills tracked</p>
              <p className="stat-val">{profile?.skills?.length ?? 0}</p>
            </div>
            <div className="stat-tile">
              <p className="stat-lbl">Target rate</p>
              <p className="stat-val">{profile?.hourly_rate ? `$${profile.hourly_rate}/hr` : "—"}</p>
            </div>
            <div className="stat-tile">
              <p className="stat-lbl">Level</p>
              <p className="stat-val" style={{ textTransform: "capitalize" }}>{profile?.experience ?? "—"}</p>
            </div>
          </div>

          <div className="col-2" style={{ alignItems: "flex-start", gap: 20 }}>
            {/* Recent scans */}
            <div>
              <div className="row-sb" style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)" }}>
                  Recent scans
                </p>
                <Link href="/app/history" style={{ fontSize: 11, color: "var(--gold)", display: "flex", alignItems: "center", gap: 3 }}>
                  View all <ChevronRight size={11} />
                </Link>
              </div>

              {loadingScans ? (
                <div className="card card-p" style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                  <div className="spinner-sm" />
                </div>
              ) : recentScans.length === 0 ? (
                <div className="card card-p empty-state">
                  <Clock size={28} color="var(--text-3)" style={{ marginBottom: 12 }} />
                  <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 4 }}>No scans yet</p>
                  <p style={{ color: "var(--text-3)", fontSize: 12, fontWeight: 300, marginBottom: 16 }}>
                    Run your first scan to see bid opportunities
                  </p>
                  <Link href="/app/scan">
                    <button className="btn btn-primary" style={{ fontSize: 12 }}>
                      Start scanning <ArrowRight size={12} />
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="stack-sm">
                  {recentScans.map(scan => (
                    <ScanRow key={scan.id} scan={scan} />
                  ))}
                </div>
              )}
            </div>

            {/* Project suggestions */}
            <div>
              <div className="row-sb" style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)" }}>
                  Suggested projects
                </p>
                <span style={{ fontSize: 10, color: "var(--gold)", letterSpacing: "0.08em", background: "var(--gold-muted)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius)", padding: "2px 7px" }}>
                  AI · Claude
                </span>
              </div>

              {loadingSugg ? (
                <div className="card card-p" style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                  <div className="spinner-sm" />
                </div>
              ) : suggestions.length === 0 ? (
                <div className="card card-p empty-state">
                  <Sparkles size={28} color="var(--text-3)" style={{ marginBottom: 12 }} />
                  <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 4 }}>No suggestions yet</p>
                  <p style={{ color: "var(--text-3)", fontSize: 12, fontWeight: 300 }}>
                    Add skills in Settings to get AI project recommendations
                  </p>
                </div>
              ) : (
                <div className="stack-sm">
                  {suggestions.map(s => (
                    <SuggCard key={s.title} s={s} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          {!profile?.skills?.length && (
            <div className="card card-p" style={{ marginTop: 20, borderLeft: "3px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <p style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
                  Complete your profile
                </p>
                <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 300 }}>
                  Add your skills and target rate to get personalized opportunities and AI suggestions.
                </p>
              </div>
              <Link href="/app/settings" style={{ flexShrink: 0 }}>
                <button className="btn btn-primary" style={{ fontSize: 12 }}>
                  Set up profile <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function ScanRow({ scan }: { scan: Scan }) {
  return (
    <Link href={`/app/scan?id=${scan.id}`} style={{ display: "block" }}>
      <div className="card card-p card-hover" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: "var(--gold-muted)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={15} color="var(--gold)" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {scan.skills?.slice(0, 3).join(", ")}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 300 }}>
            ${scan.hourly_rate}/hr · {scan.experience} · {timeAgo(scan.created_at)}
          </p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: scan.status === "complete" ? "var(--go)" : "var(--warn)", background: scan.status === "complete" ? "rgba(61,171,120,0.12)" : "var(--warn-bg)", border: `1px solid ${scan.status === "complete" ? "var(--go-border)" : "var(--warn-border)"}`, borderRadius: "var(--radius)", padding: "2px 7px", flexShrink: 0 }}>
          {scan.status}
        </span>
        <ChevronRight size={13} color="var(--border-2)" style={{ flexShrink: 0 }} />
      </div>
    </Link>
  );
}

function SuggCard({ s }: { s: Suggestion }) {
  const diffColor = s.difficulty === "easy" ? "var(--go)" : s.difficulty === "medium" ? "var(--warn)" : "var(--danger)";
  return (
    <div className="card card-p suggestion-card">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <p style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontSize: 15, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.3, flex: 1 }}>
          {s.title}
        </p>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: diffColor, background: `${diffColor}18`, border: `1px solid ${diffColor}44`, borderRadius: "var(--radius)", padding: "2px 7px", flexShrink: 0 }}>
          {s.difficulty}
        </span>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 300, lineHeight: 1.6, marginBottom: 8 }}>{s.description}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {s.skills_gained?.slice(0, 4).map(sk => (
          <span key={sk} style={{ fontSize: 10, color: "var(--text-2)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "2px 7px" }}>
            {sk}
          </span>
        ))}
        <span style={{ fontSize: 10, color: "var(--gold)", background: "var(--gold-muted)", border: "1px solid var(--gold-border)", borderRadius: "var(--radius)", padding: "2px 7px" }}>
          +{s.score_impact}
        </span>
      </div>
    </div>
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

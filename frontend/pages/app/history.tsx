import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Clock, ChevronRight, Zap } from "lucide-react";
import AppShell from "@/components/AppShell";
import AuthGuard from "@/components/AuthGuard";
import { getUserScans } from "@/lib/api";
import type { Scan } from "@/lib/types";

function groupByDate(scans: Scan[]): { label: string; items: Scan[] }[] {
  const groups: Record<string, Scan[]> = {};
  for (const s of scans) {
    const d = new Date(s.created_at);
    const now = new Date();
    let label: string;
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Yesterday";
    else if (diffDays < 7) label = `${diffDays} days ago`;
    else label = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    (groups[label] ??= []).push(s);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export default function HistoryPage() {
  const [scans, setScans]     = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    getUserScans()
      .then(r => setScans(r.scans))
      .catch(() => setError("Failed to load scan history"))
      .finally(() => setLoading(false));
  }, []);

  const groups = groupByDate(scans);

  return (
    <AuthGuard>
      <Head><title>History — Strikebase</title></Head>
      <AppShell>
        <div className="page-header">
          <div>
            <h1 style={{ fontFamily: "Space Grotesk, Inter, sans-serif", fontSize: 26, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              Scan History
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 300 }}>
              {loading ? "Loading..." : `${scans.length} scan${scans.length !== 1 ? "s" : ""} on record`}
            </p>
          </div>
          <Link href="/app/scan">
            <button className="btn btn-primary">New scan <Zap size={13} /></button>
          </Link>
        </div>

        <div className="page-body">
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
              <div className="spinner" />
            </div>
          ) : error ? (
            <div className="card card-p empty-state">
              <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>
            </div>
          ) : scans.length === 0 ? (
            <div className="card card-p empty-state">
              <Clock size={32} color="var(--text-3)" style={{ marginBottom: 14 }} />
              <p style={{ color: "var(--text-2)", fontSize: 15, marginBottom: 6 }}>No scans yet</p>
              <p style={{ color: "var(--text-3)", fontSize: 12, fontWeight: 300, marginBottom: 18 }}>
                Your scan history will appear here after your first run
              </p>
              <Link href="/app/scan">
                <button className="btn btn-primary">Start your first scan</button>
              </Link>
            </div>
          ) : (
            <div className="stack">
              {groups.map(({ label, items }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", marginBottom: 10 }}>
                    {label}
                  </p>
                  <div className="stack-sm">
                    {items.map(scan => <ScanHistoryRow key={scan.id} scan={scan} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function ScanHistoryRow({ scan }: { scan: Scan }) {
  const isComplete = scan.status === "complete";
  return (
    <Link href={`/app/scan?id=${scan.id}`} style={{ display: "block" }}>
      <div className="history-row card-hover" style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
        <div style={{ width: 38, height: 38, borderRadius: "var(--radius)", background: isComplete ? "rgba(61,171,120,0.1)" : "var(--gold-muted)", border: `1px solid ${isComplete ? "var(--go-border)" : "var(--gold-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Zap size={15} color={isComplete ? "var(--go)" : "var(--gold)"} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {scan.skills?.join(", ") || "No skills"}
          </p>
          <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-3)", fontWeight: 300, flexWrap: "wrap" }}>
            <span>${scan.hourly_rate}/hr</span>
            <span style={{ textTransform: "capitalize" }}>{scan.experience}</span>
            <span>{new Date(scan.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
          color: isComplete ? "var(--go)" : scan.status === "processing" ? "var(--warn)" : "var(--danger)",
          background: isComplete ? "rgba(61,171,120,0.1)" : scan.status === "processing" ? "var(--warn-bg)" : "var(--danger-bg)",
          border: `1px solid ${isComplete ? "var(--go-border)" : scan.status === "processing" ? "var(--warn-border)" : "var(--danger-border)"}`,
          borderRadius: "var(--radius)", padding: "3px 9px", flexShrink: 0,
        }}>
          {scan.status}
        </span>

        <ChevronRight size={13} color="var(--border-2)" style={{ flexShrink: 0 }} />
      </div>
    </Link>
  );
}

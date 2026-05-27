import { Search, Database, UserCheck, Sparkles, CheckCircle } from "lucide-react";

const STEPS = [
  { Icon: Search,    label: "SERP search",     desc: "Live scan across Upwork, Freelancer, Guru, PeoplePerHour, Toptal" },
  { Icon: Database,  label: "Extracting data",  desc: "Web Scraper API pulling details from each listing" },
  { Icon: UserCheck, label: "Client profiles",  desc: "Web Unlocker reading client history & spend data" },
  { Icon: Sparkles,  label: "AI scoring",       desc: "Advanced AI ranking every listing by your win probability" },
];

function detect(msg: string): number {
  const m = msg.toLowerCase();
  if (m.includes("scor") || m.includes("ai") || m.includes("of ")) return 3;
  if (m.includes("client") || m.includes("profile") || m.includes("unlock")) return 2;
  if (m.includes("scraping") || m.includes("extract") || m.includes("found") || m.includes("detail")) return 1;
  return 0;
}

interface Props {
  message: string;
  inline?: boolean;
  foundCount?: number;
}

export default function LoadingState({ message, inline = false, foundCount = 0 }: Props) {
  const step = detect(message);

  if (inline) {
    return (
      <div
        className="card card-p"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          borderColor: "var(--border-2)",
        }}
      >
        <div className="spinner-sm" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 2 }}>
            {message || "Processing..."}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-3)" }}>
            {foundCount > 0
              ? `${foundCount} ${foundCount === 1 ? "job" : "jobs"} ready to review · scan still running`
              : "Live scan in progress · results appear as they are scored"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {STEPS.map(({ Icon, label }, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={label}
                title={label}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: done ? "var(--go-bg)" : active ? "var(--gold)" : "var(--bg-hover)",
                  opacity: i > step ? 0.4 : 1,
                }}
              >
                {done
                  ? <CheckCircle size={12} color="var(--go)" />
                  : <Icon size={11} color={active ? "#fff" : "var(--text-3)"} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="card card-p-lg">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div className="spinner" />
      </div>

      <p style={{ textAlign: "center", fontFamily: "Space Grotesk, Inter, sans-serif", fontWeight: 600, fontSize: 18, color: "var(--text-1)", marginBottom: 4 }}>
        {message || "Processing..."}
      </p>
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)", marginBottom: 28 }}>
        Live Bright Data scrape in progress · 15–45 seconds
      </p>

      <div className="stack-sm" style={{ maxWidth: 380, margin: "0 auto" }}>
        {STEPS.map(({ Icon, label, desc }, i) => {
          const done   = i < step;
          const active = i === step;
          return (
            <div key={label} className={`load-step ${done ? "load-done" : active ? "load-active" : "load-idle"}`}>
              <div className={`load-icon ${done ? "load-icon-done" : active ? "load-icon-active" : "load-icon-idle"}`}>
                {done
                  ? <CheckCircle size={15} color="var(--go)" />
                  : <Icon size={14} color={active ? "#fff" : "var(--text-3)"} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: done ? "var(--go)" : active ? "var(--text-1)" : "var(--text-3)" }}>
                  {label}
                </p>
                {active && <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2, fontWeight: 300 }}>{desc}</p>}
              </div>
              {active && (
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", animation: "pulse-dot 1.2s ease-in-out infinite" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

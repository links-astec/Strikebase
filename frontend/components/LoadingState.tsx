import { Search, Database, UserCheck, Sparkles, CheckCircle } from "lucide-react";

const STEPS = [
  { Icon: Search,    label: "SERP search",     desc: "Live scan across Upwork, Freelancer, Guru, PeoplePerHour, Toptal" },
  { Icon: Database,  label: "Extracting data",  desc: "Web Scraper API pulling details from each listing" },
  { Icon: UserCheck, label: "Client profiles",  desc: "Web Unlocker reading client history & spend data" },
  { Icon: Sparkles,  label: "AI scoring",       desc: "Claude ranking every listing by your win probability" },
];

function detect(msg: string): number {
  const m = msg.toLowerCase();
  if (m.includes("scor") || m.includes("claude") || m.includes("ai") || m.includes("of ")) return 3;
  if (m.includes("client") || m.includes("profile") || m.includes("unlock")) return 2;
  if (m.includes("scraping") || m.includes("extract") || m.includes("found") || m.includes("detail")) return 1;
  return 0;
}

export default function LoadingState({ message }: { message: string }) {
  const step = detect(message);

  return (
    <div className="card card-p-lg">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div className="spinner" />
      </div>

      <p style={{ textAlign: "center", fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: 18, color: "var(--text-1)", marginBottom: 4 }}>
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

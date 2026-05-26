import Head from "next/head";
import Link from "next/link";
import { Zap, Search, BarChart3, Sparkles, CheckCircle, ArrowRight, Database, ShieldCheck, TrendingUp, Globe, Target, Layers } from "lucide-react";
import StrikeScore from "@/components/StrikeScore";
import ThemeToggle from "@/components/ThemeToggle";

const REASONS = [
  "Only 4 bids — platform average is 23 at this stage",
  "Client has $62k spent, 94% hire rate, 0 disputes on record",
  "Your $45/hr sits at the P57 percentile for React this week",
];

const HOW_STEPS = [
  { num: "01", Icon: Target,   bg: "var(--gold-muted)",          color: "var(--gold)",  title: "Enter your skills",    desc: "Tell Strikebase what you do and your target rate." },
  { num: "02", Icon: Globe,    bg: "rgba(61,171,120,0.12)",       color: "var(--go)",    title: "Live SERP scan",        desc: "SERP API queries Google in real time across 5 major platforms." },
  { num: "03", Icon: Database, bg: "rgba(255,255,255,0.06)",      color: "var(--text-2)",title: "Deep data extraction",  desc: "Web Scraper + Web Unlocker pull bids, budgets, and client history." },
  { num: "04", Icon: Sparkles, bg: "var(--gold-muted)",           color: "var(--gold)",  title: "AI ranking",            desc: "Claude scores each listing 0–100 with number-backed reasoning." },
];

const TOOLS = [
  { Icon: Search,     color: "var(--gold)",   bg: "var(--gold-muted)",       tag: "Discovery",   name: "SERP API",     desc: "Queries Google in real time to surface Upwork, Freelancer, Guru, PeoplePerHour, and Toptal listings matching your skills." },
  { Icon: Database,   color: "var(--go)",     bg: "rgba(61,171,120,0.12)",   tag: "Extraction",  name: "Web Scraper",  desc: "Triggers structured data extraction from each listing: budget, bid count, required skills, and posting date." },
  { Icon: ShieldCheck,color: "var(--warn)",   bg: "var(--warn-bg)",          tag: "Intelligence",name: "Web Unlocker", desc: "Reads client history behind bot protection — total spend, hire rate, review count, and dispute records." },
  { Icon: TrendingUp, color: "var(--text-2)", bg: "rgba(255,255,255,0.05)",  tag: "Market data", name: "Datasets",     desc: "Benchmarks your target hourly rate against live P25, P50, and P75 percentile data for your exact skill stack." },
];

export default function Landing() {
  return (
    <>
      <Head>
        <title>Strikebase — Win more freelance bids</title>
        <meta name="description" content="AI-powered bid intelligence for freelancers. Know which jobs to apply for — and why — before writing a single word." />
      </Head>

      {/* NAV */}
      <nav className="nav nav-public">
        <div className="wrap nav-inner">
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon"><Zap size={14} color="#fff" /></div>
            <span className="nav-logo-text">STRIKE<span className="nav-logo-accent">BASE</span></span>
          </Link>
          <div className="nav-actions">
            <ThemeToggle />
            <Link href="/login"><button className="btn-outline-light">Sign in</button></Link>
            <Link href="/register"><button className="btn btn-primary">Get started <ArrowRight size={12} /></button></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-dots" />
        <div className="hero-glow-a" />
        <div className="hero-glow-b" />
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                <span className="hero-badge-text">Live data across 5 platforms · Updated every scan</span>
              </div>
              <h1 className="hero-h1">
                Stop bidding blind.<br />
                <span className="hero-h1-accent">Start winning.</span>
              </h1>
              <p className="hero-sub">
                The average freelancer wastes 8 hours a week on bids they can&apos;t win.
                Strikebase gives you live bid counts, client history, and market rates
                before you write a single word.
              </p>
              <div className="hero-ctas">
                <Link href="/register">
                  <button className="btn btn-primary btn-lg">Start for free <ArrowRight size={14} /></button>
                </Link>
                <Link href="/login">
                  <button className="btn-outline-light" style={{ padding: "14px 28px", borderRadius: "var(--radius)", fontFamily: "Jost, sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "var(--tr)" }}>Sign in</button>
                </Link>
              </div>
              <div className="hero-stats">
                <div><p className="hero-stat-n">5</p><p className="hero-stat-l">Platforms scanned</p></div>
                <div><p className="hero-stat-n">4</p><p className="hero-stat-l">Bright Data APIs</p></div>
                <div><p className="hero-stat-n">0–100</p><p className="hero-stat-l">AI win-probability</p></div>
              </div>
            </div>

            <div className="mock-card" style={{ borderLeft: "3px solid var(--go)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 18 }}>
                <StrikeScore score={82} size="lg" />
                <div>
                  <div style={{ display: "flex", gap: 7, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ background: "var(--go-bg)", color: "var(--go)", border: "1px solid var(--go-border)", borderRadius: "var(--radius)", padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>GO</span>
                    <span style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "2px 8px", fontSize: 10, fontWeight: 500 }}>upwork</span>
                    <span style={{ color: "var(--text-3)", fontSize: 11 }}>$75–95/hr · 4 bids</span>
                  </div>
                  <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: 16, color: "var(--text-1)", lineHeight: 1.3 }}>
                    Senior React + TypeScript Developer for SaaS Dashboard
                  </h3>
                </div>
              </div>
              <div className="stack-sm" style={{ marginBottom: 16 }}>
                {REASONS.map((r, i) => (
                  <div key={i} className="mock-reason">
                    <CheckCircle size={12} color="var(--go)" style={{ flexShrink: 0, marginTop: 2 }} />
                    {r}
                  </div>
                ))}
              </div>
              <div className="mock-tip">
                <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>Proposal opening line</p>
                <p style={{ fontSize: 12, color: "var(--text-2)", fontStyle: "italic", lineHeight: 1.65, fontWeight: 300 }}>
                  &ldquo;Reference a specific SaaS product you&apos;ve built and lead with the TypeScript architecture decision that shipped it.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sec-card">
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="sec-lbl">How it works</p>
            <h2 className="sec-h2">From skills to ranked results in 30 seconds</h2>
            <p className="sec-sub" style={{ maxWidth: 400, margin: "0 auto" }}>Four steps. Live Bright Data. Claude AI. No guesswork.</p>
          </div>
          <div className="how-grid">
            {HOW_STEPS.map(s => (
              <div key={s.num} className="how-step">
                <p className="how-step-num">{s.num}</p>
                <div className="how-step-icon" style={{ background: s.bg }}>
                  <s.Icon size={18} color={s.color} />
                </div>
                <p className="how-step-title">{s.title}</p>
                <p className="how-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOLS */}
      <section className="sec-dark">
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, gap: 24, flexWrap: "wrap" }}>
            <div>
              <p className="sec-lbl">Under the hood</p>
              <h2 className="sec-h2" style={{ maxWidth: 340 }}>4 Bright Data APIs working in concert</h2>
              <p className="sec-sub" style={{ maxWidth: 340 }}>Each scan chains four live data APIs to build a complete picture of every opportunity.</p>
            </div>
            <Link href="/register"><button className="btn btn-primary">Start free <ArrowRight size={12} /></button></Link>
          </div>
          <div className="tool-grid">
            {TOOLS.map(t => (
              <div key={t.name} className="card tool-card">
                <div className="tool-icon" style={{ background: t.bg }}>
                  <t.Icon size={18} color={t.color} />
                </div>
                <span className="tool-tag">{t.tag}</span>
                <p className="tool-name">{t.name}</p>
                <p className="tool-desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="sec-card">
        <div className="wrap">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p className="sec-lbl">Why Strikebase</p>
            <h2 className="sec-h2">Intelligence nobody else has</h2>
            <p className="sec-sub" style={{ maxWidth: 440, margin: "0 auto" }}>
              Anyone can paste a job into ChatGPT. Strikebase gives you live bid counts, client spend history, and market rates before you write a word.
            </p>
          </div>
          <div className="col-3">
            {[
              { Icon: Search,    color: "var(--gold)",  bg: "var(--gold-muted)",     title: "Real-time discovery",   desc: "SERP API scans 5 platforms in real time. No cached results, no stale listings." },
              { Icon: BarChart3, color: "var(--go)",    bg: "rgba(61,171,120,0.12)", title: "Competitive intel",      desc: "Bid counts, client spend, hire rates, and disputes — live data scraped for every result." },
              { Icon: Sparkles,  color: "var(--warn)",  bg: "var(--warn-bg)",        title: "AI scoring",             desc: "Claude scores 0–100 with data-backed reasons. GO, RISKY, or SKIP — instantly clear." },
            ].map(f => (
              <div key={f.title} className="card feat-card">
                <div className="feat-icon" style={{ background: f.bg }}><f.Icon size={18} color={f.color} /></div>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, fontWeight: 600, marginBottom: 8, color: "var(--text-1)" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sec-dark" style={{ textAlign: "center" }}>
        <div className="wrap-sm">
          <div style={{ width: 56, height: 56, background: "var(--gold)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "var(--gold-sh)" }}>
            <Zap size={24} color="#fff" />
          </div>
          <h2 className="sec-h2">Ready to stop guessing?</h2>
          <p className="sec-sub" style={{ marginBottom: 32 }}>
            Create your free account and scan live listings across 5 platforms in 30 seconds.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register"><button className="btn btn-primary btn-lg">Create free account <ArrowRight size={14} /></button></Link>
            <Link href="/login"><button className="btn-outline-light" style={{ padding: "14px 28px", borderRadius: "var(--radius)", fontFamily: "Jost, sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", transition: "var(--tr)" }}>I have an account</button></Link>
          </div>
        </div>
      </section>

      <footer className="sec-foot">
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>
          STRIKEBASE · Powered by Bright Data + Claude AI
        </p>
      </footer>
    </>
  );
}

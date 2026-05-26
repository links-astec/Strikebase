import Head from "next/head";
import Link from "next/link";
import { Zap, Search, BarChart3, Sparkles, CheckCircle, ArrowRight, Database, ShieldCheck, TrendingUp, Target, Globe } from "lucide-react";
import StrikeScore from "@/components/StrikeScore";
import ThemeToggle from "@/components/ThemeToggle";

const FEATURES = [
  { Icon: Search,     color: "var(--gold)",   bg: "var(--gold-muted)",       title: "Real-time discovery",  desc: "SERP API scans 5 platforms in real time. No cached results, no stale listings. Every scan is live." },
  { Icon: BarChart3,  color: "var(--go)",     bg: "rgba(16,185,129,0.12)",   title: "Competitive intel",    desc: "Bid counts, client spend, hire rates, and dispute records — live data scraped for every result." },
  { Icon: Sparkles,   color: "#a78bfa",       bg: "rgba(167,139,250,0.12)",  title: "AI scoring",           desc: "Claude scores each listing 0–100 with data-backed reasoning. GO, RISKY, or SKIP — instantly clear." },
  { Icon: TrendingUp, color: "var(--text-2)", bg: "rgba(255,255,255,0.06)",  title: "Market rate data",     desc: "P25/P50/P75 benchmarks for your exact skill stack. Know if your rate is competitive before you bid." },
  { Icon: ShieldCheck,color: "var(--warn)",   bg: "var(--warn-bg)",          title: "Client due diligence", desc: "Reads client history behind bot protection — total spend, hire rate, review count, dispute records." },
  { Icon: Target,     color: "var(--danger)", bg: "var(--danger-bg)",        title: "Bid timing signals",   desc: "Early-bid detection flags listings with under 5 bids so you get in before the competition spikes." },
];

const STEPS = [
  { num: "01", Icon: Target,    color: "var(--gold)",   title: "Enter your skills",  desc: "Tell Strikebase what you do and your target hourly rate." },
  { num: "02", Icon: Globe,     color: "var(--go)",     title: "Live SERP scan",     desc: "SERP API queries Google in real time across 5 major freelance platforms." },
  { num: "03", Icon: Database,  color: "var(--text-2)", title: "Deep extraction",    desc: "Web Scraper + Web Unlocker pull bids, budgets, and client history." },
  { num: "04", Icon: Sparkles,  color: "#a78bfa",       title: "AI ranking",         desc: "Claude scores each listing 0–100 with number-backed reasoning." },
];

const TEAM = [
  {
    initials: "GQ",
    name: "Gabriel Nii Attoh Quaye",
    role: "Co-founder · Full-stack Engineer",
    bio: "Builds the core platform and AI pipeline. Passionate about making tools that give freelancers a real competitive edge.",
  },
  {
    initials: "PE",
    name: "Prince Edwin Nyarko",
    role: "Co-founder · Full-stack Developer",
    bio: "Shapes the product vision and builds core features. Focused on turning complex data into clear decisions anyone can act on.",
  },
];

export default function Landing() {
  return (
    <>
      <Head>
        <title>Strikebase — Win more freelance bids</title>
        <meta name="description" content="AI-powered bid intelligence for freelancers. Know which jobs to bid on before writing a single word." />
      </Head>

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link href="/" className="lp-logo">
            <div className="lp-logo-icon"><Zap size={13} color="#fff" /></div>
            <span className="lp-logo-text">STRIKE<span className="lp-logo-accent">BASE</span></span>
          </Link>
          <div className="lp-nav-end">
            <ThemeToggle />
            <Link href="/login" className="lp-nav-link">Sign in</Link>
            <Link href="/register" className="lp-btn-nav">
              Get started <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-glow" />
        <div className="lp-hero-grid" />
        <div className="lp-wrap lp-hero-content">
          <div className="lp-badge lp-anim-1">
            <span className="lp-badge-dot" />
            Live data · 5 platforms · AI scoring
          </div>

          <h1 className="lp-h1 lp-anim-2">
            Stop bidding blind.<br />
            <span className="lp-h1-accent">Start winning.</span>
          </h1>

          <p className="lp-hero-sub lp-anim-3">
            The average freelancer wastes 8 hours a week on bids they can&apos;t win.
            Strikebase gives you live bid counts, client history, and AI-ranked scores
            before you write a single word.
          </p>

          <div className="lp-hero-ctas lp-anim-4">
            <Link href="/register" className="lp-cta-primary">
              Start for free <ArrowRight size={14} />
            </Link>
            <Link href="/login" className="lp-cta-ghost">Sign in</Link>
          </div>

          {/* Product preview */}
          <div className="lp-preview lp-anim-5">
            <div className="lp-preview-bar">
              <span className="lp-dot lp-dot-r" />
              <span className="lp-dot lp-dot-y" />
              <span className="lp-dot lp-dot-g" />
              <span className="lp-preview-url">strikebase.app · scan results</span>
            </div>
            <div className="lp-preview-body">
              <div className="lp-mock">
                <div className="lp-mock-top">
                  <StrikeScore score={82} size="lg" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lp-mock-badges">
                      <span className="lp-tag lp-tag-go">GO</span>
                      <span className="lp-tag lp-tag-platform">upwork</span>
                      <span className="lp-tag lp-tag-meta">$75–95/hr · 4 bids</span>
                    </div>
                    <p className="lp-mock-title">Senior React + TypeScript Developer for SaaS Dashboard</p>
                  </div>
                </div>
                <div className="lp-mock-reasons">
                  {[
                    "Only 4 bids — platform average is 23 at this stage",
                    "Client has $62k spent, 94% hire rate, 0 disputes on record",
                    "Your $45/hr sits at the P57 percentile for React this week",
                  ].map((r, i) => (
                    <div key={i} className="lp-mock-reason">
                      <CheckCircle size={12} color="var(--go)" style={{ flexShrink: 0, marginTop: 2 }} />
                      {r}
                    </div>
                  ))}
                </div>
                <div className="lp-mock-tip">
                  <p className="lp-mock-tip-lbl">AI Proposal Tip</p>
                  <p className="lp-mock-tip-text">&ldquo;Reference a specific SaaS product you&apos;ve built and lead with the TypeScript architecture decision that shipped it.&rdquo;</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="lp-stats-strip">
        <div className="lp-wrap lp-stats-inner">
          {[
            { n: "5",     l: "Platforms scanned" },
            { n: "4",     l: "Bright Data APIs"  },
            { n: "0–100", l: "AI win score"       },
            { n: "<30s",  l: "Time per scan"      },
          ].map(s => (
            <div key={s.l} className="lp-stat">
              <span className="lp-stat-n">{s.n}</span>
              <span className="lp-stat-l">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-sec lp-sec-alt">
        <div className="lp-wrap">
          <div className="lp-sec-hd">
            <p className="lp-sec-lbl">How it works</p>
            <h2 className="lp-sec-h2">From skills to ranked results in 30 seconds</h2>
            <p className="lp-sec-p">Four steps. Live Bright Data. Claude AI. No guesswork.</p>
          </div>
          <div className="lp-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} className="lp-step">
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-icon" style={{ color: s.color }}>
                  <s.Icon size={20} />
                </div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="lp-step-arrow"><ArrowRight size={15} /></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-sec">
        <div className="lp-wrap">
          <div className="lp-sec-hd">
            <p className="lp-sec-lbl">Why Strikebase</p>
            <h2 className="lp-sec-h2">Intelligence nobody else has</h2>
            <p className="lp-sec-p">
              Anyone can paste a job into ChatGPT. Strikebase gives you live bid counts,
              client spend history, and market rates before you write a word.
            </p>
          </div>
          <div className="lp-feat-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="lp-feat-card">
                <div className="lp-feat-icon" style={{ background: f.bg, color: f.color }}>
                  <f.Icon size={18} />
                </div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="lp-sec lp-sec-alt">
        <div className="lp-wrap">
          <div className="lp-sec-hd">
            <p className="lp-sec-lbl">About us</p>
            <h2 className="lp-sec-h2">Built by freelancers, for freelancers</h2>
            <p className="lp-sec-p">
              We built Strikebase because we were tired of spending hours researching bids manually.
              Now we spend that time actually winning them.
            </p>
          </div>
          <div className="lp-team">
            {TEAM.map(m => (
              <div key={m.name} className="lp-team-card">
                <div className="lp-team-avatar">{m.initials}</div>
                <h3 className="lp-team-name">{m.name}</h3>
                <p className="lp-team-role">{m.role}</p>
                <p className="lp-team-bio">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-sec lp-cta-section">
        <div className="lp-wrap" style={{ textAlign: "center" }}>
          <div className="lp-cta-icon"><Zap size={22} color="#fff" /></div>
          <h2 className="lp-sec-h2">Ready to stop guessing?</h2>
          <p className="lp-sec-p" style={{ marginBottom: 32 }}>
            Create your free account and scan live listings across 5 platforms in under 30 seconds.
          </p>
          <div className="lp-hero-ctas" style={{ justifyContent: "center" }}>
            <Link href="/register" className="lp-cta-primary">
              Create free account <ArrowRight size={14} />
            </Link>
            <Link href="/login" className="lp-cta-ghost">I have an account</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <Link href="/" className="lp-logo">
            <div className="lp-logo-icon" style={{ width: 26, height: 26 }}><Zap size={11} color="#fff" /></div>
            <span className="lp-logo-text" style={{ fontSize: 13 }}>STRIKE<span className="lp-logo-accent">BASE</span></span>
          </Link>
          <p className="lp-footer-copy">© 2026 Strikebase. All rights reserved.</p>
          <div className="lp-footer-links">
            <Link href="/login" className="lp-footer-link">Sign in</Link>
            <Link href="/register" className="lp-footer-link">Register</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

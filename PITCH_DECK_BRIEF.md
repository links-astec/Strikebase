# Strikebase — Pitch Deck Design Brief

---

## 1. The Brand

**Product name:** Strikebase
**One-liner:** Freelance bid intelligence. Know which jobs to bid on before you write a word.
**Tone:** Sharp. Confident. Data-driven.

---

## 2. Visual Identity

### Color Palette

| Role | Hex | Usage |
|---|---|---|
| Primary accent | `#3b82f6` | Buttons, highlights, score rings, key numbers |
| Background (dark) | `#0a0f1e` | Primary slide background |
| Surface (dark) | `#111827` | Cards, panels, containers |
| Surface elevated | `#1e2a3b` | Layered card backgrounds |
| Border | `#1e293b` | Subtle dividers and card outlines |
| Text primary | `#f1f5f9` | Headings, key numbers |
| Text secondary | `#94a3b8` | Body copy, labels |
| Text muted | `#475569` | Metadata, captions |
| GO green | `#3dab78` | Positive signals, "GO" verdict |
| RISKY amber | `#f59e0b` | Caution signals, "RISKY" verdict |
| SKIP red | `#ef4444` | Negative signals, "SKIP" verdict |
| Gold accent | `#c9a040` | Secondary highlight — use sparingly |

### Typography

| Element | Font | Weight | Notes |
|---|---|---|---|
| Slide title | Space Grotesk | 700 | Large, dominant |
| Sub-headline | Inter | 600 | Clean, medium weight |
| Body copy | Inter | 300–400 | Small, generous line height |
| Data / numbers | Space Grotesk | 700 | Make numbers large |
| Labels / caps | Inter | 600 | Uppercase, letter-spaced, small |
| Code / technical | JetBrains Mono | 400 | Technical callouts only |

Both fonts are free on Google Fonts.

### Design Language

- **Dark backgrounds throughout.** The product is dark-themed — the deck should match.
- **Glassmorphism cards** — frosted glass panels: very low-opacity white fill, 1px border, backdrop blur. Use for callout boxes, stat tiles, and score cards.
- **Electric blue glow** — `#3b82f6` should cast a soft glow wherever it appears: score rings, key stats, pipeline nodes. Not on headings.
- **Noise texture** — a very subtle grain overlay on all backgrounds, 3–5% opacity. Prevents flat dark slides from looking cheap.
- **Data is the hero visual** — score rings, numbers, and charts take the place of illustrations and stock photos.
- **Whitespace** — slides should never feel crowded. Cut content before cramming it in.
- **Grid** — 80px horizontal margin on all slides. 8px base grid.

---

## 3. Slides

### SLIDE 1 — Title

**Content:**
```
STRIKEBASE

Freelance bid intelligence.
Know which jobs to win before you write a word.

[Badge: Web Data UNLOCKED · May 2026]
```

**Layout:**
- Full bleed dark background (`#0a0f1e`) with a radial gradient — electric blue glow from center-left fading to near-black on the right.
- "STRIKEBASE" in large Space Grotesk 700, left-aligned, white, subtle blue text-shadow.
- Tagline in Inter 300, slate gray, with a thin blue vertical line to its left.
- Hackathon badge in the bottom-right corner — rounded pill, gold border, gold text, dark fill.
- Optional background element: faint concentric rings or radar chart outline, 8–10% opacity, top-right area.

---

### SLIDE 2 — The Problem

**Content:**
```
Freelancers are flying blind.

59 million freelancers in the US alone.
Win rate on most platforms: under 10%.
Average proposal: 45–90 minutes of work.

They don't know:
  → How many people are already bidding
  → Whether this client has a dispute history
  → What the market rate is this week
  → Whether their specific background is even competitive for this role

Hours wasted. Proposals sent into silence.
```

**Layout:**
- Split layout. Left: headline and copy. Right: visual.
- Right side visual: three faded/ghost job cards stacked and overlapping — each with a blurred title, blurred body text, and a "?" where the score ring should be. Communicates uncertainty without words.
- The three `→` bullets each have a red (`#ef4444`) dot or icon to their left.
- The closing line ("Hours wasted...") sits below with extra spacing above it — italic, smaller, muted.
- Keep it sparse. The emptiness reinforces the problem.

---

### SLIDE 3 — The Solution

**Content:**
```
Not just market data. Your personal win probability.

[Score ring: 91]  Senior React Developer for SaaS Dashboard
                   ✓ GO
                   React (Expert) · fintech dashboards niche — strong skill match
                   Only 4 bids — platform avg is 23
                   Client spent $62k · 94% hire rate · 0 disputes
                   Budget $75–95/hr · 30% above your target
                   "I've built three fintech dashboards in React — here's what I'd do differently..."

                   [Chat about this →]
```

**Layout:**
- This is the most important slide. Give everything room.
- Large product card mockup, centered or left-aligned. Real UI feel — dark glass card, blue left border, score ring on the left (100px+, circular progress, green/blue gradient glow), GO badge.
- The score ring is the visual anchor of this slide.
- Around the card: small floating data chips — "bid count", "hire rate", "P75 rate", and a new chip showing "React · Expert" in gold — as if data is being pulled in live.
- The first reason line should reference skill depth and niche match in gold text to draw the eye.
- Headline above the card: "Not just market data. Your personal win probability."
- Show the "Chat about this" button at the bottom-right of the card — signals the AI layer without needing a separate slide.

---

### SLIDE 4 — How It Works

**Content:**
```
Live data in. Intelligence out.

  ┌─────────────────────────────────────────────────────┐
  │  DATA LAYER          Bright Data                    │
  │  ① SERP API          Live search · 5 platforms      │
  │  ② Web Scraper API   Bid counts · budgets · skills  │
  │  ③ Web Unlocker      Client profiles · disputes     │
  │  ④ MCP Server        Tools wired into the AI layer  │
  └──────────────────────┬──────────────────────────────┘
                         ↓
  ┌─────────────────────────────────────────────────────┐
  │  BACKEND             FastAPI                        │
  │  Orchestrates the pipeline · scores each listing    │
  └──────────────────────┬──────────────────────────────┘
                         ↓
  ┌─────────────────────────────────────────────────────┐
  │  AI LAYER            Claude AI                      │
  │  Strike Score · Verdict · Reasons · Proposal angle  │
  │  AI Chat powered by AI/ML API                       │
  └──────────────────────┬──────────────────────────────┘
                         ↓
  ┌─────────────────────────────────────────────────────┐
  │  STORAGE             Supabase                       │
  │  Scan history · User profiles · Cached results      │
  └──────────────────────┬──────────────────────────────┘
                         ↓
  ┌─────────────────────────────────────────────────────┐
  │  INTERFACE           Next.js                        │
  │  Score rings · Opportunity detail · AI Chat         │
  └─────────────────────────────────────────────────────┘
```

**Layout:**
- Five horizontal layer cards stacked vertically with arrow connectors between them — reads top to bottom as a pipeline.
- Each layer card: dark glass panel with a colored left-border accent.
  - Data layer: Bright Data blue border
  - Backend: slate border
  - AI layer: gold border (Claude)
  - Storage: green border (Supabase)
  - Interface: electric blue border (Next.js)
- Inside each card: layer label in uppercase caps (10px, letter-spaced) on the left, tech name bold beside it, short description in muted text below.
- The connector arrows between cards glow electric blue — data flowing downward.
- Bright Data logo badged inside the Data layer card. Claude/Anthropic badge inside the AI layer card.
- Headline above the stack: "Live data in. Intelligence out."
- Keep the cards compact — this is a technical credibility slide, not a feature slide. The density is intentional.

---

### SLIDE 5 — The Product

**Content:**
```
[Minimal text — let the screenshots carry the slide]

Scan form           Skills with proficiency levels · Niche field · Rate · Experience
Scan results        Scored opportunity cards · Strike Score rings · Filters
Opportunity detail  Score + verdict · Skill match · Market rates · Client profile · Proposal angle
AI Chat             Ask anything about an opportunity · Streaming answers · Persistent threads
```

**Layout:**
- Lead with a close-up of the scan form — show a skill chip with the "Pro" level badge in gold (React · Pro), and the niche field filled in ("React dashboards for fintech startups"). This is a unique differentiator and should be visible.
- Below: three screens in a horizontal strip — scan results, opportunity detail, and AI Chat.
- The opportunity detail screen should show a reason line that references skill depth, e.g. "React (Expert) — strong match for primary requirement".
- The AI Chat screen shows the three-column layout with a streaming proposal response in progress.
- Maximum four text labels on this slide. Everything else is the UI.
- If screenshots aren't available at full quality, use clean wireframe mockups in the product's color palette.

---

### SLIDE 6 — The Data Moat

**Content:**
```
This product cannot exist without live web data.

                    ChatGPT    Static datasets    Strikebase
Uses live data?        ✗              ✗               ✓
Behind bot protection? ✗              ✗               ✓
Updated this week?     ✗              ✗               ✓
Cross-platform?        ✗              ✗               ✓

The insight is not in the listing.
It's in the data the listing doesn't show you.

  Client spent $47,000 → trustworthy
  31 bids in 4 hours  → skip it
  Hire rate 94%       → this client pays
```

**Layout:**
- Left half: comparison table — three columns (ChatGPT, Static datasets, Strikebase). First two columns have muted red ✗. Strikebase column has an electric blue highlight background. Minimal table style — subtle row dividers, no heavy borders.
- Right half: three glass cards stacked vertically, one data callout each. Green left border on each card, the number/stat in blue.
- The italicized line ("The insight is not in the listing...") runs full-width below, centered, as the section close.

---

### SLIDE 7 — Market

**Content:**
```
Two markets. One product.

Primary     Experienced freelancers — they want a competitive edge
Secondary   Newcomers — they need a baseline for rates and client quality

59M freelancers (US)        $1.5T gig economy
18M registered on Upwork    Growing 15% YoY

A 1% improvement in bid selection = 3–5 hours saved per week.
```

**Layout:**
- Two cards side by side: "Experienced" and "Newcomers". Brief description in each. Small icon.
- Below: four stat tiles in a row. Large number (Space Grotesk 700, 48px+) in electric blue, small muted label underneath.
- The final line ("A 1% improvement...") in a gold-bordered callout box, centered, slightly larger text.

---

### SLIDE 8 — Close

**Content:**
```
STRIKEBASE

Stop guessing. Start winning.

[QR code]   strikebase.vercel.app
            Use ?demo=true to skip signup

Next.js  ·  FastAPI  ·  Supabase  ·  Bright Data  ·  Claude AI

Web Data UNLOCKED Hackathon · May 2026
```

**Layout:**
- Mirror the title slide — same radial blue glow, same visual weight.
- "STRIKEBASE" large, centered, white.
- Tagline below it, centered, smaller.
- QR code left of center, demo URL and instruction to its right.
- Tech stack as a single row of small pill badges, centered below.
- Hackathon badge at the bottom, same style as slide 1.

---

## 4. Rules

1. Maximum 40 words of body text per slide. Speaker notes carry the detail.
2. Every number has a unit. $62k, 94%, 23 bids — not raw integers.
3. Maximum three type sizes per slide: title, label, body.
4. Blue (`#3b82f6`) is for data and active elements only — not decoration.
5. Glow effects on score rings, pipeline nodes, and CTAs only — not headings.
6. No stock photos, no clip art, no generic icons. Use the actual product UI.
7. Transitions: fade only.
8. Card spec across all slides: `#111827` background, 1px `#1e293b` border, 12px radius, 24px padding.

---

## 5. Deliverable

- **Tool:** Figma preferred. PowerPoint or Keynote acceptable.
- **Aspect ratio:** 16:9
- **Slide count:** 8
- **Fonts:** Space Grotesk + Inter (Google Fonts)
- **Export:** PDF for submission + editable source file

---

## 6. Reference

The best reference is the live product. Open it at:

**`https://strikebase.vercel.app?demo=true`** — no signup needed. Navigate to any opportunity and click "Chat about this" to reach the AI Chat.

The deck should look like the product at presentation scale — same palette, same type hierarchy, same aesthetic. Someone who sees the deck and then opens the product should feel like they're in the same world.

---

*Web Data UNLOCKED Hackathon · Deadline: May 30, 2026*

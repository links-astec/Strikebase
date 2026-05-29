# Strikebase — Video Presentation Script

**Format:** Narrated screen recording (Option A)
**Target length:** ~4 minutes
**Voice tone:** Calm, confident, slightly dry. Not excited-startup-guy. More: someone who knows the problem from the inside.

---

## SCENE 1 — The Hook `0:00–0:20`

**[SCREEN]**
Open directly on a real Upwork search results page (Google "upwork react developer" in a browser, or use a saved screenshot full-screened). Dozens of listings. No scores. No signal. Let it sit for 2 seconds. Then hard cut to Strikebase.

**[NARRATION]**
> "This is what a freelancer sees. Forty-seven listings. No signal on which one is worth their time. Most will pick based on gut — and lose."

---

## SCENE 2 — The Problem `0:20–0:50`

**[SCREEN]**
Slow zoom or pan on the Upwork listings still visible, or overlay pitch deck stat callouts as graphic inserts (not full slides — just the numbers).

**[NARRATION]**
> "59 million freelancers in the US alone. Win rate on most platforms: under 10%. The average proposal takes 45 to 90 minutes to write.
>
> The data that would change those odds exists — bid counts, client spend history, hire rates, dispute records. It's just hidden behind bot protection and scattered across five platforms.
>
> And even when you find the right listing, there's a harder question: is *your specific background* competitive for this role? Knowing the market isn't enough. You need to know where you stand in it.
>
> That's the problem Strikebase solves."

---

## SCENE 3 — The Scan `0:50–1:45`

**[SCREEN]**
Navigate to `strikebase.vercel.app?demo=true`. Scan form is visible.

1. Type "React" — chip appears. Tap the "Mid" badge on the chip so it cycles to "Pro" (turns gold). Pause for 1 second so viewers see the change.
2. Type "TypeScript" — chip appears, leave it at "Mid".
3. Click the niche field, type "fintech dashboards". Pause briefly.
4. Set rate to `$65`. Select "Senior."
5. Pause so the full form is readable. Click **Scan for opportunities**.

Show the loading state for 3–4 seconds. If scan takes longer, cut away to narration and cut back to results already loaded.

**[NARRATION]**
> "I add my skills — and for each one I set my actual proficiency level. React, I'm an expert. I can tap the badge to change it.
>
> I also describe my niche in one line: fintech dashboards. That's the context that separates a generic React dev from the right candidate for this listing.
>
> I hit scan. FastAPI kicks off the pipeline — Bright Data's SERP API searches across five platforms live. The Web Scraper API extracts bid counts, budgets, post dates from every listing. For client profiles behind bot protection, that's Bright Data's Web Unlocker.
>
> All of it feeds Claude AI, which scores each listing against both the market data and my specific profile. Results are cached in Supabase and surfaced here."

---

## SCENE 4 — The Results `1:35–2:20`

**[SCREEN]**
Results page is now loaded. Scroll slowly down — let the score rings register. Pause on a GO card (green ring, high score). Hover or linger on a SKIP card briefly to show the contrast. Don't click anything yet.

**[NARRATION]**
> "Every listing gets a Strike Score — zero to a hundred. GO, RISKY, or SKIP.
>
> Not based on the title. Based on what the listing doesn't tell you.
>
> How many people are already bidding. Whether this client has ever hired. What the market is paying this week for this exact skill set.
>
> The score is the output of that entire pipeline — one number."

*Pause. Let the score rings sit on screen for a moment.*

---

## SCENE 5 — Opportunity Detail `2:30–3:20`

**[SCREEN]**
Click into the highest-scored GO opportunity. The detail page loads. Walk through it deliberately — slow cursor movement:

1. Pause on the score ring and GO badge (2 sec)
2. Move to the first reason line — it should reference skill match ("React (Expert) — strong match for primary requirement")
3. Move to bid count — hover briefly
4. Move to the client data block — spend history, hire rate, disputes
5. Move to the proposal angle at the bottom — read the first few words aloud

**[NARRATION]**
> "This listing scores 91. And the score is personalised — it's not just about the market, it's about my fit for this specific role.
>
> First reason: React Expert is a strong match for the primary requirement. That's my skill level, checked against what this listing actually needs.
>
> Four competing bids against a platform average of 23. The client has spent $62,000, a 94% hire rate, zero disputes.
>
> Budget is $75 to $95 an hour — 30% above my target rate.
>
> And the proposal angle references my niche directly: 'I've built three fintech dashboards in React — here's what I'd approach differently for your use case.'
>
> That's not a template. It's built from my profile, the listing, and the client's history."

---

## SCENE 6 — AI Chat `3:15–3:50`

**[SCREEN]**
Click **"Chat about this"** button (top-right of the detail page). The chat page opens — show the three-column layout for one second so the structure registers. The opportunity context panel is visible on the left (score, verdict, bid count).

Click into the message input. Type: `Write me a full proposal opening for this job.`

Hit send. Show the streaming response generating — let at least 2–3 lines appear live before cutting away.

**[NARRATION]**
> "Every opportunity has a chat button.
>
> The AI has full context — the score, the client history, the market rates, the red flags. Ask it anything.
>
> I ask for a proposal opening. It writes one — not a template, not boilerplate. Built from the actual data we just scraped."

*Let the streaming text play for a moment, then cut.*

---

## SCENE 7 — The Data Moat `3:50–4:10`

**[SCREEN]**
Cut to the pitch deck comparison slide or a clean minimal graphic. Three columns: ChatGPT, Static datasets, Strikebase. Strikebase column highlighted in electric blue. Hold for 10 seconds.

**[NARRATION]**
> "This product cannot exist without live web data.
>
> Not a language model. Not a static dataset. Bright Data's SERP API, Web Scraper, Web Unlocker, and MCP Server — all four — wired into a single pipeline that runs every time you hit scan.
>
> The insight isn't in the listing. It's in the data the listing doesn't show you."

---

## SCENE 8 — Close `4:10–4:25`

**[SCREEN]**
Cut back to the scan results page — score rings visible, a GO card prominent. Let it hold. Fade the URL over the bottom: `strikebase.vercel.app · use ?demo=true`

**[NARRATION]**
> "Strikebase. Stop guessing. Start winning."

*Cut to black.*

---

## Recording Checklist

- [ ] Record screen at 1920×1080, 60fps if possible
- [ ] Record narration separately in a quiet room — phone voice memo into Audacity is cleaner than a system mic
- [ ] Slow your cursor down intentionally — fast movement reads as nervous
- [ ] Do one full run-through before recording; know exactly where you're clicking
- [ ] Keep the cursor away from the centre of key UI elements — let the content breathe
- [ ] Total narration word count: ~460 words. At a relaxed 110 wpm that's ~4:10 of speaking — aim for a 4:30–4:45 final cut with pauses and screen action

---

*Web Data UNLOCKED Hackathon · May 2026*

# Strikebase — Video Presentation Script

**Format:** Narrated screen recording (Option A)
**Target length:** ~5 minutes
**Voice tone:** Calm, direct. Talking to a freelancer who has felt this pain — not pitching to a judge. Use "you" more than "I".

---

## SCENE 1 — The Hook `0:00–0:25`

**[SCREEN]**
Open on a raw Upwork search results page — "react developer" search, 40+ listings visible. Let it sit for 3 seconds. No narration yet. Just the wall of listings. Then slowly scroll down to show there's no end to it.

**[NARRATION]**
> "You're a freelancer. You open Upwork on a Tuesday morning and you see this.
>
> Forty-seven listings. No signal on which ones are worth your time. No way to know which clients actually hire, which jobs already have thirty bids, or whether your rate even fits the budget.
>
> So you pick one that looks good. You spend an hour writing a proposal. You hear nothing.
>
> You do it again on Wednesday. And Thursday."

*Hard cut to Strikebase — scan results page loaded, score rings visible.*

---

## SCENE 2 — What Strikebase Is `0:25–0:55`

**[SCREEN]**
Hold on the Strikebase scan results page. Slowly scroll through the results — let the green GO rings and red SKIP rings register visually. Don't click anything yet.

**[NARRATION]**
> "Strikebase is a freelance bid intelligence tool. It scans every major freelance platform — Upwork, Freelancer, Guru, PeoplePerHour, and Toptal — pulls live data on every listing, and scores each one against your specific background.
>
> Every listing gets a Strike Score — zero to a hundred — and a verdict: GO, RISKY, or SKIP.
>
> GO means bid now. SKIP means don't waste your time. RISKY means there are red flags but it might still be worth it.
>
> You stop guessing. You open Strikebase, see which jobs are actually worth bidding on, and only write proposals for the ones that make sense."

*Pause. Let the score rings sit.*

---

## SCENE 3 — The Scan Form `0:55–1:45`

**[SCREEN]**
Click "New scan" or navigate back to the scan form. Walk through filling it in:

1. Type "React" — chip appears. Tap the "Mid" badge → cycles to "Pro" (turns gold). Pause 2 seconds.
2. Type "TypeScript" — chip appears, leave at "Mid".
3. Click the niche field, type "fintech dashboards". Pause briefly.
4. Set rate to `$65`. Select "Senior."
5. Pause on the completed form. Click **Scan for opportunities**.

Show loading state. Cut away if it takes more than 8 seconds, cut back to results.

**[NARRATION]**
> "Before you scan, you tell Strikebase who you are.
>
> Not just your skills — your level in each one. I'm an expert in React, competent in TypeScript. That distinction matters. A listing asking for a senior React engineer scores higher for me than for someone who's just starting out.
>
> You also describe your niche in one sentence. 'Fintech dashboards.' That one line changes every proposal angle Strikebase generates for the results.
>
> Then you hit scan.
>
> Under the hood: Bright Data's SERP API fires a live search across all five platforms. The Web Scraper extracts bid counts, budgets, required skills, and post dates from every listing. For client profiles sitting behind bot protection — spend history, hire rate, dispute records — that's Bright Data's Web Unlocker.
>
> All of that goes into Claude AI, which scores each listing against both the market data and your specific profile. At the same time, Cognee — the memory layer — queries a knowledge graph built from your previous scans. If it's seen these clients before, that intelligence feeds into the score too."

---

## SCENE 4 — The Results `1:45–2:20`

**[SCREEN]**
Results page loaded. Scroll slowly. Land on a spread of GO, RISKY, and SKIP cards. Hover briefly on:
- A high-score GO card (green ring, 88+)
- A SKIP card (low score, red ring)
Show the contrast clearly. Don't click yet.

**[NARRATION]**
> "The results come back in seconds.
>
> Each card shows the Strike Score, the verdict, the platform, and the top reason it scored the way it did.
>
> A high score doesn't just mean the budget is good. It means: low competition, a client who actually hires, a budget above your target rate, and your specific skills matching what the listing actually needs.
>
> A low score means the opposite — too many bids, a client who has never hired, a budget you'd have to negotiate hard on.
>
> The point is you know all of this before you open the listing, let alone write a word."

*Pause on the results.*

---

## SCENE 5 — Opportunity Detail `2:20–3:20`

**[SCREEN]**
Click into the highest-scoring GO card. Walk through the detail page deliberately — slow cursor:

1. Land on the score ring + GO badge. Hold 2 seconds.
2. Scroll to the "Why bid" section — first reason should reference skill match. Point to it.
3. Move to bid count stat — hover.
4. Move to the client block — total spent, hire rate, disputes. Read the numbers slowly.
5. Move to market rates section.
6. Scroll to the proposal angle. Read the full line aloud in narration.

**[NARRATION]**
> "Let's look at this one. It scores 91.
>
> Here's why.
>
> First: React Expert is a strong match for the primary skill requirement — that's my proficiency level, checked against what this job actually asks for. The score would be lower for someone who listed React as a beginner.
>
> Four competing bids. The platform average for React roles is 23. That means this job is significantly underserved — most freelancers haven't found it yet.
>
> The client has spent $62,000 on the platform. 94% hire rate. Zero disputes. This is someone who finds a freelancer and pays them. That's not common.
>
> Budget is $75 to $95 an hour — 30% above my target rate.
>
> And at the bottom — the proposal angle. Strikebase writes you a literal first sentence, specific to this listing and your background:
>
> 'I've built three fintech dashboards in React — the data visualisation complexity in your brief matches exactly what I tackled for a Series B payments startup last year.'
>
> That's not a template. That's built from the listing details, the client's history, and the niche I described. You paste it as your first line. That's how you stand out."

---

## SCENE 6 — AI Chat `3:20–3:55`

**[SCREEN]**
Click "Chat about this" (top-right of detail page). The chat page opens. Show the three-column layout briefly — thread list, context panel (score + verdict + key stats visible), chat area.

Type: `This client has a 94% hire rate but the budget is above market. Should I go higher in my bid?`

Hit send. Show the streaming response — let it run for 3–4 lines. The AI should address the specific data points (hire rate, market rates, bid count).

**[NARRATION]**
> "Found a listing you want to dig into? Every opportunity has a chat button.
>
> The AI already has the full picture — the score, the bid count, the client's history, the market rates, the red flags. You don't re-explain the context. You just ask.
>
> I want to know whether to push the rate higher given this client's history. It looks at the data and answers directly — referencing the specific numbers from this listing, not generic advice.
>
> You can ask it to write a full proposal, explain a red flag, compare this listing to your usual rate, or help you decide between two jobs. It knows what it's working with."

---

## SCENE 7 — How It's Built `3:55–4:25`

**[SCREEN]**
Cut to the pipeline slide or a clean layout showing the tech stack in layers. Hold for 15–20 seconds while narrating.

**[NARRATION]**
> "A quick look at what makes this possible.
>
> Bright Data powers the data layer — four tools: SERP API for live job discovery across five platforms, Web Scraper for structured listing data, Web Unlocker for client profiles behind bot protection, and MCP Server to wire all of it directly into the AI.
>
> Claude AI handles the scoring — turning raw scraped data and your profile into a Strike Score, a verdict, and a proposal angle.
>
> Cognee is the memory layer. Every scan you run gets stored in a knowledge graph. The next time you scan, Cognee retrieves what it knows about those clients and those market conditions — so the product gets smarter with each use.
>
> AI/ML API powers the chat. Real-time, streaming, with full opportunity context already loaded.
>
> None of this works without live data. The insight isn't in the listing — it's in the data the listing doesn't show you."

---

## SCENE 8 — Close `4:25–4:45`

**[SCREEN]**
Cut back to the scan results page — a clean spread of GO, RISKY, and SKIP cards. Score rings visible. One high-scoring card prominent.

Hold for 3 seconds, no narration. Let it breathe.

Then fade URL over the bottom: `strikebase.vercel.app · use ?demo=true`

**[NARRATION]**
> "Strikebase doesn't make you a better writer.
>
> It makes sure you only write for jobs you can actually win.
>
> Try it — no signup needed."

*Cut to black.*

---

## Recording Checklist

- [ ] Record screen at 1920×1080, 60fps if possible
- [ ] Record narration separately — phone voice memo into Audacity is cleaner than a system mic
- [ ] Pace yourself. The instinct is to rush — resist it. Pause after each key stat (bid count, client spend, score).
- [ ] Do one full run-through before recording. Know exactly what you're clicking and when.
- [ ] Slow your cursor down intentionally — fast movement reads as nervous
- [ ] In Scene 5, read the proposal angle out loud, word for word — that's the most powerful moment in the video
- [ ] In Scene 3, make the level badge visible on screen when you say "expert in React" — tap it so the viewer sees it turn gold
- [ ] If the live scan takes more than 8 seconds: cut away mid-narration and cut back to results already loaded
- [ ] Total narration word count: ~610 words. At a relaxed 110 wpm that's ~5:30 of speaking. Cut pauses tight in editing to land at ~5:00.

---

*Web Data UNLOCKED Hackathon · May 2026*

---
doc: prd
status: approved
---

# CHAOS KITCHEN — Product Requirements

Implements scope.md > The Unique Kernel and The POC Boundary. Approval basis: scoped implementation delegation in the engineering handoff, not an additional learner review.

## The Core Journey

1. See an illustrated kitchen pass and an invitation to survive dinner service. Three short instructions explain the loop.
2. Start a shift. The first ticket is deliberately simple and funny. Its required ingredients, optional bonus and exclusions are explicit.
3. Tap ingredients to add/remove them from a visible plate. Serve only a nonempty plate.
4. See customer reaction and an exact reason for success/failure. Feedback stays readable until the player calls the next ticket; clocks pause during feedback.
5. Successful service builds a combo; completed tickets advance the stage and shorten ticket time. Mistakes break the combo, not the entire run.
6. When the 90-second active-service clock ends, show a printed receipt with score, happy tables, flavor bonuses, best streak, misses and replay.

## Screens and Layout

One page, four states: welcome, playing, feedback, ended; plus a pause overlay. Desktop: dramatic title/plate on the left, paper ticket on the right, ingredient rail and serve bell below. Phone: compact masthead and HUD, ticket, plate, ingredient tray and serve control in one column. No modal marketing, sidebars or dashboard cards.

## Look and Feel

User direction translated into an orange/red hot line, cream thermal paper, near-black ink, brushed metal, oversized condensed system type, grease-pencil notes, clipped ticket edges and original SVG food illustrations. Canonical master logo signs the game; Grace is a small static floor-manager portrait, never a substituted avatar. Motion is brief and decorative; reduce-motion removes it. No essential control is obscured by steam or papers.

## Features and Behavior

### Tickets and Plate

Eight authored ingredient choices. Ticket lists required items, one optional bonus where relevant and banned items with a reason. Maximum four selected items. Every ticket is solvable. Selecting every ingredient cannot win. Fictional character humor does not mock restrictions or imply they are optional.

### Timer and Escalation

90 seconds of active play. Each ticket has 18 / 16 / 14 / 12 / 10 seconds across CALM, BUSY, DINNER RUSH, WE'RE COOKED and THE RUSH. Stages advance at 0 / 2 / 4 / 6 / 8 completed tickets, including misses. Stop elapsed time at the first deadline; service expiry wins when earlier or tied. Tab hiding automatically pauses; resumption is explicit. A relaxed practice toggle removes time pressure and ends after ten tickets, with no speed bonus or panic.

### Scoring and Reactions

Correct plate = all required, no banned items, no unrequested extras. Base 300 + optional flavor bonus 100 + up to 100 speed points, multiplied by combo 1–5. Combo rises after each pair of successes. An invalid plate or ticket timeout gives zero and resets streak. Exclusion violation never scores. Every result explains the missing, excluded or extra ingredients. No negative score spiral. Scores are local to the run, not saved or submitted.

### Panic and Pause

One panic per shift: extend current ticket by five seconds (capped at its initial time + five), without extending total service, and show a fictional chef quip. Clear plate does not cost points. Pause and resume preserve both clocks and selection. Sound starts off, is opt-in, and remains optional if unavailable.

### Finish and Replay

Receipt summarizes the run with a playful title, concrete counters and one clear replay button. Replay clears score, timer, plate, prior result and panic use. No accumulating listeners or stale timeouts.

## States and Boundaries

Welcome: no ticking clock. Playing: selections and serve active. Feedback: controls lock except next ticket, clocks stop, outcome remains visible. Paused: action controls lock and clocks stop. Ended: no scoring/actions allowed. Empty serve: disabled. Unknown ingredient IDs: rejected. Audio failure: silently keep gameplay available and label unavailable. Reload: fresh welcome; no persistence. Dietary tags are simplified game rules, not real-world allergen advice.

## Product Decisions

### Chef Mode — October 3 extension

Opt-in on welcome. Easy / Medium / Hard set prep/cook/plate station budgets to 24/32/16, 20/28/14, 16/24/12 seconds: 72/62/52 seconds per order. October 3 founder feedback requested 15–20 more seconds on Hard and distinct difficulty timing; Hard gained 20 seconds, with Easy and Medium retaining more generous budgets. Total order budget is their sum; handoff never restores total time. Overall 90-second service remains and may expire before an order budget. Station allocations are reversible tuning pending further playtesting.

Choose up to four ingredients during prep. Two explicit tasks per ingredient (rice/beans: fill pot, add ingredients; others: gather, prep). Handoff locks selection. Chicken, rice, beans and plantain use fictional warming/ready/burnt gauges; seasonings are finishing ingredients. One active pan; stop in the 1.6-second READY window, otherwise restart/remake. No real temperatures or food-safety advice. All selected cookable items must finish before plating. Tap each selected component to visibly assemble the plate; then serve under existing recipe rules. Station timeout fails the order; service timeout ends the run. Panic extends both current station and order by up to five seconds, never service time.

Pantry order shuffles per ticket on Medium/Hard and from ticket 3 on Easy; never while selecting. Keyboard numbers follow visible order. Optional Hard-mode backwards required-item names are a visual joke with normal accessible labels; narrative remains readable. Bonus text is enlarged. Existing opt-in synthesized cues signal cooking start, ready/burnt and results; no downloaded recordings. Practice removes deadlines but not cooking progression. Simultaneous pans, actual ingredient morphing/mixing, advanced sizzling sound design and cook portraits are not implemented in this slice.

Founder: one loop, mobile/desktop, playful kitchen aesthetic, no runtime AI, no backend, no publication/spend without approval. Agent-derived, reversible tuning: 90 seconds, eight ingredients, ten-ticket relaxed mode, four-item plate, numeric score and stage thresholds. These are not represented as founder chef testimony.

## What We're Building

### October 9 expansion

Continue the tested game, not a rewrite. Players can opt into a longer expanded service with 1/2/3 tables by difficulty. Each table keeps its own ingredients, station, pan and timer; other tables continue while playing, all freeze during pause/feedback. Switch using compact table buttons; keep Serve/Stop visible in the mobile dock. Show only eight choices per ticket, always including required items and bonuses. Add menu variety and condiments without a wall of tiny buttons. Each cooking method uses a clearly named action and fictional READY gauge.

Every fourth completed-order opportunity is announced as Feeding Frenzy: double valid-order points, never weaken exclusions or secretly shorten clocks. Perfect flavor orders unlock cosmetic plate treatments at 1/3/5 within the run. No financial prizes or persistent identity. A safe first-ticket tutorial has neither deadlines nor burn, and finishes after one plate. Original inspector text scene is optional/skippable. Music is generated locally, starts muted and respects hidden-tab/pause. Actual founder portrait and physical iPhone/PS5 acceptance remain open.

The complete journey above, readable controls of at least 44px, keyboard focus, text alongside color, reduced motion, reproducible tests and an offline artifact.

## Deferred From the POC

Online sharing, account scores, monetization, live avatar, data collection and runtime AI are outside the loop.

## Open Questions

Optional authentic founder story can replace fictional copy after approval; it does not block a prototype. Physical iPhone/Safari and founder fun assessment remain acceptance gates. Working-title/brand licensing and open-source license require release review.

### October 14 — Learn and replay
The final receipt shows “WE WIN OR WE LEARN.” plus one evidence-based next-shift tip. Priority: tutorial guidance; recorded misses; zero completed plates; missing flavor bonuses; all-bonus replay challenge. Coaching uses recorded aggregate outcomes only. Existing replay and menu actions stay intact. Body copy is at least 16px.

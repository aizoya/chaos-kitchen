# Chaos Kitchen — final competition pass

October 22 provenance recovery: genuine Skill Pack files and original planning artifacts were recovered with the original game archive; all 14 curriculum files match the pinned official tree. Read skill-pack-provenance.md. Earlier statements that only a late spec assertion was available are historical and superseded. The original step-by-step interview transcript remains unrecovered; final personal reflections and organizer eligibility decisions are not inferred.

Updated October 23, 2026 Pacific; current tested game/build candidate fd6d97b2fdef4b5d6c58bc124e7e8b2b8195118e. Later documentation commits do not change game bytes. See release-acceptance.md for exact commit/run/artifact mapping and historical evidence. This document does not approve production deployment or submission.

## Outcome

Give casual phone and desktop players a funny, readable, replayable restaurant rush. The judge should see a complete plate travel from ticket through prep, cooking, plating, reward, receipt and replay. AIZOYA's range is the story; entertainment is the product. Do not claim restaurant training, food-safety instruction, measured learning outcomes, or commercial traction.

## Deadline and external objective

Official deadline: October 26, 2026, 2 p.m. Pacific / 5 p.m. Eastern. Internal finish target: October 23, 2 p.m. Pacific. First prize $1,250; total cash pool $2,500. No winning outcome is guaranteed.

Official rules checked October 21 Pacific: https://learn-ai-basics.devpost.com/rules
Organizer form update: https://learn-ai-basics.devpost.com/updates/46821-two-new-questions-on-the-submission-form
Required curriculum: https://github.com/challengepost/learn-ai-basics

Design, Potential Impact, Innovation/Idea and Presentation are equally weighted. Required: new project built using the Devpost Learn Skill Pack, planning documents, a public functional source repository with an open-source license, and publicly visible YouTube/Vimeo demo footage under three minutes. The owner must complete personal attestations. Recheck the submission form before saving; a prepared document is not a submitted entry.

## Three independent gates

| Gate | Evidence now | Still needed |
| --- | --- | --- |
| Technical correctness | 59/59 Node tests, canonical checks/build, all browser journeys, inspection completion/replay/early-exit and audio/video checks passed in CI 39749109317; phone geometry at 320/390/430px × 650px | Actual iPhone/Safari and sound acceptance; real-time Medium/Hard fairness. Review preview access was verified October 22. |
| Competitive strength | Founder reports children enjoyed earlier play; distinctive authored tickets, cooking, tables, Frenzy and receipt coaching in source | Observe new players completing first plate and replay without coaching; record failures as well as praise |
| Valid submission | Public source on review branch; scope, PRD, spec, app map and license included | Approved functional judge-accessible source (default branch not itself a stated rules requirement), accessible judge play path, actual demo video, Skill Pack explanation, personal attestation and saved submission confirmation |

At October 22 inspection, main had a substantial README but src/app.mjs and LICENSE returned 404; the review branch contains the working source and license. PR #1 is draft. Do not hand judges an unqualified main-branch link until approved integration is complete. The prior preview login barrier was resolved October 22 with explicit owner approval of a single-domain exception. The review URL https://aizoya-chaos-kitchen-git-release-chaos-star-review-aizoya.vercel.app/ returned HTTP 200 with game content to an unauthenticated request. Vercel lists only that preview domain as unprotected. Production promotion remains separate and unapproved; verify access again after any later promotion.

## Product-first use of the stack

- Keep deterministic JavaScript rules, local SVG art and synthesized Web Audio for reliable play without API latency or account setup.
- Use AI engineering/review for test generation, visual refinement, adversarial checks and the explanation of how the system works.
- Use GitHub for reproducible source and review; Vercel for the approved hosted release.
- Use actual game footage and an authentic founder explanation for the demo. No film footage, borrowed critic identity, unlicensed music, or paid avatar dependency.
- Do not add AWS, NVIDIA, Supabase, runtime agents, analytics or authentication merely to display provider names. These are candidates only if a specific player outcome justifies them, their access/cost is verified, and they do not delay the complete loop. No new provider connections or spend are approved here.

Current owner check sheet and demo plan: final-owner-check.md. The original source archive retains genuine Skill Pack files and planning artifacts; all 14 curriculum files match pinned official source. The original interview transcript and complete checkpoint execution remain unverified. An organizer question is prepared, not sent. The optional inspection and replay-goal implementation do not resolve that gate.

## Ordered remaining work

1. Complete browser loop: Clock In → correct ingredients → prep → stop cooking at READY → plate → Serve → points → next order → pause/quit → receipt → replay. Repeat classic and Chef modes; cover all difficulties, invalid plates, timeout and hidden-tab recovery.
2. Inspect narrow layouts at 320, 390 and 430 CSS pixels. Primary action must remain reachable, readable and unobscured; do not shrink text or buttons to hide overflow. Real iPhone Safari acceptance is separate from Chromium emulation.
3. Check sound opt-in, track switching and mute on speakers. Check motion preferences and keyboard focus. Do not advertise physical PS5 compatibility before hardware acceptance.
4. Record a compact playtest with consent: first-plate completion, where players hesitate, optional replay choice. Do not publish children's identities, recordings or contact details. No invented engagement metrics.
5. Record the demo below from the tested release; prepare the submission, then obtain production/submission authority where outstanding.

## Demo storyboard — target 2:30, below 3:00

| Time | Actual screen/action | Narration direction |
| --- | --- | --- |
| 0:00–0:12 | Open game and start immediately | “I'm Franklyn Rosario, Founder and CEO of AIZOYA—and an executive chef. Chaos Kitchen turns dinner-service pressure into a game you can play on your phone.” |
| 0:12–0:50 | Complete a real ticket, including cooking and plating | Explain only the next visible action. Show the successful serve and points without hiding failures behind edits. |
| 0:50–1:15 | Demonstrate tables and Feeding Frenzy in actual play | Show prioritization, a bonus and a customer reaction. If this cannot be captured reliably, show the verified simpler mode instead. |
| 1:15–1:35 | Receipt, next-shift coaching, then replay | Show the outcome-based tip and reset. Explain that the feedback uses recorded game outcomes, not runtime AI. |
| 1:35–2:05 | Planning documents and app map, briefly | Explain the actual Skill Pack workflow and founder feedback: mobile actions, legible bonuses, difficulty, cooking, tables. Do not claim installation or generation evidence beyond what the records establish. |
| 2:05–2:30 | Return to gameplay and finish on one memorable reaction | “Built with AI, shaped by real chef experience, made for play.” Show the tested play link and source. |

## Submission copy — draft, owner review required

### Recording-ready phone walkthrough

Use the tested review candidate, then confirm the exact hosted build before recording. Start with Game options → Chef mode → Easy; expanded service is optional. Keep the first completed plate continuous in the recording. A retake is allowed; do not disguise a failed or simulated serve as successful live gameplay.

1. Open the title screen and show Clock In plus Show me the ropes. Briefly open Game options, choose Chef Easy, and Clock In.
2. Keep the order in view. Select Chicken, Rice and Chili; tap PREP INGREDIENTS. Complete each prep task, then tap TO COOKING.
3. Start one ingredient, wait for READY, stop it, then cook the next. Show a real gauge and the shared next-action button.
4. Tap TO PLATING, add each finished ingredient, SERVE, then show the customer reaction and points.
5. Show the next order. Pause → quit, read the actual receipt, replay, and show that the score resets.
6. Briefly show scope, PRD, spec and app map from the tested source. Finish on gameplay and the accessible play/source links.

Spoken script, with pauses for the actual actions:

“I'm Franklyn Rosario, Founder and CEO of AIZOYA, and an executive chef. Welcome to Chaos Kitchen.

Read the ticket. Respect the request. Then run the kitchen.

Choose the ingredients, prep them, and move to the hot line. Watch the gauge—stop when it's ready. Now plate it and ring the bell.

The customers have opinions. Your score does too.

The phone layout keeps the order and current task together. New players can learn one safe plate, then choose a timed shift and tougher service.

At the end, the receipt gives you one next step based on what happened. Then we clock in again.

AI helped us plan, build, test and challenge the game. Our repository includes the scope, product requirements, technical specification and app map. Gameplay uses local deterministic rules, authored tickets and original synthesized sound. The hosted page additionally requests approved visitor analytics; the downloadable game remains self-contained.

Built with AI. Shaped by real chef experience. Made for play.”

Do not add claims of measured education, retention, physical-controller acceptance or iPhone certification. Record actual iPhone results before describing them as tested. Reconcile Skill Pack use evidence before answering that required form field.

### Chef Franklyn intro — animated poster delivered; cinematic expansion brief

Franklyn supplied the authorized photograph. The review branch now includes a 12-second anime animated-poster MP4 with camera movement, captions and original synthesized music. Optional muted playback and online/offline decoding passed Chromium CI at ef62f590 (run 39736468559); actual iPhone controls and sound remain open. It contains no spoken voice or full-character motion. The storyboard below remains a future cinematic expansion, not a description of the delivered video.

Target: an original optional 12–15-second clip. This intro is separate from the competition's under-three-minute demo. It must not delay Clock In or require an API call to play.

| Time | Image/action | Audio/caption |
| --- | --- | --- |
| 0–3s | Warm restaurant pass; a ticket prints; staff notice an arrival | One original bell. Caption: “THE INSPECTOR IS HERE.” |
| 3–7s | Chef Franklyn enters; brief composed look toward the kitchen | Restaurant ambience; no borrowed music |
| 7–11s | Close-up of an original fictional Chaos Star token, then the pass | Franklyn: “Your kitchen. Your shift. Impress me.” |
| 11–15s | Title and kitchen lights flare into the game palette | Caption: “CHAOS KITCHEN · CLOCK IN.” |

Reference prompt for an approved video-production route:

Create an original, playful cinematic introduction for AIZOYA's Chaos Kitchen using the supplied authorized photograph/video of Franklyn Rosario as the identity reference. Preserve his likeness; do not invent a different face or imitate a celebrity. Show him as a composed, demanding fictional restaurant inspector arriving at a warm, energetic kitchen pass. Use stainless steel, cream paper tickets, orange heat, gentle steam and tactile kitchen details. Follow the four shots above. Humor comes from staff urgency and his calm expression. No movie footage, copied characters, restaurant-rating logos, branded uniforms, real certification claim or watermarks. Leave text/captions for local editing so spelling is exact. Deliver a clean master that can be cropped for portrait and landscape. Dialogue is the founder's approved recording if supplied; do not claim a cloned voice exists.

Founder photo input has been supplied for the anime character. Any future full-motion expansion needs an authorized production route with verified cost/watermark limits. No paid rendering, subscription or new voice model has been authorized for this clip.

Integration acceptance: local MP4 plus poster; user-initiated playback; inline phone playback; muted default with captions and explicit sound control; immediate Skip/Clock In; no repeated compulsory viewing on replay; poster fallback on unsupported playback; reduced-motion users can skip straight to play. Measure real-device startup and asset size before merging. These are future acceptance requirements, not shipped capabilities.

**Pitch:** Read the ticket. Run the kitchen. Survive the rush. Chaos Kitchen is a playful browser game shaped by an executive chef's experience: prep ingredients, time the cooking, plate the order, and earn a fictional Chaos Star while the dinner rush escalates.

**Audience and value:** Casual phone and desktop players who want a short, funny challenge with adjustable difficulty and a guided first plate. Founder-reported informal feedback suggests the game appeals to children; this is qualitative feedback, not a retention study or a claim that it has been validated for every age group.

**How AI helped:** AI assisted scoping, implementation, authored illustrations, tests and review. The repository contains scope, PRD, spec and an app map aligned with the Devpost Learn workflow. The technical spec records Skill Pack installation. Before using a stronger claim about when/how each artifact was generated, reconcile original workflow evidence; do not fabricate a tool transcript. Gameplay itself uses authored content and deterministic local rules rather than a paid model call. Hosted visitor analytics is enabled; it measures pageviews and country aggregates, not completed shifts or retention.

**Limits:** Fictional cooking and awards; no real food-safety advice, real-world prizes, accounts or runtime AI. Physical-controller and Mobile Safari claims must match completed acceptance evidence.

## New test evidence

tests/full-service.test.mjs uses public engine actions, with no injected plates, scores or results: three difficulties × four seeds × ten orders = 12 complete practice shifts / 120 successful Chef orders. It checks unique issued orders, table selection, prep/cook/plate/serve, duplicate-serve rejection, frozen paused clocks, aggregate scores, reward completion and fresh initial replay state. All three tests passed on Node 24.19.0. This is not browser evidence and does not establish timed-mode balance or enjoyment.

Historical local recovery excluded the two canonical binary artwork files; no placeholders were substituted. That local pass could not repeat asset/build/server checks. Subsequent GitHub CI did run those checks against canonical assets and passed. See release-acceptance.md; do not treat the historical local limitation as the current CI status.

## October 22 hosted verification — supersedes older access notes

Candidate fd6d97b2 passed CI 39832924641 and 39832914732 plus Vercel deployment. Hosted-only analytics received the assistant's verification visit; no external-player traction is inferred. Live cloud desktop actions verified startup, pause/resume, timeout feedback, early shift end, receipt, and replay reset. This was not a successful complete shift or an iPhone acceptance test. Standard Analytics was explicitly approved; Plus remains off. The internal company motto is absent from public game copy. See release-acceptance.md for exact boundaries.

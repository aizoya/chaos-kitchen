# Chaos Kitchen — final competition pass

Prepared October 21, 2026 Pacific; evidence reconciled October 22 UTC against review baseline 1232641f79844550cac91748ecb1fc79096e5e10. See release-acceptance.md for exact commit/run/artifact mapping and historical evidence. This document does not approve production deployment or submission.

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
| Technical correctness | 50/50 Node tests, canonical asset/build checks, classic/controller and expanded Chromium harnesses, plus real-clock Easy touch smoke passed; unchanged game build inputs mapped to review baseline | Actual iPhone/Safari and sound acceptance; real-time Medium/Hard fairness; hosted artifact/access verification |
| Competitive strength | Founder reports children enjoyed earlier play; distinctive authored tickets, cooking, tables, Frenzy and receipt coaching in source | Observe new players completing first plate and replay without coaching; record failures as well as praise |
| Valid submission | Public source on review branch; scope, PRD, spec, app map and license included | Approved functional judge-accessible source (default branch not itself a stated rules requirement), accessible judge play path, actual demo video, Skill Pack explanation, personal attestation and saved submission confirmation |

The public repository's main branch was still initialization-only at inspection. PR #1 is draft. Do not hand judges an unqualified main-branch link until approved integration is complete. The last browser attempt hit Vercel sign-in; a successful deployment is not proof of anonymous access. Do not disable preview protection to resolve this. Verify the approved production release anonymously after promotion.

## Product-first use of the stack

- Keep deterministic JavaScript rules, local SVG art and synthesized Web Audio for reliable play without API latency or account setup.
- Use AI engineering/review for test generation, visual refinement, adversarial checks and the explanation of how the system works.
- Use GitHub for reproducible source and review; Vercel for the approved hosted release.
- Use actual game footage and an authentic founder explanation for the demo. No film footage, borrowed critic identity, unlicensed music, or paid avatar dependency.
- Do not add AWS, NVIDIA, Supabase, runtime agents, analytics or authentication merely to display provider names. These are candidates only if a specific player outcome justifies them, their access/cost is verified, and they do not delay the complete loop. No new provider connections or spend are approved here.

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
| 1:15–1:35 | Receipt, “We win or we learn,” then replay | Show the outcome-based tip and reset. Explain that the feedback uses recorded game outcomes, not runtime AI. |
| 1:35–2:05 | Planning documents and app map, briefly | Explain the actual Skill Pack workflow and founder feedback: mobile actions, legible bonuses, difficulty, cooking, tables. Do not claim installation or generation evidence beyond what the records establish. |
| 2:05–2:30 | Return to gameplay and finish on one memorable reaction | “Built with AI, shaped by real chef experience, made for play. We win or we learn.” Show the tested play link and source. |

## Submission copy — draft, owner review required

**Pitch:** Read the ticket. Run the kitchen. Survive the rush. Chaos Kitchen is a playful browser game shaped by an executive chef's experience: prep ingredients, time the cooking, plate the order, and earn a fictional Chaos Star while the dinner rush escalates.

**Audience and value:** Casual phone and desktop players who want a short, funny challenge with adjustable difficulty and a guided first plate. Founder-reported informal feedback suggests the game appeals to children; this is qualitative feedback, not a retention study or a claim that it has been validated for every age group.

**How AI helped:** AI assisted scoping, implementation, authored illustrations, tests and review. The repository contains scope, PRD, spec and an app map aligned with the Devpost Learn workflow. The technical spec records Skill Pack installation. Before using a stronger claim about when/how each artifact was generated, reconcile original workflow evidence; do not fabricate a tool transcript. Gameplay itself uses authored content and deterministic local rules rather than a paid model call.

**Limits:** Fictional cooking and awards; no real food-safety advice, real-world prizes, accounts or runtime AI. Physical-controller and Mobile Safari claims must match completed acceptance evidence.

## New test evidence

tests/full-service.test.mjs uses public engine actions, with no injected plates, scores or results: three difficulties × four seeds × ten orders = 12 complete practice shifts / 120 successful Chef orders. It checks unique issued orders, table selection, prep/cook/plate/serve, duplicate-serve rejection, frozen paused clocks, aggregate scores, reward completion and fresh initial replay state. All three tests passed on Node 24.19.0. This is not browser evidence and does not establish timed-mode balance or enjoyment.

Historical local recovery excluded the two canonical binary artwork files; no placeholders were substituted. That local pass could not repeat asset/build/server checks. Subsequent GitHub CI did run those checks against canonical assets and passed. See release-acceptance.md; do not treat the historical local limitation as the current CI status.

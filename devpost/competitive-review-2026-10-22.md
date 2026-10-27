# Chaos Kitchen — competition and product benchmark

Reviewed October 22, 2026 Pacific. Review-branch head at inspection: d5dd5b845ca134f018258f72fa11d0dd579af25e. Tested game candidate: c0a5353419558c24333012c61d81e1029c7a23b6; CI 39745780922; bundle SHA-256 3c204baffae25e60288168970d880fbdabbb8add943467fde8cca7b2494dbd87.

## Verdict and evidence boundary

Competitive prototype with a completed loop and improving founder-observed phone usability; not yet cleared for submission. Future paid iPhone release remains a separate validation and release project. A first-place outcome is a target, not a forecast.

This review combines selected source inspection, existing exact-candidate automated receipts, founder screenshots/comments and current primary-source research. It is not a new full source audit, personal gameplay session, competitor playtest, exhaustive worldwide market survey, trademark clearance or external Gemini/Claude/Perplexity review.

Founder’s latest screenshot shows the compact result screen and reachable Replay/Menu; founder says it is much better. Earlier screenshots show completed shifts; music is reported audible. Exact hosted commit and device/browser version are not captured. Current CI verifies 55 Node tests, browser journeys, audio signal/mute and mobile geometry; it does not measure fun, retention or human difficulty fairness.

## Verified competition objective

Official first prize is $1,250; closing is October 26 at 2 p.m. Pacific. Stage One checks Skill Pack use and planning. Stage Two equally weights Design, Potential Impact, Innovation/Idea and Presentation; Design is the first tiebreaker. Required packaging includes functional public source, detectable open-source license, planning documents and a public YouTube/Vimeo working demo under three minutes. Judges may rely on the submission media without playing.

Organizer update requires a Skill Pack explanation and majority-age confirmation; public source belongs in Try it out. An organizer forum response says the pack should be used from the beginning; a separate response permits missing intermediate commit checkpoints for someone who used that workflow. These are different circumstances.

Sources:
- https://learn-ai-basics.devpost.com/rules
- https://learn-ai-basics.devpost.com/updates/46821-two-new-questions-on-the-submission-form
- https://learn-ai-basics.devpost.com/forum_topics/45533-subject-eligibility-question-using-learn-skill-pack-after-initial-development

## Gate findings

1. Curriculum provenance is unresolved. spec.md records installation, but that assertion alone does not prove initial chronology. Recover original scope/interview/install records and distinguish actual use from later updates. Do not recreate a fictional transcript or backdate commits. If the timeline is uncertain, prepare a narrow organizer question for Franklyn to send; no outreach was sent here.
2. Default-branch packaging is incomplete. Live main was 41aa891c82c678b70ec52578695e7987b58bc9d7. README is substantial, but src/app.mjs and LICENSE both returned 404 on main. Review branch LICENSE is present. A README describing a game does not supply its executable source. Approved integration and root license detection remain open; this review does not authorize a merge.
3. Judge access needs an anonymous end-to-end check of the exact intended release. Founder access and successful deployment status do not establish access for a judge. Do not weaken preview protection as a shortcut.
4. The 12-second anime intro is an optional game asset, not the required demonstration. Actual continuous gameplay footage, planning workflow, truthful limitations and saved submission confirmation remain necessary.
5. Medium/Hard balance has regression coverage after waiting-table changes, but the earlier adverse human-speed review is not closed by source changes alone. Test real-time play with new players. Keep the strongest verified mode in the demo.

## Benchmark: official listings and publisher descriptions

The rows below describe advertised features, not independently measured performance or retention. App Store descriptions are developer claims. Ratings/download counts are omitted because they do not establish why users return.

| Comparator | Advertised strength | What to learn | Chaos Kitchen gap / response |
| --- | --- | --- | --- |
| Good Pizza, Great Pizza — TapBlaze | Character-specific orders, restaurant upgrades and a pizza-professional origin | A focused food identity and recognizable customers can carry a game | Build recurring original guest personalities and one chef-authored inspector challenge; founder credentials alone are not differentiation |
| Cooking Mama: Let's cook! — Office Create | Touch cooking minigames, recipe variety, forgiving completion and weekly challenges | Different actions should feel different; a safe first success matters | Prep is mostly repeated button actions; prioritize visible mixing, steaming and plating feedback before gesture complexity |
| Cooking Fever — Nordcurrent | Broad cuisines, 1,000+ levels and equipment/interior upgrades; listing says internet required | A clear route of achievable goals gives another-session motivation | Add a compact authored challenge ladder; do not compete on content volume or copy its economy |
| Cooking Madness — ZenLife | Global themed restaurants, 3,000+ levels, strategic timing and achievement rewards | Each stage needs a legible objective and payoff | Existing food variety and in-shift prizes need a clearer destination and next challenge |
| Overcooked! All You Can Eat — Team17 | Assist settings, slower recipe timeouts, extended rounds and scalable UI | Fairness and accessibility are product quality | Retain practice and waiting-table safeguards; verify actual attention load rather than equating shorter clocks with better difficulty |

Sources:
- https://apps.apple.com/us/app/good-pizza-great-pizza/id911121200
- https://apps.apple.com/us/app/cooking-mama-lets-cook/id987360477
- https://apps.apple.com/us/app/cooking-fever-restaurant-game/id714796093
- https://apps.apple.com/tt/app/cooking-madness-kitchen-frenzy/id1323901884
- https://www.team17.com/news/overcooked-all-you-can-eat-updated-faqs
- https://www.team17.com/news/introducing-overcooked-all-you-can-eat

## Qualitative assessment against the rubric

Design: strongest improvement. Ticket, task and primary action are bounded on phone; result actions now stay visible. Remaining risks are first-time comprehension, full-shift fairness, interrupted audio and smaller/enlarged-text layouts. No numeric judge score is implied.

Potential Impact: weakest substantiated pitch. Entertainment is legitimate user value, but generic fun for everyone is not specific. Test the hypothesis: casual phone players who want a brief cooking challenge with a fast first success, optional pressure and encouraging feedback. No measured education, retention or stress-relief benefit is established.

Innovation: credible combination, limited novelty proof. Prep/cook/serve, timers and stars are established conventions. A distinctive chef voice, culturally grounded menu, readable short-shift format and actionable comeback coaching can form a recognizable package. The proposed inspector challenge must change play, not merely add a cutscene.

Presentation: highest immediate leverage. Lead with a working plate, demonstrate the core challenge and receipt, then show how the actual planning process and founder feedback changed the implementation. Do not lead with provider logos, long exposition or the optional intro.

## Recommended product delta, in order

P0 — close eligibility, source, judge access and actual demo gates before optional feature work.

P1 — make the first plate unmistakable. Use the existing safe tutorial as the guided route. Acceptance target: four of five consented new players serve a first plate within 60 seconds without coaching. This is a proposed small-sample usability target, not statistical proof or a reported result. Record every attempt and where users hesitate; avoid identifiable child records.

P1 — one signature Chaos Star inspection challenge. Proposal, not implemented: an original guest with a visible requirement, three manageable tickets, clear exclusion/bonus instructions and a defined fictional star result. Offer practice/retry and preserve clear loss explanations. Include culturally grounded dishes and humor approved by Franklyn. Never imply real restaurant certification or film affiliation.

P1 — make replay concrete. Proposal: show a next-shift goal based on the actual result, such as completing three plates or earning one more flavor bonus. Define goals before play; never move the target after a result. Prefer in-session challenge progression for the competition. Cross-session bests, saved unlocks and settings require a separate storage design, reset/recovery tests and honest device-local labeling; no backend or telemetry is needed by default.

P2 — sensory polish within the existing screen: ingredient lands on plate, steam while cooking, clear READY change, successful-serve reaction and short distinct success/failure cues. Reduced-motion alternatives and mute stay available. These are proposed enhancements, not claims of shipped animation.

P2 — a three-step challenge ladder before broad new menus. Teach ingredient matching, then cooking, then table pressure. Keep current modes as options; reduce simultaneous first-screen decisions. Defer more cuisines, multiplayer, stores and progression economies until new-player evidence justifies them.

## Technology allocation

| Capability | Best use now | Runtime / cost boundary |
| --- | --- | --- |
| Codex and existing AI assistants | Implement bounded deltas, test invalid actions, review timer and UI regressions | Development assistance; do not invent completed external reviews |
| Image generation | Original approved guest expressions, reaction art and consistent chef identity | Existing built-in route only; retain provenance |
| Deterministic JavaScript | Timing, eligibility, scoring, goals and outcome coaching | Keep immediate/offline and testable; no LLM scoring |
| GitHub + Playwright | Exact candidate checks, stable judge source and reproducible evidence | Existing workflow; no new paid runner/service |
| Vercel | Approved play link and release hosting | Existing preview scope; production approval remains separate |
| AWS/Bedrock, NVIDIA/Nebius, Crusoe, hosted agents | Possible later authoring/evaluation experiments when a specific need is proven | No verified project connection or authorized call is inferred; omit from this deadline build |
| Supabase / auth / leaderboards | Consider only after shared progression or fair competition is a demonstrated need | No accounts or backend for a solo short-shift game now |
| PostHog / Sentry | Later privacy-reviewed product and runtime evidence if needed | Not connected by this review; no child telemetry or recording added |
| Paid video / voice / music services | Later quality upgrade if approved and demonstrably useful | No new spend or voice cloning authorized |

Using AI during development fits the stated competition objective; runtime AI is not a separate published judging criterion. Do not describe deterministic coaching as AI inference.

## Execution through the internal target

October 22: reconcile initial Skill Pack evidence; prepare exact candidate and judge-facing package; run consented first-time tests and actual real-time difficulty checks. Preserve failures. Complete the short demo draft with the best verified mode.

October 23 internal target: close material defects, verify source/assets/license and the authorized play path, finish the public demonstration and submission fields, then obtain the remaining release/submission decisions. Freeze optional feature expansion if it jeopardizes these outcomes. Owner personally completes attestations. Official deadline remains October 26 at 2 p.m. Pacific.

## Proposed pitch

“I'm Franklyn Rosario, executive chef and Founder of AIZOYA. Chaos Kitchen turns the pressure of dinner service into a short phone game: read the ticket, prep, cook, plate and survive the rush. Finish with one practical tip and try again. Built with AI, shaped by real player feedback.”

This is positioning, not proof of retention, educational effectiveness, uniqueness, sales or prize probability. The highest-value outcome is a coherent, accessible working entry with truthful process evidence and a strong demonstration. The $1,250 is not guaranteed income.

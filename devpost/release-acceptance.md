# Chaos Kitchen — release acceptance
Updated October 22, 2026 UTC.

## Active balance remediation — supersedes prior gameplay clearance

Claude's source/automated-play review was supplied by the founder: reviewed aa6f4ce, reported real-clock Chromium successes on Easy but excessive unattended station timeouts on Medium/Hard. This is an external source and scripted-browser review, not real iPhone or uncoached human testing. Its claims that Gemini/Perplexity were unavailable apply to that review session; their documentation outputs have separately been received here. The sequence is not retroactively treated as ordered.

Change: extra initial tables and replacement tickets in expanded Chef Medium/Hard wait until first ingredient selection. Navigation does not arm a waiting ticket. Once armed, clearing or leaving it never pauses its deadlines; pans still cook/burn offscreen. Global shift time always runs. Initial active ticket, Easy and classic rules remain unchanged. This removes automatic prep expiry on untouched queued work without granting unlimited time to started work.

New regression coverage uses one simulated second before each public action and actual cooking durations, including a one-second reaction after READY. Across four seeds, initial Medium/Hard table sets can all serve bonus plates without station misses. Separate tests cover waiting clocks, arming, deselection, offscreen expiry and shift progress. This is deterministic paced simulation, not proof that novices can do it or that all authored tickets are balanced. Full CI on the changed candidate is pending; all prior bundle hashes and browser receipts below are historical until rebuilt and rerun.

Claude also reported a feedback/banner overlap at 390px. This remains an open visual reproduction item, not fixed by the timing change. Demo, rights/Skill Pack evidence, judge access and real-device gates remain open.

Internal read-only challenge found no blocking waiting-ticket logic defect; it identified misleading active-station copy, now corrected to explain that only the shift clock continues while waiting. Regression assertions also cover replacement waiting, invalid food not arming, all-waiting global expiry, and a started pan burning while another table waits. This internal check is not external-provider re-review of the fix.

## Candidate and artifact identity

Review baseline: `1232641f79844550cac91748ecb1fc79096e5e10` on `release/chaos-star-review` (draft PR #1). This is a review candidate, not an approved production release.

Built bundle SHA-256 reported by the successful expanded-browser run: `5ec5297cc5f4de26390e326f70727be68b5992ef9a402ebf664866cbedbd9802`.

GitHub recursive tree comparison on October 22 verified:
- From `aa6f4ce1a1cca071ac291249778bb0d5dc28928d` to `000d48420b7c099faee1fab944eec1dfbdd7a0b6`: only `.github/workflows/game-browser.yml` and new `scripts/real-clock-browser-test.mjs` changed.
- From that real-clock candidate to `1232641f79844550cac91748ecb1fc79096e5e10`: only this acceptance document changed.
- No files were removed. Game source, HTML, CSS, canonical assets, build scripts and package metadata are identical across all three snapshots. Later documentation-only reconciliation does not alter the game artifact.

This maps automated evidence to the review baseline by unchanged build inputs; it is not a claim that CI ran on every documentation commit or that hosted bytes were independently downloaded and hashed.

## Verified automated evidence

| Source commit | Receipt | Result and limits |
| --- | --- | --- |
| `aa6f4ce…` | [39727785430](https://github.com/aizoya/chaos-kitchen/actions/runs/39727785430) | Canonical asset/content checks, 50/50 Node tests and build passed on Node 24.19.0. Classic browser and simulated controller journeys passed. Expanded harness passed 20 cases. |
| `000d484…` | [39728159090](https://github.com/aizoya/chaos-kitchen/actions/runs/39728159090) | Repeated suite passed; real-clock Chromium touch smoke passed for classic Chef and expanded Chef Easy at 390px. |

Run success and source SHAs were rechecked through GitHub on October 22. Raw job logs were retrieved in this development chat, including both passing real-clock cases; the independent documentation reviewer did not independently inspect those logs.

Expanded harness: eight Medium/Hard cases at 320, 390, 430 and 1440px, plus twelve Clock In cases at 320, 390 and 430px with classic/expanded and intro open/skipped. Assertions cover cooking, table switching, reachable controls, receipt and replay. These cases use controlled clocks; they do not prove real-time balancing. Offline cases reported no external requests or page errors.

Real-clock smoke: normal animation clocks, public touch actions, no injected game state; prep, cooking, plating, correct serve, positive score, receipt and replay. It uses a local source server, not the hosted Vercel URL. Expanded Easy has one table; Medium/Hard real-time multi-table fairness remains unverified.

Screenshots were generated on ephemeral CI runners but were not retained or visually reviewed. Automated Chromium is not actual iPhone Safari, real sound, physical-controller or enjoyment acceptance.

## Historical evidence — October 15 only

Earlier candidate `08507c02af366dfedb8676eebb3b953becdca203` had 47/47 local tests, canonical checks and build equality passing. Vercel reported preview success (`6MumEJjrXy6jek6dokPUXYdH86Wv`). Founder reported the preview opened and Clock In started; device/browser was not recorded. These historical receipts are not the current candidate's primary test evidence.

## Independent review record

Perplexity documentation review received from the founder October 22: all four packet sections and terminal marker present; hackathon HOLD, commercial sign-off not ready. Reviewer inspected supplied documents and reported primary-source rule checks, not executable source, CI reproduction, screenshots or actual gameplay. Findings include candidate-evidence reconciliation, judge access, device acceptance, fairness/replay, rights and Skill Pack claim substantiation.

Gemini documentation review also received from the founder October 22: hackathon HOLD and commercial planning only. It read the four-document packet, not source or live gameplay. Its statements that Perplexity had not reviewed, that judge access is currently broken, and that judges will immediately disqualify/down-score are not adopted: Perplexity's review is now received, the access observation is historical, and no such judging outcome has been established. Physical PS5 acceptance is conditional on advertising hardware support, not an unconditional hackathon gate. Presence of supplied blob IDs is not independent verification of Git objects or recomputed hashes.

The candidate mapping and mixed historical headings are corrected here. Other findings remain open. Both Gemini and Perplexity documentation reviews are received; a completed Claude review of this snapshot is not received. No completed external source/gameplay review or completion of the ordered Gemini → Claude → Perplexity sequence is claimed. A later Perplexity reconciliation should use Claude's actual findings when available.

## Remaining human/device and submission acceptance

These checkboxes are hands-on or external-release requirements, distinct from passing automation:
- [ ] Actual iPhone Safari: complete a shift, see points, understand receipt and replay; record device, browser, tested candidate and outcome.
- [ ] Actual device: ticket/text readable; primary action and table switching reachable; pause/resume and tab-return recovery.
- [ ] Actual device sound: opt-in, track switching and mute.
- [ ] Real-time Medium/Hard multi-table fairness and uncoached voluntary replay observed; record failures as well as praise.
- [ ] Desktop human journey and judge-facing anonymous access to exact approved source/play URLs.
- [ ] Rights/provenance and Skill Pack claims reconciled against supplied source and workflow evidence.
- [ ] Actual under-three-minute demo recorded and publicly accessible.
- [ ] Owner attestations and saved Devpost submission confirmation.
- [ ] Physical controller acceptance if that capability will be advertised; PS5 remains deferred.

Review preview: https://aizoya-chaos-kitchen-git-release-chaos-star-review-aizoya.vercel.app

A prior browser attempt encountered sign-in and direct Vercel connector access returned 403. Successful GitHub-triggered preview deployment does not establish anonymous judge access. No preview protection is to be weakened. Production promotion and submission remain separately gated; keep PR #1 draft.

# Release acceptance — October 15, 2026

Game candidate: `08507c02af366dfedb8676eebb3b953becdca203` (PR #1).

## Verified evidence

- 47/47 local Node 24.19.0 tests pass, including build-output equality and bundled JavaScript syntax.
- Content and canonical image checks pass.
- Build emits both `dist/index.html` and `dist/Chaos-Kitchen.html` with identical game bytes.
- Vercel GitHub status reports successful preview deployment at 08:26 Pacific: `6MumEJjrXy6jek6dokPUXYdH86Wv`.
- Founder confirmed at 09:01 Pacific that the updated preview opens and Clock In starts the game. This is a user-reported startup check; exact device/browser was not recorded.

## Remaining acceptance

- [ ] Complete an order: Serve Plate responds and points are awarded.
- [ ] Finish or quit a shift: receipt coaching matches the outcome; replay resets score and clocks.
- [ ] Mobile controls and ticket remain readable and reachable during cooking and table switching.
- [ ] Sound opt-in, track selection and mute work on an actual device.
- [ ] Latest automated browser harness completes, including receipt and replay checks.
- [ ] Physical controller acceptance (PS5 deferred; simulated coverage is not hardware acceptance).

Preview: https://aizoya-chaos-kitchen-git-release-chaos-star-review-aizoya.vercel.app

Direct Vercel connector access remains denied (403). GitHub-triggered preview deployment succeeds. Neither the deployment success status nor the founder startup check proves the entire gameplay flow. Production promotion remains unapproved for this candidate; keep PR #1 draft until the applicable release checks are resolved.

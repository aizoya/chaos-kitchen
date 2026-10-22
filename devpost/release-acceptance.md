# Release acceptance — updated October 21, 2026 Pacific

## Automated Chromium evidence added October 21

Source `aa6f4ce1a1cca071ac291249778bb0d5dc28928d` passed GitHub Actions run [39727785430](https://github.com/aizoya/chaos-kitchen/actions/runs/39727785430) on Node 24.19.0 and Chromium:

- Canonical asset/content checks, all 50 Node tests, and build passed without placeholder artwork.
- Classic browser journeys and simulated controller journey passed.
- Expanded browser harness passed 20 cases: eight medium/hard gameplay cases at 320, 390, 430 and 1440px; twelve Clock In cases at 320, 390 and 430px with classic/expanded mode and intro open/skipped.
- Expanded gameplay assertions cover cooking, table switching, reachable mobile controls, receipt and replay. Expanded cases use controlled clocks and do not establish real-time balancing.
- Offline expanded cases reported zero external requests and zero page errors. Tested bundle SHA-256: `5ec5297cc5f4de26390e326f70727be68b5992ef9a402ebf664866cbedbd9802`.
- Screenshots were produced on the ephemeral runner, not retained or visually reviewed. This is automated Chromium evidence, not real Safari, sound or hardware acceptance.

## Historical startup evidence — October 15

Additional source `000d48420b7c099faee1fab944eec1dfbdd7a0b6` passed [run 39728159090](https://github.com/aizoya/chaos-kitchen/actions/runs/39728159090), repeating the checks above and adding real-clock Chromium touch smoke at 390px for classic Chef and expanded Chef Easy. Both completed prep, cooking, plating, correct serving, positive score, receipt and replay with unmodified animation clocks and no injected game state. These cases use the local source server, not the deployed Vercel URL; expanded Easy has one table, so multi-table real-time balance remains unverified. Internal static review found no blocking harness issue. Real-device gates below remain open.

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
- [x] Automated Chromium harness completes, including receipt and replay checks (run above).
- [ ] Physical controller acceptance (PS5 deferred; simulated coverage is not hardware acceptance).

Preview: https://aizoya-chaos-kitchen-git-release-chaos-star-review-aizoya.vercel.app

Direct Vercel connector access remains denied (403). GitHub-triggered preview deployment succeeds. Neither the deployment success status nor the founder startup check proves the entire gameplay flow. Production promotion remains unapproved for this candidate; keep PR #1 draft until the applicable release checks are resolved.

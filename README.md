# Chaos Kitchen — AIZOYA

Read the chaos. Cook the order. Run the pass. Clock in again.

A restaurant-rush browser game with fictional customer requests, method-specific cooking, multiple tables, Feeding Frenzy bonuses, original kitchen beats and a Chef Franklyn / Chaos Star introduction. Built for touch, keyboard and standard-mapped controllers. Chaos Star is a fictional game award.

## Run

Use Node 24 or later. No application dependency installation or API key is needed.

```sh
npm test
npm run check
npm run build
npm start
```

Open http://127.0.0.1:4173. Vercel serves `dist/index.html` at the root URL; its build runs asset checks and unit tests before bundling. The build also produces `dist/Chaos-Kitchen.html`, a standalone offline game for desktop browsers. Mobile file previews may not execute HTML; use a hosted version for phone testing. This source candidate is not a claim that the live site contains these changes.

## Play

- Choose classic plate-building or Chef mode (prep → cook → plate → serve).
- On phones, the order stays above one workspace. Choose ingredients, tap PREP, finish the tasks, then use the bottom button for cooking, plating and serving. Ingredients ↩ returns to selection; Clear and Panic stay above the action bar. The compact countdown shows the next station/order deadline.
- Clock In and the safe tutorial are the welcome screen's main actions. Open Game options for modes/difficulty. Chef Franklyn's current optional story is animated text/art; a filmed/generated video has not been supplied.
- Expanded service provides Easy/Medium/Hard with one/two/three tables and 210/180/150 seconds respectively. Classic service uses a 90-second shift.
- In expanded Chef mode, extra queued tables wait until you select their first ingredient. Selecting a table alone does not start its deadline. Once started, its clocks and pans run even while you work elsewhere; clearing a plate does not pause them. The overall shift clock always runs.
- Match the ticket, honor exclusions, and include its optional bonus for extra points.
- Watch fictional READY gauges and stop cooking before food burns. This is entertainment, not cooking or dietary-safety instruction.
- Feedback pauses the clocks. Pause and hidden-tab handling preserve the shift.
- Practice removes deadlines; cooking can still burn. “Show me the ropes” is the safe first-plate tutorial.
- The final receipt gives one recorded-outcome-based improvement under “We win or we learn.” Replay resets the shift.

Sound is optional and synthesized locally. No runtime AI, analytics, accounts, cloud persistence or paid providers. Controller behavior has simulated coverage; physical PS5 acceptance is not established.

## How it works

`src/content.mjs` holds authored tickets and ingredients. `engine.mjs` owns deterministic rules and clocks. `service.mjs` coordinates tables. `showtime.mjs` owns intro, music and receipt coaching. `app.mjs` connects input to state and rendering. `art.mjs` contains original SVG illustrations. `devpost/app-map.html` explains the core flow; historical planning amendments are in scope.md, prd.md and spec.md.

## Verification status

The pre-balance candidate passed 50 Node tests, canonical asset checks, build, classic/controller/expanded Chromium harnesses and real-clock Easy touch smoke in GitHub CI. The waiting-ticket balance change adds paced Medium/Hard regressions; its current verification is recorded in devpost/release-acceptance.md. Older browser results do not clear changed gameplay. Mobile Safari, actual speakers, physical controllers and human difficulty acceptance remain open. Automated checks do not prove visual quality or fun.

For browser verification, install Playwright and its Chromium in your development environment, then run `node scripts/expanded-browser-test.mjs`. If needed, set PLAYWRIGHT_MODULE to Playwright's absolute ESM entry and CHROMIUM_PATH to the installed Chromium executable. DOM harnesses separately require jsdom. These are development tools, not gameplay dependencies.

## Build with AI

Planning artifacts accompany the source. AI assisted scoping, implementation, authored art and tests. The required Devpost Learn workflow is documented by the official curriculum: https://github.com/challengepost/learn-ai-basics . Planning documents include historical scope and later founder-directed expansions; do not treat earlier boundaries as descriptions of the final build.

## License and release status

Game source and accompanying documentation are MIT-licensed; see LICENSE. The AIZOYA logo and Grace artwork are excluded and retain separate rights; see LICENSE-SCOPE.md and public/NOTICE.md. This exclusion also applies to their embedded bytes in the standalone build.

This source is published on a review branch. It has not been promoted to production. Browser acceptance remains open. Internal Git history and operational records are deliberately excluded.

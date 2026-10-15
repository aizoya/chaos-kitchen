---
doc: spec
status: approved
---

# CHAOS KITCHEN — Technical Spec

Approval basis: user delegates safe implementation choices within a self-contained browser MVP. No service, spending, deployment or legal choice inferred.

## How This Works, In Plain Language

Tickets are a small list we write. The browser keeps the current plate and clock in memory. A pure rules function checks the plate; the screen shows its result. Sound is made by the browser, not downloaded. Nothing is sent anywhere. Refreshing starts over.

## The Core Journey Through the System

Button click → app.mjs handler → engine.mjs action → new game state → DOM rendering and optional sound → next ticket or receipt. Implements prd.md > The Core Journey.

## Stack

Plain HTML/CSS and JavaScript modules; no application dependencies, frameworks, API keys or backend. Node >=24 for local serving, build and node:test. A zero-dependency build assembles a single offline HTML from these owned files. Tests use the existing runtime's Playwright separately, not a shipped runtime dependency.
Docs: https://nodejs.org/api/test.html ; https://nodejs.org/api/http.html ; https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API ; https://developer.mozilla.org/en-US/docs/Web/API/Performance/now ; https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API .

## Where It Runs and How Someone Tries It

`npm start` serves only project public files at http://127.0.0.1:4173. `npm test` tests rules and boundaries. `npm run build` produces dist/Chaos-Kitchen.html that can open without a server in a desktop browser. Phone acceptance needs a separately approved reachable preview; do not expose local secrets. Video and public repository are submission requirements, not private MVP build requirements; publication not yet authorized.

## Look and Feel

Implements prd.md > Look and Feel. CSS owns material texture, sizing, stage lighting and motion. Small inline SVGs own ingredient illustrations. No CDN/fonts or copyrighted recordings. Logo and portrait copied byte-for-byte from verified previous assets; hashes retained. Audio uses a short synthesized bell with a low volume envelope.

## Components

### Authored content

src/content.mjs: ingredient IDs, labels, color/illustration keys, tickets and reaction text. Each ticket has required, optional, forbidden and narrative. Validation verifies all references, no contradictions and plate-size solvability. Implements Tickets and Plate.

### Rules engine

src/engine.mjs: pure functions createGame, dispatch, judgePlate, stageFor, multiplier. Time supplied as milliseconds by caller; never read wall clock internally. Reject invalid actions and nonfinite/negative deltas. Implements scoring, timers, panic, pause and replay.

### Presentation

Mobile action follow-up: a fixed bottom bar at <=620px mirrors the current legal action, includes required-item summary and ticket time, and stays outside scrolling content. Safe-area padding and reserved body space keep content reachable. Hidden while paused/ended/welcome. Existing handlers remain the action authority; no second scoring path. Desktop is unchanged except the clearer Serve plate label.

src/app.mjs: attaches events once; renders semantic buttons and live region; uses performance.now deltas and requestAnimationFrame. Updates timer display without rebuilding focused controls. No delayed next-ticket callbacks. Visibility pauses; explicit resume resets timing anchor. Decorative art is aria-hidden. Implements all visible PRD behavior.

### Local server and build

scripts/server.mjs serves a fixed allowlist, GET/HEAD only, correct MIME and no credential handling. scripts/build.mjs inlines known module imports and local assets into a standalone HTML; fails if unexpected imports remain. No arbitrary templating or external requests.

## Data Model

Chef mode adds difficulty, station, stationRemainingMs, per-item prep counts, cooking progress/state, activePan and plated IDs. Engine owns eligibility and deadlines; UI cannot bypass prep/cook/plating through Serve. pantryFor(seed,index) produces stable per-ticket order. Cooking elapsed is capped at the earliest active deadline. No timers continue in feedback or pause. DOM rows remain stable across gauge updates to preserve focus. Build allowlist includes new engine exports. Tests: tests/chef.test.mjs and scripts/chef-dom-test.mjs (development-only jsdom, no runtime dependency).

In-memory status, mode, remainingMs, orderRemainingMs, index, selected IDs, score, streak, bestStreak, served, perfect, panicUsed and result. Paused remembers prior state. Nothing persists; no localStorage, cookies or telemetry. Tickets repeat in a shuffled authored deck after a fixed friendly opener; seed injected for reproducibility.

## File Structure

- index.html — page and all semantic regions
- styles.css — responsive kitchen art and motion
- src/content.mjs — authored tickets and ingredients
- src/engine.mjs — pure game rules
- src/art.mjs — original SVG ingredient and kitchen drawings
- src/app.mjs — UI, input, timer and sound
- src/controller.mjs — single-controller ownership and button edges; ownership retained over visibility/API interruptions
- public/ — canonical logo and Grace portrait only
- scripts/ — local server, build, hygiene checks and browser test
- tests/ — deterministic rule, content and server tests
- devpost/ — scope, PRD, spec, checklist, decisions, review, app map

## External Services and Dependencies

None at runtime. No spend. Official curriculum installed via npx skills add challengepost/learn-ai-basics --all -y (cache relocated to /tmp after read-only/default-cache failures). Browser test tools are development-only. No change to other AIZOYA projects.

## Important Failure Modes

Audio unsupported → mute with clear label. Hidden tab → pause, no surprise lost shift. Timer boundary → tick before serve, no late points. Double serve → feedback state rejects duplicate. Malformed content → tests fail before build. Long content → wrap and scroll, never hide actions. JS disabled → honest explanation, not a fake game.

## What Was Simplified and Why

Authored requests instead of runtime AI preserve timing, humor control and offline reliability. One active ticket instead of parallel queues keeps mobile readable. Visual chaos is cosmetic; it never moves controls or conceals requirements. Fixed pantry availability avoids a second inventory system.

## Decisions and Open Issues

October 9: `service.mjs` wraps the original pure engine for multi-table scheduling and aggregate score. `showtime.mjs` owns the optional original intro and synthesized music. No dependencies or providers added. Existing engine remains callable for classic play. Expanded service uses longer, difficulty-distinct service clocks and per-table deadlines; settle earliest deadline before inputs. UI renders a flat active-table view while wrapper retains other tables. Tests must cover inactive cooking, timeout ties, pause, feedback, switching, duplicate scoring, tutorial immunity and full offline build. Build and server use explicit module allowlists.

No new learner uncertainty invented. Useful engineering risk: clock correctness at pause/visibility and serve boundaries; test it before polishing. All numerical balancing is reversible proposal, not user fact. Human playtest is still required to judge fun; mechanical checks cannot establish that.

### October 14 — Receipt lesson
`showtime.mjs::shiftLesson` is a pure presentation function over aggregate counters. `app.mjs` writes its title, evidence and tip through textContent into the final receipt. No scoring or timer changes. `tests/lesson.test.mjs` verifies branch priority, zero-plate behavior and no invented failure diagnosis.

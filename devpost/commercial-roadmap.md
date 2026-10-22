# Chaos Kitchen — commercial product direction
Updated October 21, 2026 Pacific. Founder requested an eventual paid App Store game and optional purchasable features. This authorizes planning and reversible engineering, not enrollment, purchases, contracts or store publication.

## Product before payment
Finish the competition browser release first. Preserve a complete, enjoyable base game and the current offline/local rules. Do not replace gameplay work with a storefront.
Commercial hypothesis: casual players will pay for a distinctive, polished cooking challenge and new authored experiences. Informal positive feedback is not willingness-to-pay evidence.

## Candidate business model — decision pending
Evaluate a paid base game against a free starter with a one-time full-game unlock using actual player feedback. No price or revenue forecast is approved.
Later non-consumable additions may include themed kitchen/menu packs, original music and cosmetic chef/plate styles. Content packs should introduce meaningful authored challenges, not merely recolored buttons.
No paid difficulty relief, sold timer boosts, loot boxes, forced ads, artificial energy limits or subscription at launch. Accessibility, pause, readable text and fair base-game balance are not premium features.

## Sequence and acceptance
1. Competition: reliable first plate, cooking, scoring, rush, receipt and replay; mobile readability; actual demo video; verified judge access.
2. Product validation: consented playtests measuring unassisted first-plate completion and voluntary replay. Ask about willingness to pay without treating polite answers as sales. Decide intended age audience before child-directed marketing.
3. iOS feasibility: compare a bundled web-game shell with native presentation against real-device performance, safe areas, audio lifecycle, offline launch, accessibility and maintenance cost. No framework choice or automatic rewrite yet. A web wrapper does not guarantee App Store acceptance.
4. Commercial foundation: versioned local progression/settings with reset, recovery and migration tests; content IDs separate from purchasable product IDs; platform adapter separated from deterministic engine. Do not build backend accounts unless a verified player need requires them.
5. Purchase implementation after approval: use StoreKit as the default digital-unlock path; verify current storefront-specific rules. Test cancellation, pending/Ask to Buy, duplicate updates, restore, reinstall, refund/revocation and offline behavior. Never treat a local boolean as purchase proof or sell content that cannot be restored appropriately.
6. TestFlight and release: verify existing AIZOYA Apple membership/team before proposing a new enrollment. Confirm signing authority, privacy disclosures, age rating, support URL, asset rights, naming clearance and screenshot/video accuracy. Approval and App Review are separate gates.

## Verified policy sources
Checked October 21 Pacific:
- https://developer.apple.com/app-store/review/guidelines/ — sections 1.3, 3.1.1, 4.2 and 5.1.4.
- https://developer.apple.com/kids/ — age-appropriate design and parental gates.
- https://developer.apple.com/help/account/membership/program-enrollment — membership enrollment; existing account status is unverified here.

If specifically marketed for children/Kids Category, parental gates and tighter privacy/analytics rules apply. No child telemetry, advertising SDK or purchase flow is added by this plan. Do not evade applicable protections by changing the label alone.

## Support ownership
Codex: implementation, regression checks and iOS feasibility.
Parallel internal reviewer: challenge source, evidence and product assumptions; not an external-provider review.
Grace: coordinate competition readiness, benchmark commercial model, reconcile rights/age/privacy questions and arrange independent provider review.
External reviewers: Gemini first, then Claude, then Perplexity under the owner's existing review order. No external review is claimed until an actual response is received; no new API spending is authorized.

## Copy-paste assignment for Grace / independent review
Review Chaos Kitchen without restarting development.
Repo: https://github.com/aizoya/chaos-kitchen
Branch: release/chaos-star-review
Read devpost/final-countdown.md, release-acceptance.md, scope.md, prd.md, spec.md and this document; inspect current source and latest commit.
Immediate goal: October 26, 2026, 2 p.m. Pacific Devpost deadline; internal October 23 target. Later goal: a commercially credible iPhone game with optional paid content.
Challenge first-plate usability, replay value, difficulty fairness, originality, actual Skill Pack evidence, accessible judging links, and truthful demo claims. Benchmark paid base versus starter/full unlock; do not fabricate prices, conversion or revenue.
Use official Apple sources for App Review, digital purchases, restore and child-directed requirements. Distinguish internal code review from real-device tests and independent external-provider review.
Return separate verdicts for competition readiness and commercial/iOS readiness, ranked defects, exact evidence, and a short NOW/LATER list.
Arrange Gemini → Claude → Perplexity challenge reviews only within existing authorized access; no spend, publication, deployment, purchase configuration or new accounts. Report missing evidence rather than inventing it.

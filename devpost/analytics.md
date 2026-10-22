# Hosted visitor analytics

Standard Vercel Web Analytics was enabled with owner approval on October 22, 2026, including the displayed overage rate. Plus was not enabled.

Only Vercel builds (VERCEL=1) add the first-party /_vercel/insights/script.js tag to dist/index.html. The downloadable dist/Chaos-Kitchen.html and local builds contain no analytics. No custom gameplay events, precise location, session recording, or player identifiers are added. Pageviews and approximate country aggregates do not prove shifts started or completed. No historical visitor counts can be recovered by installing this now.

The optional analytics request must not gate startup. Blocking analytics leaves the complete game playable. Hosted traffic is no longer described as having zero network requests; the offline download retains that property.

Vercel Agent draft PR #2 targeted the README-only main branch and created a placeholder app. It was inspected and not merged. This integration instead changes only the existing review branch build.

Live collection and country reporting remain unverified until a hosted visit is received and visible in the dashboard.

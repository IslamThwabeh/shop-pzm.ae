# Next Session Prompt

Use this repository as the source of truth and continue from the post-April-7 deployed migration state without redoing already-verified work.

Context:
- Workspace: C:\Users\islamt\shop-pzm.ae
- Legacy reference remains read-only at C:\Users\islamt\pzm.ae
- Production domain: https://shop.pzm.ae
- Goal: finish replacement-readiness so shop.pzm.ae can fully replace pzm.ae with clean production copy, stable operations, and verified SEO/admin/email behavior.

Important workflow rules for the next chat:
- Start by reading repo memories and using codegraph memory/context tools before changing code.
- Work in small, reviewable tasks only.
- After each task, stop and ask for confirmation before starting the next one.
- Do not batch multiple large implementation areas into one turn.
- After each task, do a short review of the affected files/pages for placeholder copy, stale assumptions, broken UX, and missing verification.
- Treat weak production copy as a bug. If wording sounds internal, migration-specific, or operational rather than customer-facing, fix it before moving on.

Already completed and verified:
- Public parity foundation is live for the shared shell, homepage, services index, areas index, blog, return policy, and terms.
- Legacy-safe .html redirects/aliases are already in place where needed.
- Frontend site/api URL handling was centralized through shared site config helpers.
- Service requests persist in D1 and admin service-request management exists.
- Production transactional email delivery is active through ZeptoMail with sender no-reply@pzm.ae.
- Dedicated retail slices are live for /services/buy-iphone, /services/brand-new, and /services/secondhand.
- Live catalog coverage was expanded to 66 storefront products across new and used inventory.
- Product browsing is category-first and contact-first; standalone product-detail navigation is retired.
- Public storefront copy was simplified on 2026-04-07 to remove stock-count/status language.
- Product-feed text is sanitized at the display layer via frontend/src/utils/productPresentation.ts and mirrored in frontend/scripts/prerender-seo-routes.mjs so stock wording does not leak into prerendered HTML or preloaded JSON.
- Services and areas now follow shorter legacy-style copy patterns with direct actions instead of long explanatory blocks.
- Live catalog update already applied on 2026-04-07 for both iPhone 17 Pro Max 256GB eSIM Middle East variants: Deep Blue and Cosmic Orange are both set to AED 5100 with quantity 1.

Highest-value remaining priorities:
- Run a route-by-route final production QA pass against legacy pzm.ae and capture any remaining parity gaps.
- Perform a focused SEO verification pass on the current production deployment: titles, descriptions, canonicals, JSON-LD, sitemap, robots, internal links, and legacy redirect behavior.
- Review admin completeness and polish, especially product/service-request/order handling and any hardcoded assumptions.
- Verify order, service-request, and status-change email flows end to end on production.
- Decide and prepare for final domain cutover from shop.pzm.ae to pzm.ae when the production checklist is fully green.
- Optionally review bundle size and loading performance; current production build passes but Vite still warns about a JS chunk above 500 kB.

Suggested execution order:
1. Task 1: Run a focused production QA sweep on the main public routes and compare them against legacy pzm.ae. Produce a concise punch list of remaining parity issues only.
2. Task 2: Run SEO and crawlability verification on the live site. Fix only confirmed issues, then recheck the affected routes.
3. Task 3: Review admin-panel production readiness and fix the next highest-impact gap.
4. Task 4: Verify production email flows end to end with a narrow smoke test plan and fix wording or flow issues if needed.
5. Task 5: Prepare a final go/no-go replacement-readiness checklist for domain cutover, including exact config changes still needed for pzm.ae.

Execution requirements:
- Use codegraph memory/context tools early in each task.
- Prefer focused implementation plus verification over broad planning.
- Keep each task narrow enough to finish cleanly in one turn.
- When a task is complete, give a concise summary, note any risks or unfinished details, and ask whether to proceed.
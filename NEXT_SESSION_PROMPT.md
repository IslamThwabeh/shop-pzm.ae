# Next Session Prompt

Use this repository as the source of truth and continue from the current migration state without redoing already-verified work.

Context:
- Workspace: C:\Users\islamt\shop-pzm.ae
- Legacy source of truth remains read-only at C:\Users\islamt\pzm.ae
- Production domain: https://shop.pzm.ae
- Goal: make shop-pzm.ae fully ready to replace the old pzm.ae without placeholder content, broken flows, or incomplete operational coverage.

Important workflow rules for this chat:
- Start by reading the repo memories and using codegraph memory/context tools before making changes.
- Work in small tasks only.
- After each task is completed, stop and ask me for confirmation before starting the next one.
- Do not batch multiple large implementation areas into one turn.
- After each task, do a short review of the affected pages/files for dummy content, stale assumptions, broken UX, and missing verification.
- If you find placeholder or weak production copy such as:
  Website Design
  If the site sells web design, the lead should be stored here too
  This route gives you a first-party request capture for website-design work with a proper reference ID and contact preferences.
  • Good for brochure sites, e-commerce, and landing pages
  • Works for quote requests and discovery calls
  treat it as a production-content bug and fix it before moving on.

Already completed and verified:
- Public parity foundation is live for shared shell, services index, areas, return policy, homepage, and blog.
- Legacy-safe .html aliases are already in place where needed.
- Frontend site/api URL handling was centralized through site config helpers.
- Service requests persist in D1 and admin service-request management exists.
- Production email delivery is active through ZeptoMail with sender no-reply@pzm.ae.
- ZeptoMail DNS verification is complete and the production API token was updated and verified.
- Dedicated buy-iphone retail slice is live at /services/buy-iphone.
- Live iPhone catalog coverage was expanded to 18 storefront products across Pro Max, Pro, Air, and standard iPhone 17 families.
- Product-page scroll reset was fixed in the app shell.
- Product browsing on /shop and /services/buy-iphone now uses explicit View Details and Add to Cart actions instead of accidental one-click redirects.
- Recent continuity context is stored in repo memories and codegraph memories.

Remaining replacement-readiness priorities:
- Remove dummy, placeholder, or weak production copy across public pages and service routes.
- Build dedicated retail-parity pages for brand-new and buy-used or secondhand similar to buy-iphone.
- Review homepage, blog, and service pages again for visual/theme consistency and production polish.
- Perform full SEO verification: canonicals, titles, descriptions, JSON-LD, sitemap, robots, internal links, and legacy alias behavior.
- Review the admin panel for completeness, polish, and production-safe data handling.
- Verify all email flows end to end: order emails, service-request create emails, status-change emails, sender wording, and support guidance.
- Run a route-by-route replacement review against legacy pzm.ae and track any remaining parity gaps.
- Make sure each completed slice is reviewed before proceeding to the next one.

Suggested execution order for this new chat:
1. Task 1: Audit public pages and service routes for placeholder or dummy production copy, especially low-priority services such as website-design. Produce a punch list, fix the highest-confidence issues, review the affected pages, then stop and ask for confirmation.
2. Task 2: Build the dedicated brand-new retail slice with real production copy, live catalog usage, correct CTAs, and a short review pass. Then stop and ask for confirmation.
3. Task 3: Build the dedicated buy-used or secondhand retail slice with real production copy, live catalog usage, correct CTAs, and a short review pass. Then stop and ask for confirmation.
4. Task 4: Review the shared design and theme across homepage, service slices, shop, and blog so the site feels intentional and consistent rather than partially migrated. Fix only the highest-impact issues in this step, then stop and ask for confirmation.
5. Task 5: Run SEO and crawlability verification across the migrated public surface. Fix issues in small batches, review results, then stop and ask for confirmation.
6. Task 6: Review admin-panel completeness and production readiness, especially service requests, order management, content quality, and any hardcoded assumptions. Fix the next highest-impact gap, then stop and ask for confirmation.
7. Task 7: Run full email-flow verification and clean up wording or flow gaps if needed. Then stop and ask for confirmation.
8. Task 8: Perform a final replacement-readiness review against legacy pzm.ae, covering design, SEO, content quality, admin, checkout, emails, and service-request flows. Produce a concise go or no-go checklist and stop for confirmation.

Execution requirements:
- Use codegraph memory/context tools early in each task.
- Prefer focused implementation plus verification over broad planning.
- Keep each task narrow enough to finish cleanly in one turn.
- When a task is complete, give a concise summary, list any risks or unfinished details, and ask me whether to proceed to the next task.
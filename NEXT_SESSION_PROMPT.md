# Next Session Prompt

Use this repository as the source of truth. The Dubai delivery-pricing rollout is already live; the next session should start from cutover readiness for moving the public storefront from https://shop.pzm.ae to https://pzm.ae.

Context:
- Workspace: C:\Users\islamt\shop-pzm.ae
- Legacy reference remains read-only at C:\Users\islamt\pzm.ae
- Current live storefront: https://shop.pzm.ae
- Target public storefront: https://pzm.ae
- Frontend production deploy source: frontend/ via `npm run deploy:production`
- Backend production deploy source: backend/ via `npm run deploy:production`

Critical production notes:
- Do not rerun the full production migration chain blindly. Migration 011 uses plain ALTER TABLE, so the safe production rollout for the new delivery fields was a direct execute of migrations/012_add_order_delivery_fields.sql.
- Cloudflare Pages custom-domain setup is dashboard-managed. The repo-root CNAME file is not the live cutover switch for the current storefront deployment.

Already completed and verified:
- 2026-04-09 delivery-pricing rollout is live in production.
- Production D1 now includes orders.items_total and orders.delivery_fee.
- Backend production deployed successfully with Worker version ID 70a94258-fbb3-48c9-92b0-a7f80695dce3.
- Frontend production Pages deploy completed and live shop.pzm.ae serves bundle assets index-BPus-Kgb.js and index-adDw6oiD.css.
- Production API verification succeeded via https://shop.pzm.ae/api/products?condition=new.
- Live smoke order ord-mnrrt3by-orn1n4 verified the Dubai <= AED 500 path with items_total 450, delivery_fee 20, and total_price 470; the order was then cancelled in production.
- Backend production origin checks already include https://pzm.ae and https://www.pzm.ae.

Remaining cutover facts from the repo:
- frontend/src/utils/siteConfig.ts still defaults SITE_URL to https://shop.pzm.ae.
- frontend/scripts/prerender-seo-routes.mjs still defaults SITE_URL to https://shop.pzm.ae and injects some "via shop.pzm.ae" message text into prerendered output.
- frontend/public/robots.txt still points to https://shop.pzm.ae/sitemap.xml.
- frontend/public/sitemap.xml still contains shop.pzm.ae URLs.
- frontend/public/index.html still contains a canonical for https://shop.pzm.ae/; confirm whether it is still needed in the Pages output or should be updated/removed.
- backend/wrangler.toml production routes still expose shop.pzm.ae/api/* and r2.pzm.ae/* only; pzm.ae/api/* still needs to be added before the root-domain switch.
- Pages custom-domain routing for pzm.ae and www.pzm.ae still needs dashboard verification, along with the decision on whether shop.pzm.ae remains an alias or becomes a redirect.
- The user left an incomplete taxonomy note: "Categorization, at new devices and brand new and". Treat this as an open classification review for New Devices / Brand New / Buy iPhone / Secondhand before Merchant Center and final public cutover.

Suggested execution order:
1. Update the active frontend domain defaults in frontend/src/utils/siteConfig.ts and frontend/scripts/prerender-seo-routes.mjs, then rebuild the frontend so canonicals, JSON-LD, sitemap, and prerendered HTML move together.
2. Update backend/wrangler.toml to add the pzm.ae/api/* production route, then redeploy the backend.
3. Review frontend/public SEO artifacts actually shipped by the Pages build: robots.txt, sitemap.xml, and any legacy static index canonical behavior.
4. Redeploy the frontend from frontend/ and verify both the Pages preview URL and live pzm.ae/shop aliases before switching traffic.
5. Run a narrow production verification pass on pzm.ae: homepage, services, areas, blog, terms, return policy, cart, checkout, robots, sitemap, canonical tags, JSON-LD, and pzm.ae/api reachability.
6. Finish the ops layer after code is aligned: Merchant Center re-review, Search Console / GA4 domain checks, final catalog audit, and the open categorization cleanup.

Execution rules for the next chat:
- Start by reading repo memories and this prompt before editing code.
- Keep tasks narrow and reviewable.
- After each task, summarize what changed, what was verified, and the next blocker.
- Treat stale production-domain references as bugs, especially inside prerendered output and structured data.
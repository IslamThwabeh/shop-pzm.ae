# Next Session Prompt

Use this repository as the source of truth. The Dubai delivery-pricing rollout is already live, and the public storefront cutover to https://pzm.ae is now live. The next session should start from post-cutover SEO plus Google Search Console, Google Ads, Google Maps, and cleanup work.

Context:
- Workspace: C:\Users\islamt\shop-pzm.ae
- Legacy reference remains read-only at C:\Users\islamt\pzm.ae
- Current live storefront: https://pzm.ae
- Shop alias still active: https://shop.pzm.ae
- Frontend production deploy source: frontend/ via `npm run deploy:production`
- Backend production deploy source: backend/ via `npm run deploy:production`

Critical production notes:
- Do not rerun the full production migration chain blindly. Migration 011 uses plain ALTER TABLE, so the safe production rollout for the new delivery fields was a direct execute of migrations/012_add_order_delivery_fields.sql.
- Cloudflare Pages custom-domain setup is dashboard-managed. The repo-root CNAME file is not the live cutover switch for the current storefront deployment.

Already completed and verified:
- 2026-04-09 delivery-pricing rollout is live in production.
- Production D1 now includes orders.items_total and orders.delivery_fee.
- Backend production redeployed with root + www API routes and media URL normalization; current Worker version ID is 3f507029-205f-4c02-a4ba-74e4664e176b.
- Frontend production Pages deploy completed and live shop.pzm.ae now serves bundle assets index-D5-CWK-P.js and index-adDw6oiD.css.
- Frontend production Pages deploy completed and live pzm.ae now serves bundle assets index-DuyGW2Yi.js and index-CI1c2ZkE.css.
- Production API verification succeeded via https://shop.pzm.ae/api/products?condition=new.
- Live smoke order ord-mnrrt3by-orn1n4 verified the Dubai <= AED 500 path with items_total 450, delivery_fee 20, and total_price 470; the order was then cancelled in production.
- Backend production origin checks already include https://pzm.ae and https://www.pzm.ae.
- Code-side root cutover work is complete in repo and deployed on the shop alias: site config, prerender SEO output, robots, sitemap, root/www Worker routes, and product/media URL normalization.
- Live verification on shop.pzm.ae confirms pzm.ae canonicals, pzm.ae media URLs in prerendered product payloads, and the new production bundle.
- Root-domain cutover is now live: https://pzm.ae/api/products?condition=new returns 200 and core pages serve the new storefront.
- Product detail pages are now prerendered at /product/:id on the live site, included in https://pzm.ae/sitemap.xml, and expose Product JSON-LD.
- The user completed the Search Console sitemap resubmission and URL inspection step.
- The mobile floating cart shortcut was tightened for narrow screens and only shows when the cart has items.
- Merchant Center is intentionally disconnected and should stay out of scope unless the user explicitly asks to reconnect it.
- Google Customer Reviews prompt/telemetry and Merchant feed cleanup is in progress; keep search-facing Product schema fields that help Google Search.

Remaining follow-up facts from the repo:
- The root domain is live, but GitHub Pages cleanup on the old `pzm.ae` repo still needs to be done so the legacy workflow and custom-domain marker cannot reclaim the domain.
- Decide whether shop.pzm.ae remains a temporary alias or becomes a redirect to https://pzm.ae.
- Remove remaining Merchant-oriented repo/runtime surfaces without touching Product schema fields used for Google Search enhancements.
- Provision `GOOGLE_MAPS_API_KEY` in production so `/api/business-hours?refresh=1` returns live Google-backed hours instead of the fallback schedule.
- Reconfirm Google Ads measurement strategy: keep GA4-imported conversions only, or create native website conversions and fill the `VITE_GOOGLE_ADS_*_LABEL` vars.

Suggested execution order:
1. Finish removing Merchant feed and Google Customer Reviews runtime/operator surfaces while preserving Product schema completeness for Google Search.
2. Provision the production Google Maps API key and verify `https://pzm.ae/api/business-hours?refresh=1` reports a Google-backed source.
3. Decide whether shop.pzm.ae remains a temporary alias or becomes a redirect to https://pzm.ae, then verify storefront + API behavior on both hosts.
4. Disable GitHub Pages or remove the custom domain from the old `pzm.ae` repo so it cannot take the domain back.
5. Run a narrow production verification pass on `pzm.ae`: homepage, services, areas, blog, product pages, cart, checkout, robots, sitemap, canonical tags, and JSON-LD.
6. Finish the ops layer: Search Console follow-up, Google Ads conversion strategy confirmation, and final catalog audit.

Execution rules for the next chat:
- Start by reading repo memories and this prompt before editing code.
- Keep tasks narrow and reviewable.
- After each task, summarize what changed, what was verified, and the next blocker.
- Treat stale production-domain references as bugs, especially inside prerendered output and structured data.
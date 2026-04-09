# Next Session Prompt

Use this repository as the source of truth. The Dubai delivery-pricing rollout is already live, and the public storefront cutover to https://pzm.ae is now live. The next session should start from post-cutover SEO, Merchant Center, and cleanup work.

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
- A live Merchant Center feed is now available at https://pzm.ae/merchant-feed.xml and currently includes in-stock catalog items with pzm.ae product links and pzm.ae media URLs.
- A Merchant Center fallback feed is also live at https://pzm.ae/merchant-feed.txt for scheduled fetch compatibility.
- The user completed the Search Console sitemap resubmission and URL inspection step.
- Merchant Center business name was updated to "PZM Computers & Phones Store".
- Merchant Center scheduled fetch source was switched to https://pzm.ae/merchant-feed.txt after Google reported the original source format as unsupported.
- The mobile floating cart shortcut was tightened for narrow screens and only shows when the cart has items.

Remaining follow-up facts from the repo:
- The root domain is live, but GitHub Pages cleanup on the old `pzm.ae` repo still needs to be done so the legacy workflow and custom-domain marker cannot reclaim the domain.
- Decide whether shop.pzm.ae remains a temporary alias or becomes a redirect to https://pzm.ae.
- Merchant Center still needs the scheduled fetch to complete successfully on the new TXT source, plus diagnostics review for identifiers, landing-page match, and categorization.
- The current Merchant purchase-method warning is believed to be stale from the previous static site; re-evaluate it only after Google finishes revalidating the new storefront.
- The user left an incomplete taxonomy note: "Categorization, at new devices and brand new and". Treat this as an open classification review for New Devices / Brand New / Buy iPhone / Secondhand during Merchant cleanup.

Suggested execution order:
1. In Merchant Center, wait for or manually trigger a refresh of the scheduled fetch source at https://pzm.ae/merchant-feed.txt and review Diagnostics after processing completes.
2. Reassess the Merchant purchase-method issue only after Google has recrawled the new storefront; if it persists, inspect live product landing pages, cart, and checkout from a Googlebot-friendly no-JS path.
3. Decide whether shop.pzm.ae remains a temporary alias or becomes a redirect to https://pzm.ae, then verify storefront + API behavior on both hosts.
4. Disable GitHub Pages or remove the custom domain from the old `pzm.ae` repo so it cannot take the domain back.
5. Run a narrow production verification pass on `pzm.ae`: homepage, services, areas, blog, product pages, cart, checkout, robots, sitemap, merchant-feed.xml, merchant-feed.txt, canonical tags, and JSON-LD.
6. Finish the ops layer: GA4 domain checks, final catalog audit, and the open categorization cleanup.

Execution rules for the next chat:
- Start by reading repo memories and this prompt before editing code.
- Keep tasks narrow and reviewable.
- After each task, summarize what changed, what was verified, and the next blocker.
- Treat stale production-domain references as bugs, especially inside prerendered output and structured data.
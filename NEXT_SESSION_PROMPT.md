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
- Backend production redeployed with root + www API routes and media URL normalization; current Worker version ID is 3f507029-205f-4c02-a4ba-74e4664e176b.
- Frontend production Pages deploy completed and live shop.pzm.ae now serves bundle assets index-D5-CWK-P.js and index-adDw6oiD.css.
- Production API verification succeeded via https://shop.pzm.ae/api/products?condition=new.
- Live smoke order ord-mnrrt3by-orn1n4 verified the Dubai <= AED 500 path with items_total 450, delivery_fee 20, and total_price 470; the order was then cancelled in production.
- Backend production origin checks already include https://pzm.ae and https://www.pzm.ae.
- Code-side root cutover work is complete in repo and deployed on the shop alias: site config, prerender SEO output, robots, sitemap, root/www Worker routes, and product/media URL normalization.
- Live verification on shop.pzm.ae confirms pzm.ae canonicals, pzm.ae media URLs in prerendered product payloads, and the new production bundle.

Remaining cutover facts from the repo:
- The main blocker is now external routing: `https://pzm.ae/api/products` still returns the old GitHub Pages 404 externally even though the Worker has `pzm.ae/api/*` and `www.pzm.ae/api/*` routes attached. This means the Cloudflare DNS/custom-domain switch is not finished yet.
- Pages custom-domain routing for pzm.ae and www.pzm.ae still needs dashboard verification, along with the decision on whether shop.pzm.ae remains an alias or becomes a redirect after root cutover.
- The old `pzm.ae` repo still has a GitHub Pages workflow (`.github/workflows/static.yml`) and custom-domain marker, so GitHub Pages cleanup is still required after Cloudflare root traffic is confirmed on the new storefront.
- The user left an incomplete taxonomy note: "Categorization, at new devices and brand new and". Treat this as an open classification review for New Devices / Brand New / Buy iPhone / Secondhand before Merchant Center and final public cutover.

Suggested execution order:
1. In Cloudflare Pages and DNS, point `pzm.ae` and `www.pzm.ae` to the new Pages project and confirm they proxy through Cloudflare rather than the old GitHub Pages target.
2. Verify `https://pzm.ae/api/products?condition=new` returns JSON instead of the old GitHub 404 once the domain switch is active.
3. Decide whether `shop.pzm.ae` remains a temporary alias or becomes a redirect to `pzm.ae`, then verify storefront + API behavior on both hosts.
4. After root traffic is confirmed on the new storefront, disable GitHub Pages or remove the custom domain from the old `pzm.ae` repo so it cannot take the domain back.
5. Run a narrow production verification pass on `pzm.ae`: homepage, services, areas, blog, terms, return policy, cart, checkout, robots, sitemap, canonical tags, JSON-LD, and one checkout/service smoke flow.
6. Finish the ops layer after traffic is switched: Merchant Center re-review, Search Console / GA4 domain checks, final catalog audit, and the open categorization cleanup.

Execution rules for the next chat:
- Start by reading repo memories and this prompt before editing code.
- Keep tasks narrow and reviewable.
- After each task, summarize what changed, what was verified, and the next blocker.
- Treat stale production-domain references as bugs, especially inside prerendered output and structured data.
# QA Prompt — Arabic Localization Phase 2 (i18n, RTL, /ar/ Routes) (2026-05-10)

Use the prompt below with another AI agent for an independent QA, completeness review, and publication checklist of the Arabic Phase 2 localization work implemented and built in this session.

```text
You are performing a full QA, verification, and publish-readiness review of the Arabic Phase 2 localization implemented in the `shop-pzm.ae` repository on 2026-05-10. Your goals are:

1. Verify that every implemented component is correct and complete
2. Identify anything missed, broken, or likely to regress in production
3. Confirm what Google Search Console actions are still needed after deployment

Read every file mentioned before forming any opinion. Do not assume code is correct — read it. Check for actual Arabic content rendering, RTL layout classes, hreflang correctness, prerender output, and TypeScript type safety.

---

## Context

- Repo root: `C:\Users\islamt\shop-pzm.ae`
- Production site: `https://pzm.ae`
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS v3, built from `frontend/src/`, deployed to Cloudflare Pages
- Build command: `cd frontend && npm run build` → runs `tsc && vite build && node scripts/prerender-seo-routes.mjs`
- Build output: `frontend/dist/` — static HTML prerendered for all canonical routes
- Deployment: `wrangler pages deploy ./dist --branch main --project-name pzm-ae-frontend`
- Google Search Console property: `https://pzm.ae` (URL-prefix property)

---

## What Was Implemented

### Phase 2 Scope
Arabic core pages (`/ar/*`) for a Dubai mobile/PC shop (pzm.ae). The strategy is a **hybrid localization**: only core UI chrome and 4 service pages are translated. Product catalog, spec tables, and individual SKUs remain English-only.

### New Files Created

| File | Purpose |
|---|---|
| `frontend/src/i18n/translations.ts` | Single source of truth for all translated strings. Exports `Lang`, `useTranslations(lang)` hook, and both `en` and `ar` records (~60 keys each). |
| `frontend/src/context/LanguageContext.tsx` | Detects `/ar/` URL prefix, sets `document.documentElement.lang` and `.dir`, provides `lang`, `isRtl`, and `t()` via React context. Exports `LanguageProvider`, `useLanguage()`, `toArPath()`. |

### Modified Files

#### Routing & Orchestration
- **`frontend/src/App.tsx`** — Wrapped in `<LanguageProvider>`. Added `effectivePath` normalization to strip `/ar` prefix before route-type checks. Added `/ar/*` mirror routes for: `/ar`, `/ar/services/gaming-pc`, `/ar/services/laptop-shop`, `/ar/services/computer-shop`, `/ar/services/buy-iphone`, `/ar/return-policy` (with and without trailing slash variants).

#### SEO
- **`frontend/src/components/Seo.tsx`** — Added `hreflangPath?: string` prop. When provided, injects three `<link rel="alternate">` tags: `en-AE`, `ar-AE`, and `x-default` (pointing to English canonical).

#### Translations Wired Into Components
- **`frontend/src/components/Header.tsx`** — Imports `useLanguage()`. Builds `translatedCategories` and `translatedShopSections` arrays mapped from translation keys. Replaces all hardcoded English nav/mega-menu/contact strings with `t()` calls.
- **`frontend/src/components/Footer.tsx`** — Copyright uses `t('footerCopyright', { year })`. Removed unused `siteIdentity` import.
- **`frontend/src/components/StoreContactSection.tsx`** — All 11 hardcoded English strings replaced with `t()` calls including eyebrow, heading, body, all 3 contact cards, and store info card.
- **`frontend/src/components/WhatsAppCTA.tsx`** — `title` and `description` props default to `t('whatsappCtaDefaultTitle')` / `t('whatsappCtaDefaultDesc')`. Button label uses `t('whatsappCtaButtonLabel')`.
- **`frontend/src/pages/ServicePage.tsx`** — Imports `useLanguage()`. Conditionally resolves Arabic content (`service.ar.*`) when `lang === 'ar'`. All 14 static label strings replaced with `t()` calls. `<Seo>` receives `hreflangPath` when `service.ar` exists.

#### Content Catalog
- **`frontend/src/content/serviceCatalog.ts`** — Added `ar?: { title, heroTitle, heroDescription, highlights, localSupportTitle?, localSupportDescription?, localSupportPoints? }` field to `ServiceCatalogEntry` interface. Arabic content provided for 4 services: `gaming-pc`, `laptop-shop`, `computer-shop`, `buy-iphone`. Also fixed pre-existing bug: `secondhand` entry was missing `slug: 'secondhand'` property.

#### RTL Layout (Tailwind Logical Properties)
All directional physical Tailwind classes (`text-left`, `text-right`, `pl-`, `pr-`, `ml-`, `mr-`, `border-l`) swapped to logical equivalents (`text-start`, `text-end`, `ps-`, `pe-`, `ms-`, `me-`, `border-s`) in 20 frontend files. These flip automatically when `<html dir="rtl">` is set. Admin-facing components were intentionally excluded.

Files updated: `ServicePage.tsx`, `WhatsAppCTA.tsx`, `Footer.tsx`, `FaqAccordion.tsx`, `ConsentBanner.tsx`, `StoreHoursPanel.tsx`, `HeaderSearch.tsx`, `AreaPage.tsx`, `AreasPage.tsx`, `BlogPostPage.tsx`, `HomeAppointmentPanel.tsx`, `IphoneFamilyCard.tsx`, `ProductCard.tsx`, `VariantCard.tsx`, `BrandNewPage.tsx`, `BuyIphonePage.tsx`, `SecondhandPage.tsx`, `HomePage.tsx`, `BrandFilterChips.tsx`, `ReturnPolicyPage.tsx`.

#### Prerender Script
- **`frontend/scripts/prerender-seo-routes.mjs`** — Appended an `AR_CORE_ROUTES` block at the end that prerender 6 Arabic pages to `dist/ar/` with: `<html lang="ar" dir="rtl">`, correct canonical URL (`/ar/...`), and three hreflang `<link>` tags (`en-AE`, `ar-AE`, `x-default`).

---

## Build Result

The build completed successfully:
- `tsc` — 0 errors
- `vite build` — clean bundle
- Prerender — `Prerendered 6 Arabic core routes.`
- Output confirmed in `frontend/dist/ar/`: `index.html`, `return-policy/index.html`, `services/gaming-pc/index.html`, `services/laptop-shop/index.html`, `services/computer-shop/index.html`, `services/buy-iphone/index.html`
- Spot-check on `dist/ar/index.html` confirmed: `lang="ar"`, `dir="rtl"`, canonical `https://pzm.ae/ar/`, hreflang `en-AE → https://pzm.ae/`, `ar-AE → https://pzm.ae/ar/`, `x-default → https://pzm.ae/`

---

## QA Checklist — Read These Files

### 1. Translation Completeness
Read `frontend/src/i18n/translations.ts`:
- Verify both `en` and `ar` records have the **same set of keys** (no missing keys in `ar`).
- Verify the `useTranslations()` function applies `{var}` substitution correctly for: `footerCopyright` (`{year}`), `serviceMorePoints` (`{n}`), `serviceNeedHelp` (`{service}`).
- Verify `langSwitchLabel` is `'العربية'` in English record and `'English'` in Arabic record.

### 2. LanguageContext Logic
Read `frontend/src/context/LanguageContext.tsx`:
- Confirm language detection covers: `/ar`, `/ar/`, `/ar/services/*`, and any other `/ar/*` paths.
- Confirm `document.documentElement.dir` and `.lang` are set in a `useEffect` with correct cleanup.
- Confirm `toArPath(enPath)` correctly maps `/services/gaming-pc` → `/ar/services/gaming-pc`.
- Check: does `LanguageProvider` use `useLocation()` correctly? Is it inside `<BrowserRouter>` in the component tree?

### 3. App.tsx Route Completeness
Read `frontend/src/App.tsx`:
- Verify `/ar` and `/ar/` both render `<HomePage>`.
- Verify all 4 service page routes have both `/ar/services/{slug}` and `/ar/services/{slug}/` variants.
- Verify `/ar/return-policy` and `/ar/return-policy/` are both present.
- Check `effectivePath` logic: does it correctly strip `/ar` from `/ar` (giving `/`) and `/ar/services/buy-iphone` (giving `/services/buy-iphone`)?
- Verify `isHomeRoute`, `isServiceRoute`, `routeNeedsFullCatalog`, and `currentPage` all use `effectivePath` — not the raw `location.pathname`.

### 4. Header Translation Correctness
Read `frontend/src/components/Header.tsx`:
- Confirm `translatedCategories` maps exactly 4 items from `megaMenuCategories` using `categoryLabelKeys` and `categorySubtitleKeys`.
- Confirm `translatedShopSections` maps exactly 5 items from `megaMenuShopSections` using `shopLabelKeys` and `shopSubtitleKeys`.
- Risk: if `megaMenuCategories` or `megaMenuShopSections` in `siteData.ts` ever change their item count, the index-based key arrays will silently mis-map. Note this as a fragility.
- Verify the mobile menu also uses `translatedCategories` and `translatedShopSections` (not the original arrays).
- Verify "Repair" in both desktop nav and mobile nav uses `t('navRepair')`.
- Verify mobile contact buttons use `t('contactCardCallLabel')` and `t('contactCardWhatsappLabel')`.

### 5. ServicePage Arabic Content
Read `frontend/src/pages/ServicePage.tsx`:
- Confirm `isAr` is only true when both `lang === 'ar'` AND `service.ar` exists (not just `lang === 'ar'`).
- Confirm `heroTitle`, `heroDescription`, `highlights`, `localSupportTitle`, `localSupportDescription`, `localSupportPoints` all fall back gracefully to English when `service.ar` is undefined.
- Confirm `hreflangPath` is passed to `<Seo>` only when `service.ar` exists.
- Confirm `seoTitle` for Arabic uses `service.ar.title` (the full Arabic meta title string), not just `service.ar.heroTitle`.
- Read `frontend/src/content/serviceCatalog.ts` — verify Arabic content for all 4 services (`gaming-pc`, `laptop-shop`, `computer-shop`, `buy-iphone`) has: `title`, `heroTitle`, `heroDescription`, at minimum 3 `highlights`. Check Arabic text for obvious machine-translation artifacts or incomplete content.

### 6. Seo.tsx Hreflang Logic
Read `frontend/src/components/Seo.tsx`:
- Confirm `hreflangPath` generates: English `en-AE` → `https://pzm.ae{hreflangPath}`, Arabic `ar-AE` → `https://pzm.ae/ar{hreflangPath}`, `x-default` → same as `en-AE`.
- Important: if `hreflangPath = '/services/gaming-pc'` (no trailing slash), confirm the resulting URLs are consistent with the canonical URL pattern used for those pages elsewhere (trailing slash vs. no trailing slash). Inconsistent canonicals between hreflang and canonical tags are a GSC error.
- Confirm the `SeoProps` interface includes `hreflangPath?: string`.

### 7. Prerender Output
Check `frontend/dist/ar/index.html` and `frontend/dist/ar/services/gaming-pc/index.html`:
- `<html lang="ar" dir="rtl">` — present
- `<link rel="canonical" href="https://pzm.ae/ar/services/gaming-pc/">` — trailing slash matches Cloudflare Pages convention
- `<link rel="alternate" hrefLang="en-AE" href="https://pzm.ae/services/gaming-pc/">` — trailing slash consistent
- `<link rel="alternate" hrefLang="ar-AE" href="https://pzm.ae/ar/services/gaming-pc/">`
- `<link rel="alternate" hrefLang="x-default" href="https://pzm.ae/services/gaming-pc/">`
- `<title>` is in Arabic
- `<meta name="description">` is in Arabic
- No `<meta name="robots" content="noindex">` on these pages
- Check: does `WEBSITE_BRAND` exist as a constant in the prerender script? The Arabic prerender block references it. If it's undefined, OG tags will be broken. Search for `WEBSITE_BRAND` in `frontend/scripts/prerender-seo-routes.mjs` and confirm it is defined.

### 8. RTL Layout Verification
Spot-check 3 files for correct logical property substitutions:
- `frontend/src/pages/ServicePage.tsx` — search for any remaining `text-left`, `pl-`, `pr-` (physical) — should be 0.
- `frontend/src/components/Header.tsx` — search for `ml-`, `mr-` in non-admin contexts.
- `frontend/src/components/StoreContactSection.tsx` — search for directional physical classes.
- Known intentional physical classes to leave alone: cart badge `-right-1 -top-1` (visual convention), admin components (excluded by design).

### 9. WhatsApp Pre-filled Message on Arabic Routes
Read `frontend/src/pages/ServicePage.tsx`:
- The `prefilledMessage` prop passed to `<WhatsAppCTA>` still uses English text (e.g., `"Hi, I'm interested in..."`) even when `lang === 'ar'`. This is acceptable for Phase 2 (the WhatsApp number owner reads both languages), but note it as a known gap for Phase 3 if an Arabic-language pre-fill is desired.
- Verify the `quickContactHref` passed to `<HomeAppointmentPanel>` in the appointment section also still uses English. Same acceptable gap.

### 10. Trailing Slash / Canonical Consistency
- The `hreflangPath` passed from `ServicePage.tsx` is currently `/services/${service.slug}` (no trailing slash). Confirm whether the canonical generated by `buildCanonicalUrl('/services/gaming-pc')` in `Seo.tsx` adds a trailing slash or not. They must match.
- Check `frontend/src/components/Seo.tsx` → `buildCanonicalUrl()` to see if it normalizes trailing slashes.
- Check if the prerender script's `normalizeCanonicalPath()` adds a trailing slash — it likely does (`/services/gaming-pc/`). If `Seo.tsx` canonical is `/services/gaming-pc/` but hreflang `enHref` is `https://pzm.ae/services/gaming-pc` (no slash), GSC will flag an inconsistency.

### 11. Sitemap
Read `frontend/dist/sitemap.xml` (or the sitemap build output):
- Confirm `/ar/*` routes are NOT included in the sitemap. These are alternate-language pages; GSC discovers them via hreflang, not sitemap. Including them in the English sitemap would be incorrect.
- If they are present, they need to be removed from the `canonicalRoutes` array or marked `excludeFromSitemap: true`.

### 12. Language Switcher in UI
Search across `Header.tsx` and `Footer.tsx` for a rendered `<Link>` using `t('langSwitchLabel')` that allows users to switch between `/` and `/ar/`:
- If this link is missing, there is no in-page navigation to Arabic routes. Users can only reach `/ar/*` by typing the URL directly. This is a usability gap that should be noted.
- If it exists, verify the link logic: English page → link to `/ar/` equivalent; Arabic page → link to `/` equivalent. Check if `toArPath` or a similar utility is used.

---

## Deployment Steps (In Order)

1. **Run final build** (if not done since last code change):
   ```
   cd C:\Users\islamt\shop-pzm.ae\frontend
   npm run build
   ```
   Build must complete with 0 TypeScript errors and print `Prerendered 6 Arabic core routes.`

2. **Deploy to Cloudflare Pages**:
   ```
   cd C:\Users\islamt\shop-pzm.ae\frontend
   npx wrangler pages deploy ./dist --branch main --project-name pzm-ae-frontend
   ```
   Wait for deployment to complete and note the deployment URL.

3. **Smoke-test live Arabic routes** (after ~60 seconds propagation):
   - `curl -s -o /dev/null -w "%{http_code}" https://pzm.ae/ar/` → must be `200`
   - `curl -s -o /dev/null -w "%{http_code}" https://pzm.ae/ar/services/gaming-pc/` → must be `200`
   - `curl -s -o /dev/null -w "%{http_code}" https://pzm.ae/ar/services/laptop-shop/` → must be `200`
   - `curl -s -o /dev/null -w "%{http_code}" https://pzm.ae/ar/services/computer-shop/` → must be `200`
   - `curl -s -o /dev/null -w "%{http_code}" https://pzm.ae/ar/services/buy-iphone/` → must be `200`
   - `curl -s -o /dev/null -w "%{http_code}" https://pzm.ae/ar/return-policy/` → must be `200`

4. **Verify live HTML attributes**:
   ```
   curl -s https://pzm.ae/ar/ | grep -E 'lang=|dir=|hreflang|canonical'
   ```
   Expected output:
   ```
   <html lang="ar" dir="rtl">
   <link rel="canonical" href="https://pzm.ae/ar/" />
   <link rel="alternate" hrefLang="en-AE" href="https://pzm.ae/" />
   <link rel="alternate" hrefLang="ar-AE" href="https://pzm.ae/ar/" />
   <link rel="alternate" hrefLang="x-default" href="https://pzm.ae/" />
   ```

5. **Verify live hreflang on English service pages**:
   ```
   curl -s https://pzm.ae/services/gaming-pc/ | grep hreflang
   ```
   Expected: 3 `<link rel="alternate">` tags with `en-AE`, `ar-AE`, `x-default`.

6. **Verify English homepage is unaffected**:
   ```
   curl -s https://pzm.ae/ | grep -E 'lang=|dir='
   ```
   Expected: `<html lang="en">` — no `dir` attribute (or `dir="ltr"`). No hreflang on the homepage (it was not given `hreflangPath`).

---

## Google Search Console Actions (After Successful Deployment)

### Step 1 — Request Indexing for Arabic Core Pages
In GSC (property: `https://pzm.ae`), use the **URL Inspection** tool on each Arabic URL and click **Request Indexing**:
- `https://pzm.ae/ar/`
- `https://pzm.ae/ar/services/gaming-pc/`
- `https://pzm.ae/ar/services/laptop-shop/`
- `https://pzm.ae/ar/services/computer-shop/`
- `https://pzm.ae/ar/services/buy-iphone/`
- `https://pzm.ae/ar/return-policy/`

Before requesting indexing, click **Test Live URL** in the inspection tool and confirm:
- Page is indexable (no `noindex`)
- Canonical matches the inspected URL
- hreflang is detected

### Step 2 — Verify Hreflang in GSC Enhancement Reports
After ~1 week of crawling, check **Enhancements → International Targeting** in GSC:
- Confirm no hreflang errors are reported (missing return tags, invalid language codes, etc.)
- Hreflang requires return tags: the English page must point to the Arabic page AND the Arabic page must point back. Both sides are implemented, but GSC takes time to verify both simultaneously.

### Step 3 — Check Coverage Report for /ar/ URLs
In **Coverage → Valid** (or **Indexed**), after a few weeks, confirm Arabic URLs appear with status `Submitted and indexed` (they will not be in sitemap, so they will be `Discovered – currently not indexed` first and then graduate to indexed via hreflang signal alone).

### Step 4 — Do NOT Submit Arabic URLs to Sitemap
The `sitemap.xml` deployed to `https://pzm.ae/sitemap.xml` is English-only. Do not submit an Arabic sitemap or add `/ar/*` URLs to the existing sitemap. Google discovers hreflang alternates via crawling, not sitemap. Mixing them would add noise.

### Step 5 — Monitor After 2-4 Weeks
After indexing, check Google Search for `site:pzm.ae/ar` to see if Arabic pages appear. Expect limited visibility initially — Arabic localization SEO results take 4–8 weeks to stabilize.

---

## Known Gaps (Phase 3 Candidates)

These items were intentionally out of scope for Phase 2 and should NOT be treated as bugs:

| Gap | Impact | Phase 3 Priority |
|---|---|---|
| No language switcher link rendered in Header or Footer | Users cannot navigate to Arabic routes from the UI | HIGH — should be added before promoting Arabic routes |
| WhatsApp pre-filled message is English on Arabic routes | Minor friction; staff handles both languages | LOW |
| Product catalog pages (`/services/brand-new`, `/services/secondhand`) have no Arabic version | Catalog browsing only available in English | MEDIUM |
| Homepage has no `hreflangPath` — no hreflang on `https://pzm.ae/` | Google won't know `/ar/` is the Arabic homepage equivalent | HIGH |
| Arabic meta descriptions for service pages use the English `service.description` field | Service meta desc in Arabic is English on live page | MEDIUM |
| `BuyIphonePage.tsx` and `BrandNewPage.tsx` pages rendered under `/ar/services/buy-iphone` don't consume `useLanguage()` directly | These pages have their own React component tree; ServicePage wraps them but the inner pages don't translate themselves | MEDIUM |

---

## Risk Assessment

| Risk | Severity | Notes |
|---|---|---|
| `WEBSITE_BRAND` constant undefined in prerender script | HIGH | Would silently emit broken OG `og:site_name` tag. Must be verified before deploy. |
| `hreflangPath` trailing slash mismatch | HIGH | If canonical uses trailing slash but hreflangPath does not, GSC will report inconsistent alternate tags. |
| Language switcher absent | HIGH | Arabic pages are unreachable from normal site navigation — discoverability is crawlers-only until fixed. |
| Index-based mega-menu key arrays in Header.tsx | MEDIUM | Breaks silently if `siteData.ts` item order or count changes. |
| Arabic content only on 4 service slugs | LOW | Expected by design; `/ar/services/repair`, `/ar/services/secondhand` etc. would render but show English content. Not a bug, but could confuse Arabic-speaking visitors if they navigate there. |

---

## Files To Read (Full List)

```
frontend/src/i18n/translations.ts
frontend/src/context/LanguageContext.tsx
frontend/src/App.tsx
frontend/src/components/Seo.tsx
frontend/src/components/Header.tsx
frontend/src/components/Footer.tsx
frontend/src/components/StoreContactSection.tsx
frontend/src/components/WhatsAppCTA.tsx
frontend/src/pages/ServicePage.tsx
frontend/src/content/serviceCatalog.ts
frontend/scripts/prerender-seo-routes.mjs
frontend/dist/ar/index.html
frontend/dist/ar/services/gaming-pc/index.html
frontend/dist/sitemap.xml
```

Report every finding with: file path, line number if applicable, severity (HIGH / MEDIUM / LOW), and a specific recommendation. Do not summarize — be precise.
```

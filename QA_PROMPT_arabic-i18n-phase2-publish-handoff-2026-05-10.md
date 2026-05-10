# QA Prompt — Arabic Phase 2 Publish Handoff (2026-05-10)

Use the prompt below with a QA AI engineer for an independent verification, publish-readiness review, deployment decision, and Google Search Console follow-through for the Arabic Phase 2 localization work completed in this repository on 2026-05-10.

This prompt supersedes the earlier [QA_PROMPT_arabic-i18n-phase2-2026-05-10.md](QA_PROMPT_arabic-i18n-phase2-2026-05-10.md) for continuation work because the codebase moved materially after that prompt was created.

```text
You are performing a final QA, release-readiness review, and continuation pass for the Arabic Phase 2 localization work in the `shop-pzm.ae` repository.

Your job is to:

1. Read the implementation and verify what is already correct
2. Identify anything still incomplete, broken, or risky before publish
3. Continue the remaining verification steps required to safely deploy
4. After deployment, complete the Google Search Console actions that are actually needed

Do not assume any code is correct. Read every file listed before forming conclusions. Validate both source HTML and hydrated browser output. Prefer evidence from the current workspace, local build output, and the live site after deployment.

You are not starting from scratch. A substantial remediation pass was already completed in this session. Your task is to review that work, verify it, and finish the remaining actions.

---

## Repository Context

- Repo root: `C:\Users\islamt\shop-pzm.ae`
- Frontend app: `C:\Users\islamt\shop-pzm.ae\frontend`
- Production site: `https://pzm.ae`
- Frontend build command:
  - `cd frontend && npm run build`
  - This runs: `tsc && vite build && node scripts/prerender-seo-routes.mjs`
- Frontend local preview command:
  - `cd frontend && npm run preview -- --host 127.0.0.1 --port 4173`
- Frontend deploy command:
  - `cd frontend && npx wrangler pages deploy ./dist --branch main --project-name pzm-ae-frontend`
- Google Search Console property:
  - `https://pzm.ae`

Important local-environment note:
- During local preview in this session, `/api/products` and `/api/business-hours` failed because the backend API was not running locally.
- Treat those failures as local-environment noise unless they also reproduce on production.
- Do not misclassify missing local API data as an Arabic i18n defect.

---

## What Was Already Done In This Session

Read this section carefully before reviewing the code. These are not proposals. These are actions already taken.

### 1. Route-Control and Locale Wiring Fixes

The Arabic routes were repaired so localized service pages actually resolve to the correct shared page logic instead of falling into missing-param or English-only behavior.

Files already updated:
- `frontend/src/App.tsx`
- `frontend/src/context/LanguageContext.tsx`
- `frontend/src/components/Seo.tsx`
- `frontend/src/components/Header.tsx`
- `frontend/src/components/Footer.tsx`
- `frontend/src/pages/ServicePage.tsx`

Implemented behavior:
- Arabic service routes use param-based routing (`/ar/services/:slug` and slash variants), not fixed one-off wiring that breaks `useParams()`.
- `LanguageContext` now exposes route helpers needed by the UI and SEO flow:
  - `toEnPath()`
  - `toArPath()`
  - `toLocalizedPath()`
  - `hasArabicVariant()`
  - `toSupportedLocalizedPath()`
  - `getLanguageSwitchPath()`
- Header and footer links now preserve Arabic where Arabic variants actually exist, and intentionally fall back to English where no Arabic route exists.
- Runtime SEO now uses normalized localized canonical logic instead of treating Arabic routes as English pages with translated copy.

### 2. Arabic Page-Content Remediation

Visible Arabic content was added or repaired across the core Phase 2 pages.

Files already updated:
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/BuyIphonePage.tsx`
- `frontend/src/pages/ReturnPolicyPage.tsx`
- `frontend/src/pages/ServicePage.tsx`
- `frontend/src/components/IphoneFamilyCard.tsx`
- `frontend/src/components/HomeAppointmentPanel.tsx`

Implemented behavior:
- Home page now localizes the visible hero, section headings, featured inventory labels, trust strip, area section copy, blog section labels, FAQ labels, FAQ schema payload, and supported route cards/links.
- Return policy page now has a fully Arabic body, not just an Arabic title and date line.
- Buy iPhone page now localizes hero copy, family-card copy, CTA copy, instruction steps, related links, and WhatsApp prompt text.
- Arabic service pages now localize hero/highlights/local-support/appointment/WhatsApp copy.
- On Arabic service routes, untranslated English-only `detailSections` and `relatedLinks` are intentionally suppressed instead of leaking mixed-language content.
- Appointment panel UI on Arabic service routes is now localized for field labels, validation messages, mode cards, service labels, and submit states.

### 3. Prerender and Source-HTML Fixes

The biggest structural publish blocker was in the prerender script, not the React routes. That was repaired.

Primary file updated:
- `frontend/scripts/prerender-seo-routes.mjs`

Implemented behavior:
- `extractServiceRoutes()` now parses Arabic service metadata instead of dropping it.
- English service pages can now emit source-level return hreflang tags when an Arabic variant exists.
- Arabic core routes no longer ship head-only shells; they now include real crawlable Arabic root HTML in `dist/ar/...`.
- Arabic prerender output now includes Arabic content snapshots for:
  - `/ar/`
  - `/ar/services/gaming-pc/`
  - `/ar/services/laptop-shop/`
  - `/ar/services/computer-shop/`
  - `/ar/services/buy-iphone/`
  - `/ar/return-policy/`
- Alternate links now use `hreflang` consistently and were aligned with runtime head behavior.
- Arabic return-policy prerender output now uses Arabic last-updated copy.

### 4. Validation Already Performed

These checks were already executed and passed unless otherwise noted.

Build validation already run multiple times:
- `cd frontend && npm run build`
- Result: success
- `tsc`: passed
- `vite build`: passed
- prerender script: passed
- Output contained: `Prerendered 6 Arabic core routes.`

Static dist checks already confirmed:
- `frontend/dist/services/gaming-pc/index.html` now includes source-level alternates:
  - `en-AE`
  - `ar-AE`
  - `x-default`
- `frontend/dist/ar/services/gaming-pc/index.html` now contains both:
  - Arabic source head tags
  - Arabic body snapshot HTML inside `<div id="root">`
- `frontend/dist/ar/index.html` now contains Arabic root snapshot HTML
- `frontend/dist/ar/return-policy/index.html` now contains Arabic legal body snapshot HTML

Hydrated browser checks already performed locally on preview build:
- `/ar/services/gaming-pc/`
- `/ar/services/buy-iphone/`

Observed results after hydration:
- exactly one canonical on the route
- exactly three alternates on the route:
  - `en-AE`
  - `ar-AE`
  - `x-default`
- Arabic body content rendered after hydration on both routes
- Arabic appointment panel rendered after hydration on gaming-pc route
- Buy-iPhone family cards render Arabic-facing copy after hydration

### 5. Known Local Preview Noise Already Observed

These appeared during preview and should not be confused with localization defects:
- `/api/products` failed locally because the backend was not running
- `/api/business-hours` failed locally because the backend was not running
- Google Ads / analytics network requests aborted in local browser preview

---

## Files You Must Read Before Reviewing

### Core Routing / SEO / Locale Files
- `frontend/src/App.tsx`
- `frontend/src/context/LanguageContext.tsx`
- `frontend/src/components/Seo.tsx`
- `frontend/src/components/Header.tsx`
- `frontend/src/components/Footer.tsx`
- `frontend/src/i18n/translations.ts`

### Arabic Content / Surface Files
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/BuyIphonePage.tsx`
- `frontend/src/pages/ReturnPolicyPage.tsx`
- `frontend/src/pages/ServicePage.tsx`
- `frontend/src/components/IphoneFamilyCard.tsx`
- `frontend/src/components/HomeAppointmentPanel.tsx`
- `frontend/src/content/serviceCatalog.ts`
- `frontend/src/content/homePageContent.ts`
- `frontend/src/content/buyIphoneCatalog.ts`

### Prerender / Dist Output Files
- `frontend/scripts/prerender-seo-routes.mjs`
- `frontend/dist/index.html`
- `frontend/dist/sitemap.xml`
- `frontend/dist/services/gaming-pc/index.html`
- `frontend/dist/services/laptop-shop/index.html`
- `frontend/dist/services/computer-shop/index.html`
- `frontend/dist/services/buy-iphone/index.html`
- `frontend/dist/ar/index.html`
- `frontend/dist/ar/return-policy/index.html`
- `frontend/dist/ar/services/gaming-pc/index.html`
- `frontend/dist/ar/services/laptop-shop/index.html`
- `frontend/dist/ar/services/computer-shop/index.html`
- `frontend/dist/ar/services/buy-iphone/index.html`

### Existing Prompt / Historical Context Files
- `QA_PROMPT_arabic-i18n-phase2-2026-05-10.md`
- `NEXT_SESSION_PROMPT.md`

---

## Your Review Goals

### Goal 1 — Confirm The Remediated Work Is Actually Correct

Check all of the following with file reads plus executable validation:

1. Arabic service routes resolve correctly in `App.tsx`
2. `LanguageContext` helper exposure matches actual consumer usage
3. `Seo.tsx` emits correct localized canonical and alternates
4. Header/footer locale-switch and supported-route fallback logic are correct
5. Arabic pages do not leak the old English-only source-head problem
6. English service pages now emit return hreflang tags where Arabic variants exist
7. Arabic prerender output now includes crawlable body snapshots, not empty root shells

### Goal 2 — Find Remaining Gaps Before Publish

You are expected to identify residual issues, especially on global/shared UI, including but not limited to:

- untranslated header search UI
- untranslated store-hours panels
- untranslated consent banner
- untranslated footer icon labels or utility text
- mixed-language fragments still visible on Arabic routes
- missing hreflang return-tag parity on any remaining localized route
- sitemap problems
- accidental inclusion of Arabic pages in sitemap when they should rely on hreflang discovery
- trailing-slash mismatches between source canonical, runtime canonical, and alternates

Treat this as a release QA pass, not just a code read.

### Goal 3 — Finish The Remaining Actions To Reach Publishable State

If you find fixable issues that are narrow and clearly in scope, fix them.

Then:
- rerun the build
- rerun focused browser validation
- only after the QA state is acceptable, proceed to deployment readiness

### Goal 4 — Drive The Deployment / GSC Follow-Through Where Appropriate

If the local QA result is clean enough for release, continue through the post-build publication checklist:

1. Deploy the current frontend build
2. Verify the live Arabic and English route pairs
3. Resubmit or confirm sitemap in GSC if the deploy materially changed crawlable output
4. Use URL Inspection / Request Indexing for the Arabic core routes and their paired English routes where appropriate

If deployment or GSC actions require user credentials or dashboard access you do not have, stop at the exact blocker and produce the exact manual step required.

---

## Focused Verification Checklist

### A. Translation / Context Safety

Read `frontend/src/i18n/translations.ts` and confirm:
- English and Arabic key sets are aligned
- interpolation still works for keys with variables
- service and CTA strings are still internally consistent

Read `frontend/src/context/LanguageContext.tsx` and confirm:
- provider value exposes every helper actually consumed by pages/components
- `toSupportedLocalizedPath()` behavior matches header/footer/home-page usage
- `getLanguageSwitchPath()` preserves valid route switching behavior

### B. Route Wiring

Read `frontend/src/App.tsx` and verify:
- `/ar` and `/ar/` map to home page
- slash and non-slash variants exist for the 4 Arabic service routes and return-policy route
- there is no residual fixed-route bug that would leave `slug` undefined

### C. Runtime SEO

Read `frontend/src/components/Seo.tsx` and verify:
- canonical generation uses the current language correctly
- alternate generation is normalized and consistent with production canonical shape
- no duplicate head emission logic remains after hydration

### D. ServicePage Behavior

Read `frontend/src/pages/ServicePage.tsx` and verify:
- Arabic routes use Arabic hero/highlights/local-support content
- untranslated detail sections and related links are intentionally suppressed on Arabic routes
- breadcrumb JSON-LD names localize correctly
- appointment/WhatsApp copy localizes correctly

### E. Home / Buy iPhone / Return Policy Behavior

Read these files and verify visible Arabic copy coverage:
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/BuyIphonePage.tsx`
- `frontend/src/pages/ReturnPolicyPage.tsx`
- `frontend/src/components/IphoneFamilyCard.tsx`
- `frontend/src/components/HomeAppointmentPanel.tsx`

Confirm that the most visible Arabic routes no longer show the English fragments that were present earlier.

### F. Prerender Source HTML

Read `frontend/scripts/prerender-seo-routes.mjs` and verify:
- Arabic service metadata extraction now includes `ar`
- Arabic root snapshots are built from dedicated snapshot helpers
- alternates use `hreflang`
- Arabic `rootHtml` is actually injected for the Arabic core routes

Then inspect the built files in `frontend/dist/` and confirm the generated output matches the script behavior.

### G. Browser Verification

Use a local preview build and verify both source HTML and hydrated DOM for at least these routes:

Arabic routes:
- `/ar/`
- `/ar/return-policy/`
- `/ar/services/gaming-pc/`
- `/ar/services/laptop-shop/`
- `/ar/services/computer-shop/`
- `/ar/services/buy-iphone/`

English paired routes:
- `/`
- `/return-policy/`
- `/services/gaming-pc/`
- `/services/laptop-shop/`
- `/services/computer-shop/`
- `/services/buy-iphone/`

For each paired route, verify:
- one canonical only
- correct canonical target
- three alternates only where expected
- source head and hydrated head agree
- visible Arabic body content where expected
- no mixed-language regressions in the route’s main content

### H. RTL Regression Check

Run targeted searches for physical-direction Tailwind classes in touched Arabic-facing surfaces:
- `text-left`
- `text-right`
- `pl-`
- `pr-`
- `ml-`
- `mr-`
- `border-l`

Spot-check:
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/ReturnPolicyPage.tsx`
- `frontend/src/pages/ServicePage.tsx`
- `frontend/src/components/HomeAppointmentPanel.tsx`
- `frontend/src/components/IphoneFamilyCard.tsx`

Do not treat intentionally physical placement like absolute cart badges as a bug unless it breaks in RTL.

---

## Remaining High-Probability Gaps To Investigate First

These were not fully closed in the local preview and should be treated as the most likely continuation points:

1. Global chrome still has some English on Arabic pages
   - header search placeholder
   - store-hours panel labels / day names / status copy
   - consent banner copy
   - some footer utility/icon labels

2. Non-core Arabic routes are intentionally unsupported
   - confirm unsupported routes fall back to English cleanly instead of producing broken Arabic URLs

3. Arabic sitemap policy must be verified
   - if `/ar/*` is intentionally discovered through hreflang only, confirm the current sitemap behavior matches that strategy

4. Live deployment and GSC follow-through are still outstanding
   - local build was verified
   - local preview was verified
   - deployment was not performed in this session

---

## Required Command Sequence

### 1. Rebuild Before Any Final Opinion

```powershell
Set-Location -LiteralPath 'C:\Users\islamt\shop-pzm.ae\frontend'
npm run build
```

Expected:
- TypeScript passes
- Vite build passes
- prerender script passes
- output contains `Prerendered 6 Arabic core routes.`

### 2. Local Preview Validation

```powershell
Set-Location -LiteralPath 'C:\Users\islamt\shop-pzm.ae\frontend'
npm run preview -- --host 127.0.0.1 --port 4173
```

Then verify the route list above in the browser.

Reminder:
- local `/api/products` and `/api/business-hours` failures may appear if backend is not running
- do not misclassify empty product inventory or missing live hours as Arabic route regressions without confirming the root cause

### 3. Deploy Only After QA Pass Is Clean Enough

```powershell
Set-Location -LiteralPath 'C:\Users\islamt\shop-pzm.ae\frontend'
npx wrangler pages deploy ./dist --branch main --project-name pzm-ae-frontend
```

Capture:
- deployment result
- deployment URL if shown
- timestamp

### 4. Live HTTP Checks After Deploy

Verify at minimum:

```powershell
curl.exe -I https://pzm.ae/ar/
curl.exe -I https://pzm.ae/ar/return-policy/
curl.exe -I https://pzm.ae/ar/services/gaming-pc/
curl.exe -I https://pzm.ae/ar/services/laptop-shop/
curl.exe -I https://pzm.ae/ar/services/computer-shop/
curl.exe -I https://pzm.ae/ar/services/buy-iphone/

curl.exe -I https://pzm.ae/
curl.exe -I https://pzm.ae/return-policy/
curl.exe -I https://pzm.ae/services/gaming-pc/
curl.exe -I https://pzm.ae/services/laptop-shop/
curl.exe -I https://pzm.ae/services/computer-shop/
curl.exe -I https://pzm.ae/services/buy-iphone/
```

Expected:
- `200 OK` for canonical live routes
- no redirect loops

Then inspect live HTML for at least one English/Arabic pair:

```powershell
curl.exe -s https://pzm.ae/services/gaming-pc/ | findstr /I "canonical alternate hreflang"
curl.exe -s https://pzm.ae/ar/services/gaming-pc/ | findstr /I "canonical alternate hreflang"
```

### 5. GSC Actions After Successful Deploy

If deployment succeeds and live checks pass, do the following in Google Search Console for property `https://pzm.ae`:

1. Resubmit `https://pzm.ae/sitemap.xml` if the deploy changed crawlable canonical output or sitemap timestamps
2. Run URL Inspection and Request Indexing for:
   - `https://pzm.ae/ar/`
   - `https://pzm.ae/ar/return-policy/`
   - `https://pzm.ae/ar/services/gaming-pc/`
   - `https://pzm.ae/ar/services/laptop-shop/`
   - `https://pzm.ae/ar/services/computer-shop/`
   - `https://pzm.ae/ar/services/buy-iphone/`
3. Also inspect one or two paired English routes to confirm return-tag parity, especially:
   - `https://pzm.ae/services/gaming-pc/`
   - `https://pzm.ae/services/buy-iphone/`
4. In each inspection, confirm:
   - page is indexable
   - canonical matches the route
   - no `noindex`
   - live page includes hreflang alternates where expected

If you cannot access GSC directly, stop and produce the exact manual checklist the user should execute in GSC.

---

## Reporting Format Required From You

When you finish, report in this exact structure:

### 1. Findings
- severity-ordered
- file and route references
- only actual problems or confirmed clean verdicts

### 2. Verified Completed Work
- what was already implemented and proven correct

### 3. Remaining Actions
- only the actions still needed before full publish and GSC submission are complete

### 4. Deploy / GSC Status
- whether deploy was executed
- whether live checks passed
- whether sitemap was resubmitted
- whether URL Inspection / Request Indexing was completed

### 5. Blockers
- only if real blockers remain

Be strict. If something was not verified, say it was not verified.
```

---

## Handoff Notes

- Use this new file as the active continuation prompt.
- Keep the earlier [QA_PROMPT_arabic-i18n-phase2-2026-05-10.md](QA_PROMPT_arabic-i18n-phase2-2026-05-10.md) as historical context only.
- The most important already-fixed publish blocker was the prerender/source-HTML path. Do not reopen broad routing exploration unless a new validation result falsifies the current implementation.
- The most likely remaining work is in shared global UI, live deployment verification, and GSC follow-through.
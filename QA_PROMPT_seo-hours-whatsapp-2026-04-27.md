# QA Prompt — SEO Title Fix, WhatsApp CTA, Live Business Hours (2026-04-27)

Use the prompt below with another AI agent for an independent QA and completeness review of all changes made in this session.

```text
You are performing a full QA and completeness review of three production improvements made to the `shop-pzm.ae` repository on 2026-04-27. Your goal is to:

1. Verify that each fix correctly and fully addresses the stated problem
2. Identify anything missed, incomplete, or that could regress
3. Recommend any additional steps that would make the solution more robust or complete

Read every file mentioned before forming any opinion. Do not assume code is correct — read it.

---

## Context

- Repo root: `C:\Users\islamt\shop-pzm.ae`
- Production site: `https://pzm.ae`
- Production API: `https://pzm.ae/api` (Cloudflare Worker, backend at `backend/src/index.ts`)
- Frontend: React + Vite + Tailwind, built from `frontend/src/`, deployed to Cloudflare Pages
- Build pipeline note: frontend builds also run a separate prerender/snapshot script from `frontend/package.json`
- Google Maps Place ID for PZM store: `ChIJ1aZJvMBtXz4RLrOI1vITjBU`

---

## Issue 1 — Google Search Title Not Matching Business Name

### Problem
The site's `<title>` in `frontend/index.html` was:
  `PZM Computers & Phones Store - New, Used, Repair, PC Build | Dubai`

And `homeSeoTitle` in `frontend/src/pages/HomePage.tsx` was:
  `Buy iPhones, Laptops & Repair in Al Barsha, JVC & Tecom | PZM Computers & Phones Store - New, Used, Repair, PC Build`

Google was truncating the long title and showing `PZM Computers & Phones Store` in search results, which did not match the business owner's desired name on Google Maps:
  `PZM Computers & Phones -New Used Repair PC Build Barsha Dubai`

### Intended Fix
The homepage fallback title in `frontend/index.html` and the React homepage title in `frontend/src/pages/HomePage.tsx` were changed to:
  `PZM Computers & Phones – New, Used, Repair, PC Build | Barsha Dubai`

Important nuance:
- This string is 67 characters including spaces, punctuation, and the en-dash `–`
- Google title truncation is pixel-based, not a strict character cutoff
- The frontend build also has a separate homepage metadata/prerender path that may still carry older brand/title values

### Files To Read
- `frontend/index.html`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/content/siteData.ts`
- `frontend/src/components/Seo.tsx`
- `frontend/package.json`
- `frontend/scripts/prerender-seo-routes.mjs`
- `frontend/dist/index.html` after running a fresh build

### QA Questions To Answer
1. Confirm the exact character count of:
  `PZM Computers & Phones – New, Used, Repair, PC Build | Barsha Dubai`
  Then assess whether it is likely safe enough for Google in practice, given pixel-based truncation.

2. Search for remaining old brand/title strings across the codebase, not just `homeSeoTitle`. Check:
  - `frontend/src/content/siteData.ts`
  - `frontend/src/components/Seo.tsx`
  - `frontend/src/pages/`
  - `frontend/scripts/prerender-seo-routes.mjs`
  - built `frontend/dist/index.html`
  Flag anything still using:
  - `PZM Computers & Phones Store`
  - `PZM Computers & Phones Store - New, Used, Repair, PC Build`
  - the old long homepage title

3. Determine what Googlebot would actually see for `/` after a production build:
  - the fallback `<title>` from `frontend/index.html`
  - the React-rendered `<Seo>` title
  - or the snapshot/prerender output written by `frontend/scripts/prerender-seo-routes.mjs`
  Read `frontend/package.json`, `frontend/scripts/prerender-seo-routes.mjs`, and the generated `frontend/dist/index.html` before answering.

4. The `homeSeoDescription` was not changed. Read it in `frontend/src/pages/HomePage.tsx` and assess whether it still supports the updated title well for CTR.

5. Has the GSC (Google Search Console) `Request Indexing` step been completed for `https://pzm.ae/`? This is a manual post-deploy action, so confirm with the user if unsure.

6. Check structured data for the homepage in both places:
  - `storeJsonLd` in `frontend/src/pages/HomePage.tsx`
  - `buildStoreJsonLd()` in `frontend/scripts/prerender-seo-routes.mjs`
  If either still uses old branding, flag it. Also check whether `og:site_name` in `frontend/src/components/Seo.tsx` and generated output still reflects the old brand string.

---

## Issue 2 — WhatsApp Link Missing From "Book a Service Appointment" Section

### Problem
The service pages for `repair`, `gaming-pc`, and `sell-gadgets` had a `Book a Service Appointment` card with a form but no direct WhatsApp shortcut. Clients had no quick way to bypass the form and message the store directly from within that card.

### Fix Applied
In `frontend/src/pages/ServicePage.tsx`, inside the appointment section (the `hasAppointment` guard block), a WhatsApp link was added immediately after the subtext paragraph. The link:
- Uses `MessageCircle` from `lucide-react`
- Is styled as a subtle green text link:
  `inline-flex items-center gap-1.5 text-sm font-medium text-[#25D366] hover:underline`
- Links to `https://wa.me/971528026677?text=...`
- Prefills:
  `Hi, I'd like to book a ${service.title} appointment. (via pzm.ae/services/${service.slug})`
- Opens in a new tab with `target="_blank" rel="noopener noreferrer"`

### Files To Read
- `frontend/src/pages/ServicePage.tsx`
- `frontend/src/components/WhatsAppCTA.tsx`
- `frontend/src/content/siteData.ts`
- `frontend/src/utils/whatsappLead.ts`
- `frontend/src/content/serviceCatalog.ts`
- Search the rest of `frontend/src/` for hardcoded WhatsApp URLs or numbers

### QA Questions To Answer
1. Read `frontend/src/pages/ServicePage.tsx` in full. Confirm the WhatsApp link appears inside the appointment section block guarded by `hasAppointment`, not outside it.

2. The three slugs with appointments are `repair`, `gaming-pc`, and `sell-gadgets` from `appointmentServiceTypes`. Verify the appointment WhatsApp link does not appear on service pages without appointments such as `/services/accessories/` and `/services/brand-new/`.

3. The WhatsApp number in the new link is hardcoded as `971528026677`. Compare it against `siteContact` in `frontend/src/content/siteData.ts`.
  Important: the shared field name is `siteContact.whatsappSupportHref`, not `siteContact.whatsappUrl`.
  Answer whether the new link should use:
  - `siteContact.whatsappSupportHref`
  - a shared helper
  - or another single source of truth

4. The `WhatsAppCTA` block at the bottom of every service page already adds a WhatsApp entry point. Does having two WhatsApp entry points on appointment-enabled pages create useful redundancy or UI confusion? Evaluate the visual hierarchy and likelihood of user hesitation.

5. Check whether the WhatsApp number is duplicated across the codebase. At minimum inspect:
  - `frontend/src/pages/ServicePage.tsx`
  - `frontend/src/components/WhatsAppCTA.tsx`
  - `frontend/src/content/siteData.ts`
  - `frontend/src/utils/whatsappLead.ts`
  Then search `frontend/src/` for any other hardcoded `971528026677` or `wa.me` links and flag all locations.

6. The prefilled message encodes `service.title`, which comes from `frontend/src/content/serviceCatalog.ts`. Verify that `service.title` is clean, human-readable text for all three appointment-eligible services and not an internal identifier or slug.

---

## Issue 3 — Website Business Hours Hardcoded And Out Of Sync With Google Maps

### Problem
The store owner updates hours only on Google Maps. The website `StoreHoursPanel` component was displaying hardcoded hours from `frontend/src/utils/storeHours.ts` that were significantly wrong.
Examples:
- Opening time had been 10:00 AM across all days, while Google Maps shows 8:30 AM for most days and 10:00 AM on Friday
- Closing times were also wrong, such as Tuesday showing 10:30 PM while Google Maps shows 11:30 PM

### Fix Applied — Backend
The backend already had a `/api/business-hours` endpoint in `backend/src/index.ts` that:
- Reads `GOOGLE_MAPS_API_KEY` from Cloudflare Worker secrets
- Calls `https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJ1aZJvMBtXz4RLrOI1vITjBU&fields=name,opening_hours&key={apiKey}`
- Returns the Google Places response
- Falls back to hardcoded hours when the API key is not set

The API key was set as a Cloudflare Worker production secret during this session. The API key restriction was initially set to HTTP referrer and caused `REQUEST_DENIED` for server-side calls. That was fixed by removing the application restriction while keeping the API restricted to Places API.

Live API response confirmed at `https://pzm.ae/api/business-hours` is shaped like this:
```json
{
  "result": {
   "opening_hours": {
    "weekday_text": [
      "Monday: 8:30 AM – 11:30 PM",
      "Tuesday: 8:30 AM – 11:30 PM",
      "Wednesday: 8:30 AM – 11:30 PM",
      "Thursday: 8:30 AM – 11:30 PM",
      "Friday: 10:00 AM – 11:30 PM",
      "Saturday: 8:30 AM – 1:00 AM",
      "Sunday: 8:30 AM – 1:00 AM"
    ]
   }
  },
  "status": "OK"
}
```

### Fix Applied — Frontend (StoreHoursPanel)
`frontend/src/components/StoreHoursPanel.tsx` was rewritten to:
- Fetch `buildApiUrl('/business-hours')` on mount
- Cache the result in `sessionStorage` under key `pzm_biz_hours` for 60 minutes
- Fall back to hardcoded `weeklyHoursText` from `storeHours.ts` if the fetch fails or returns an unexpected shape
- Show a 7-row shimmer skeleton while loading
- Parse each row by the first `:` index instead of splitting on `: `
- Keep the open/closed badge and today highlight from `getStoreHoursSnapshot()`, which still uses the hardcoded `STORE_HOURS` object

### Fix Applied — Correcting Hardcoded Fallback Hours
`frontend/src/utils/storeHours.ts` was updated to match the confirmed Google Maps hours:
- `STORE_HOURS` now reflects the corrected opening and closing times
- `weeklyHoursText` now matches the expected Google-style text format

### Files To Read
- `frontend/src/components/StoreHoursPanel.tsx`
- `frontend/src/utils/storeHours.ts`
- `backend/src/index.ts`
- `frontend/src/components/StoreContactSection.tsx`
- `frontend/src/App.tsx`
- `frontend/package.json`
- `frontend/scripts/prerender-seo-routes.mjs`
- generated frontend build output after a fresh build

### Design Decisions Made
- The open/closed badge still uses `STORE_HOURS` instead of Google `open_now`
- No backend caching was added; frontend `sessionStorage` caching was considered sufficient

### QA Questions To Answer
1. Read `frontend/src/components/StoreHoursPanel.tsx` in full and verify the fetch/cache/fallback/skeleton logic:
  a. Does `getCachedHours()` validate both TTL and data shape sufficiently before using cached data?
  b. Does `setCachedHours()` handle storage failures gracefully?
  c. Does the `cancelled = true` cleanup prevent state updates after unmount?
  d. Is the `finally` behavior correct given that the effect returns early when cached data already exists?

2. Trace `hoursLoading` from initial mount through both paths:
  - cache hit
  - cache miss + fetch
  Confirm whether there is any state initialization bug.

3. Google `weekday_text` is Monday-first, but `snapshot.todayName` from `getStoreHoursSnapshot()` comes from a Sunday-indexed JS day array. Verify that the today-row highlight still works because the comparison is by day-name string rather than index.

4. The backend fallback in `backend/src/index.ts` still returns stale early-2026 hours when `GOOGLE_MAPS_API_KEY` is missing. Should that fallback now be updated to the confirmed correct hours?

5. The Places API key no longer has an application restriction. Check whether the key is surfaced anywhere unsafe:
  - frontend responses
  - error messages
  - request logs
  - server logs in `backend/src/index.ts`
  If not surfaced, say so clearly. If surfaced anywhere, flag it.

6. Does the backend add CORS headers that cover `/api/business-hours`? Read the CORS middleware in `backend/src/index.ts`. The frontend calls same-origin `/api/business-hours`, so CORS may not be strictly needed, but verify there is no preflight or header mismatch issue.

7. The `sessionStorage` TTL is 60 minutes. If the owner updates hours on Google Maps, visitors may see stale hours for up to an hour in the same browser session. Is that acceptable, or would a shorter TTL make more sense?

8. Run `npm run build` in `frontend/` and confirm:
  - build succeeds with no TypeScript or Vite errors
  - generated output is consistent with the intended changes
  - `StoreHoursPanel` is still reachable in the actual app and not accidentally excluded by route logic or build output assumptions

9. `StoreHoursPanel` is rendered inside `StoreContactSection`, but `StoreContactSection` itself is mounted from `frontend/src/App.tsx`. Confirm exactly which routes show the hours/contact block.
  Important: do not assume it is homepage-only. Determine whether it appears on all public pages except admin, invoice, and order-confirmation flows.

10. Check whether the build produces any prerendered/snapshot HTML for pages that would be expected to show the hours section. This project uses a separate snapshot generator from `frontend/package.json` via `frontend/scripts/prerender-seo-routes.mjs`.
   Verify one of these outcomes:
  - the hours/contact section is present in prerendered HTML
  - or it is absent entirely from snapshot HTML
  - or it renders only after client hydration
  Then assess whether that is acceptable for SEO/UX, especially on the homepage.

---

## Overall QA Checklist

After reviewing all individual issues above, also answer:

1. Were all three changes included in a single frontend build? Run `npm run build` in `frontend/` and confirm the build succeeds cleanly.

2. Is there a backend deployment step needed?
  - No backend source code may have changed
  - But the Worker secret and key restrictions were changed
  Verify live behavior by hitting `https://pzm.ae/api/business-hours` and confirming:
  - `status: "OK"`
  - `result.opening_hours.weekday_text` exists
  - hours match the intended store hours

3. Is there a frontend deployment step needed?
  The following frontend files require a rebuild/deploy if they changed:
  - `frontend/index.html`
  - `frontend/src/pages/HomePage.tsx`
  - `frontend/src/pages/ServicePage.tsx`
  - `frontend/src/components/StoreHoursPanel.tsx`
  - `frontend/src/utils/storeHours.ts`
  - and potentially `frontend/scripts/prerender-seo-routes.mjs` if homepage SEO metadata also needed updating there

4. After deploy, what is the recommended verification sequence?
  - [ ] Run a fresh frontend build and inspect `frontend/dist/index.html`
  - [ ] Confirm homepage `<title>` matches the intended new string
  - [ ] Confirm homepage `og:site_name` and homepage JSON-LD business name/brand strings are correct
  - [ ] Open `https://pzm.ae/` and verify the visible contact section shows the correct hours
  - [ ] In DevTools Network, verify `GET /api/business-hours` returns 200 with `status: "OK"`
  - [ ] Reload or revisit within the cache window and verify no unnecessary repeat call if cache is already populated
  - [ ] Block `/api/business-hours` in DevTools and confirm the panel still renders fallback hours without crashing
  - [ ] Open `https://pzm.ae/services/repair/` and confirm the appointment card shows the WhatsApp link below the subtext
  - [ ] Click the WhatsApp link and verify the correct number and prefilled message
  - [ ] Open `https://pzm.ae/services/accessories/` and confirm there is no appointment-card WhatsApp shortcut for a non-appointment service
  - [ ] In Google Search Console, use URL Inspection on `https://pzm.ae/` and request indexing if deployment is complete

5. Are there any other pages, components, helpers, hardcoded constants, prerender outputs, or structured-data blocks that still reference:
  - the old homepage title
  - the old brand string
  - stale fallback business hours
  - or duplicated WhatsApp number logic that should be centralized?
```

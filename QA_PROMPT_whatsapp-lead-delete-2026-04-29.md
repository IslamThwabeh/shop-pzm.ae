# QA + Deploy Prompt — WhatsApp Lead Delete Feature (2026-04-29)

## Context

A delete-lead capability was added to the admin panel's WhatsApp Leads section.
Previously, leads could only be updated (status / notes). Now each lead has a
trash-can icon in the table row and a "Delete Lead" button in the detail panel.

---

## Exact changes made — verify all three files before doing anything else

### 1. `backend/src/db.ts`

A new `deleteWhatsAppLead(id: string): Promise<boolean>` method was added to the
`Database` class, directly above the `// ============ GOOGLE CUSTOMER REVIEWS ============`
comment block.

**Verify:**
```
grep -n "deleteWhatsAppLead" backend/src/db.ts
```
Expected: one definition hit that runs `DELETE FROM whatsapp_leads WHERE id = ?`,
binds the id, and returns `(result.meta?.changes ?? 0) > 0`.

---

### 2. `backend/src/index.ts`

A new `app.delete('/api/whatsapp-leads/:id', ...)` route was added immediately
after the closing `});` of the existing `app.put('/api/whatsapp-leads/:id', ...)`
route, and before the `// ============ AUTH API ============` comment.

**Verify:**
```
grep -n "app.delete.*whatsapp" backend/src/index.ts
```
Expected: one hit.

The route must:
- Extract and verify the admin Bearer token (same guard as the PUT route).
- Call `db.deleteWhatsAppLead(leadId)`.
- Return `{ data: { id: leadId }, status: 200 }` on success.
- Return 404 if `deleted === false` (lead not found).
- Return 401/403 for missing/invalid token.
- Log via `logError` on unexpected exceptions.

Read lines around the match and confirm all of the above are present.

---

### 3. `frontend/src/components/admin/WhatsAppLeadManagement.tsx`

**Verify each of these individually:**

a) `Trash2` is imported from `lucide-react` alongside `RefreshCw`:
```
grep -n "Trash2" frontend/src/components/admin/WhatsAppLeadManagement.tsx
```
Expected: import line + two usage sites (table row + detail panel button).

b) `deletingId` state is declared:
```
grep -n "deletingId" frontend/src/components/admin/WhatsAppLeadManagement.tsx
```
Expected: `useState<string | null>(null)` declaration + usage in `handleDeleteLead` + disabled props on both buttons.

c) `handleDeleteLead` function exists and:
- Calls `window.confirm(...)` before proceeding.
- Sets `deletingId` to the lead id at start and clears it in `finally`.
- Calls `DELETE /api/whatsapp-leads/${lead.id}` with the admin Bearer token.
- Handles 401/403 the same way as other handlers (clears localStorage, calls `onUnauthorized`).
- Removes the deleted lead from local `leads` state via `setLeads(prev => prev.filter(...))`.
- Closes the detail panel if the deleted lead was the `selectedLead`.

d) Table row Action column: confirm there is a `<Trash2 size={15} />` button beside the "Manage" button inside a `flex items-center gap-3` wrapper.

e) Detail panel: confirm there is a "Delete Lead" button with `<Trash2 size={15} />` beside the "Save Changes" button, styled in rose colors (not the green gradient).

---

## TypeScript / lint check

Run from the repo root:
```powershell
cd frontend; npx tsc --noEmit; cd ..
cd backend; npx tsc --noEmit; cd ..
```
Both must exit with 0 errors before proceeding.

---

## Build check

```powershell
cd frontend
npm run build
```
Confirm the build succeeds with no errors. Watch for any missing-import or
unused-variable warnings that may indicate a bad edit.

---

## Deployment order

### Step 1 — Deploy backend (Cloudflare Worker)

```powershell
cd backend
# Load deploy token — do NOT echo or log it
$env:CLOUDFLARE_API_TOKEN = (Get-Content .cloudflare-deploy.env | Where-Object { $_ -match "CLOUDFLARE_API_TOKEN" } | ForEach-Object { ($_ -split "=", 2)[1].Trim() })
npx wrangler deploy
```

After deploy:
- Note the Worker version ID printed in the output.
- Verify the new DELETE route is live (unauthenticated request should return 401):
```powershell
Invoke-RestMethod -Uri "https://pzm.ae/api/whatsapp-leads/nonexistent-id" -Method DELETE
```
Expected response body: `{ "error": "Unauthorized", "status": 401 }` with HTTP 401.

---

### Step 2 — Deploy frontend (Cloudflare Pages)

```powershell
cd frontend
npm run deploy:production
```

The correct project name is `shop-pzm-ae-frontend` — this is already baked into
`npm run deploy:production` in `frontend/package.json`. Do NOT pass a different
`--project-name`.

After deploy:
- Note the preview deployment URL (format: `https://<hash>.pzm-store-frontend.pages.dev`).
- Open `https://pzm.ae/admin` and log in.
- Navigate to the **WhatsApp Leads** tab.
- Confirm:
  - Each table row has a small trash-can icon button in the Action column beside "Manage".
  - Opening a lead's detail panel shows a rose-colored "Delete Lead" button beside "Save Changes".
  - The trash-can button is disabled (visually faded) while a delete is in progress.

---

### Step 3 — Live smoke test

1. In the admin panel, identify a test lead (all current leads are test orders per the user's note).
2. Click the trash-can icon on any lead in the table.
3. Confirm the browser `confirm()` dialog appears with the lead's `reference_label`.
4. Click OK.
5. Confirm the lead disappears from the table immediately without a page reload.
6. Confirm the stat counters (Total, Pending, etc.) update to reflect the deletion.
7. Repeat via the detail panel: open a lead, click "Delete Lead", confirm dialog, confirm the panel closes and the lead is gone from the table.
8. Verify that attempting to delete an already-deleted ID returns 404:
```powershell
# Replace <id> and <token> with real values from the admin session
Invoke-RestMethod -Uri "https://pzm.ae/api/whatsapp-leads/<id>" -Method DELETE -Headers @{ Authorization = "Bearer <token>" }
```
Expected: `{ "error": "Lead not found", "status": 404 }` with HTTP 404.

---

### Step 4 — Git commit and push

Only after both deploys succeed and the smoke test passes:

```powershell
cd C:\Users\islamt\shop-pzm.ae
git add backend/src/db.ts backend/src/index.ts frontend/src/components/admin/WhatsAppLeadManagement.tsx
git status   # confirm only the three expected files are staged
git commit -m "feat(admin): add delete button for WhatsApp leads"
git push origin main
```

Confirm the push succeeds and note the commit SHA.

---

## What NOT to do

- Do not change `frontend/package.json`'s deploy script or the `--project-name` value.
- Do not touch `migrations/` — no schema change is needed; `DELETE` on the existing `whatsapp_leads` table works without a migration.
- Do not commit `.cloudflare-deploy.env`, `.dev.vars`, or any token value.
- Do not run `git push --force`.

---

## Success criteria checklist

- [ ] `deleteWhatsAppLead` method present and correct in `backend/src/db.ts`
- [ ] `DELETE /api/whatsapp-leads/:id` route present and correct in `backend/src/index.ts`
- [ ] `Trash2` imported, `deletingId` state declared, `handleDeleteLead` function complete in `WhatsAppLeadManagement.tsx`
- [ ] Trash-can button visible in table row Action column
- [ ] "Delete Lead" button visible in detail panel beside "Save Changes"
- [ ] `tsc --noEmit` passes for both backend and frontend
- [ ] `npm run build` passes in `frontend/`
- [ ] Backend Worker deployed — DELETE route returns 401 without auth on live URL
- [ ] Frontend Pages deployed — admin panel UI shows delete buttons
- [ ] Smoke test: delete via table row works end-to-end on live site
- [ ] Smoke test: delete via detail panel works end-to-end on live site
- [ ] Git commit pushed to `origin/main` with the three changed files only

# Backend (Cloudflare Workers)

Local development instructions have been removed per repository policy change. This project uses Cloudflare staging and production environments for development and testing.

## Local deploy auth
- Store the shop.pzm.ae deploy token only in `backend/.cloudflare-deploy.env`.
- Keep runtime worker secrets in `backend/.dev.vars`.
- Do not place the deploy token in `backend/.env` or `backend/.dev.vars`.
- Use `backend/.cloudflare-deploy.env.example` as the template for the local deploy-token file.

PowerShell example for commands that need Cloudflare deploy auth:

```powershell
Get-Content .cloudflare-deploy.env | ForEach-Object {
	if ($_ -match '^(.*?)=(.*)$') {
		[System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
	}
}
npx wrangler whoami
```

## Staging
- Staging worker: `pzm-api-staging` (routes: `test.pzm.ae/api/*`)

To deploy to staging:

```bash
cd backend
npm ci
npx wrangler deploy --env staging
```

## Production
- Production worker: `shop-pzm-ae-api-production` (routes: `pzm.ae/api/*`, `www.pzm.ae/api/*`)

To deploy to production:

```bash
cd backend
npm ci
npm run deploy
```

Notes:

- `npm run deploy` is intentionally pinned to `--env production` so the Worker keeps its D1, KV, R2, and route bindings.
- Do not run a bare `wrangler deploy` for production from this repo. The top-level worker name matches production, so an env-less deploy can replace the live script without the production bindings and break `https://pzm.ae/api/*`.

## Useful commands
- Run DB migrations on the production DB (`pzm-db`):

```bash
cd backend
npm run db:migrate
```

- Seed production DB (use with caution):

```bash
cd backend
npm run db:seed
```

## Notes
- If you need local development instructions restored, contact the maintainers to restore the archived docs.

# Backend (Cloudflare Workers)

Local development instructions have been removed per repository policy change. This project uses Cloudflare staging and production environments for development and testing.

## Staging
- Staging worker: `pzm-api-staging` (routes: `test.pzm.ae/api/*`)

To deploy to staging:

```bash
cd backend
npm ci
npx wrangler deploy --env staging
```

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

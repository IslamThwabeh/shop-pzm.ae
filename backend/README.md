# Backend local development (D1 local-pzm-db)

This document explains how to create and seed a local Cloudflare D1 database (`local-pzm-db`) for safe local development without touching production (`pzm-db`).

## Create a local D1 database
(Requires Wrangler configured with your Cloudflare account)

1. Create the database:

   ```bash
   cd backend
   npm run db:create:local
   ```

   > This runs `wrangler d1 create local-pzm-db` and returns the new database id.

2. Configure the local environment in `wrangler.toml` (already added):

   - `env.local` is configured to bind the `DB` to `local-pzm-db`.
   - API key/secret placeholders are set for local development; replace if needed.

## Initialize and seed the local DB

Run migrations and seed data into `local-pzm-db`:

```bash
cd backend
npm run db:init:local
npm run db:seed:local
# OR run both with:
npm run db:migrate:local
```

## Run the backend against the local DB

Start the Worker using the `local` environment which binds `DB` to `local-pzm-db`:

```bash
cd backend
npm run dev:local
# This runs `wrangler dev --env local` and serves the API locally.
```

## Useful commands

- Query the local DB interactively:

```bash
cd backend
npm run db:query:local -- "SELECT username, password_hash FROM admin_users;"
```

- To remove or recreate the local D1 database, use the Cloudflare dashboard or the Wrangler CLI.

## Notes

- Do not use `local-pzm-db` for production data.
- Remove local CORS relaxations and any test credentials before deploying to production.
- If you want a fully local non-Cloudflare solution (SQLite), open an issue and we can add a local adapter.

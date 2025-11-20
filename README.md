# TinyLink - Next.js + Prisma template

This is a ready-to-run template implementing the TinyLink take-home assignment:
- Next.js (Pages router)
- PostgreSQL via Prisma
- API endpoints and page routes matching the assignment spec

## What is included
- `/` Dashboard (pages/index.tsx)
- `/code/:code` Stats page (pages/code/[code].tsx)
- `/:code` Redirect (pages/[code].tsx) — server-side 302 redirect and click increment
- `/healthz` and `/api/healthz` returning JSON { ok: true, version: "1.0" }
- API routes:
  - `POST /api/links` create link (409 if duplicate)
  - `GET /api/links` list links
  - `GET /api/links/:code` get link
  - `DELETE /api/links/:code` delete link

## Quick start (local)
1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install packages:
   ```
   npm install
   ```
3. Generate Prisma client and run migration:
   ```
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Start dev server:
   ```
   npm run dev
   ```

## Deploy
Recommended: Vercel + Neon (Postgres)
- Add `DATABASE_URL` to platform env vars.
- Run migrations in production: `npx prisma migrate deploy`

## Notes
- The project includes a small `lib/prisma.ts` helper to avoid multiple PrismaClient instances during development hot reloads.
- Keep endpoints, field names and routes exactly as in the spec for autograder compatibility.

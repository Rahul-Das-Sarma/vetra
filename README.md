# Vetra

**Executive Search Dossier Engine** — turn a candidate CV, screening-call transcript/audio, recruiter notes and search mandate into a firm-specific, source-grounded, client-ready executive dossier.

> Not an ATS/CRM. Lightweight file-in → dossier-out workflow that coexists with your existing stack.

## Positioning

> Turn your candidate interview, CV and search mandate into your firm's client-ready executive dossier in minutes—with every important claim traceable to its source.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (persisted local demo state)

## MVP surfaces

- Dashboard with dossier + audit overview
- Dossier workflow: Ingest → Evidence → Draft/Review → QA → Export
- Real AI generation via OpenAI (`/api/dossiers/generate`)
- PDF/DOCX/TXT upload with text extraction
- Real **DOCX + PDF** download from the Export tab
- Search mandates (must-have / nice-to-have)
- Firm template configuration
- Retention policy + audit log (no training on customer data)

## Getting started

```bash
npm install
cp .env.example .env.local
```

### 1. OpenAI
Add `OPENAI_API_KEY` to `.env.local`.

### 2. Clerk
1. Create an application at [clerk.com](https://clerk.com)
2. Copy **Publishable key** + **Secret key** into `.env.local`
3. In Clerk Dashboard → Paths, set sign-in `/sign-in` and sign-up `/sign-up`

### 3. Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor** → paste and run [`supabase/schema.sql`](./supabase/schema.sql)
3. **Project Settings → Database** → copy the Postgres URI into `DATABASE_URL`
   - Prefer the **pooler** connection (port `6543`) on Vercel/serverless
4. (Optional) copy Project URL + anon key for later Storage use

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Without Clerk/Supabase keys: local demo mode (Zustand) still works.
- With both configured: sign in → workspace loads/saves to Supabase.
- **Generate draft** uses OpenAI; Export downloads real DOCX/PDF.

## Explicitly out of MVP

ATS/CRM, candidate database, LinkedIn scraping, sourcing, ranking, email campaigns, client billing, job-board integrations, full recruiting analytics.

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
- Search mandates (must-have / nice-to-have)
- Firm template configuration
- Retention policy + audit log (no training on customer data)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo dossier: **Elena March** already includes claims, evidence links and QA flags.

## Explicitly out of MVP

ATS/CRM, candidate database, LinkedIn scraping, sourcing, ranking, email campaigns, client billing, job-board integrations, full recruiting analytics.

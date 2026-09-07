# Clerk + Supabase setup for Vetra

## Clerk
1. Create app at https://dashboard.clerk.com
2. Add to `.env.local`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Configure sign-in/sign-up paths: `/sign-in`, `/sign-up`

## Supabase
1. Create project at https://supabase.com
2. SQL Editor → run `supabase/schema.sql`
3. Settings → Database → Connection string (URI) → `DATABASE_URL` in `.env.local`
4. Optional: Project URL + anon key for Storage later

## Verify
```bash
npm run dev
```
Sign in → banner should say "Synced with Supabase". Create a dossier → refresh → data persists.

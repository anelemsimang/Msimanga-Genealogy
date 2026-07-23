# Usapho lakwaMsimanga — The Msimanga Family Archive

A dedicated, citation-driven family history archive for the **Msimanga family**. It pairs a beautiful, interactive family tree with a versioned, source-backed editing workflow so the family can build and preserve its history together — including the **izithakazelo zakwaMsimanga** (clan praises) carried down through the generations.

The interface is available in **English**, **isiXhosa**, and **Sesotho**.

> This project is being built in phases (see **Build Order** below). Each phase is verified to compile and run before the next begins.

## Tech Stack

| Concern            | Choice                                                        |
| ------------------ | ------------------------------------------------------------ |
| Framework          | Next.js 16 (App Router, Server Components + Server Actions)  |
| Language           | TypeScript (strict mode, no `any`)                          |
| Database & Auth    | Supabase (Postgres, Row Level Security, Auth, Storage)      |
| Styling            | Tailwind CSS v4 + shadcn/ui (Base UI primitives)            |
| Tree visualization | React Flow (`@xyflow/react`)                                |
| Forms              | React Hook Form + Zod                                        |
| Data fetching      | TanStack Query (client) + Supabase server client            |
| Rich text          | Tiptap                                                       |
| Media              | Supabase Storage + `browser-image-compression`             |
| Deployment target  | Vercel                                                       |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your Supabase project values
(Supabase dashboard → Project Settings → API):

```bash
cp .env.local.example .env.local
```

| Variable                          | Where to find it                    | Exposure     |
| --------------------------------- | ----------------------------------- | ------------ |
| `NEXT_PUBLIC_SUPABASE_URL`        | Project Settings → API → Project URL | Public       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Project Settings → API → anon key    | Public       |
| `SUPABASE_SERVICE_ROLE_KEY`       | Project Settings → API → service_role | **Server only** |
| `NEXT_PUBLIC_SITE_URL`            | Your deployed URL (or localhost)     | Public       |

> The public keys are safe to expose — access is enforced by Row Level
> Security. The service role key bypasses RLS and must never reach the browser.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (site)/            Public, read-only facing pages (shared header/footer)
      layout.tsx
      page.tsx         Landing page
    layout.tsx         Root layout: fonts + providers
    globals.css        Tailwind v4 theme (heritage palette, dark mode)
  components/
    providers/         Theme + React Query providers
    ui/                shadcn/ui components
    ...                App-specific components (header, footer, brand, ...)
  lib/
    supabase/
      client.ts        Browser Supabase client
      server.ts        Server + admin Supabase clients
      env.ts           Validated env access
      types.ts         Generated DB types (placeholder until schema exists)
    i18n/
      dictionaries.ts  English / isiXhosa / Sesotho translations
    clan.ts            Izithakazelo zakwaMsimanga (clan praises)
    site.ts            Site config / navigation
    utils.ts           cn() helper
supabase/
  migrations/          SQL migrations (added in Build Order step 2)
```

## Languages

The site is authored entirely in **English** (`src/lib/i18n/dictionaries.ts` is
the single source of truth for interface copy). A **Google Translate engine**
lets any visitor translate the whole page — interface *and* family-entered
content — on demand from the translate icon in the header:

| Code | Language  |
| ---- | --------- |
| `en` | English (original) |
| `zu` | isiZulu   |
| `xh` | isiXhosa  |
| `st` | Sesotho   |

Implementation notes (`src/components/providers/google-translate-provider.tsx`):

- Uses the Google Website Translate widget; the chosen language is stored in the
  `googtrans` cookie and re-applied on load, so it persists across pages/reloads.
- Google's default banner/toolbar is hidden via CSS; translation is driven from
  our own language switcher. Each switch performs a brief reload for reliability.
- The **izithakazelo** and the **Msimanga** name are marked `translate="no"`
  (`notranslate`) so they are never machine-translated.

> Caveat: this is the free Google widget (loaded via `translate.googleapis.com`),
> which is not officially supported for embedding. If Google ever changes it, the
> officially-supported alternative is the paid **Google Cloud Translation API**.

## Build Order

The app is built as a checklist. Current progress:

- [x] **1. Scaffold** — Next.js + TS + Tailwind + shadcn/ui + Supabase clients + env
- [ ] **2. Schema** — SQL migrations for all tables + Row Level Security policies
- [ ] **3. Auth** — invite-only sign-up, sign-in, role-aware middleware
- [ ] **4. Person CRUD** — server actions + person profile page
- [ ] **5. Revisions** — versioning wired through every mutation
- [ ] **6. Tree** — interactive family tree (React Flow)
- [ ] **7. Dashboard** — add/edit person, media upload, sources & citations
- [ ] **8. Review** — moderation queue + history/diff UI
- [ ] **9. Discovery** — search, surname/place indexes, "what's new" feed
- [ ] **10. GEDCOM** — import/export
- [ ] **11. Polish** — dark mode, mobile, empty/error states, seed data

## Role Model

| Role          | Capabilities                                                        |
| ------------- | ------------------------------------------------------------------ |
| `viewer`      | Read everything not marked private                                  |
| `contributor` | Propose edits; changes enter a moderation queue as pending revisions |
| `editor`      | Edit live (bypasses the queue); review contributor submissions      |
| `admin`       | Full control: role management, merges, invites, audit log           |

Anonymous visitors can read only public, non-living-person data.

_Detailed schema and RLS documentation will be added with the migrations in step 2._

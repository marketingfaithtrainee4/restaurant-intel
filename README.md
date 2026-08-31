# Restaurant Marketing Intelligence Platform

Multi-tenant marketing intelligence + competitor audit platform for restaurant/takeaway clients.
Every collected data point is stored with its source and a confidence type
(`fact` / `derived` / `estimate` / `ai_analysis`) — nothing in a report is
presented without traceability back to where it came from.

## Stack

- **Next.js** (App Router) on **Vercel**
- **Supabase** (Postgres + PostGIS for radius queries, Auth for later multi-user support)
- **PowerShell** scripts for setup and data intake
- **Claude API** for synthesis (scoring narrative, gap analysis, roadmap generation) — always fed only structured, already-collected facts

## Project structure

```
restaurant-intel/
├── app/                    # Next.js pages
│   ├── layout.tsx
│   └── page.tsx             # lists managed businesses
├── lib/
│   └── supabase.ts          # server + browser Supabase clients
├── types/
│   └── db.ts                 # TypeScript types mirroring the DB schema
├── scripts/
│   ├── setup.ps1              # one-time project setup
│   └── add-business.ps1       # intake script — add a managed business
├── supabase/
│   └── migrations/
│       └── 0001_init.sql      # core schema: businesses, audits, findings, scores, roadmap
└── .env.example
```

## Setup

1. Create a Supabase project (note the project ref, URL, anon key, and service role key)
2. From the project root, in PowerShell:
   ```powershell
   .\scripts\setup.ps1 -SupabaseProjectRef your-project-ref
   ```
3. Fill in the real values in `.env.local`
4. Run the app:
   ```powershell
   npm run dev
   ```

## Adding your first business

```powershell
.\scripts\add-business.ps1 `
    -Name "Your Restaurant Name" `
    -CuisineType "Indian" `
    -WebsiteUrl "https://..." `
    -MenuUrl "https://..." `
    -GbpUrl "https://..." `
    -GoogleReviewUrl "https://..." `
    -AddressLine "..." `
    -Postcode "..."
```

## Schema notes (why it's built this way)

- **`businesses`** holds both managed restaurants and competitors — distinguished by `is_managed`. Competitors are linked to a managed business via `competitor_links`, which stores *why* they were selected (distance, cuisine similarity, relevance score) — not just proximity.
- **`sources`** logs every external fetch (URL, provider, raw payload, timestamp). This is the audit trail.
- **`findings`** is the atomic data unit — every metric is one row, tagged `fact` / `derived` / `estimate` / `ai_analysis`, linked to the `source` it came from. Reports are built by querying this table, never by asking the LLM to "remember" data.
- **`scores`** always stores its `formula_notes` — no black-box numbers.
- **`roadmap_items`** links back to `supporting_finding_ids` so every recommendation is traceable to evidence.

## Not yet built (by design — see MVP plan)

- Multi-user auth / Row Level Security (single login for this phase)
- Automated competitor discovery via Google Places (next step)
- Website crawler job
- Google Places / GBP API integration
- LLM synthesis pipeline
- Report/dashboard UI beyond the basic business list

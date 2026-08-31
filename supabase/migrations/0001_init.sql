-- =========================================================
-- Restaurant Marketing Intelligence Platform — Core Schema
-- =========================================================
-- Design principles:
-- 1. Every collected data point is stored as a FINDING with a
--    confidence_type (fact / derived / estimate / ai_analysis)
--    and a link back to its SOURCE (url + fetched_at).
-- 2. "businesses" holds both OUR managed restaurants and
--    COMPETITOR businesses — distinguished by is_managed.
--    A competitor is always linked to the managed business
--    it was discovered for, via the "competitor_links" table.
-- 3. Snapshots are append-only so score/finding history over
--    time is preserved (needed for re-audit / trend tracking).
-- 4. Single login for now — but every table already carries
--    created_by / account scoping columns so Row Level
--    Security can be turned on later without restructuring.

create extension if not exists "uuid-ossp";
create extension if not exists postgis; -- for radius / distance queries

-- ---------------------------------------------------------
-- BUSINESSES
-- One row per restaurant/takeaway — ours or a competitor's.
-- ---------------------------------------------------------
create table businesses (
    id uuid primary key default uuid_generate_v4(),
    is_managed boolean not null default false,     -- true = one of our 700 clients
    name text not null,
    cuisine_type text,                              -- e.g. 'Indian', 'Pizza', 'Kebab'
    website_url text,
    menu_url text,
    gbp_url text,                                    -- Google Business Profile / Maps link
    gbp_place_id text,                                -- Google Places place_id (for API calls)
    google_review_url text,
    address_line text,
    postcode text,
    location geography(Point, 4326),                 -- lat/long for radius queries
    phone text,
    facebook_url text,
    instagram_url text,
    ordering_provider text,                           -- e.g. 'Just Eat', 'own website', 'Deliveroo'
    ordering_url text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_businesses_location on businesses using gist (location);
create index idx_businesses_is_managed on businesses (is_managed);

-- ---------------------------------------------------------
-- COMPETITOR LINKS
-- Links a managed business to a competitor business, with the
-- relevance signals used to select/rank it (not just distance).
-- ---------------------------------------------------------
create table competitor_links (
    id uuid primary key default uuid_generate_v4(),
    managed_business_id uuid not null references businesses(id) on delete cascade,
    competitor_business_id uuid not null references businesses(id) on delete cascade,
    distance_km numeric(6,3),
    cuisine_similarity_score numeric(4,3),            -- 0-1, AI/keyword-derived
    relevance_score numeric(4,3),                     -- composite score used to rank
    status text not null default 'suggested'          -- 'suggested' | 'confirmed' | 'rejected'
        check (status in ('suggested','confirmed','rejected')),
    confirmed_by text,
    confirmed_at timestamptz,
    created_at timestamptz not null default now(),
    unique (managed_business_id, competitor_business_id)
);

create index idx_competitor_links_managed on competitor_links (managed_business_id);
create index idx_competitor_links_status on competitor_links (status);

-- ---------------------------------------------------------
-- AUDITS
-- One audit run = one point-in-time analysis of a managed
-- business (and optionally its confirmed competitor set).
-- ---------------------------------------------------------
create table audits (
    id uuid primary key default uuid_generate_v4(),
    managed_business_id uuid not null references businesses(id) on delete cascade,
    status text not null default 'pending'
        check (status in ('pending','collecting','analysing','complete','failed')),
    radius_km numeric(5,2) not null default 3.0,
    requested_by text,
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz not null default now()
);

create index idx_audits_managed_business on audits (managed_business_id);

-- Which businesses (managed + competitors) were actually
-- included in a given audit run.
create table audit_subjects (
    id uuid primary key default uuid_generate_v4(),
    audit_id uuid not null references audits(id) on delete cascade,
    business_id uuid not null references businesses(id) on delete cascade,
    role text not null check (role in ('managed','competitor')),
    unique (audit_id, business_id)
);

-- ---------------------------------------------------------
-- SOURCES
-- Every external data pull is logged here — the audit trail
-- that lets every report claim be traced to a real fetch.
-- ---------------------------------------------------------
create table sources (
    id uuid primary key default uuid_generate_v4(),
    audit_id uuid references audits(id) on delete cascade,
    business_id uuid not null references businesses(id) on delete cascade,
    source_type text not null,       -- 'website_crawl' | 'google_places' | 'gbp_api' |
                                      -- 'scheduler_pro' | 'meta_graph' | 'seo_tool' | 'manual'
    source_url text,
    provider text,                    -- e.g. 'Google Places API', 'Scheduler Pro', 'SEMrush'
    raw_payload jsonb,                -- store the raw fetched response for traceability
    fetched_at timestamptz not null default now(),
    is_fallback boolean not null default false  -- true if this was a fallback source (e.g. Scheduler Pro used because direct platform data was unavailable)
);

create index idx_sources_business on sources (business_id);
create index idx_sources_audit on sources (audit_id);

-- ---------------------------------------------------------
-- FINDINGS
-- The atomic unit of the whole platform: one specific piece
-- of information, tagged by confidence type, linked to its
-- source. Report sections are built by querying this table.
-- ---------------------------------------------------------
create table findings (
    id uuid primary key default uuid_generate_v4(),
    audit_id uuid not null references audits(id) on delete cascade,
    business_id uuid not null references businesses(id) on delete cascade,
    source_id uuid references sources(id) on delete set null,
    category text not null,           -- 'website' | 'seo' | 'local_seo' | 'gbp' | 'reviews' |
                                       -- 'social' | 'menu' | 'pricing' | 'creative' | 'keywords'
    finding_key text not null,        -- machine key, e.g. 'page_speed_mobile', 'review_count'
    finding_label text not null,      -- human label, e.g. 'Mobile Page Speed Score'
    value_text text,
    value_numeric numeric,
    confidence_type text not null
        check (confidence_type in ('fact','derived','estimate','ai_analysis')),
    confidence_notes text,             -- e.g. how a derived/estimate value was calculated
    created_at timestamptz not null default now()
);

create index idx_findings_audit on findings (audit_id);
create index idx_findings_business on findings (business_id);
create index idx_findings_category on findings (category);

-- ---------------------------------------------------------
-- SCORES
-- Category + composite scores, always with the formula/inputs
-- that produced them stored alongside (no black-box numbers).
-- ---------------------------------------------------------
create table scores (
    id uuid primary key default uuid_generate_v4(),
    audit_id uuid not null references audits(id) on delete cascade,
    business_id uuid not null references businesses(id) on delete cascade,
    score_type text not null,          -- 'website' | 'local_seo' | 'gbp' | 'reviews' |
                                        -- 'social' | 'menu_offers' | 'composite_growth'
    score_value numeric(5,2) not null, -- e.g. 0-100
    formula_notes text not null,       -- human-readable explanation of weights/inputs
    inputs jsonb,                       -- structured breakdown of contributing findings
    created_at timestamptz not null default now()
);

create index idx_scores_audit_business on scores (audit_id, business_id);

-- ---------------------------------------------------------
-- ROADMAP ITEMS
-- The output layer: recommendations with priority/impact/
-- effort, each traceable back to the findings that justify it.
-- ---------------------------------------------------------
create table roadmap_items (
    id uuid primary key default uuid_generate_v4(),
    audit_id uuid not null references audits(id) on delete cascade,
    managed_business_id uuid not null references businesses(id) on delete cascade,
    timeframe text not null check (timeframe in ('immediate','30_day','60_day','90_day')),
    problem text not null,
    recommendation text not null,
    priority text not null check (priority in ('low','medium','high')),
    impact text check (impact in ('low','medium','high')),
    effort text check (effort in ('low','medium','high')),
    suggested_channel text,             -- e.g. 'Google Business Profile', 'SMS', 'Website'
    supporting_finding_ids uuid[],      -- array of findings.id this recommendation is based on
    status text not null default 'proposed'
        check (status in ('proposed','approved','in_progress','done','rejected')),
    created_at timestamptz not null default now()
);

create index idx_roadmap_managed_business on roadmap_items (managed_business_id);
create index idx_roadmap_audit on roadmap_items (audit_id);

-- ---------------------------------------------------------
-- Basic updated_at trigger for businesses
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trg_businesses_updated_at
before update on businesses
for each row execute function set_updated_at();

-- Run this in Supabase SQL Editor to set up all tables

-- 1. Scans
create table if not exists scans (
    id           uuid primary key,
    skills       text[],
    hourly_rate  numeric,
    experience   text,
    status       text default 'processing',  -- processing | complete | error
    progress     text default '',
    created_at   timestamptz default now()
);

-- 2. Opportunities
create table if not exists opportunities (
    id             uuid primary key default gen_random_uuid(),
    scan_id        uuid references scans(id) on delete cascade,
    title          text,
    url            text,
    platform       text,           -- upwork | freelancer
    budget_min     numeric,
    budget_max     numeric,
    bid_count      int,
    posted_at      timestamptz,
    client_id      text,
    strike_score   int default 50,
    verdict        text,           -- go | skip | risky
    reasons        text[],
    red_flags      text[],
    proposal_angle text,
    is_demo        boolean default false,
    created_at     timestamptz default now()
);

create index if not exists idx_opps_scan_id on opportunities(scan_id);
create index if not exists idx_opps_demo on opportunities(is_demo) where is_demo = true;
create index if not exists idx_opps_score on opportunities(strike_score desc);

-- 3. Client profiles (cache)
create table if not exists client_profiles (
    client_id          text primary key,
    platform           text,
    total_spent        numeric default 0,
    hire_rate          numeric default 0,
    review_count       int default 0,
    dispute_count      int default 0,
    avg_rating         numeric default 0,
    avg_duration_days  int default 0,
    scraped_at         timestamptz default now()
);

-- 4. Market rates
create table if not exists market_rates (
    id            uuid primary key default gen_random_uuid(),
    skill_tag     text,
    platform      text,
    p25_rate      numeric,
    median_rate   numeric,
    p75_rate      numeric,
    sample_count  int,
    week_start    date,
    created_at    timestamptz default now()
);

create index if not exists idx_rates_skill on market_rates(skill_tag, platform, created_at desc);


-- =============================================================
-- SEED DEMO DATA (run after creating tables)
-- 3 scenarios: React dev mid $45/hr, Copywriter junior $25/hr, Logo designer $30/hr
-- =============================================================

-- Demo scan (placeholder — opportunities reference this)
insert into scans (id, skills, hourly_rate, experience, status, progress)
values (
    '00000000-0000-0000-0000-000000000001',
    array['React', 'TypeScript'],
    45,
    'mid',
    'complete',
    'Done'
) on conflict (id) do nothing;

-- Demo client profiles
insert into client_profiles (client_id, platform, total_spent, hire_rate, review_count, dispute_count, avg_rating, avg_duration_days, scraped_at)
values
    ('demo_client_a', 'upwork', 62000, 94, 47, 0, 4.9, 21, now()),
    ('demo_client_b', 'upwork', 8200, 61, 12, 1, 4.1, 14, now()),
    ('demo_client_c', 'upwork', 1500, 38, 3, 2, 3.7, 7, now())
on conflict (client_id) do nothing;

-- Market rates
insert into market_rates (skill_tag, platform, p25_rate, median_rate, p75_rate, sample_count, week_start)
values
    ('react', 'upwork', 38, 47, 65, 84, date_trunc('week', now())::date),
    ('copywriting', 'upwork', 20, 28, 40, 62, date_trunc('week', now())::date),
    ('logo design', 'upwork', 18, 30, 55, 51, date_trunc('week', now())::date)
on conflict do nothing;

-- Demo opportunities — Scenario 1: React dev (high strike score)
insert into opportunities (
    id, scan_id, title, url, platform, budget_min, budget_max,
    bid_count, posted_at, client_id, strike_score, verdict,
    reasons, red_flags, proposal_angle, is_demo
) values (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Senior React + TypeScript Developer for SaaS Dashboard',
    'https://www.upwork.com/jobs/react-typescript-saas-dashboard',
    'upwork', 40, 60,
    4,
    now() - interval '3 hours',
    'demo_client_a',
    82,
    'go',
    array[
        'Only 4 bids placed so far — platform average is 23 at this stage',
        'Client has spent $62,000 with a 94% hire rate and 0 disputes',
        'Your rate of $45/hr sits at the P57 percentile — competitive without underselling'
    ],
    array[]::text[],
    'Reference a specific SaaS product you''ve built and lead with the TypeScript architecture decision that shipped it.',
    true
),
-- Scenario 2: Copywriter junior (mixed results)
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Email Campaign Copywriter — B2B SaaS Onboarding Sequence',
    'https://www.upwork.com/jobs/email-copywriter-b2b-saas',
    'upwork', 20, 35,
    14,
    now() - interval '18 hours',
    'demo_client_b',
    54,
    'risky',
    array[
        '14 bids already — above average competition for a $25/hr listing',
        'Client has $8,200 spent with a 61% hire rate — they post more than they hire',
        'Your rate of $25/hr aligns with the P50 — budget fit is good'
    ],
    array['Client has 1 payment dispute on record — verify milestone structure before bidding'],
    'Show one email subject line you''ve written that hit above 30% open rate — make the value immediate.',
    true
),
-- Scenario 3: Logo designer (risky / red flags)
(
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Logo + Brand Identity Package — Startup',
    'https://www.upwork.com/jobs/logo-brand-identity-startup',
    'upwork', 15, 25,
    31,
    now() - interval '2 days',
    'demo_client_c',
    28,
    'skip',
    array[
        '31 bids at 48 hours — extremely saturated for this budget range',
        'Budget of $15–25 is below the P25 market rate of $18/hr for logo design',
        'Client has only spent $1,500 total — low commitment history'
    ],
    array[
        'Client has 2 payment disputes — high chargeback risk',
        'Budget is $15/hr against a $30/hr median — expect scope expansion pressure'
    ],
    'If you bid, propose a fixed-price milestone structure to protect against scope creep.',
    true
);

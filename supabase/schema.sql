create extension if not exists pgcrypto;

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 160),
  phone text,
  company text,
  service text,
  message text not null check (char_length(message) between 5 and 5000),
  status text not null default 'new' check (status in ('new','contacted','qualified','closed')),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

-- No public SELECT/INSERT policy is intentionally created. Public enquiries are
-- inserted by the server route using the service-role key. Admin reads/updates
-- are also performed server-side after Supabase Auth + ADMIN_EMAILS checks.

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status);

-- Optional helper for future reporting.
create or replace view public.contact_submission_daily as
select date_trunc('day', created_at) as day, count(*)::int as submissions
from public.contact_submissions
group by 1
order by 1 desc;

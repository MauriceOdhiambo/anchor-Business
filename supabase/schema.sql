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
create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_status_idx on public.contact_submissions (status);

create or replace view public.contact_submission_daily as
select date_trunc('day', created_at) as day, count(*)::int as submissions
from public.contact_submissions
group by 1
order by 1 desc;

-- Dashboard-managed administrators. Auth credentials are held by Supabase Auth;
-- this table stores only access rights and the Auth user id, never passwords.
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin','manager')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users add column if not exists auth_user_id uuid;
alter table public.admin_users add column if not exists role text not null default 'admin';
alter table public.admin_users enable row level security;
create index if not exists admin_users_email_idx on public.admin_users (lower(email));
create index if not exists admin_users_auth_user_idx on public.admin_users (auth_user_id);

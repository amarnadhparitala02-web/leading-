-- Leading Light: database setup for Supabase.
-- Paste this whole file into Supabase > SQL Editor and click Run. It is safe to run more than once.
--
-- The site stores each "table" (colleges, courses, cutoffs, leads, students, ...) as rows of JSON in
-- one table. This keeps the site's existing code unchanged and lets colleges keep their nested course
-- details. Only the website's server can read or write it, using the secret service key.

create table if not exists public.records (
  table_name text not null,
  id         text not null,
  position   bigint generated always as identity,   -- keeps insertion order
  data       jsonb not null,
  created_at timestamptz not null default now(),
  primary key (table_name, id)
);
create index if not exists records_table_position_idx on public.records (table_name, position);

-- Remembers which tables have been saved at least once, so a table that an admin emptied on
-- purpose is not refilled with the built-in starter courses.
create table if not exists public.table_state (
  table_name text primary key,
  initialized_at timestamptz not null default now()
);

-- Lock both tables: with row level security on and no policies, the public (anon) key that browsers
-- can see has no access at all. The server's service key bypasses this.
alter table public.records     enable row level security;
alter table public.table_state enable row level security;
revoke all on public.records     from anon, authenticated;
revoke all on public.table_state from anon, authenticated;

-- Replace every row of one table in a single all-or-nothing step.
create or replace function public.replace_table(p_table text, p_rows jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.records where table_name = p_table;
  insert into public.records (table_name, id, data)
    select p_table, t.r ->> 'id', t.r
    from jsonb_array_elements(p_rows) with ordinality as t(r, n)
    order by t.n;
  insert into public.table_state (table_name) values (p_table) on conflict do nothing;
end;
$$;

-- Change some fields of one record in a single step (shallow merge), returning the updated record.
create or replace function public.patch_record(p_table text, p_id text, p_patch jsonb)
returns jsonb
language sql
security definer
set search_path = public
as $$
  update public.records
     set data = data || p_patch
   where table_name = p_table and id = p_id
  returning data;
$$;

revoke execute on function public.replace_table(text, jsonb)       from public, anon, authenticated;
revoke execute on function public.patch_record(text, text, jsonb)  from public, anon, authenticated;
grant  execute on function public.replace_table(text, jsonb)       to service_role;
grant  execute on function public.patch_record(text, text, jsonb)  to service_role;

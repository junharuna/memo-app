create table public.memos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memos_title_not_blank check (btrim(title) <> ''),
  constraint memos_title_length check (char_length(title) <= 200),
  constraint memos_content_length check (char_length(content) <= 100000)
);

create index memos_owner_created_at_idx
  on public.memos (owner_id, created_at desc);

alter table public.memos enable row level security;

revoke all privileges on table public.memos from anon, authenticated;
grant insert (owner_id, title, content) on table public.memos to authenticated;

create policy "Authenticated users can create their own memos"
  on public.memos
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

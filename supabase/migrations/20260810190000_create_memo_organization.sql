create table public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color_key text not null default 'blue',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_trimmed check (name = btrim(name)),
  constraint categories_name_length check (char_length(name) between 1 and 50),
  constraint categories_color_key_valid check (color_key in ('blue', 'orange', 'violet')),
  constraint categories_owner_id_id_key unique (owner_id, id)
);

create unique index categories_owner_normalized_name_key
  on public.categories (owner_id, lower(name));

create index categories_owner_name_idx
  on public.categories (owner_id, lower(name));

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_name_trimmed check (name = btrim(name)),
  constraint tags_name_length check (char_length(name) between 1 and 30),
  constraint tags_name_has_no_display_prefix check (left(name, 1) <> '#'),
  constraint tags_owner_id_id_key unique (owner_id, id)
);

create unique index tags_owner_normalized_name_key
  on public.tags (owner_id, lower(name));

create index tags_owner_name_idx
  on public.tags (owner_id, lower(name));

alter table public.memos
  add column category_id uuid,
  add constraint memos_owner_id_id_key unique (owner_id, id),
  add constraint memos_category_owner_fkey
    foreign key (owner_id, category_id)
    references public.categories (owner_id, id)
    on delete set null (category_id);

create index memos_owner_category_updated_at_idx
  on public.memos (owner_id, category_id, updated_at desc);

create table public.memo_tags (
  owner_id uuid not null,
  memo_id uuid not null,
  tag_id uuid not null,
  created_at timestamptz not null default now(),
  constraint memo_tags_pkey primary key (owner_id, memo_id, tag_id),
  constraint memo_tags_memo_owner_fkey
    foreign key (owner_id, memo_id)
    references public.memos (owner_id, id)
    on delete cascade,
  constraint memo_tags_tag_owner_fkey
    foreign key (owner_id, tag_id)
    references public.tags (owner_id, id)
    on delete cascade
);

create index memo_tags_owner_tag_memo_idx
  on public.memo_tags (owner_id, tag_id, memo_id);

alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.memo_tags enable row level security;

revoke all privileges on table public.categories from anon, authenticated;
revoke all privileges on table public.tags from anon, authenticated;
revoke all privileges on table public.memo_tags from anon, authenticated;

grant select on table public.categories to authenticated;
grant insert (owner_id, name, color_key) on table public.categories to authenticated;
grant update (name, color_key) on table public.categories to authenticated;
grant delete on table public.categories to authenticated;

grant select on table public.tags to authenticated;
grant insert (owner_id, name) on table public.tags to authenticated;
grant update (name) on table public.tags to authenticated;
grant delete on table public.tags to authenticated;

grant select on table public.memo_tags to authenticated;
grant insert (owner_id, memo_id, tag_id) on table public.memo_tags to authenticated;
grant delete on table public.memo_tags to authenticated;

grant update (category_id) on table public.memos to authenticated;

create policy "Authenticated users can read their own categories"
  on public.categories
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Authenticated users can create their own categories"
  on public.categories
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Authenticated users can update their own categories"
  on public.categories
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Authenticated users can delete their own categories"
  on public.categories
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Authenticated users can read their own tags"
  on public.tags
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Authenticated users can create their own tags"
  on public.tags
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Authenticated users can update their own tags"
  on public.tags
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Authenticated users can delete their own tags"
  on public.tags
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Authenticated users can read their own memo tags"
  on public.memo_tags
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Authenticated users can create their own memo tags"
  on public.memo_tags
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Authenticated users can delete their own memo tags"
  on public.memo_tags
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

create function public.set_organization_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_organization_updated_at() from public, anon, authenticated;

create trigger set_categories_updated_at
  before update of name, color_key on public.categories
  for each row
  execute function public.set_organization_updated_at();

create trigger set_tags_updated_at
  before update of name on public.tags
  for each row
  execute function public.set_organization_updated_at();

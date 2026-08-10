set local lock_timeout = '5s';

alter table public.memos
  add column favorited_at timestamptz,
  add column archived_at timestamptz,
  add column trashed_at timestamptz,
  add column revision bigint not null default 1,
  add constraint memos_revision_positive check (revision >= 1),
  add constraint memos_trashed_is_not_archived
    check (trashed_at is null or archived_at is null);

create index memos_owner_active_updated_idx
  on public.memos (owner_id, updated_at desc, id desc)
  where archived_at is null and trashed_at is null;

create index memos_owner_favorited_idx
  on public.memos (owner_id, favorited_at desc, id desc)
  where favorited_at is not null
    and archived_at is null
    and trashed_at is null;

create index memos_owner_archived_idx
  on public.memos (owner_id, archived_at desc, id desc)
  where archived_at is not null and trashed_at is null;

create index memos_owner_trashed_idx
  on public.memos (owner_id, trashed_at desc, id desc)
  where trashed_at is not null;

grant update (favorited_at, archived_at, trashed_at, revision)
  on table public.memos to authenticated;

drop policy "Authenticated users can delete their own memos" on public.memos;

create policy "Authenticated users can permanently delete their trashed memos"
  on public.memos
  for delete
  to authenticated
  using (
    (select auth.uid()) = owner_id
    and trashed_at is not null
  );

create table public.profiles (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  theme text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_trimmed
    check (display_name is null or display_name = btrim(display_name)),
  constraint profiles_display_name_length
    check (display_name is null or char_length(display_name) between 1 and 50),
  constraint profiles_theme_valid
    check (theme in ('system', 'light', 'dark'))
);

alter table public.profiles enable row level security;

revoke all privileges on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (owner_id, display_name, theme) on table public.profiles to authenticated;
grant update (display_name, theme) on table public.profiles to authenticated;

create policy "Authenticated users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create policy "Authenticated users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Authenticated users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create function public.set_profile_updated_at()
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

revoke all on function public.set_profile_updated_at()
  from public, anon, authenticated;

create trigger set_profiles_updated_at
  before update of display_name, theme on public.profiles
  for each row
  execute function public.set_profile_updated_at();

create function public.search_memos_v2(
  search_terms text[] default '{}'::text[],
  category_filter uuid default null,
  include_uncategorized boolean default false,
  tag_filters uuid[] default '{}'::uuid[],
  memo_view text default 'active',
  sort_key text default 'updated_desc',
  result_limit integer default 24,
  result_offset integer default 0
)
returns table (
  id uuid,
  title text,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
  favorited_at timestamptz,
  archived_at timestamptz,
  trashed_at timestamptz,
  revision bigint,
  category_id uuid,
  category_name text,
  category_color_key text,
  tags jsonb,
  total_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with matching_memos as (
    select
      m.id,
      m.title,
      m.content,
      m.created_at,
      m.updated_at,
      m.favorited_at,
      m.archived_at,
      m.trashed_at,
      m.revision,
      m.category_id,
      c.name as category_name,
      c.color_key as category_color_key
    from public.memos as m
    left join public.categories as c
      on c.owner_id = m.owner_id
      and c.id = m.category_id
    where m.owner_id = (select auth.uid())
      and case memo_view
        when 'favorites' then
          m.favorited_at is not null
          and m.archived_at is null
          and m.trashed_at is null
        when 'archive' then
          m.archived_at is not null
          and m.trashed_at is null
        when 'trash' then m.trashed_at is not null
        else m.archived_at is null and m.trashed_at is null
      end
      and case
        when include_uncategorized then m.category_id is null
        when category_filter is not null then m.category_id = category_filter
        else true
      end
      and not exists (
        select 1
        from unnest(coalesce(search_terms, '{}'::text[])) as search_term
        where m.content not ilike (
          '%' ||
          replace(
            replace(
              replace(search_term, E'\\', E'\\\\'),
              '%',
              E'\\%'
            ),
            '_',
            E'\\_'
          ) ||
          '%'
        ) escape E'\\'
      )
      and (
        select count(distinct memo_tag.tag_id)
        from public.memo_tags as memo_tag
        where memo_tag.owner_id = m.owner_id
          and memo_tag.memo_id = m.id
          and memo_tag.tag_id = any(coalesce(tag_filters, '{}'::uuid[]))
      ) = (
        select count(distinct requested_tag_id)
        from unnest(coalesce(tag_filters, '{}'::uuid[])) as requested_tag_id
      )
  )
  select
    matching_memos.id,
    matching_memos.title,
    matching_memos.content,
    matching_memos.created_at,
    matching_memos.updated_at,
    matching_memos.favorited_at,
    matching_memos.archived_at,
    matching_memos.trashed_at,
    matching_memos.revision,
    matching_memos.category_id,
    matching_memos.category_name,
    matching_memos.category_color_key,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('id', tag.id, 'name', tag.name)
          order by lower(tag.name), tag.id
        )
        from public.memo_tags as memo_tag
        join public.tags as tag
          on tag.owner_id = memo_tag.owner_id
          and tag.id = memo_tag.tag_id
        where memo_tag.owner_id = (select auth.uid())
          and memo_tag.memo_id = matching_memos.id
      ),
      '[]'::jsonb
    ) as tags,
    count(*) over () as total_count
  from matching_memos
  order by
    case when sort_key = 'title_asc' then lower(matching_memos.title) end asc,
    case when sort_key = 'created_desc' then matching_memos.created_at end desc,
    case when sort_key = 'favorited_desc' then matching_memos.favorited_at end desc,
    case when sort_key = 'archived_desc' then matching_memos.archived_at end desc,
    case when sort_key = 'trashed_desc' then matching_memos.trashed_at end desc,
    case
      when sort_key not in (
        'title_asc',
        'created_desc',
        'favorited_desc',
        'archived_desc',
        'trashed_desc'
      ) then matching_memos.updated_at
    end desc,
    matching_memos.id desc
  limit least(greatest(coalesce(result_limit, 24), 1), 24)
  offset greatest(coalesce(result_offset, 0), 0);
$$;

revoke all on function public.search_memos_v2(
  text[], uuid, boolean, uuid[], text, text, integer, integer
) from public, anon;
grant execute on function public.search_memos_v2(
  text[], uuid, boolean, uuid[], text, text, integer, integer
) to authenticated;

create function public.save_memo_revision(
  target_memo_id uuid,
  expected_revision bigint,
  memo_title text,
  memo_content text,
  memo_category_id uuid default null,
  memo_tag_ids uuid[] default '{}'::uuid[]
)
returns table (
  status text,
  new_revision bigint,
  new_updated_at timestamptz
)
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  current_owner_id uuid := auth.uid();
  current_memo public.memos%rowtype;
  requested_tag_count integer;
  owned_tag_count integer;
begin
  if current_owner_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select m.*
    into current_memo
  from public.memos as m
  where m.owner_id = current_owner_id
    and m.id = target_memo_id;

  if not found then
    return query select 'not_found'::text, null::bigint, null::timestamptz;
    return;
  end if;

  if current_memo.trashed_at is not null then
    return query select 'trashed'::text, current_memo.revision, current_memo.updated_at;
    return;
  end if;

  if current_memo.revision <> expected_revision then
    return query select 'conflict'::text, current_memo.revision, current_memo.updated_at;
    return;
  end if;

  if memo_category_id is not null and not exists (
    select 1
    from public.categories
    where owner_id = current_owner_id
      and id = memo_category_id
  ) then
    raise exception 'The category is unavailable.' using errcode = '23503';
  end if;

  select count(distinct requested_tag_id)
    into requested_tag_count
  from unnest(coalesce(memo_tag_ids, '{}'::uuid[])) as requested_tag_id;

  select count(*)
    into owned_tag_count
  from public.tags
  where owner_id = current_owner_id
    and id = any(coalesce(memo_tag_ids, '{}'::uuid[]));

  if requested_tag_count <> owned_tag_count then
    raise exception 'One or more tags are unavailable.' using errcode = '23503';
  end if;

  update public.memos as m
  set title = memo_title,
      content = memo_content,
      category_id = memo_category_id,
      revision = m.revision + 1
  where m.owner_id = current_owner_id
    and m.id = target_memo_id
    and m.revision = expected_revision
    and m.trashed_at is null
  returning m.revision, m.updated_at
    into current_memo.revision, current_memo.updated_at;

  if not found then
    return query select 'conflict'::text, null::bigint, null::timestamptz;
    return;
  end if;

  delete from public.memo_tags
  where owner_id = current_owner_id
    and memo_id = target_memo_id;

  insert into public.memo_tags (owner_id, memo_id, tag_id)
  select current_owner_id, target_memo_id, requested_tag_id
  from (
    select distinct unnest(coalesce(memo_tag_ids, '{}'::uuid[])) as requested_tag_id
  ) as requested_tags;

  return query
    select 'saved'::text, current_memo.revision, current_memo.updated_at;
end;
$$;

revoke all on function public.save_memo_revision(
  uuid, bigint, text, text, uuid, uuid[]
) from public, anon;
grant execute on function public.save_memo_revision(
  uuid, bigint, text, text, uuid, uuid[]
) to authenticated;

create extension if not exists pg_trgm with schema extensions;

create index memos_content_trgm_idx
  on public.memos
  using gin (content extensions.gin_trgm_ops);

create function public.search_memos(
  search_terms text[] default '{}'::text[],
  category_filter uuid default null,
  include_uncategorized boolean default false,
  tag_filters uuid[] default '{}'::uuid[],
  result_limit integer default 24,
  result_offset integer default 0
)
returns table (
  id uuid,
  title text,
  content text,
  created_at timestamptz,
  updated_at timestamptz,
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
      m.category_id,
      c.name as category_name,
      c.color_key as category_color_key
    from public.memos as m
    left join public.categories as c
      on c.owner_id = m.owner_id
      and c.id = m.category_id
    where m.owner_id = (select auth.uid())
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
  order by matching_memos.updated_at desc, matching_memos.id desc
  limit least(greatest(coalesce(result_limit, 24), 1), 24)
  offset greatest(coalesce(result_offset, 0), 0);
$$;

revoke all on function public.search_memos(text[], uuid, boolean, uuid[], integer, integer)
  from public, anon;
grant execute on function public.search_memos(text[], uuid, boolean, uuid[], integer, integer)
  to authenticated;

create function public.create_memo_with_metadata(
  memo_title text,
  memo_content text,
  memo_category_id uuid default null,
  memo_tag_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  current_owner_id uuid := auth.uid();
  new_memo_id uuid;
  requested_tag_count integer;
  owned_tag_count integer;
begin
  if current_owner_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
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

  insert into public.memos (owner_id, title, content, category_id)
  values (current_owner_id, memo_title, memo_content, memo_category_id)
  returning id into new_memo_id;

  insert into public.memo_tags (owner_id, memo_id, tag_id)
  select current_owner_id, new_memo_id, requested_tag_id
  from (
    select distinct unnest(coalesce(memo_tag_ids, '{}'::uuid[])) as requested_tag_id
  ) as requested_tags;

  return new_memo_id;
end;
$$;

revoke all on function public.create_memo_with_metadata(text, text, uuid, uuid[])
  from public, anon;
grant execute on function public.create_memo_with_metadata(text, text, uuid, uuid[])
  to authenticated;

create function public.update_memo_with_metadata(
  memo_id uuid,
  memo_title text,
  memo_content text,
  memo_category_id uuid default null,
  memo_tag_ids uuid[] default '{}'::uuid[]
)
returns boolean
language plpgsql
volatile
security invoker
set search_path = ''
as $$
declare
  current_owner_id uuid := auth.uid();
  requested_tag_count integer;
  owned_tag_count integer;
begin
  if current_owner_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.memos
    where owner_id = current_owner_id
      and id = memo_id
  ) then
    return false;
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

  update public.memos
  set title = memo_title,
      content = memo_content,
      category_id = memo_category_id
  where owner_id = current_owner_id
    and id = memo_id;

  delete from public.memo_tags
  where owner_id = current_owner_id
    and memo_tags.memo_id = update_memo_with_metadata.memo_id;

  insert into public.memo_tags (owner_id, memo_id, tag_id)
  select current_owner_id, update_memo_with_metadata.memo_id, requested_tag_id
  from (
    select distinct unnest(coalesce(memo_tag_ids, '{}'::uuid[])) as requested_tag_id
  ) as requested_tags;

  return true;
end;
$$;

revoke all on function public.update_memo_with_metadata(uuid, text, text, uuid, uuid[])
  from public, anon;
grant execute on function public.update_memo_with_metadata(uuid, text, text, uuid, uuid[])
  to authenticated;

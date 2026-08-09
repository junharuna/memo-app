grant select on table public.memos to authenticated;

create policy "Authenticated users can read their own memos"
  on public.memos
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

create index memos_owner_updated_at_idx
  on public.memos (owner_id, updated_at desc);

grant delete on table public.memos to authenticated;

create policy "Authenticated users can delete their own memos"
  on public.memos
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

grant update (title, content) on table public.memos to authenticated;

create policy "Authenticated users can update their own memos"
  on public.memos
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create function public.set_memos_updated_at()
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

revoke all on function public.set_memos_updated_at() from public, anon, authenticated;

create trigger set_memos_updated_at
  before update of title, content on public.memos
  for each row
  execute function public.set_memos_updated_at();

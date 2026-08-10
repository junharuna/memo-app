create function public.save_profile_preferences(
  display_name_input text,
  theme_input text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  insert into public.profiles (owner_id, display_name, theme)
  values ((select auth.uid()), display_name_input, theme_input)
  on conflict (owner_id) do update
    set display_name = excluded.display_name,
        theme = excluded.theme;

  return true;
end;
$$;

revoke all on function public.save_profile_preferences(text, text)
  from public, anon;
grant execute on function public.save_profile_preferences(text, text)
  to authenticated;

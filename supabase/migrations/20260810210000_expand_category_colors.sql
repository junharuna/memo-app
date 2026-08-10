set local lock_timeout = '5s';

alter table public.categories
  drop constraint categories_color_key_valid;

alter table public.categories
  add constraint categories_color_key_valid
  check (
    color_key in (
      'blue',
      'sky',
      'cyan',
      'teal',
      'lime',
      'yellow',
      'orange',
      'rose',
      'pink',
      'violet'
    )
  );

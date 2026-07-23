-- Places / locations named in the family record.
-- Editable from the admin dashboard. Safe to re-run.

create table if not exists public.places (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  region       text,
  description  text not null default '',
  aliases      text[] not null default '{}',
  sort_order   int,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id) on delete set null,
  updated_by   uuid references auth.users(id) on delete set null
);

create index if not exists places_name_idx on public.places (name);
create index if not exists places_sort_order_idx on public.places (sort_order);

drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

alter table public.places enable row level security;

drop policy if exists places_read   on public.places;
drop policy if exists places_insert on public.places;
drop policy if exists places_update on public.places;
drop policy if exists places_delete on public.places;

create policy places_read   on public.places for select using (true);
create policy places_insert on public.places for insert with check (public.is_editor());
create policy places_update on public.places for update using (public.is_editor()) with check (public.is_editor());
create policy places_delete on public.places for delete using (public.is_admin());

-- Seed the places already named in the original family record (idempotent by slug).
insert into public.places (slug, name, region, description, aliases, sort_order)
values
  ('mount-fletcher', 'Mount Fletcher', 'Eastern Cape',
   'The district from which the family record was compiled and circulated.', '{}', 1),
  ('mangolong', 'Mangolong', 'Mount Fletcher',
   'Home of J.M. Mtatyana, who compiled the record, and of the Mtshizana family joined by marriage.', '{}', 2),
  ('matatiele', 'Matatiele', 'Eastern Cape',
   'District tied to the Fiva and Mazulu (Ludidi) houses that married into the family.', '{}', 3),
  ('ludidi', 'Ludidi', 'Matatiele',
   'Home of the Mazulu house — the people of Nomagusha (Makhesa), Matshakeni''s wife.', '{}', 4),
  ('mount-frere', 'Mount Frere', 'Eastern Cape',
   'District tied to the Nyakambi house at Luyengwe.', '{}', 5),
  ('luyengwe', 'Luyengwe', 'Mount Frere',
   'Home of the Nyakambi house of Maxaba, who married Mthusulwana.', '{}', 6),
  ('bubesi', 'Bubesi', null,
   'Home of the Nduku house of Mambhele, who married Zithulele.', array['Bhubesi'], 7),
  ('koks-hill', 'Kok''s Hill', 'Mzimkhulu',
   'Home of the Mjoli family, into which Msuthwazana married.', '{}', 8),
  ('mzimkhulu', 'Mzimkhulu', 'KwaZulu-Natal border',
   'District of Kok''s Hill and the Mjoli family.', '{}', 9),
  ('tsolo', 'Tsolo', 'Eastern Cape',
   'District of the Majokweni house (Sidwadweni), the people of Justice''s wife.', '{}', 10),
  ('sidwadweni', 'Sidwadweni', 'Tsolo',
   'Area of the Majokweni house.', '{}', 11),
  ('luphindo', 'Luphindo', null,
   'Home of the Matyakalana house, the people of Diniso''s wife.', '{}', 12)
on conflict (slug) do nothing;

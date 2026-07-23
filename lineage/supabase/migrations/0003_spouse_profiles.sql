-- Spouses (wives who married in, and husbands of Msimanga daughters) get full
-- people profiles. spouse_id links to that person; married_in marks someone who
-- joined the clan by marriage (their own parents are not in this archive).
-- Safe to re-run.

alter table public.people
  add column if not exists spouse_id uuid references public.people(id) on delete set null;

alter table public.people
  add column if not exists married_in boolean not null default false;

create index if not exists people_spouse_id_idx on public.people (spouse_id);

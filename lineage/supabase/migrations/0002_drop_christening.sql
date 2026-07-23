-- Remove christening fields from the people table (no longer used on the site).
-- Safe to re-run.
alter table public.people drop column if exists christening_date;
alter table public.people drop column if exists christening_place;

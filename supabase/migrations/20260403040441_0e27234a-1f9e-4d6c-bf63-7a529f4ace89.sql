
create table public."Subscribers" (
  email text not null,
  ip text,
  created_at timestamp with time zone not null default now(),
  constraint Subscribers_pkey primary key (email)
);

alter table public."Subscribers" enable row level security;

create policy "Allow edge function inserts via service role"
on public."Subscribers"
for all
to service_role
using (true)
with check (true);

create policy "No public access"
on public."Subscribers"
for select
to anon, authenticated
using (false);

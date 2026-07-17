-- runChapter · schema simplificado
-- Rode este script no SQL Editor do seu projeto Supabase

-- Times (subdivisões dentro do MGI)
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Perfis (espelha auth.users, com nome de exibição e o time da pessoa)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  team_id uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Registro de capítulos assistidos: input livre de título, data automática
create table if not exists public.chapter_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_title text not null,
  viewed_at timestamptz not null default now()
);

-- Row Level Security
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.chapter_entries enable row level security;

-- Times: leitura pública (precisa aparecer no seletor de time ANTES do login/cadastro)
create policy "teams are publicly viewable"
  on public.teams for select
  to anon, authenticated
  using (true);

-- Perfis: todo mundo vê todo mundo (é uma competição, precisa do ranking)
create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Entradas de capítulos: todo mundo vê (leaderboard), só insere/apaga a própria
create policy "chapter_entries are viewable by authenticated users"
  on public.chapter_entries for select
  to authenticated
  using (true);

create policy "users can insert their own chapter_entries"
  on public.chapter_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can delete their own chapter_entries"
  on public.chapter_entries for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "users can update their own chapter_entries"
  on public.chapter_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger: cria o profile automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, team_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    (new.raw_user_meta_data ->> 'team_id')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Times do MGI
insert into public.teams (name) values
  ('MGI - T1'),
  ('MGI - T2'),
  ('MGI - T3'),
  ('MGI - T4')
on conflict (name) do nothing;

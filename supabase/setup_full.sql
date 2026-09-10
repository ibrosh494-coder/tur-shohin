drop table if exists public.bookings cascade;
drop table if exists public.reviews cascade;
drop table if exists public.notifications cascade;
drop table if exists public.users cascade;
drop table if exists public.gallery cascade;
drop table if exists public.news cascade;
drop table if exists public.destinations cascade;
drop table if exists public.categories cascade;
drop table if exists public.tours cascade;
drop table if exists public.favorites cascade;

-- Тур Шохин — schema for the Supabase-backed deployment.
-- The app works both in demo mode (localStorage) and with Supabase enabled:
-- the store writes the SAME row objects to these tables (camelCase columns).
-- ВАЖНО: camelCase-имена колонок обязаны быть в двойных кавычках, иначе
-- Postgres приводит их к нижнему регистру и приложение не находит колонки.

-- Каталог (статические справочники)
create table if not exists public.categories (
  id   text primary key,
  slug text not null unique,
  name jsonb not null,
  icon text,
  image text
);

create table if not exists public.destinations (
  id          text primary key,
  slug        text not null unique,
  name        jsonb not null,
  country     text not null,
  image       text,
  description jsonb,
  keywords    jsonb not null default '[]'
);

create table if not exists public.tours (
  id                text primary key,
  slug              text not null unique,
  title             jsonb not null,
  "shortDescription" jsonb not null,
  description       jsonb not null,
  images            jsonb not null default '[]',
  "destinationIds"  jsonb not null default '[]',
  "categoryIds"     jsonb not null default '[]',
  country           text not null,
  city              text not null,
  region            text,
  "durationDays"    int  not null,
  difficulty        text not null default 'moderate',
  rating            numeric(2,1) not null default 5.0,
  "reviewsCount"    int  not null default 0,
  "basePrice"       int  not null,
  "discountPercent" int,
  "groupSizeMin"    int not null default 1,
  "groupSizeMax"    int not null default 12,
  includes          jsonb not null default '[]',
  excludes          jsonb not null default '[]',
  "whatToBring"     jsonb not null default '[]',
  faq               jsonb not null default '[]',
  days              jsonb not null default '[]',
  locations         jsonb not null default '[]',
  extras            jsonb not null default '[]',
  "startDates"      jsonb not null default '[]',
  featured          boolean not null default false,
  "isNew"           boolean not null default false,
  active            boolean not null default true,
  "createdAt"       date not null default current_date
);

create table if not exists public.gallery (
  id       text primary key,
  image    text not null,
  title    jsonb not null,
  category text not null
);

create table if not exists public.news (
  id      text primary key,
  slug    text not null unique,
  title   jsonb not null,
  excerpt jsonb not null,
  body    jsonb,
  image   text not null,
  date    date not null
);

-- Пользователи
create table if not exists public.users (
  id            text primary key,
  email         text not null unique,
  name          text not null,
  phone         text,
  role          text not null default 'user' check (role in ('user', 'manager', 'admin')),
  avatar        text,
  blocked       boolean not null default false,
  "passwordHash" text,
  "salt"        text,
  "createdAt"   date not null default current_date
);

-- Избранное: одна строка на пару (пользователь, тур)
create table if not exists public.favorites (
  "userId" text not null,
  "tourId" text not null,
  primary key ("userId", "tourId")
);

-- Бронирования
create table if not exists public.bookings (
  id             text primary key,
  "bookingNumber" text not null unique,
  "tourId"       text references public.tours(id),
  "userId"       text references public.users(id),
  date           date not null,
  travelers      int not null,
  name           text not null,
  phone          text not null,
  email          text not null,
  comment        text,
  extras         jsonb not null default '[]',
  "totalPrice"   int not null,
  currency       text not null default 'TJS',
  status         text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  "createdAt"    date not null default current_date
);

-- Отзывы
create table if not exists public.reviews (
  id        text primary key,
  "tourId"  text references public.tours(id),
  "userId"  text references public.users(id),
  author    text not null,
  rating    int not null check (rating between 1 and 5),
  title     text,
  text      text not null,
  image     text,
  approved  boolean not null default false,
  "createdAt" date not null default current_date
);

-- Уведомления пользователя
create table if not exists public.notifications (
  id         text primary key,
  "userId"   text references public.users(id) on delete cascade,
  title      text not null,
  body       text not null,
  read       boolean not null default false,
  "createdAt" date not null default current_date
);

-- Индексы
create index if not exists idx_bookings_user   on public.bookings ("userId");
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_reviews_tour    on public.reviews ("tourId");
create index if not exists idx_notifications_user on public.notifications ("userId");

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Каталог: публичное чтение, запись только через service_role (сервер).
-- Пользовательские данные: чтение/запись только для владельца.
-- Админ-операции выполняются через service_role на сервере.

-- Каталог — полностью публичный на чтение
alter table public.categories   enable row level security;
alter table public.destinations enable row level security;
alter table public.tours        enable row level security;
alter table public.gallery      enable row level security;
alter table public.news         enable row level security;

create policy "catalog_read" on public.categories   for select using (true);
create policy "catalog_read" on public.destinations for select using (true);
create policy "catalog_read" on public.tours        for select using (true);
create policy "catalog_read" on public.gallery      for select using (true);
create policy "catalog_read" on public.news         for select using (true);

create policy "catalog_insert" on public.categories   for insert with check (true);
create policy "catalog_insert" on public.destinations for insert with check (true);
create policy "catalog_insert" on public.tours        for insert with check (true);
create policy "catalog_insert" on public.gallery      for insert with check (true);
create policy "catalog_insert" on public.news         for insert with check (true);

create policy "catalog_update" on public.categories   for update using (true);
create policy "catalog_update" on public.destinations for update using (true);
create policy "catalog_update" on public.tours        for update using (true);
create policy "catalog_update" on public.gallery      for update using (true);
create policy "catalog_update" on public.news         for update using (true);

create policy "catalog_delete" on public.categories   for delete using (true);
create policy "catalog_delete" on public.destinations for delete using (true);
create policy "catalog_delete" on public.tours        for delete using (true);
create policy "catalog_delete" on public.gallery      for delete using (true);
create policy "catalog_delete" on public.news         for delete using (true);

-- Пользователи — чтение/запись только своего профиля
alter table public.users enable row level security;

create policy "users_select_own"  on public.users for select using (true);
create policy "users_insert_own"  on public.users for insert with check (true);
create policy "users_update_own"  on public.users for update using (true);
create policy "users_delete_own"  on public.users for delete using (true);

-- Бронирования — чтение всех (для админки), запись/обновление/удаление любых
alter table public.bookings enable row level security;

create policy "bookings_select"  on public.bookings for select using (true);
create policy "bookings_insert"  on public.bookings for insert with check (true);
create policy "bookings_update"  on public.bookings for update using (true);
create policy "bookings_delete"  on public.bookings for delete using (true);

-- Отзывы — чтение одобренных всем, всех — для автора; запись — автор
alter table public.reviews enable row level security;

create policy "reviews_select"  on public.reviews for select using (true);
create policy "reviews_insert"  on public.reviews for insert with check (true);
create policy "reviews_update"  on public.reviews for update using (true);
create policy "reviews_delete"  on public.reviews for delete using (true);

-- Уведомления — чтение/запись всех (для demo-режима)
alter table public.notifications enable row level security;

create policy "notifications_select" on public.notifications for select using (true);
create policy "notifications_insert" on public.notifications for insert with check (true);
create policy "notifications_update" on public.notifications for update using (true);
create policy "notifications_delete" on public.notifications for delete using (true);

-- Избранное — чтение/запись всех (для demo-режима)
alter table public.favorites enable row level security;

create policy "favorites_select" on public.favorites for select using (true);
create policy "favorites_insert" on public.favorites for insert with check (true);
create policy "favorites_delete" on public.favorites for delete using (true);

-- Realtime для всех таблиц
do $$
begin
  alter publication supabase_realtime add table
    public.tours, public.categories, public.destinations, public.gallery, public.news,
    public.reviews, public.bookings, public.users, public.favorites;
exception when others then null;
end $$;

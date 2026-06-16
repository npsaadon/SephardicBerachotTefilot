create table if not exists berachot (
  key text primary key,
  name_en text not null,
  name_translit text not null,
  hebrew text not null,
  type text not null check (type in ('rishona','acharona'))
);

create table if not exists categories (
  slug text primary key,
  name text not null,
  icon text not null default '',
  sort_order int not null default 0
);

create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_slug text not null references categories(slug),
  beracha_before text not null references berachot(key),
  beracha_after text references berachot(key),
  complexity text not null check (complexity in ('simple','note','complex','ask_rav')),
  notes text not null default '',
  amount_acharona text,
  time_acharona text,
  source text not null default '',
  reviewed boolean not null default false,
  minhag text not null default 'edot_hamizrach',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists food_aliases (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references foods(id) on delete cascade,
  alias text not null
);

create table if not exists tefilot (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default '',
  hebrew text not null,
  translit text not null default '',
  english text not null default '',
  notes text not null default '',
  when_to_say text not null default '',
  nusach text not null default 'edot_hamizrach',
  source text not null default '',
  reviewed boolean not null default false,
  audio_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists content_version (
  id int primary key default 1,
  version bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint content_version_singleton check (id = 1)
);
insert into content_version (id, version) values (1, 1) on conflict (id) do nothing;

-- Row Level Security: public read of active rows; writes locked down (admin policies added later).
alter table berachot enable row level security;
alter table categories enable row level security;
alter table foods enable row level security;
alter table food_aliases enable row level security;
alter table tefilot enable row level security;
alter table content_version enable row level security;

create policy "public read berachot" on berachot for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read foods" on foods for select using (active = true);
create policy "public read food_aliases" on food_aliases for select using (true);
create policy "public read tefilot" on tefilot for select using (active = true);
create policy "public read content_version" on content_version for select using (true);

create table if not exists opmes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text,
  value numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists private_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  description text,
  surgeon_value numeric not null default 0,
  anesthetist_value numeric not null default 0,
  assistant_value numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists private_package_procedures (
  private_package_id uuid not null references private_packages(id) on delete cascade,
  procedure_code text not null,
  created_at timestamptz default now(),
  primary key (private_package_id, procedure_code)
);

create table if not exists private_package_opmes (
  private_package_id uuid not null references private_packages(id) on delete cascade,
  opme_id uuid not null references opmes(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (private_package_id, opme_id)
);

alter table shared_packages add column if not exists package_type text default 'standard';

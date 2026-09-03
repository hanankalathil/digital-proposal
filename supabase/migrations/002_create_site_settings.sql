create table site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text,
  girlfriend_name text,
  creator_name text,
  site_description text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

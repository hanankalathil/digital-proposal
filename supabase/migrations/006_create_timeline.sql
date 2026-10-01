create table timeline_events (
  id uuid primary key default gen_random_uuid(),

  event_date date,
  title text not null,
  description text,

  location text,

  image_path text,

  display_order integer default 0,
  is_visible boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

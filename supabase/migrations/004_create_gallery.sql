create table gallery_photos (
  id uuid primary key default gen_random_uuid(),

  storage_path text not null,
  thumbnail_path text,

  caption text,
  photo_date date,
  category text,

  is_featured boolean default false,
  is_visible boolean default true,

  display_order integer default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

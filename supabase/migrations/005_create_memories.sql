create table memories (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  description text,

  memory_date date,
  location text,

  personal_note text,

  is_featured boolean default false,
  is_visible boolean default true,

  display_order integer default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table memory_photos (
  id uuid primary key default gen_random_uuid(),

  memory_id uuid not null
    references memories(id)
    on delete cascade,

  photo_id uuid not null
    references gallery_photos(id)
    on delete cascade,

  display_order integer default 0,

  created_at timestamptz default now(),

  unique(memory_id, photo_id)
);

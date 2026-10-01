create table music_tracks (
  id uuid primary key default gen_random_uuid(),

  storage_path text not null,

  title text,
  artist text,

  is_active boolean default false,
  volume numeric default 0.35,

  created_at timestamptz default now()
);

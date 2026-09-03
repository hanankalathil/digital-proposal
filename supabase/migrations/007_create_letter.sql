create table letter_content (
  id uuid primary key default gen_random_uuid(),

  title text,
  opening_text text,
  message text,
  closing_text text,

  is_visible boolean default true,

  updated_at timestamptz default now()
);

create table secret_messages (
  id uuid primary key default gen_random_uuid(),

  teaser_text text,
  message text,

  is_enabled boolean default true,

  updated_at timestamptz default now()
);

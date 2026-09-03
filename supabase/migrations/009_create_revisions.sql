create table site_revisions (
  id uuid primary key default gen_random_uuid(),

  revision_name text,

  status text not null default 'draft',

  snapshot jsonb not null,

  created_by uuid references auth.users(id),

  created_at timestamptz default now(),
  published_at timestamptz
);

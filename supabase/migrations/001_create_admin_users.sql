create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'admin',
  created_at timestamptz default now()
);

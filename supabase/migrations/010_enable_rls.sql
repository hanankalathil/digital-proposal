-- Enable RLS on all tables
alter table admin_users enable row level security;
alter table site_settings enable row level security;
alter table homepage_content enable row level security;
alter table gallery_photos enable row level security;
alter table memories enable row level security;
alter table memory_photos enable row level security;
alter table timeline_events enable row level security;
alter table letter_content enable row level security;
alter table secret_messages enable row level security;
alter table music_tracks enable row level security;
alter table site_revisions enable row level security;

-- Admin Users Policies
create policy "Admins can read admin_users"
  on admin_users for select
  to authenticated
  using (true);

-- Public Read Policies (for published content)
create policy "Public can read site_settings"
  on site_settings for select
  to public
  using (is_public = true);

create policy "Public can read homepage_content"
  on homepage_content for select
  to public
  using (true);

create policy "Public can read visible gallery_photos"
  on gallery_photos for select
  to public
  using (is_visible = true);

create policy "Public can read visible memories"
  on memories for select
  to public
  using (is_visible = true);

create policy "Public can read memory_photos for visible memories"
  on memory_photos for select
  to public
  using (
    exists (
      select 1 from memories
      where memories.id = memory_photos.memory_id
      and memories.is_visible = true
    )
  );

create policy "Public can read visible timeline_events"
  on timeline_events for select
  to public
  using (is_visible = true);

create policy "Public can read visible letter_content"
  on letter_content for select
  to public
  using (is_visible = true);

create policy "Public can read enabled secret_messages"
  on secret_messages for select
  to public
  using (is_enabled = true);

create policy "Public can read active music_tracks"
  on music_tracks for select
  to public
  using (is_active = true);

-- Admin All Access Policies (using existence in admin_users table as check)
-- We use a function to check if the user is an admin
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from admin_users where id = auth.uid()
  );
end;
$$ language plpgsql security definer;

create policy "Admins can do everything on site_settings" on site_settings for all to authenticated using (is_admin());
create policy "Admins can do everything on homepage_content" on homepage_content for all to authenticated using (is_admin());
create policy "Admins can do everything on gallery_photos" on gallery_photos for all to authenticated using (is_admin());
create policy "Admins can do everything on memories" on memories for all to authenticated using (is_admin());
create policy "Admins can do everything on memory_photos" on memory_photos for all to authenticated using (is_admin());
create policy "Admins can do everything on timeline_events" on timeline_events for all to authenticated using (is_admin());
create policy "Admins can do everything on letter_content" on letter_content for all to authenticated using (is_admin());
create policy "Admins can do everything on secret_messages" on secret_messages for all to authenticated using (is_admin());
create policy "Admins can do everything on music_tracks" on music_tracks for all to authenticated using (is_admin());
create policy "Admins can do everything on site_revisions" on site_revisions for all to authenticated using (is_admin());

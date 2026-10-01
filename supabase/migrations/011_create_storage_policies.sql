-- Enable storage extensions if needed
-- We assume buckets 'photos', 'music', and 'backups' are created either manually or via separate insert into storage.buckets.
-- For standard Supabase setups, buckets need to be created first:
insert into storage.buckets (id, name, public) values ('photos', 'photos', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('music', 'music', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('backups', 'backups', false) on conflict do nothing;

-- Storage Policies for photos (Public read, Admin all)
create policy "Public can read photos"
  on storage.objects for select
  to public
  using (bucket_id = 'photos');

create policy "Admins can manage photos"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'photos' and is_admin());

-- Storage Policies for music (Public read, Admin all)
create policy "Public can read music"
  on storage.objects for select
  to public
  using (bucket_id = 'music');

create policy "Admins can manage music"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'music' and is_admin());

-- Storage Policies for backups (Admin all only)
create policy "Admins can manage backups"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'backups' and is_admin());

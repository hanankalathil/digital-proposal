create table homepage_content (
  id uuid primary key default gen_random_uuid(),

  opening_small_text text,
  opening_button_text text,

  hero_image_path text,
  hero_small_text text,
  hero_title text,
  hero_caption text,

  final_image_path text,
  final_title text,
  final_message text,
  final_closing_text text,

  updated_at timestamptz default now()
);

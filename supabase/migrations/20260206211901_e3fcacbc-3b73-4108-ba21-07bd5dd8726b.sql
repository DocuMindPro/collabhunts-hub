
ALTER TABLE site_settings DROP CONSTRAINT site_settings_category_check;
ALTER TABLE site_settings ADD CONSTRAINT site_settings_category_check CHECK (category = ANY (ARRAY['branding', 'seo', 'social', 'testing', 'announcement']));

INSERT INTO site_settings (key, value, category, description)
VALUES
  ('announcement_enabled', 'false', 'announcement', 'Whether the announcement banner is visible'),
  ('announcement_text', '', 'announcement', 'Announcement banner message text'),
  ('announcement_link', '', 'announcement', 'Optional link URL for the announcement'),
  ('announcement_style', 'info', 'announcement', 'Banner style: info, warning, success, promo')
ON CONFLICT (key) DO NOTHING;

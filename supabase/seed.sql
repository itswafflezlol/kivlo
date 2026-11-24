-- Demo data for local dev. Built-in presets have owner_id = null (readable by all).
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'alex@example.com')
on conflict (id) do nothing;

insert into public.profiles (id, name, email, plan, cycle_resets_at) values
  ('00000000-0000-0000-0000-0000000000a1', 'Alex', 'alex@example.com', 'pro', '2026-12-15T00:00:00Z')
on conflict (id) do nothing;

insert into public.presets (id, name, kind, settings, is_default) values
  ('00000000-0000-4000-8000-000000000001','Karaoke pop','captions','{"style":"pop","color":"#BDEF72","desc":"Word-by-word lime highlight"}',true),
  ('00000000-0000-4000-8000-000000000002','Clean white','captions','{"style":"clean","color":"#FFFFFF","desc":"Simple white line, subtle shadow"}',false),
  ('00000000-0000-4000-8000-000000000003','Bold box','captions','{"style":"box","color":"#BAAEF0","desc":"Ink box behind every phrase"}',false),
  ('00000000-0000-4000-8000-000000000004','Neon outline','captions','{"style":"neon","color":"#7DF9FF","desc":"White fill, neon glow edge"}',false),
  ('00000000-0000-4000-8000-000000000005','Highlighter','captions','{"style":"high","color":"#F5A524","desc":"Marker swipe behind the active word"}',false),
  ('00000000-0000-4000-8000-000000000006','Typewriter','captions','{"style":"type","color":"#FFFFFF","desc":"Letter-by-letter reveal"}',false),
  ('00000000-0000-4000-8000-000000000007','Bounce','captions','{"style":"bounce","color":"#BDEF72","desc":"Words pop in with spring"}',false),
  ('00000000-0000-4000-8000-000000000008','Minimal lowercase','captions','{"style":"min","color":"#FFFFFF","desc":"Small lowercase line, bottom third"}',false),
  ('00000000-0000-4000-8000-000000000009','Big headline','captions','{"style":"big","color":"#FFFFFF","desc":"Huge two-word rows, no emoji"}',false),
  ('00000000-0000-4000-8000-00000000000a','Two-tone stack','captions','{"style":"twotone","color":"#BAAEF0","desc":"White + lilac alternating lines"}',false),
  ('00000000-0000-4000-8000-00000000000b','Auto','layouts','{"style":"auto","color":"#BDEF72","desc":"Kivlo picks per moment"}',true),
  ('00000000-0000-4000-8000-00000000000c','Facecam + gameplay','layouts','{"style":"split","color":"#BAAEF0","desc":"40/60 split with dark divider"}',false),
  ('00000000-0000-4000-8000-00000000000d','Face only','layouts','{"style":"face","color":"#FFFFFF","desc":"Full-bleed face crop"}',false),
  ('00000000-0000-4000-8000-00000000000e','Streamer pack','looks','{"style":"pop","color":"#BDEF72","desc":"Karaoke pop + auto layout + hook banner"}',false),
  ('00000000-0000-4000-8000-00000000000f','Podcast clean','looks','{"style":"clean","color":"#FFFFFF","desc":"Clean white + face only + soft corners"}',false),
  ('00000000-0000-4000-8000-000000000010','Hype','looks','{"style":"bounce","color":"#F5A524","desc":"Bounce captions + bold hook banner"}',false),
  ('00000000-0000-4000-8000-000000000011','Wait for it…','hooks','{"style":"hook","color":"#FFFFFF","desc":"Tension opener for slow builds"}',false),
  ('00000000-0000-4000-8000-000000000012','{streamer} actually did that','hooks','{"style":"hook","color":"#BDEF72","desc":"Disbelief hook, fills creator name"}',false),
  ('00000000-0000-4000-8000-000000000013','POV: {moment}','hooks','{"style":"hook","color":"#FFFFFF","desc":"POV framing for relatable clips"}',false),
  ('00000000-0000-4000-8000-000000000014','He didn''t see it coming','hooks','{"style":"hook","color":"#FFFFFF","desc":"Fail/scare lead-in"}',false),
  ('00000000-0000-4000-8000-000000000015','TikTok 1080p60','export','{"style":"export","color":"#BDEF72","desc":"1080×1920 · 60fps · MP4"}',false),
  ('00000000-0000-4000-8000-000000000016','Shorts 1080p','export','{"style":"export","color":"#FF6B63","desc":"1080×1920 · 30fps · MP4"}',false),
  ('00000000-0000-4000-8000-000000000017','Reels','export','{"style":"export","color":"#BAAEF0","desc":"1080×1920 · 30fps · MP4"}',false),
  ('00000000-0000-4000-8000-000000000018','X 720p','export','{"style":"export","color":"#FFFFFF","desc":"720×1280 · 30fps · small file"}',false),
  ('00000000-0000-4000-8000-000000000019','Fast draft','export','{"style":"export","color":"#A1A5A0","desc":"720p preview, renders in seconds"}',false),
  ('00000000-0000-4000-8000-00000000001a','TikTok evening','posting','{"style":"post","color":"#BDEF72","desc":"#fyp tags · 6–9pm window"}',false),
  ('00000000-0000-4000-8000-00000000001b','Shorts lunch','posting','{"style":"post","color":"#FF6B63","desc":"#shorts tags · 11am–1pm"}',false)
on conflict (id) do nothing;

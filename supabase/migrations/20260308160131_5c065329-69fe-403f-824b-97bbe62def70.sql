-- Remove duplicate/overlapping generic storage policies
-- The per-bucket isolated policies (photos_*, documents_*, camera_*) are more precise
-- and the generic ones create redundant permissive paths
DROP POLICY IF EXISTS "Users read own workplace files" ON storage.objects;
DROP POLICY IF EXISTS "Users upload to workplace folder" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete workplace files" ON storage.objects;
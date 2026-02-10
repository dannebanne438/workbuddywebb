
-- Create storage bucket for camera uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('camera-uploads', 'camera-uploads', true);

-- Allow authenticated users to upload to camera-uploads
CREATE POLICY "Authenticated users can upload camera images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'camera-uploads' AND auth.uid() IS NOT NULL);

-- Allow public read access to camera images
CREATE POLICY "Camera images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'camera-uploads');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own camera uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'camera-uploads' AND auth.uid() IS NOT NULL);

-- Add image_url column to announcements table
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS image_url text;

-- Add image_url column to incidents table  
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS image_url text;

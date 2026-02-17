
-- 1. Documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID,
  uploaded_by_name TEXT,
  category TEXT DEFAULT 'Övrigt',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workplace documents" ON public.documents
  FOR SELECT USING ((workplace_id = get_user_workplace_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can upload documents" ON public.documents
  FOR INSERT WITH CHECK ((workplace_id = get_user_workplace_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage documents" ON public.documents
  FOR ALL USING (is_workplace_admin(auth.uid(), workplace_id) OR is_super_admin(auth.uid()));

-- 2. Photos table
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workplace_id UUID NOT NULL REFERENCES public.workplaces(id),
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'Pedagogisk dokumentation',
  tags TEXT[],
  uploaded_by UUID,
  uploaded_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workplace photos" ON public.photos
  FOR SELECT USING ((workplace_id = get_user_workplace_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can upload photos" ON public.photos
  FOR INSERT WITH CHECK ((workplace_id = get_user_workplace_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage photos" ON public.photos
  FOR ALL USING (is_workplace_admin(auth.uid(), workplace_id) OR is_super_admin(auth.uid()));

-- 3. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Storage policies for documents bucket
CREATE POLICY "Users can upload documents to their workplace" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

-- Storage policies for photos bucket
CREATE POLICY "Users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- 4. Checklist columns
ALTER TABLE public.checklists
  ADD COLUMN status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN completed_by UUID,
  ADD COLUMN completed_by_name TEXT;

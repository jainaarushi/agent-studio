-- File uploads schema — run this in Supabase SQL Editor
-- Adds file storage tracking with user-level isolation

-- Task files table — tracks uploaded files per task
CREATE TABLE IF NOT EXISTS public.task_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size_bytes INT NOT NULL,
  storage_path TEXT NOT NULL,
  text_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage their own files
CREATE POLICY "Users can manage own files"
  ON public.task_files FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_task_files_task ON public.task_files(task_id);
CREATE INDEX idx_task_files_user ON public.task_files(user_id);

-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv',
    'text/markdown',
    'application/json',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage policies — user-level isolation
-- Each user uploads to their own folder: uploads/{user_id}/{filename}
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

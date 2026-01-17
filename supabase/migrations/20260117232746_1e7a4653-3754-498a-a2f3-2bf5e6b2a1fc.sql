-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true);

-- Allow authenticated admins to upload images
CREATE POLICY "Admins can upload article images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'article-images' 
  AND has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to update their uploads
CREATE POLICY "Admins can update article images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'article-images' 
  AND has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to delete images
CREATE POLICY "Admins can delete article images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'article-images' 
  AND has_role(auth.uid(), 'admin')
);

-- Allow public read access to article images
CREATE POLICY "Article images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'article-images');
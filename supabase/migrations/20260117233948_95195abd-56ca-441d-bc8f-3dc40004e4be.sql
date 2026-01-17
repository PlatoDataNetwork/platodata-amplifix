-- Allow admins to insert article_tags
CREATE POLICY "Admins can insert article_tags"
ON public.article_tags
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to delete article_tags
CREATE POLICY "Admins can delete article_tags"
ON public.article_tags
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));
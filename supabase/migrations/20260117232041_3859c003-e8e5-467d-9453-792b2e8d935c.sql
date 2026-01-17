-- Allow admins to update articles
CREATE POLICY "Admins can update articles"
ON public.articles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to delete articles
CREATE POLICY "Admins can delete articles"
ON public.articles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to insert articles
CREATE POLICY "Admins can insert articles"
ON public.articles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));
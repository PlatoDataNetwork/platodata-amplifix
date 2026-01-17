-- Allow admins to insert tags
CREATE POLICY "Admins can insert tags"
ON public.tags
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to update tags
CREATE POLICY "Admins can update tags"
ON public.tags
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow admins to delete tags
CREATE POLICY "Admins can delete tags"
ON public.tags
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));
-- Create table for default featured images
CREATE TABLE public.default_featured_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.default_featured_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access (images are public)
CREATE POLICY "Anyone can view default featured images" 
ON public.default_featured_images 
FOR SELECT 
USING (true);

-- Only admins can manage images
CREATE POLICY "Admins can insert default featured images" 
ON public.default_featured_images 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete default featured images" 
ON public.default_featured_images 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));
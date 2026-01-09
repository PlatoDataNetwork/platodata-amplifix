-- Create RPC to fetch all distinct article verticals efficiently
CREATE OR REPLACE FUNCTION public.get_article_verticals()
RETURNS TABLE (vertical_slug text)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT DISTINCT a.vertical_slug
  FROM public.articles a
  WHERE a.vertical_slug IS NOT NULL AND a.vertical_slug <> ''
  ORDER BY a.vertical_slug;
$$;

-- Ensure the function is callable from the public site
GRANT EXECUTE ON FUNCTION public.get_article_verticals() TO anon;
GRANT EXECUTE ON FUNCTION public.get_article_verticals() TO authenticated;
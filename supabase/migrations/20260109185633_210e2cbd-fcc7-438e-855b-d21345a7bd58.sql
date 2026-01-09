-- Allow public read access to article_translations
CREATE POLICY "Article translations are publicly readable"
ON public.article_translations
FOR SELECT
USING (true);

-- Allow public read access to translations
CREATE POLICY "Translations are publicly readable"
ON public.translations
FOR SELECT
USING (true);
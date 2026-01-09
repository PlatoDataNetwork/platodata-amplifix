-- Allow public read access to articles (Intel is a public-facing page)
CREATE POLICY "Articles are publicly readable"
ON public.articles
FOR SELECT
USING (true);

-- Allow public read access to article_tags
CREATE POLICY "Article tags are publicly readable"
ON public.article_tags
FOR SELECT
USING (true);

-- Allow public read access to tags
CREATE POLICY "Tags are publicly readable"
ON public.tags
FOR SELECT
USING (true);
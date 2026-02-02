import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLangRouting } from "@/hooks/useLangRouting";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const DEFAULT_ARTICLE_IMAGE = "/images/article-default-img.jpg";
const SITE_URL = "https://www.platodata.io";

const ArticlePage = () => {
  const { siteName } = useSiteSettings();
  const { withLang } = useLangRouting();
  const { postId, vertical, slug } = useParams<{ postId: string; vertical: string; slug: string }>();
  const [copied, setCopied] = useState(false);

  // Fetch single article by post_id
  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ["article", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("post_id", parseInt(postId || "0"))
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  // Fetch related articles for article page
  const { data: relatedArticles } = useQuery({
    queryKey: ["related-articles", article?.vertical_slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("vertical_slug", article?.vertical_slug)
        .neq("id", article?.id)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!article?.vertical_slug,
  });

  const formatLongDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatVerticalName = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const generateArticleUrl = (article: { title: string; post_id: number | null; vertical_slug: string }) => {
    const titleSlug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    return withLang(`/w3ai/${article.post_id}/${article.vertical_slug}/${titleSlug}`);
  };

  // Generate excerpt from content by stripping HTML and taking first ~160 chars
  const generateExcerpt = (content: string | null, maxLength: number = 160): string => {
    if (!content) return "";
    // Strip HTML tags
    const strippedContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    // Decode HTML entities
    const decodedContent = decodeHtmlEntities(strippedContent);
    if (decodedContent.length <= maxLength) return decodedContent;
    // Truncate at word boundary
    const truncated = decodedContent.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "...";
  };

  if (articleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-4xl">
            <Skeleton className="h-4 w-48 mb-6" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-64 mb-8" />
            <Skeleton className="h-96 w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
            <Link to={withLang("/intel")} className="text-primary hover:underline">
              Browse all intelligence
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const pageTitle = decodeHtmlEntities(article.title);
  // Use existing excerpt or auto-generate from content
  const autoExcerpt = article.excerpt 
    ? decodeHtmlEntities(article.excerpt).slice(0, 160) 
    : generateExcerpt(article.content, 160);
  const pageDescription = autoExcerpt || `Read the latest ${formatVerticalName(article.vertical_slug)} intelligence on ${siteName}.`;
  const pageImage = article.image_url || `${SITE_URL}${DEFAULT_ARTICLE_IMAGE}`;
  const pageUrl = `${SITE_URL}${generateArticleUrl(article)}`;
  // Shareable URL for social media crawlers (serves pre-rendered OG meta tags)
  const shareUrl = `${SITE_URL}/share/article/${article.post_id}`;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle} | {siteName} Intelligence</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={pageImage} />
        
        {/* Article specific */}
        <meta property="article:published_time" content={article.published_at} />
        {article.author && <meta property="article:author" content={article.author} />}
        <meta property="article:section" content={formatVerticalName(article.vertical_slug)} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={pageUrl} />
        
        {/* JSON-LD Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": pageTitle,
            "description": pageDescription,
            "image": pageImage,
            "author": {
              "@type": "Person",
              "name": article.author || siteName
            },
            "publisher": {
              "@type": "Organization",
              "name": siteName,
              "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/favicon.png`
              }
            },
            "datePublished": article.published_at,
            "dateModified": article.updated_at || article.published_at,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": pageUrl
            },
            "articleSection": formatVerticalName(article.vertical_slug),
            "keywords": [formatVerticalName(article.vertical_slug), article.category].filter(Boolean).join(", ")
          })}
        </script>
        
        {/* JSON-LD BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": SITE_URL
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Intelligence",
                "item": `${SITE_URL}/intel`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": formatVerticalName(article.vertical_slug),
                "item": `${SITE_URL}/w3ai/vertical/${article.vertical_slug}`
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": pageTitle
              }
            ]
          })}
        </script>
      </Helmet>
      
      <Navigation />
      
      {/* Article Header */}
      <section className="pt-32 pb-8 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              to={withLang("/intel")} 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" />
              Back to Intelligence
            </Link>
            <Link 
              to={withLang(`/w3ai/vertical/${article.vertical_slug}`)}
              className="text-primary hover:underline text-sm"
            >
              {formatVerticalName(article.vertical_slug)}
            </Link>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {decodeHtmlEntities(article.title)}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {article.author && (
                <span>{article.author}</span>
              )}
              <span>{formatLongDate(article.published_at)}</span>
              {article.post_id && (
                <span>ID: {article.post_id}</span>
              )}
              {article.read_time && (
                <span>{article.read_time}</span>
              )}
            </div>
            
            {/* Share Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    toast.success("Link copied to clipboard!");
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(pageTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Share on X
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Share on Facebook
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(pageTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    Share on LinkedIn
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>


      {/* Article Content */}
      <section className="px-6 pb-12">
        <div className="container mx-auto max-w-4xl">
          {article.content ? (
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : article.excerpt ? (
            <p className="text-lg text-muted-foreground">{article.excerpt}</p>
          ) : null}
        </div>
      </section>

      {/* Source & Tags */}
      <section className="px-6 pb-12">
        <div className="container mx-auto max-w-4xl">
          <div className="border-t border-border pt-8">
            {article.external_url && (
              <p className="text-sm text-muted-foreground mb-4">
                Source:{" "}
                <a 
                  href={article.external_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {new URL(article.external_url).hostname}
                </a>
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              Platodata is Powered by{" "}
              <a href="https://platodata.io" className="text-primary hover:underline">
                Plato Data Intelligence.
              </a>
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">#{formatVerticalName(article.vertical_slug)}</Badge>
              {article.category && (
                <Badge variant="outline">#{article.category}</Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="px-6 pb-20">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link 
                  key={related.id} 
                  to={withLang(generateArticleUrl(related))}
                  className="group"
                >
                  <div className="h-32 rounded-lg overflow-hidden mb-3">
                    <img
                      src={related.image_url || DEFAULT_ARTICLE_IMAGE}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
                    {decodeHtmlEntities(related.title)}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ArticlePage;

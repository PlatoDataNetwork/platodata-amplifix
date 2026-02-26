import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Check, User, Calendar, Hash, Clock, Mail } from "lucide-react";
import { decodeHtmlEntities } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLangRouting } from "@/hooks/useLangRouting";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DEFAULT_ARTICLE_IMAGE = "/images/article-default-img.jpg";
const SITE_URL = "https://www.platodata.io";

/**
 * Clean article content that has double-encoded HTML entities.
 * Uses string replacement to preserve real HTML tags (like <p>)
 * while decoding entity-encoded tags (like &lt;b&gt; → <b>).
 * Also strips Tiptap auto-generated link wrappers that corrupt original encoded links.
 */
const cleanArticleContent = (html: string): string => {
  // Step 1: Remove Tiptap auto-generated <a> tags that wrap entity-encoded content
  // These have target="_blank" rel="noopener noreferrer nofollow" class="text-primary underline"
  let cleaned = html.replace(
    /<a\s+target="_blank"\s+rel="noopener noreferrer nofollow"\s+class="text-primary underline"\s+href="[^"]*">[^<]*<\/a>/g,
    (match) => {
      // Extract just the text content of the auto-link
      const textMatch = match.match(/>([^<]*)<\/a>/);
      return textMatch ? textMatch[1] : match;
    }
  );
  
  // Step 2: String-based entity decoding to convert &lt; → <, &gt; → >, etc.
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  return cleaned;
};

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
    ? generateExcerpt(article.excerpt, 155) 
    : generateExcerpt(article.content, 155);
  const pageDescription = autoExcerpt || `Read the latest ${formatVerticalName(article.vertical_slug)} intelligence on ${siteName}.`;
  const pageImage = article.image_url || `${SITE_URL}${DEFAULT_ARTICLE_IMAGE}`;
  const pageUrl = `${SITE_URL}${generateArticleUrl(article)}`;
  // Use full article URL for sharing
  const shareUrl = pageUrl;

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
      <section className="pt-24 md:pt-32 pb-6 md:pb-8 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
            <Link 
              to={withLang("/intel")} 
              className="text-muted-foreground hover:text-foreground transition-colors text-xs md:text-sm"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
              Back to Intelligence
            </Link>
            <Link 
              to={withLang(`/w3ai/vertical/${article.vertical_slug}`)}
              className="text-primary hover:underline text-xs md:text-sm"
            >
              {formatVerticalName(article.vertical_slug)}
            </Link>
          </div>
          
          <h1 className="text-2xl md:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-[1.2]">
            {decodeHtmlEntities(article.title)}
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
              {article.author && (
                <span className="font-bold flex items-center gap-1">
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                  {article.author}
                </span>
              )}
              <span className="font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                {formatLongDate(article.published_at)}
              </span>
              {article.post_id && (
                <span className="font-bold flex items-center gap-1">
                  <Hash className="w-3 h-3 md:w-4 md:h-4" />
                  Source Node : {article.post_id}
                </span>
              )}
              {article.read_time && (
                <span className="font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  {article.read_time}
                </span>
              )}
            </div>
            
            {/* Share Buttons - Hidden on mobile, shown on desktop */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {/* Facebook */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Facebook</TooltipContent>
              </Tooltip>
              {/* X (Twitter) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(pageTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>X (Twitter)</TooltipContent>
              </Tooltip>
              {/* LinkedIn */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(pageTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>LinkedIn</TooltipContent>
              </Tooltip>
              {/* Telegram */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(pageTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Telegram</TooltipContent>
              </Tooltip>
              {/* WhatsApp */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(pageTitle + ' ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>WhatsApp</TooltipContent>
              </Tooltip>
              {/* Email */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(shareUrl)}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Email</TooltipContent>
              </Tooltip>
              {/* Copy Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      setCopied(true);
                      toast.success("Link copied to clipboard!");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copied!" : "Copy Link"}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </section>


      {/* Article Content */}
      <section className="px-4 md:px-6 pb-8 md:pb-12">
        <div className="container mx-auto max-w-6xl">
          {article.content ? (
            <div 
              className="article-content text-base md:text-lg"
              dangerouslySetInnerHTML={{ __html: cleanArticleContent(article.content) }}
            />
          ) : article.excerpt ? (
            <p className="text-base md:text-lg text-muted-foreground">{article.excerpt}</p>
          ) : null}
        </div>
      </section>

      {/* Source & Tags */}
      <section className="px-4 md:px-6 pb-8 md:pb-12">
        <div className="container mx-auto max-w-6xl">
          <div className="border-t border-border pt-6 md:pt-8">
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


      {/* Mobile Sticky Share Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background/95 backdrop-blur-sm border-t border-border p-3 z-50">
        <div className="flex items-center justify-center gap-2">
          {/* Facebook */}
          <Button variant="outline" size="sm" asChild className="flex-1 max-w-12">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </Button>
          {/* X (Twitter) */}
          <Button variant="outline" size="sm" asChild className="flex-1 max-w-12">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(pageTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </Button>
          {/* LinkedIn */}
          <Button variant="outline" size="sm" asChild className="flex-1 max-w-12">
            <a
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(pageTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </Button>
          {/* Telegram */}
          <Button variant="outline" size="sm" asChild className="flex-1 max-w-12">
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(pageTitle)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
          </Button>
          {/* WhatsApp */}
          <Button variant="outline" size="sm" asChild className="flex-1 max-w-12">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(pageTitle + ' ' + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </Button>
          {/* Email */}
          <Button variant="outline" size="sm" asChild className="flex-1 max-w-12">
            <a href={`mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(shareUrl)}`}>
              <Mail className="w-4 h-4" />
            </a>
          </Button>
          {/* Copy Link */}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 max-w-12"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              setCopied(true);
              toast.success("Link copied!");
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Add bottom padding to account for sticky bar on mobile */}
      <div className="h-16 md:hidden" />

      <Footer />
    </div>
  );
};

export default ArticlePage;

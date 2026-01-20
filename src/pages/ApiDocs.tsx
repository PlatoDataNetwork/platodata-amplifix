import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Copy, Check, Key, Database, Filter, BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://www.platodata.io";
const API_BASE_URL = "https://tmmerifhwscgicmncndl.supabase.co/functions/v1/articles-api";

const ApiDocs = () => {
  const { siteName } = useSiteSettings();
  const pageTitle = `API Documentation | ${siteName}`;
  const pageDescription = `Learn how to use the ${siteName} Articles API to fetch articles programmatically. Get API access, authentication details, and example code.`;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, id, language = "bash" }: { code: string; id: string; language?: string }) => (
    <div className="relative group">
      <pre className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto text-sm">
        <code className="text-foreground">{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/api-docs`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:site_name" content={siteName} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${SITE_URL}/api-docs`} />
      </Helmet>
      
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-8 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
            API Documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access our articles programmatically with our REST API. Get real-time data on AI, Web3, and emerging technology news.
          </p>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="px-6 pb-20">
        <div className="container mx-auto max-w-4xl">
          {/* Authentication Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Authentication</h2>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground mb-4">
                All API requests require authentication using an API key. Include your API key in the request headers:
              </p>
              <CodeBlock
                id="auth-header"
                code={`X-API-Key: your_api_key_here`}
              />
              <p className="text-sm text-muted-foreground mt-4">
                To obtain an API key, please contact us at <a href="mailto:api@platodata.io" className="text-primary hover:underline">api@platodata.io</a>
              </p>
            </div>
          </div>

          {/* Base URL Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Base URL</h2>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <CodeBlock
                id="base-url"
                code={API_BASE_URL}
              />
            </div>
          </div>

          {/* Query Parameters Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Query Parameters</h2>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Parameter</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Default</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4"><code className="text-primary">vertical</code></td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4">-</td>
                      <td className="py-3 px-4">Filter articles by vertical slug (e.g., "blockchain", "artificial-intelligence")</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4"><code className="text-primary">category</code></td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4">-</td>
                      <td className="py-3 px-4">Filter articles by category</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4"><code className="text-primary">limit</code></td>
                      <td className="py-3 px-4">number</td>
                      <td className="py-3 px-4">50</td>
                      <td className="py-3 px-4">Number of articles to return. Use 0 to fetch all articles.</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-3 px-4"><code className="text-primary">offset</code></td>
                      <td className="py-3 px-4">number</td>
                      <td className="py-3 px-4">0</td>
                      <td className="py-3 px-4">Number of articles to skip (for pagination)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="text-primary">include_translations</code></td>
                      <td className="py-3 px-4">boolean</td>
                      <td className="py-3 px-4">false</td>
                      <td className="py-3 px-4">Set to "true" to include article translations</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Examples Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Examples</h2>
            </div>
            
            {/* Curl Example */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">cURL</h3>
              <p className="text-muted-foreground mb-4">Fetch the latest 10 blockchain articles:</p>
              <CodeBlock
                id="curl-example"
                language="bash"
                code={`curl -X GET "${API_BASE_URL}?vertical=blockchain&limit=10" \\
  -H "X-API-Key: your_api_key_here"`}
              />
            </div>

            {/* JavaScript Example */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">JavaScript / TypeScript</h3>
              <p className="text-muted-foreground mb-4">Using fetch to get AI articles:</p>
              <CodeBlock
                id="js-example"
                language="javascript"
                code={`const response = await fetch(
  "${API_BASE_URL}?vertical=artificial-intelligence&limit=20",
  {
    headers: {
      "X-API-Key": "your_api_key_here"
    }
  }
);

const data = await response.json();
console.log(data.data); // Array of articles
console.log(data.pagination); // { limit, offset, total }`}
              />
            </div>

            {/* Python Example */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Python</h3>
              <p className="text-muted-foreground mb-4">Using requests library:</p>
              <CodeBlock
                id="python-example"
                language="python"
                code={`import requests

url = "${API_BASE_URL}"
headers = {"X-API-Key": "your_api_key_here"}
params = {
    "vertical": "fintech",
    "limit": 50,
    "offset": 0
}

response = requests.get(url, headers=headers, params=params)
data = response.json()

for article in data["data"]:
    print(article["title"])`}
              />
            </div>
          </div>

          {/* Response Format Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Response Format</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground mb-4">Successful responses return a JSON object with the following structure:</p>
              <CodeBlock
                id="response-format"
                language="json"
                code={`{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "post_id": 12345,
      "title": "Article Title",
      "excerpt": "Brief description...",
      "content": "Full article content...",
      "author": "Author Name",
      "published_at": "2024-01-15T10:30:00Z",
      "read_time": "5 min read",
      "category": "Technology",
      "vertical_slug": "blockchain",
      "image_url": "https://...",
      "external_url": "https://...",
      "metadata": {},
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "translations": [
        {
          "article_id": "uuid",
          "language_code": "es",
          "translated_title": "Título del artículo",
          "translated_excerpt": "Breve descripción...",
          "translated_content": "Contenido completo..."
        }
      ]
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1234
  }
}`}
              />
            </div>
          </div>

          {/* Error Responses Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Error Responses</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground">401 Unauthorized</h4>
                  <p className="text-sm text-muted-foreground">Invalid or missing API key</p>
                  <pre className="bg-muted/50 rounded p-2 mt-2 text-sm">
                    <code>{`{"success": false, "error": "Unauthorized: Invalid or missing API key"}`}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">405 Method Not Allowed</h4>
                  <p className="text-sm text-muted-foreground">Only GET requests are supported</p>
                  <pre className="bg-muted/50 rounded p-2 mt-2 text-sm">
                    <code>{`{"success": false, "error": "Method not allowed"}`}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">500 Internal Server Error</h4>
                  <p className="text-sm text-muted-foreground">Server-side error occurred</p>
                  <pre className="bg-muted/50 rounded p-2 mt-2 text-sm">
                    <code>{`{"success": false, "error": "Internal server error"}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Limits Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Rate Limits</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground">
                API requests are subject to rate limiting. Current limits are:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>1,000 requests per hour</li>
                <li>10,000 requests per day</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                For higher limits, please contact us at <a href="mailto:api@platodata.io" className="text-primary hover:underline">api@platodata.io</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApiDocs;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const xslStylesheet = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>XML Sitemap - PlatoData</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #ffffff;
            color: #1a1a2e;
            min-height: 100vh;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }
          .header {
            text-align: center;
            padding: 3rem 0;
            border-bottom: 1px solid rgba(139, 92, 246, 0.5);
            margin-bottom: 2rem;
          }
          .logo {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
          }
          .subtitle {
            color: #52525b;
            font-size: 1.1rem;
          }
          .info-box {
            background: rgba(139, 92, 246, 0.08);
            border: 1px solid rgba(139, 92, 246, 0.4);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          .info-box p {
            margin-bottom: 0.5rem;
            color: #3f3f46;
          }
          .info-box strong {
            color: #a78bfa;
          }
          .info-box a {
            color: #8b5cf6;
            text-decoration: none;
          }
          .info-box a:hover {
            text-decoration: underline;
          }
          .stats {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }
          .stat-card {
            background: rgba(139, 92, 246, 0.08);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            padding: 1.5rem 2rem;
            flex: 1;
            min-width: 200px;
          }
          .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #8b5cf6;
          }
          .stat-label {
            color: #52525b;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #fafafa;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e4e4e7;
          }
          th {
            background: rgba(139, 92, 246, 0.15);
            color: #1a1a2e;
            font-weight: 600;
            text-align: left;
            padding: 1rem 1.5rem;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid rgba(139, 92, 246, 0.3);
          }
          td {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #e4e4e7;
            font-size: 0.95rem;
          }
          tr:hover {
            background: rgba(139, 92, 246, 0.05);
          }
          tr:last-child td {
            border-bottom: none;
          }
          td a {
            color: #8b5cf6;
            text-decoration: none;
            word-break: break-all;
          }
          td a:hover {
            color: #a78bfa;
            text-decoration: underline;
          }
          .priority {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 500;
          }
          .priority-high {
            background: rgba(34, 197, 94, 0.2);
            color: #4ade80;
          }
          .priority-medium {
            background: rgba(234, 179, 8, 0.2);
            color: #facc15;
          }
          .priority-low {
            background: rgba(156, 163, 175, 0.2);
            color: #9ca3af;
          }
          .lastmod {
            color: #52525b;
            font-size: 0.9rem;
          }
          .changefreq {
            color: #52525b;
            font-size: 0.85rem;
            text-transform: capitalize;
          }
          .row-number {
            color: #52525b;
            font-size: 0.85rem;
            font-weight: 500;
          }
          .footer {
            text-align: center;
            padding: 3rem 0;
            color: #52525b;
            font-size: 0.9rem;
          }
          .footer a {
            color: #8b5cf6;
            text-decoration: none;
          }
          @media (max-width: 768px) {
            .container {
              padding: 1rem;
            }
            .header {
              padding: 2rem 0;
            }
            .logo {
              font-size: 1.8rem;
            }
            th, td {
              padding: 0.75rem;
              font-size: 0.85rem;
            }
            .stats {
              gap: 1rem;
            }
            .stat-card {
              min-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🗺️ XML Sitemap</div>
            <p class="subtitle">PlatoData - AI-Powered Intelligence Platform</p>
          </div>

          <div class="info-box">
            <p>This XML sitemap is used by search engines like Google, Bing, and others to efficiently crawl and index this website.</p>
            <p><strong>Learn more:</strong> <a href="https://www.sitemaps.org/" target="_blank" rel="noopener">sitemaps.org</a></p>
          </div>

          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-number"><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/></div>
                  <div class="stat-label">Sitemaps</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width: 60px">#</th>
                    <th>Sitemap URL</th>
                    <th style="width: 150px">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <tr>
                      <td class="row-number"><xsl:value-of select="position()"/></td>
                      <td>
                        <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                      </td>
                      <td class="lastmod">
                        <xsl:value-of select="sitemap:lastmod"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:when>
            <xsl:otherwise>
              <div class="stats">
                <div class="stat-card">
                  <div class="stat-number"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
                  <div class="stat-label">URLs</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style="width: 60px">#</th>
                    <th>URL</th>
                    <th style="width: 100px">Priority</th>
                    <th style="width: 110px">Change Freq</th>
                    <th style="width: 130px">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td class="row-number"><xsl:value-of select="position()"/></td>
                      <td>
                        <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                      </td>
                      <td>
                        <xsl:choose>
                          <xsl:when test="sitemap:priority &gt;= 0.8">
                            <span class="priority priority-high"><xsl:value-of select="sitemap:priority"/></span>
                          </xsl:when>
                          <xsl:when test="sitemap:priority &gt;= 0.5">
                            <span class="priority priority-medium"><xsl:value-of select="sitemap:priority"/></span>
                          </xsl:when>
                          <xsl:otherwise>
                            <span class="priority priority-low"><xsl:value-of select="sitemap:priority"/></span>
                          </xsl:otherwise>
                        </xsl:choose>
                      </td>
                      <td class="changefreq">
                        <xsl:value-of select="sitemap:changefreq"/>
                      </td>
                      <td class="lastmod">
                        <xsl:value-of select="sitemap:lastmod"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </xsl:otherwise>
          </xsl:choose>

          <div class="footer">
            <p>Generated by <a href="https://www.platodata.io" target="_blank">PlatoData</a></p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  return new Response(xslStylesheet, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xslt+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
});

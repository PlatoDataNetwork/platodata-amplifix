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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
        <style type="text/css">
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
            color: #0f172a;
            min-height: 100vh;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 2.5rem 2rem;
          }
          .header {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding-bottom: 2rem;
            margin-bottom: 2rem;
            border-bottom: 1px solid #e2e8f0;
          }
          .logo-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
          }
          .header-text h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.025em;
          }
          .header-text p {
            color: #64748b;
            font-size: 0.9rem;
          }
          .info-banner {
            background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%);
            border: 1px solid #c7d2fe;
            border-radius: 10px;
            padding: 1rem 1.25rem;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .info-banner svg {
            flex-shrink: 0;
            color: #6366f1;
          }
          .info-banner p {
            color: #4338ca;
            font-size: 0.875rem;
          }
          .info-banner a {
            color: #4f46e5;
            font-weight: 500;
            text-decoration: none;
          }
          .info-banner a:hover {
            text-decoration: underline;
          }
          .stats-row {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          .stat-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 1.25rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          }
          .stat-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.1rem;
          }
          .stat-content .stat-number {
            font-size: 1.75rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1;
          }
          .stat-content .stat-label {
            color: #64748b;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .table-wrapper {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: #f8fafc;
            color: #475569;
            font-weight: 600;
            text-align: left;
            padding: 0.875rem 1.25rem;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e2e8f0;
          }
          td {
            padding: 0.875rem 1.25rem;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.875rem;
            color: #334155;
          }
          tbody tr:hover {
            background: #f8fafc;
          }
          tbody tr:last-child td {
            border-bottom: none;
          }
          td a {
            color: #4f46e5;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
            transition: color 0.15s;
          }
          td a:hover {
            color: #6366f1;
            text-decoration: underline;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.625rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
          }
          .badge-high {
            background: #dcfce7;
            color: #166534;
          }
          .badge-medium {
            background: #fef3c7;
            color: #92400e;
          }
          .badge-low {
            background: #f1f5f9;
            color: #475569;
          }
          .text-muted {
            color: #64748b;
          }
          .text-sm {
            font-size: 0.8125rem;
          }
          .row-num {
            color: #94a3b8;
            font-weight: 500;
            font-size: 0.8125rem;
          }
          .footer {
            text-align: center;
            padding: 2.5rem 0 1rem;
            color: #94a3b8;
            font-size: 0.8125rem;
          }
          .footer a {
            color: #6366f1;
            font-weight: 500;
            text-decoration: none;
          }
          .footer a:hover {
            text-decoration: underline;
          }
          @media (max-width: 768px) {
            .container {
              padding: 1.5rem 1rem;
            }
            .header {
              flex-direction: column;
              text-align: center;
              gap: 0.75rem;
            }
            th, td {
              padding: 0.75rem 0.875rem;
              font-size: 0.8rem;
            }
            .stat-card {
              flex: 1;
              min-width: 0;
            }
            .hide-mobile {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-icon">🗺️</div>
            <div class="header-text">
              <h1>XML Sitemap</h1>
              <p>PlatoData</p>
            </div>
          </div>

          <div class="info-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p>This sitemap helps search engines crawl and index this website. <a href="https://www.sitemaps.org/" target="_blank" rel="noopener">Learn more →</a></p>
          </div>

          <xsl:choose>
            <xsl:when test="sitemap:sitemapindex">
              <div class="stats-row">
                <div class="stat-card">
                  <div class="stat-icon">📄</div>
                  <div class="stat-content">
                    <div class="stat-number"><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/></div>
                    <div class="stat-label">Sitemaps</div>
                  </div>
                </div>
              </div>

              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 50px">#</th>
                      <th>Sitemap URL</th>
                      <th style="width: 140px" class="hide-mobile">Last Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                      <tr>
                        <td class="row-num"><xsl:value-of select="position()"/></td>
                        <td>
                          <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                        </td>
                        <td class="text-muted text-sm hide-mobile">
                          <xsl:value-of select="sitemap:lastmod"/>
                        </td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:when>
            <xsl:otherwise>
              <div class="stats-row">
                <div class="stat-card">
                  <div class="stat-icon">🔗</div>
                  <div class="stat-content">
                    <div class="stat-number"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
                    <div class="stat-label">URLs</div>
                  </div>
                </div>
              </div>

              <div class="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 50px">#</th>
                      <th>URL</th>
                      <th style="width: 80px">Priority</th>
                      <th style="width: 100px" class="hide-mobile">Frequency</th>
                      <th style="width: 120px" class="hide-mobile">Last Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="sitemap:urlset/sitemap:url">
                      <tr>
                        <td class="row-num"><xsl:value-of select="position()"/></td>
                        <td>
                          <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                        </td>
                        <td>
                          <xsl:choose>
                            <xsl:when test="sitemap:priority &gt;= 0.8">
                              <span class="badge badge-high"><xsl:value-of select="sitemap:priority"/></span>
                            </xsl:when>
                            <xsl:when test="sitemap:priority &gt;= 0.5">
                              <span class="badge badge-medium"><xsl:value-of select="sitemap:priority"/></span>
                            </xsl:when>
                            <xsl:otherwise>
                              <span class="badge badge-low"><xsl:value-of select="sitemap:priority"/></span>
                            </xsl:otherwise>
                          </xsl:choose>
                        </td>
                        <td class="text-muted text-sm hide-mobile" style="text-transform: capitalize;">
                          <xsl:value-of select="sitemap:changefreq"/>
                        </td>
                        <td class="text-muted text-sm hide-mobile">
                          <xsl:value-of select="sitemap:lastmod"/>
                        </td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
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

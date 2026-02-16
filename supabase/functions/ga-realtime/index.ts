import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function base64url(data: string | ArrayBuffer): string {
  let b64: string;
  if (typeof data === "string") {
    b64 = btoa(data);
  } else {
    b64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));

  const signInput = `${header}.${payload}`;

  // Import the private key - handle both real newlines and literal \n
  const pemContents = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "")
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signInput)
  );

  const sig = base64url(signature);
  const jwt = `${signInput}.${sig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceAccountJson = Deno.env.get("GA_SERVICE_ACCOUNT_JSON");
    const propertyId = Deno.env.get("GA4_PROPERTY_ID");

    if (!serviceAccountJson || !propertyId) {
      return new Response(JSON.stringify({ error: "GA credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const reportType = url.searchParams.get("type") || "realtime";

    const accessToken = await getAccessToken(serviceAccountJson);

    if (reportType === "realtime") {
      // Real-time report
      const body: Record<string, unknown> = {
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "conversions" },
          { name: "eventCount" },
        ],
        dimensions: [
          { name: "unifiedScreenName" },
        ],
        limit: 20,
      };

      // Optional dimension filter
      const filterDimension = url.searchParams.get("filterDimension");
      const filterValue = url.searchParams.get("filterValue");
      if (filterDimension && filterValue) {
        body.dimensionFilter = {
          filter: {
            fieldName: filterDimension,
            stringFilter: {
              matchType: "CONTAINS",
              value: filterValue,
              caseSensitive: false,
            },
          },
        };
      }

      const res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (reportType === "realtime-overview") {
      // Overview metrics (active users by device, country, etc.)
      const dimensionParam = url.searchParams.get("dimension") || "deviceCategory";
      
      const body = {
        metrics: [{ name: "activeUsers" }],
        dimensions: [{ name: dimensionParam }],
        limit: 10,
      };

      const res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (reportType === "historical") {
      // Historical report using GA4 Data API runReport
      const startDate = url.searchParams.get("startDate") || "7daysAgo";
      const endDate = url.searchParams.get("endDate") || "today";
      const metrics = url.searchParams.get("metrics") || "sessions,totalUsers,screenPageViews,eventCount";
      const dimension = url.searchParams.get("dimension") || "date";

      const metricsList = metrics.split(",").map((m: string) => ({ name: m.trim() }));

      const body: Record<string, unknown> = {
        dateRanges: [{ startDate, endDate }],
        metrics: metricsList,
        dimensions: [{ name: dimension }],
        orderBys: [{ dimension: { dimensionName: dimension, orderType: "ALPHANUMERIC" }, desc: false }],
        limit: 100,
      };

      const res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid report type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GA Realtime error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

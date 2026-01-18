import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RssFeed {
  id: string;
  name: string;
  feed_url: string;
  sync_interval_hours: number;
  last_synced_at: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting auto-sync check for RSS feeds...");

    // Find all active feeds with auto_sync enabled that are due for syncing
    const { data: feeds, error: feedsError } = await supabase
      .from("rss_feeds")
      .select("id, name, feed_url, sync_interval_hours, last_synced_at")
      .eq("status", "active")
      .eq("auto_sync", true);

    if (feedsError) {
      console.error("Error fetching feeds:", feedsError);
      return new Response(
        JSON.stringify({ error: feedsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!feeds || feeds.length === 0) {
      console.log("No feeds configured for auto-sync");
      return new Response(
        JSON.stringify({ message: "No feeds to sync", synced: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${feeds.length} feeds with auto-sync enabled`);

    const now = new Date();
    const feedsDueForSync: RssFeed[] = [];

    for (const feed of feeds as RssFeed[]) {
      if (!feed.last_synced_at) {
        // Never synced, should sync now
        feedsDueForSync.push(feed);
      } else {
        const lastSynced = new Date(feed.last_synced_at);
        const hoursSinceLastSync = (now.getTime() - lastSynced.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastSync >= feed.sync_interval_hours) {
          feedsDueForSync.push(feed);
        }
      }
    }

    console.log(`${feedsDueForSync.length} feeds are due for syncing`);

    if (feedsDueForSync.length === 0) {
      return new Response(
        JSON.stringify({ message: "No feeds due for sync", synced: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { feedId: string; feedName: string; success: boolean; articlesImported?: number; error?: string }[] = [];

    // Sync each feed by calling the sync-rss-feed function
    for (const feed of feedsDueForSync) {
      try {
        console.log(`Syncing feed: ${feed.name} (${feed.id})`);
        
        const { data, error } = await supabase.functions.invoke("sync-rss-feed", {
          body: { feedId: feed.id },
        });

        if (error) {
          console.error(`Error syncing feed ${feed.name}:`, error);
          results.push({
            feedId: feed.id,
            feedName: feed.name,
            success: false,
            error: error.message,
          });
        } else {
          console.log(`Feed ${feed.name} synced: ${data.articlesImported} articles imported`);
          results.push({
            feedId: feed.id,
            feedName: feed.name,
            success: true,
            articlesImported: data.articlesImported,
          });
        }
      } catch (syncError: unknown) {
        const errorMessage = syncError instanceof Error ? syncError.message : String(syncError);
        console.error(`Exception syncing feed ${feed.name}:`, syncError);
        results.push({
          feedId: feed.id,
          feedName: feed.name,
          success: false,
          error: errorMessage,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalArticles = results.reduce((sum, r) => sum + (r.articlesImported || 0), 0);

    console.log(`Auto-sync complete. ${successCount}/${results.length} feeds synced, ${totalArticles} articles imported`);

    return new Response(
      JSON.stringify({
        message: "Auto-sync complete",
        synced: successCount,
        failed: results.length - successCount,
        totalArticlesImported: totalArticles,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Auto-sync error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

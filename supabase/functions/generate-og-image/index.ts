import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articleId, postId } = await req.json();

    if (!articleId && !postId) {
      return new Response(
        JSON.stringify({ error: "articleId or postId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch article
    let query = supabase
      .from("articles")
      .select("id, title, vertical_slug, image_url, post_id")
      .limit(1);

    if (articleId) {
      query = query.eq("id", articleId);
    } else if (postId) {
      query = query.eq("post_id", parseInt(postId));
    }

    const { data: article, error: fetchError } = await query.maybeSingle();

    if (fetchError || !article) {
      return new Response(
        JSON.stringify({ error: "Article not found", details: fetchError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Skip if article already has an image that's not the default
    if (article.image_url && !article.image_url.includes("article-default-img")) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Article already has an image",
          image_url: article.image_url 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate image using Lovable AI
    const verticalName = formatVerticalName(article.vertical_slug);
    const cleanTitle = decodeHtmlEntities(article.title);
    
    // Truncate title if too long for the image
    const displayTitle = cleanTitle.length > 100 
      ? cleanTitle.substring(0, 97) + "..." 
      : cleanTitle;

    const prompt = `Create a professional, modern social media preview image with EXACTLY 1200x630 pixel dimensions (1.91:1 aspect ratio).
The image should have a dark gradient background (deep blue to purple) with subtle tech/data visualization patterns.
Include the article title "${displayTitle}" prominently displayed in white, bold text in the center.
Add a small category badge showing "${verticalName}" in the top-left corner.
Add "platodata.io" branding subtly in the bottom-right corner.
The style should be professional, sleek, and suitable for financial/tech news.
IMPORTANT: The final image MUST be exactly 1200 pixels wide and 630 pixels tall for optimal social media sharing.
Ultra high resolution, clean typography.`;

    console.log("Generating image for article:", article.id, "with prompt:", prompt);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate image", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error("No image data in AI response:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "No image generated by AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract base64 data from data URL
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(
        JSON.stringify({ error: "Invalid image data format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const fileName = `og-${article.post_id || article.id}-${Date.now()}.${imageFormat}`;
    const filePath = `og-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("article-images")
      .upload(filePath, bytes, {
        contentType: `image/${imageFormat}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload image", details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Update article with new image URL
    const { error: updateError } = await supabase
      .from("articles")
      .update({ image_url: publicUrl })
      .eq("id", article.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update article", details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Successfully generated and saved OG image for article:", article.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        image_url: publicUrl,
        article_id: article.id,
        post_id: article.post_id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatVerticalName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&hellip;/g, "...")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ");
}

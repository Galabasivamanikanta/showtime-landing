import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let rawKey = Deno.env.get("OMDB_API_KEY") || "";
    // Extract key from URL if stored as full URL
    const match = rawKey.match(/apikey=([^&]+)/);
    const apiKey = match ? match[1] : rawKey.trim();

    if (!apiKey) throw new Error("OMDB_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    const { data: movies, error } = await sb.from("movies").select("id, title, release_date, poster_url");
    if (error) throw error;

    const results: { id: string; title: string; oldUrl: string | null; newUrl: string | null; status: string }[] = [];

    for (const movie of movies || []) {
      try {
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : undefined;
        const params = new URLSearchParams({ t: movie.title, apikey: apiKey });
        if (year) params.set("y", String(year));

        const resp = await fetch(`http://www.omdbapi.com/?${params}`);
        const data = await resp.json();

        if (data.Response === "True" && data.Poster && data.Poster !== "N/A") {
          const { error: updateErr } = await sb
            .from("movies")
            .update({ poster_url: data.Poster })
            .eq("id", movie.id);

          results.push({
            id: movie.id,
            title: movie.title,
            oldUrl: movie.poster_url,
            newUrl: data.Poster,
            status: updateErr ? `error: ${updateErr.message}` : "updated",
          });
        } else {
          results.push({ id: movie.id, title: movie.title, oldUrl: movie.poster_url, newUrl: null, status: "not_found_on_omdb" });
        }
      } catch (e) {
        results.push({ id: movie.id, title: movie.title, oldUrl: movie.poster_url, newUrl: null, status: `error: ${e.message}` });
      }
    }

    return new Response(JSON.stringify({ updated: results.filter(r => r.status === "updated").length, total: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

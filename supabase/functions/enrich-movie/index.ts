const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OMDB_API_KEY")?.trim();
    console.log("OMDB key length:", apiKey?.length);
    if (!apiKey) throw new Error("OMDB_API_KEY not configured");

    const { title, year, imdbId } = await req.json();

    if (!title && !imdbId) {
      return new Response(
        JSON.stringify({ error: "title or imdbId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const params = new URLSearchParams({ apikey: apiKey, plot: "full" });
    if (imdbId) params.set("i", imdbId);
    else {
      params.set("t", title);
      if (year) params.set("y", String(year));
    }

    const omdbRes = await fetch(`https://www.omdbapi.com/?${params}`);
    const data = await omdbRes.json();

    if (data.Response === "False") {
      return new Response(
        JSON.stringify({ error: data.Error || "Movie not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize OMDb response into our shape
    const enriched = {
      title: data.Title,
      year: data.Year,
      rated: data.Rated,
      released: data.Released,
      runtime: data.Runtime,
      genres: data.Genre ? data.Genre.split(",").map((g: string) => g.trim()) : [],
      director: data.Director,
      writer: data.Writer,
      cast: data.Actors ? data.Actors.split(",").map((a: string) => a.trim()) : [],
      plot: data.Plot,
      language: data.Language,
      country: data.Country,
      awards: data.Awards,
      poster: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
      ratings: data.Ratings || [],
      imdbRating: data.imdbRating,
      imdbVotes: data.imdbVotes,
      imdbId: data.imdbID,
      boxOffice: data.BoxOffice,
      metascore: data.Metascore,
    };

    return new Response(JSON.stringify(enriched), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("enrich-movie error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

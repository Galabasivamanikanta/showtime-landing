import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EnrichedMovie {
  title: string;
  year?: string;
  rated?: string;
  released?: string;
  runtime?: string;
  genres: string[];
  director?: string;
  writer?: string;
  cast: string[];
  plot?: string;
  language?: string;
  country?: string;
  awards?: string;
  poster?: string | null;
  ratings: { Source: string; Value: string }[];
  imdbRating?: string;
  imdbVotes?: string;
  imdbId?: string;
  boxOffice?: string;
  metascore?: string;
}

export function useEnrichedMovie(title?: string, year?: number | string) {
  const [data, setData] = useState<EnrichedMovie | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title) return;
    let cancelled = false;

    const fetchEnriched = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke(
          "enrich-movie",
          { body: { title, year } }
        );
        if (fnError) throw fnError;
        if (!cancelled) setData(result as EnrichedMovie);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to enrich movie");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEnriched();
    return () => {
      cancelled = true;
    };
  }, [title, year]);

  return { data, loading, error };
}

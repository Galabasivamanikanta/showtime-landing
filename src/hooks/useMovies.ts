import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Movie = Tables<"movies">;

export function useMovies(isNowShowing?: boolean) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        let query = supabase.from("movies").select("*");
        
        if (isNowShowing !== undefined) {
          query = query.eq("is_now_showing", isNowShowing);
        }
        
        const { data, error } = await query.order("created_at", { ascending: false });
        
        if (error) throw error;
        setMovies(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("movies-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "movies" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMovies((prev) => [payload.new as Movie, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setMovies((prev) =>
              prev.map((movie) =>
                movie.id === (payload.new as Movie).id ? (payload.new as Movie) : movie
              )
            );
          } else if (payload.eventType === "DELETE") {
            setMovies((prev) =>
              prev.filter((movie) => movie.id !== (payload.old as Movie).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isNowShowing]);

  return { movies, loading, error };
}

export function useMovie(id: string | undefined) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchMovie = async () => {
      try {
        const { data, error } = await supabase
          .from("movies")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error) throw error;
        setMovie(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch movie");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  return { movie, loading, error };
}

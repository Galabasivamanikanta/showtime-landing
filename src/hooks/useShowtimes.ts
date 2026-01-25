import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Theater = Tables<"theaters">;
type Showtime = Tables<"showtimes">;

export interface ShowtimeWithTheater extends Showtime {
  theater: Theater;
}

export interface TheaterWithShowtimes {
  theater: Theater;
  showtimes: Showtime[];
}

export function useTheaters() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const { data, error } = await supabase
          .from("theaters")
          .select("*")
          .order("name");
        
        if (error) throw error;
        setTheaters(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch theaters");
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  return { theaters, loading, error };
}

export function useShowtimesForMovie(movieId: string | undefined) {
  const [theatersWithShowtimes, setTheatersWithShowtimes] = useState<TheaterWithShowtimes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setLoading(false);
      return;
    }

    const fetchShowtimes = async () => {
      try {
        // Get all theaters
        const { data: theaters, error: theatersError } = await supabase
          .from("theaters")
          .select("*")
          .order("name");

        if (theatersError) throw theatersError;

        // Get showtimes for this movie
        const { data: showtimes, error: showtimesError } = await supabase
          .from("showtimes")
          .select("*")
          .eq("movie_id", movieId)
          .gte("show_date", new Date().toISOString().split("T")[0])
          .order("show_date")
          .order("show_time");

        if (showtimesError) throw showtimesError;

        // Group showtimes by theater
        const grouped: TheaterWithShowtimes[] = (theaters || []).map((theater) => ({
          theater,
          showtimes: (showtimes || []).filter((s) => s.theater_id === theater.id),
        })).filter((t) => t.showtimes.length > 0);

        setTheatersWithShowtimes(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch showtimes");
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId]);

  return { theatersWithShowtimes, loading, error };
}

export async function createShowtimesForMovie(movieId: string, theaterId: string) {
  const today = new Date();
  const showtimes: { movie_id: string; theater_id: string; show_date: string; show_time: string; price: number }[] = [];
  const times = ["10:00", "13:30", "17:00", "20:30"];

  // Create showtimes for next 7 days
  for (let day = 1; day <= 7; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];

    for (const time of times) {
      showtimes.push({
        movie_id: movieId,
        theater_id: theaterId,
        show_date: dateStr,
        show_time: time,
        price: 250 + (time === "20:30" ? 50 : 0), // Evening shows cost more
      });
    }
  }

  const { data, error } = await supabase
    .from("showtimes")
    .insert(showtimes)
    .select();

  if (error) throw error;
  return data;
}

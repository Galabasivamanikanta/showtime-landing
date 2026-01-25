import { MapPin, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useShowtimesForMovie, type TheaterWithShowtimes } from "@/hooks/useShowtimes";
import { format, parseISO } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type Showtime = Tables<"showtimes">;

interface TheaterShowtimesProps {
  movieId: string;
  movieTitle: string;
  selectedDate: string;
  onSelectShowtime: (showtime: Showtime, theaterName: string, theaterLocation: string) => void;
}

const TheaterShowtimes = ({ 
  movieId, 
  movieTitle, 
  selectedDate,
  onSelectShowtime 
}: TheaterShowtimesProps) => {
  const { theatersWithShowtimes, loading, error } = useShowtimesForMovie(movieId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Failed to load theaters. Please try again.
      </p>
    );
  }

  // Filter showtimes by selected date
  const filteredTheaters = theatersWithShowtimes
    .map((t) => ({
      ...t,
      showtimes: t.showtimes.filter((s) => s.show_date === selectedDate),
    }))
    .filter((t) => t.showtimes.length > 0);

  if (filteredTheaters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No showtimes available for this date.</p>
        <p className="text-sm text-muted-foreground mt-1">Please select a different date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        Theaters Showing {movieTitle}
      </h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {filteredTheaters.map(({ theater, showtimes }) => (
          <div
            key={theater.id}
            className="p-4 bg-secondary rounded-lg border border-border"
          >
            {/* Theater Info */}
            <div className="mb-3">
              <h3 className="font-semibold text-foreground">{theater.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {theater.location}
              </p>
              {theater.facilities && theater.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {theater.facilities.slice(0, 3).map((facility) => (
                    <Badge
                      key={facility}
                      variant="outline"
                      className="text-xs bg-background"
                    >
                      {facility}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Showtimes */}
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Available Times</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {showtimes.map((showtime) => {
                const timeFormatted = showtime.show_time.substring(0, 5);
                const isAvailable = (showtime.available_seats ?? 0) > 0;
                
                return (
                  <button
                    key={showtime.id}
                    onClick={() => isAvailable && onSelectShowtime(showtime, theater.name, theater.location)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 rounded-md text-sm font-medium border transition-all ${
                      isAvailable
                        ? "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        : "border-muted text-muted-foreground cursor-not-allowed opacity-50"
                    }`}
                  >
                    <span>{timeFormatted}</span>
                    <span className="block text-xs mt-0.5">
                      ₹{showtime.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheaterShowtimes;

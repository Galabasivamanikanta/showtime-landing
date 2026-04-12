import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BookingModal from "./BookingModal";
import type { Tables } from "@/integrations/supabase/types";

type Movie = Tables<"movies">;

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const navigate = useNavigate();

  const posterImage = movie.poster_url || "/placeholder.svg";

  return (
    <>
      <div className="group cursor-pointer" onClick={() => navigate(`/movie/${movie.id}`)}>
        {/* Poster */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-card">
          <img
            src={posterImage}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating Badge */}
          {movie.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-semibold text-foreground">{movie.rating}</span>
            </div>
          )}

          {/* Book Now Button on Hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsBookingOpen(true); }}
              className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex flex-wrap gap-1 mb-1">
            {movie.genre?.slice(0, 2).map((g) => (
              <Badge key={g} variant="secondary" className="text-xs px-2 py-0">
                {g}
              </Badge>
            ))}
          </div>
          {movie.is_now_showing ? (
            <p className="text-xs text-muted-foreground">Now Showing</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {movie.release_date ? new Date(movie.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Coming Soon"}
            </p>
          )}
        </div>
      </div>

      <BookingModal
        movie={movie}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
};

export default MovieCard;

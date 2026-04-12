import { Play, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMovies } from "@/hooks/useMovies";

const HeroSection = () => {
  const { movies, loading } = useMovies(true);
  const navigate = useNavigate();

  // Pick the highest-rated now-showing movie as featured
  const featured = movies.length > 0
    ? movies.reduce((best, m) => ((m.rating || 0) > (best.rating || 0) ? m : best), movies[0])
    : null;

  if (loading || !featured) {
    return (
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden bg-muted animate-pulse" />
    );
  }

  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={featured.poster_url || "/placeholder.svg"}
          alt={featured.title}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl pt-20">
          <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full mb-4">
            Featured This Week
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            {featured.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            {featured.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-foreground font-semibold">{featured.rating}</span>
                <span>/10</span>
              </div>
            )}
            <span className="hidden sm:inline">•</span>
            {featured.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(featured.duration_minutes / 60)}h {featured.duration_minutes % 60}m</span>
              </div>
            )}
            <span className="hidden sm:inline">•</span>
            <span>{featured.genre?.join(", ")}</span>
          </div>

          <p className="text-muted-foreground text-lg mb-8 max-w-lg hidden md:block">
            {featured.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="gap-2" onClick={() => navigate(`/movie/${featured.id}`)}>
              <Play className="w-5 h-5 fill-current" />
              Book Tickets
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-secondary/50 border-border hover:bg-secondary"
              onClick={() => navigate(`/movie/${featured.id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { ChevronRight, Loader2 } from "lucide-react";
import MovieCard from "./MovieCard";
import { useMovies } from "@/hooks/useMovies";

interface MovieSectionProps {
  title: string;
  isNowShowing: boolean;
}

const MovieSection = ({ title, isNowShowing }: MovieSectionProps) => {
  const { movies, loading, error } = useMovies(isNowShowing);

  if (loading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{title}</h2>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{title}</h2>
          <p className="text-muted-foreground text-center py-12">Failed to load movies. Please try again.</p>
        </div>
      </section>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
          <button className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
            <span className="text-sm font-medium">See All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovieSection;

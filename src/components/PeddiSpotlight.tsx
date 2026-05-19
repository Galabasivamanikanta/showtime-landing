import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Star, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Movie = Tables<"movies">;

const PeddiSpotlight = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("movies")
      .select("*")
      .ilike("title", "Peddi")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setMovie(data));
  }, []);

  if (!movie) return null;

  return (
    <section className="relative overflow-hidden border-y border-primary/30">
      {/* Animated background layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(354_85%_52%/0.35),transparent_55%),radial-gradient(circle_at_80%_70%,hsl(280_70%_45%/0.3),transparent_55%),radial-gradient(circle_at_50%_100%,hsl(40_90%_55%/0.2),transparent_60%)] animate-[spotlight-pan_14s_ease-in-out_infinite_alternate]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,hsl(0_0%_100%/0.07)_50%,transparent_60%)] bg-[length:250%_250%] animate-[shimmer_6s_linear_infinite] pointer-events-none" />
      <div className="absolute inset-0 opacity-40 [background:repeating-linear-gradient(90deg,transparent_0,transparent_60px,hsl(var(--primary)/0.08)_60px,hsl(var(--primary)/0.08)_61px)]" />

      {/* Floating sparkles */}
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="absolute block w-1 h-1 rounded-full bg-primary/70 shadow-[0_0_12px_hsl(var(--primary))] animate-[float-up_var(--d,8s)_ease-in_infinite]"
          style={{
            left: `${(i * 83) % 100}%`,
            bottom: `-10px`,
            // @ts-expect-error css var
            "--d": `${6 + (i % 5)}s`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}

      <div className="relative container mx-auto px-4 py-10 md:py-14 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
        {/* Poster */}
        <div className="relative mx-auto md:mx-0 w-40 md:w-52 aspect-[2/3] rounded-xl overflow-hidden border border-primary/40 shadow-[0_0_60px_hsl(var(--primary)/0.45)] animate-[scale-in_0.6s_ease-out]">
          <img
            src={movie.poster_url || "/placeholder.svg"}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>

        {/* Copy */}
        <div className="text-center md:text-left animate-[fade-in_0.7s_ease-out]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary text-xs font-semibold tracking-widest uppercase rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Spotlight • New Arrival
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-3">
            {movie.title}
            <span className="block text-base md:text-lg font-medium text-muted-foreground mt-1">
              Ram Charan • Buchi Babu Sana • A. R. Rahman
            </span>
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mb-4">
            {movie.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-foreground font-semibold">{movie.rating}</span>/10
              </span>
            )}
            {movie.release_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(movie.release_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            <span>{movie.genre?.join(" • ")}</span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto md:mx-0 mb-6 line-clamp-3 md:line-clamp-none">
            {movie.description}
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Button size="lg" className="gap-2 shadow-[0_0_30px_hsl(var(--primary)/0.5)]" onClick={() => navigate(`/movie/${movie.id}`)}>
              <Play className="w-5 h-5 fill-current" /> Book Tickets
            </Button>
            <Button variant="outline" size="lg" className="bg-secondary/40 border-border" onClick={() => navigate(`/movie/${movie.id}`)}>
              View Details
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PeddiSpotlight;

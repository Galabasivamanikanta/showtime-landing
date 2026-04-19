import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Play, Calendar, Film, Globe, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingModal from "@/components/BookingModal";
import { useMovie } from "@/hooks/useMovies";
import { useEnrichedMovie } from "@/hooks/useEnrichedMovie";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { movie, loading, error } = useMovie(id);
  const releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : undefined;
  const { data: enriched, loading: enrichLoading } = useEnrichedMovie(movie?.title, releaseYear);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground text-lg">Movie not found</p>
          <Button onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  const castMembers = enriched?.cast?.length ? enriched.cast : ((movie as any).cast_members || []);
  const director = enriched?.director || (movie as any).director || "Unknown";
  const language = enriched?.language || (movie as any).language || "English";
  const certificate = enriched?.rated || (movie as any).certificate || "UA";
  const trailerUrl = (movie as any).trailer_url || "";
  const posterUrl = enriched?.poster || movie.poster_url || "/placeholder.svg";
  const description = enriched?.plot || movie.description || "No description available.";
  const imdbRating = enriched?.imdbRating ? parseFloat(enriched.imdbRating) : movie.rating;
  const genres = enriched?.genres?.length ? enriched.genres : (movie.genre || []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[65vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={movie.poster_url || "/placeholder.svg"}
            alt={movie.title}
            className="w-full h-full object-cover object-top blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Poster */}
            <div className="hidden md:block w-48 lg:w-56 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border-2 border-border/50 -mb-24 relative z-10">
              <img
                src={movie.poster_url || "/placeholder.svg"}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {movie.genre?.map((g) => (
                  <Badge key={g} variant="secondary" className="text-xs">
                    {g}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 md:gap-5 text-muted-foreground mb-5">
                {movie.rating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-foreground font-bold text-lg">{movie.rating}</span>
                    <span className="text-sm">/10</span>
                  </div>
                )}
                {movie.duration_minutes && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{Math.floor(movie.duration_minutes / 60)}h {movie.duration_minutes % 60}m</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {movie.release_date
                      ? new Date(movie.release_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "TBA"}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                  {certificate}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="gap-2" onClick={() => setIsBookingOpen(true)}>
                  Book Tickets
                </Button>
                {trailerUrl && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 bg-secondary/50 border-border hover:bg-secondary"
                    onClick={() => setIsTrailerOpen(true)}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Watch Trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="container mx-auto px-4 pt-8 md:pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - About & Cast */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-3">About the Movie</h2>
              <p className="text-muted-foreground leading-relaxed text-base">
                {movie.description || "No description available."}
              </p>
            </div>

            <Separator />

            {/* Cast */}
            {castMembers.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Cast
                </h2>
                <div className="flex flex-wrap gap-3">
                  {castMembers.map((actor: string) => (
                    <div
                      key={actor}
                      className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {actor.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <span className="text-foreground text-sm font-medium">{actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Quick Info */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <h3 className="text-lg font-bold text-foreground">Quick Info</h3>

              <div className="flex items-center gap-3">
                <Film className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Director</p>
                  <p className="text-sm font-medium text-foreground">{director}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Language</p>
                  <p className="text-sm font-medium text-foreground">{language}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Certificate</p>
                  <p className="text-sm font-medium text-foreground">{certificate}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm font-medium text-foreground">
                    {movie.duration_minutes ? `${Math.floor(movie.duration_minutes / 60)}h ${movie.duration_minutes % 60}m` : "TBA"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="text-sm font-medium text-foreground">{movie.rating ? `${movie.rating}/10` : "N/A"}</p>
                </div>
              </div>

              <Separator />

              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Ticket Price</p>
                <p className="text-2xl font-bold text-primary">₹{movie.price || 250}</p>
              </div>

              <Button className="w-full" size="lg" onClick={() => setIsBookingOpen(true)}>
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Booking Modal */}
      <BookingModal
        movie={movie}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      {/* Trailer Modal */}
      <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black">
          <DialogTitle className="sr-only">Trailer - {movie.title}</DialogTitle>
          <div className="aspect-video w-full">
            {isTrailerOpen && trailerUrl && (
              <iframe
                src={`${trailerUrl}?autoplay=1`}
                title={`${movie.title} Trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MovieDetails;

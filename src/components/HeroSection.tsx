import { Play, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBanner}
          alt="Featured Movie"
          className="w-full h-full object-cover"
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
            Shadow Vengeance
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-foreground font-semibold">8.7</span>
              <span>/10</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>2h 35min</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <span>Action, Thriller</span>
          </div>

          <p className="text-muted-foreground text-lg mb-8 max-w-lg hidden md:block">
            In a city consumed by darkness, one man rises to deliver justice. When his family is taken, 
            he must confront the shadows of his past to save their future.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="gap-2">
              <Play className="w-5 h-5 fill-current" />
              Book Tickets
            </Button>
            <Button variant="outline" size="lg" className="bg-secondary/50 border-border hover:bg-secondary">
              Watch Trailer
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  title: string;
  image: string;
  rating: number;
  genres: string[];
  releaseDate?: string;
}

const MovieCard = ({ title, image, rating, genres, releaseDate }: MovieCardProps) => {
  return (
    <div className="group cursor-pointer">
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 shadow-card">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-semibold text-foreground">{rating}</span>
        </div>

        {/* Book Now Button on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors">
            Book Now
          </button>
        </div>
      </div>

      {/* Info */}
      <div>
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex flex-wrap gap-1 mb-1">
          {genres.slice(0, 2).map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs px-2 py-0">
              {genre}
            </Badge>
          ))}
        </div>
        {releaseDate && (
          <p className="text-xs text-muted-foreground">{releaseDate}</p>
        )}
      </div>
    </div>
  );
};

export default MovieCard;

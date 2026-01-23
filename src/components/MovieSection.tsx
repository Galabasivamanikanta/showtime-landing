import { ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";

import moviePoster1 from "@/assets/movie-poster-1.jpg";
import moviePoster2 from "@/assets/movie-poster-2.jpg";
import moviePoster3 from "@/assets/movie-poster-3.jpg";
import moviePoster4 from "@/assets/movie-poster-4.jpg";
import moviePoster5 from "@/assets/movie-poster-5.jpg";
import moviePoster6 from "@/assets/movie-poster-6.jpg";

const nowShowingMovies = [
  {
    id: 1,
    title: "Rail Driver",
    image: moviePoster1,
    rating: 8.5,
    genres: ["Action", "Thriller"],
    releaseDate: "Now Showing",
  },
  {
    id: 2,
    title: "Paris Romance",
    image: moviePoster2,
    rating: 7.8,
    genres: ["Romance", "Comedy"],
    releaseDate: "Now Showing",
  },
  {
    id: 3,
    title: "Cosmic Odyssey",
    image: moviePoster3,
    rating: 9.1,
    genres: ["Sci-Fi", "Adventure"],
    releaseDate: "Now Showing",
  },
  {
    id: 4,
    title: "The Haunting",
    image: moviePoster4,
    rating: 7.5,
    genres: ["Horror", "Mystery"],
    releaseDate: "Now Showing",
  },
  {
    id: 5,
    title: "Magical Forest",
    image: moviePoster5,
    rating: 8.2,
    genres: ["Animation", "Family"],
    releaseDate: "Now Showing",
  },
  {
    id: 6,
    title: "Dark Streets",
    image: moviePoster6,
    rating: 8.0,
    genres: ["Crime", "Drama"],
    releaseDate: "Now Showing",
  },
];

const upcomingMovies = [
  {
    id: 7,
    title: "The Haunting",
    image: moviePoster4,
    rating: 7.5,
    genres: ["Horror", "Mystery"],
    releaseDate: "Jan 30, 2026",
  },
  {
    id: 8,
    title: "Cosmic Odyssey",
    image: moviePoster3,
    rating: 9.1,
    genres: ["Sci-Fi", "Adventure"],
    releaseDate: "Feb 14, 2026",
  },
  {
    id: 9,
    title: "Rail Driver",
    image: moviePoster1,
    rating: 8.5,
    genres: ["Action", "Thriller"],
    releaseDate: "Feb 28, 2026",
  },
  {
    id: 10,
    title: "Dark Streets",
    image: moviePoster6,
    rating: 8.0,
    genres: ["Crime", "Drama"],
    releaseDate: "Mar 15, 2026",
  },
];

interface MovieSectionProps {
  title: string;
  movies: typeof nowShowingMovies;
}

const MovieSection = ({ title, movies }: MovieSectionProps) => {
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
            <MovieCard
              key={movie.id}
              title={movie.title}
              image={movie.image}
              rating={movie.rating}
              genres={movie.genres}
              releaseDate={movie.releaseDate}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { MovieSection, nowShowingMovies, upcomingMovies };

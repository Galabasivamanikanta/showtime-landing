import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GenreFilter from "@/components/GenreFilter";
import { MovieSection, nowShowingMovies, upcomingMovies } from "@/components/MovieSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <GenreFilter />
        <MovieSection title="Now Showing" movies={nowShowingMovies} />
        <MovieSection title="Coming Soon" movies={upcomingMovies} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

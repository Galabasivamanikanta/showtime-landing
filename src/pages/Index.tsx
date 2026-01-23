import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GenreFilter from "@/components/GenreFilter";
import MovieSection from "@/components/MovieSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <GenreFilter />
        <MovieSection title="Now Showing" isNowShowing={true} />
        <MovieSection title="Coming Soon" isNowShowing={false} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

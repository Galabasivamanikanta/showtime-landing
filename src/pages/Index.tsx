import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PeddiSpotlight from "@/components/PeddiSpotlight";
import GenreFilter from "@/components/GenreFilter";
import MovieSection from "@/components/MovieSection";
import Footer from "@/components/Footer";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  return (
    <div className="min-h-screen bg-background">
      <Header initialSearch={searchQuery} />
      <main>
        <div id="movies">
          <HeroSection />
        </div>
        <PeddiSpotlight />
        <div id="genres" className="scroll-mt-32">
          <GenreFilter />
        </div>
        <MovieSection title="Now Showing" isNowShowing={true} sectionId="now-showing" searchQuery={searchQuery} />
        <MovieSection title="Coming Soon" isNowShowing={false} sectionId="coming-soon" searchQuery={searchQuery} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

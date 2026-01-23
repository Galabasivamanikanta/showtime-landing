import { Search, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-foreground hidden sm:block">
              Book<span className="text-primary">MyShow</span>
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for Movies, Events, Plays, Sports and Activities"
                className="w-full pl-10 pr-4 py-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Location */}
            <button className="hidden sm:flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">Mumbai</span>
            </button>

            {/* Sign In Button */}
            <Button variant="default" size="sm" className="hidden sm:flex">
              Sign In
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 py-3 border-t border-border/50">
          <a href="#" className="text-primary font-medium text-sm">Movies</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Stream</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Events</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Plays</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Sports</a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Activities</a>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search movies, events..."
                className="w-full pl-10 pr-4 py-2 bg-secondary"
              />
            </div>
            
            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-primary font-medium py-2">Movies</a>
              <a href="#" className="text-muted-foreground py-2">Stream</a>
              <a href="#" className="text-muted-foreground py-2">Events</a>
              <a href="#" className="text-muted-foreground py-2">Plays</a>
              <a href="#" className="text-muted-foreground py-2">Sports</a>
              <a href="#" className="text-muted-foreground py-2">Activities</a>
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <button className="flex items-center gap-1 text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">Mumbai</span>
              </button>
              <Button variant="default" size="sm">Sign In</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

import { Search, MapPin, Menu, X, User, LogOut, Ticket } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  initialSearch?: string;
}

const Header = ({ initialSearch = "" }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : "/");
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (sectionId: string) => {
    if (window.location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      setIsMobileMenuOpen(false);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-foreground hidden sm:block">
              Book<span className="text-primary">MyShow</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form className="hidden md:flex flex-1 max-w-xl mx-8" onSubmit={handleSearch}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for Movies, Events, Plays, Sports and Activities"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
              />
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Location */}
            <button className="hidden sm:flex items-center gap-1 text-foreground hover:text-primary transition-colors">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">Vadodara</span>
            </button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <User className="w-4 h-4" />
                    <span className="max-w-24 truncate">{user.email?.split("@")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/bookings")}>
                    <Ticket className="w-4 h-4 mr-2" />
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="hidden sm:flex"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}

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
          <button onClick={() => handleNavClick("movies")} className="text-primary font-medium text-sm">Movies</button>
          <button onClick={() => handleNavClick("now-showing")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">Now Showing</button>
          <button onClick={() => handleNavClick("coming-soon")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">Coming Soon</button>
          <button onClick={() => handleNavClick("genres")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">Genres</button>
          <button onClick={() => navigate("/bookings")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">Bookings</button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search */}
            <form className="relative mb-4" onSubmit={handleSearch}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search movies, events..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary"
              />
            </form>
            
            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-3">
              <button onClick={() => handleNavClick("movies")} className="text-primary font-medium py-2 text-left">Movies</button>
              <button onClick={() => handleNavClick("now-showing")} className="text-muted-foreground py-2 text-left">Now Showing</button>
              <button onClick={() => handleNavClick("coming-soon")} className="text-muted-foreground py-2 text-left">Coming Soon</button>
              <button onClick={() => handleNavClick("genres")} className="text-muted-foreground py-2 text-left">Genres</button>
              <button onClick={() => navigate("/bookings")} className="text-muted-foreground py-2 text-left">Bookings</button>
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <button className="flex items-center gap-1 text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">Vadodara</span>
              </button>
              {user ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate("/bookings")}>
                    <Ticket className="w-4 h-4 mr-2" />
                    Bookings
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

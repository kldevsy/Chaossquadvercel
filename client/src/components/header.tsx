import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Search, Music, Moon, Sun, Menu } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Header({ onSearch, searchQuery }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
              <Music className="text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">
              GeeKTunes
            </h1>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="nav-link text-foreground hover:text-primary transition-colors">
              Início
            </a>
            <a href="#artistas" className="nav-link text-foreground hover:text-primary transition-colors">
              Artistas
            </a>
            <a href="#generos" className="nav-link text-foreground hover:text-primary transition-colors">
              Gêneros
            </a>
            <a href="#sobre" className="nav-link text-foreground hover:text-primary transition-colors">
              Sobre
            </a>
          </nav>

          {/* Search & Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Buscar artistas..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-64 pl-4 pr-10 transition-all duration-300 focus:w-80 bg-card border-border"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden mt-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar artistas..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-4 pr-10 bg-card border-border"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col space-y-2">
              <a href="#inicio" className="text-foreground hover:text-primary transition-colors py-2">
                Início
              </a>
              <a href="#artistas" className="text-foreground hover:text-primary transition-colors py-2">
                Artistas
              </a>
              <a href="#generos" className="text-foreground hover:text-primary transition-colors py-2">
                Gêneros
              </a>
              <a href="#sobre" className="text-foreground hover:text-primary transition-colors py-2">
                Sobre
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

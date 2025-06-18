import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/theme-selector";
import { Search, Music, Menu } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Header({ onSearch, searchQuery }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Music className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                chaos squad 
              </h1>
              <p className="text-xs text-muted-foreground">Música Profissional</p>
            </div>
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
          <div className="flex items-center space-x-6">
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Buscar artistas..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-72 pl-4 pr-12 h-12 transition-all duration-300 focus:w-80 bg-background/60 backdrop-blur-sm border-border/50 rounded-2xl text-sm placeholder:text-muted-foreground/70"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
            </div>
            
            {/* Theme Selector */}
            <ThemeSelector />

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

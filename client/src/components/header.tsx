import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/theme-selector";
import { Search, Music, Menu, X } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Header({ onSearch, searchQuery }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/90 border-b border-border/50 shadow-lg"
    >
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-lg"
              animate={{ 
                boxShadow: ["0 0 20px rgba(59, 130, 246, 0.3)", "0 0 30px rgba(139, 92, 246, 0.4)", "0 0 20px rgba(6, 182, 212, 0.3)"] 
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Music className="text-white text-xl" />
            </motion.div>
            <div>
              <motion.h1 
                className="text-2xl font-bold gradient-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                chaos squad 
              </motion.h1>
              <motion.p 
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Música Profissional
              </motion.p>
            </div>
          </motion.div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Início", "Artistas", "Gêneros", "Sobre"].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="nav-link text-foreground hover:text-primary transition-all duration-300 relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                {item}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>

          {/* Search & Theme Toggle */}
          <div className="flex items-center space-x-6">
            {/* Enhanced Search Input */}
            <motion.div 
              className="relative hidden sm:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.div
                className={`relative transition-all duration-500 ${
                  isSearchFocused ? 'transform scale-105' : ''
                }`}
              >
                <Input
                  type="text"
                  placeholder="Buscar artistas..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-72 pl-6 pr-14 h-12 transition-all duration-500 bg-background/70 backdrop-blur-md border-2 rounded-2xl text-sm placeholder:text-muted-foreground/70 shadow-lg ${
                    isSearchFocused 
                      ? 'w-80 border-primary/50 shadow-primary/20 shadow-xl bg-background/90' 
                      : 'border-border/30 hover:border-border/60'
                  }`}
                />
                <motion.div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  animate={isSearchFocused ? { scale: 1.1, rotate: 360 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Search className="h-5 w-5 text-muted-foreground/60" />
                </motion.div>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 -z-10"
                  />
                )}
              </motion.div>
            </motion.div>
            
            {/* Theme Selector */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <ThemeSelector />
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Button
                variant="outline"
                size="icon"
                className="md:hidden rounded-full hover:scale-110 transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Search */}
        <AnimatePresence>
          <motion.div 
            className="sm:hidden mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar artistas..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-6 pr-12 h-12 bg-background/70 backdrop-blur-md border-2 border-border/30 rounded-xl text-sm placeholder:text-muted-foreground/70 shadow-lg transition-all duration-300 focus:border-primary/50 focus:shadow-primary/20 focus:shadow-xl"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav 
              className="md:hidden mt-4 pb-4 border-t border-border pt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-2">
                {["Início", "Artistas", "Gêneros", "Sobre"].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-foreground hover:text-primary transition-all duration-300 py-3 px-2 rounded-lg hover:bg-accent/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

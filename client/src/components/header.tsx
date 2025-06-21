import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeSelector } from "@/components/theme-selector";
import PlatformStats from "@/components/platform-stats";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { Search, Music, Menu, X, User, LogOut } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  totalArtists?: number;
}

export default function Header({ onSearch, searchQuery, totalArtists = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

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
                className={`text-2xl font-bold transition-all duration-500 ${
                  theme === 'red' ? 'text-red-400' :
                  theme === 'green' ? 'text-green-400' :
                  theme === 'blue' ? 'text-blue-400' :
                  theme === 'purple' ? 'text-purple-400' :
                  theme === 'neon' ? 'text-cyan-400' :
                  theme === 'gold' ? 'text-yellow-500' :
                  theme === 'orange' ? 'text-orange-400' :
                  theme === 'pink' ? 'text-pink-400' :
                  theme === 'indigo' ? 'text-indigo-400' :
                  theme === 'emerald' ? 'text-emerald-400' :
                  theme === 'rose' ? 'text-rose-400' :
                  'gradient-text'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                chaos squad 
              </motion.h1>
              <motion.p 
                className={`text-xs transition-all duration-500 ${
                  theme === 'red' ? 'text-red-300' :
                  theme === 'green' ? 'text-green-300' :
                  theme === 'blue' ? 'text-blue-300' :
                  theme === 'purple' ? 'text-purple-300' :
                  theme === 'neon' ? 'text-cyan-300' :
                  theme === 'gold' ? 'text-yellow-400' :
                  theme === 'orange' ? 'text-orange-300' :
                  theme === 'pink' ? 'text-pink-300' :
                  theme === 'indigo' ? 'text-indigo-300' :
                  theme === 'emerald' ? 'text-emerald-300' :
                  theme === 'rose' ? 'text-rose-300' :
                  'text-muted-foreground'
                }`}
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
            {[
              { label: "Artistas", href: "/" },
              { label: "Projetos", href: "/projects" },
              { label: "Gêneros", href: "#generos" },
              { label: "Sobre", href: "#sobre" }
            ].map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="nav-link text-foreground hover:text-primary transition-all duration-300 relative"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                {item.label}
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
            {/* Simplified Search Input */}
            <div className="relative hidden sm:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar artistas..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="search-input w-72 pl-10 pr-4 h-10 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl text-sm transition-all duration-300 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/20"
                />
                
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <div className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium">
                      {searchQuery.length}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Platform Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <PlatformStats totalArtists={totalArtists} />
            </motion.div>

            {/* User Section & Actions */}
            <div className="flex items-center space-x-4">
              <ThemeSelector />
              
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {user.firstName || user.username}
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = "/api/logout"}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => window.location.href = "/api/login"}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              )}
              
              {/* Mobile Menu Button */}
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
            </div>
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
                {[
                  { label: "Artistas", href: "/" },
                  { label: "Projetos", href: "/projects" },
                  { label: "Gêneros", href: "#generos" },
                  { label: "Sobre", href: "#sobre" }
                ].map((item, index) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    className="text-foreground hover:text-primary transition-all duration-300 py-3 px-2 rounded-lg hover:bg-accent/50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.label}
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

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Header from "@/components/header";
import HeroBanner from "@/components/hero-banner";
import TabNavigation from "@/components/tab-navigation";
import ArtistCard from "@/components/artist-card";
import MusicPlayer from "@/components/music-player";
import { useMusicPlayer } from "@/hooks/use-music-player";
import type { Artist } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  const musicPlayer = useMusicPlayer();

  // Listen for role filter events from badges
  useEffect(() => {
    const handleFilterByRole = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('filterByRole', handleFilterByRole as EventListener);
    
    return () => {
      window.removeEventListener('filterByRole', handleFilterByRole as EventListener);
    };
  }, []);

  const { data: artists = [], isLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const filteredArtists = useMemo(() => {
    let filtered = artists;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        artist =>
          artist.name.toLowerCase().includes(query) ||
          artist.description.toLowerCase().includes(query) ||
          artist.roles.some(role => role.toLowerCase().includes(query))
      );
    }

    // Filter by active tab
    if (activeTab !== "todos") {
      filtered = filtered.filter(artist =>
        artist.roles.includes(activeTab)
      );
    }

    return filtered;
  }, [artists, searchQuery, activeTab]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} totalArtists={artists.length} />
      
      <HeroBanner />
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Artists Grid */}
      <section className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-96 bg-card rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-4 text-muted-foreground">
              Nenhum artista encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `Não encontramos artistas para "${searchQuery}"`
                : "Não há artistas nesta categoria"
              }
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut" 
                }}
              >
                <ArtistCard
                  artist={artist}
                  isPlaying={
                    musicPlayer.currentArtist?.id === artist.id && 
                    musicPlayer.isPlaying
                  }
                  onPlay={() => musicPlayer.playArtist(artist)}
                  onPause={() => musicPlayer.togglePlayPause()}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More Button */}
        {filteredArtists.length > 0 && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground transform transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" />
              Carregar Mais Artistas
            </Button>
          </motion.div>
        )}
      </section>

      {/* Music Player */}
      <MusicPlayer
        isVisible={musicPlayer.isPlayerVisible}
        isMinimized={musicPlayer.isPlayerMinimized}
        currentArtist={musicPlayer.currentArtist}
        isPlaying={musicPlayer.isPlaying}
        currentTime={musicPlayer.currentTime}
        duration={musicPlayer.duration}
        volume={musicPlayer.volume}
        onPlayPause={musicPlayer.togglePlayPause}
        onNext={musicPlayer.next}
        onPrevious={musicPlayer.previous}
        onSeek={musicPlayer.seek}
        onVolumeChange={musicPlayer.changeVolume}
        onClose={musicPlayer.closePlayer}
        onToggleMinimize={musicPlayer.toggleMinimize}
      />

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <h3 className="text-xl font-bold">Chaos squad</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                A plataforma definitiva para descobrir e apoiar artistas da música geek brasileira.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Explorar</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Todos os Artistas</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Gêneros</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Novos Lançamentos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Top Charts</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Para Artistas</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Cadastre-se</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Distribuição</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Suporte</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Imprensa</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 chaos squad. Todos os direitos reservados. Feito com ❤️ para a comunidade geek brasileira.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

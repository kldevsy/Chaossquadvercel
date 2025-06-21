import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Music, Wrench, CheckCircle, Rocket } from "lucide-react";
import Header from "@/components/header";
import ProjectCard from "@/components/project-card";
import MusicPlayer from "@/components/music-player";
import { useMusicPlayer } from "@/hooks/use-music-player";
import type { Project, Artist } from "@shared/schema";

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("todos");
  const [visibleCount, setVisibleCount] = useState(6);

  const musicPlayer = useMusicPlayer();

  const { data: projects = [], isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: artists = [] } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        project =>
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.genres.some(genre => genre.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (activeFilter !== "todos") {
      filtered = filtered.filter(project => project.status === activeFilter);
    }

    return filtered;
  }, [projects, searchQuery, activeFilter]);

  const visibleProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

  const hasMoreProjects = filteredProjects.length > visibleCount;

  const loadMoreProjects = () => {
    setVisibleCount(prev => prev + 6);
  };

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, activeFilter]);

  const statusFilters = [
    { key: "todos", label: "Todos", icon: Music, count: projects.length },
    { key: "em_desenvolvimento", label: "Em Desenvolvimento", icon: Wrench, count: projects.filter(p => p.status === "em_desenvolvimento").length },
    { key: "finalizado", label: "Finalizado", icon: CheckCircle, count: projects.filter(p => p.status === "finalizado").length },
    { key: "lancado", label: "Lançado", icon: Rocket, count: projects.filter(p => p.status === "lancado").length }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} totalArtists={projects.length} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Projetos Musicais
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Descubra colaborações épicas, álbuns em desenvolvimento e lançamentos da cena geek
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Navigation */}
      <section className="container mx-auto px-4 mb-8">
        <motion.div 
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {statusFilters.map((filter, index) => (
            <motion.div
              key={filter.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={activeFilter === filter.key ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.key)}
                className={`
                  relative overflow-hidden transition-all duration-300 border-2
                  ${activeFilter === filter.key 
                    ? "bg-primary text-primary-foreground shadow-lg border-primary" 
                    : "hover:bg-primary/5 hover:border-primary/30 border-border"
                  }
                `}
              >
                <motion.div 
                  className="flex items-center gap-2"
                  initial={false}
                  animate={activeFilter === filter.key ? { x: [0, -1, 1, 0] } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <filter.icon className="w-4 h-4" />
                  <span className="font-medium">{filter.label}</span>
                  {filter.count > 0 && (
                    <motion.span 
                      className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${activeFilter === filter.key 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "bg-primary/20 text-primary"
                        }
                      `}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                    >
                      {filter.count}
                    </motion.span>
                  )}
                </motion.div>
                
                {/* Active indicator */}
                {activeFilter === filter.key && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary-foreground/80 rounded-t-sm"
                    layoutId="activeFilter"
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Projects Grid */}
      <section className="container mx-auto px-4 pb-20">
        {loadingProjects ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card/50 rounded-lg h-80 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold mb-4 text-muted-foreground">
              Nenhum projeto encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `Não encontramos projetos para "${searchQuery}"`
                : "Não há projetos nesta categoria"
              }
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {visibleProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut" 
                }}
              >
                <ProjectCard
                  project={project}
                  artists={artists}
                  isPlaying={
                    musicPlayer.currentArtist?.name === project.name && 
                    musicPlayer.isPlaying
                  }
                  onPlay={() => {
                    // Create a fake artist object for the project preview
                    const projectArtist = {
                      id: project.id,
                      name: project.name,
                      avatar: project.cover,
                      description: project.description,
                      roles: ["Projeto"],
                      socialLinks: "{}",
                      musicUrl: project.previewUrl,
                      isActive: true,
                      musicalStyles: project.genres,
                      artistTypes: ["Projeto"]
                    };
                    musicPlayer.playArtist(projectArtist);
                  }}
                  onPause={() => musicPlayer.togglePlayPause()}
                  musicPlayer={musicPlayer}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More Button */}
        {hasMoreProjects && (
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              variant="outline" 
              size="lg"
              onClick={loadMoreProjects}
              className="px-8 py-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground transform transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" />
              Carregar Mais Projetos ({filteredProjects.length - visibleCount} restantes)
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
    </div>
  );
}
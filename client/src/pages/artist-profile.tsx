import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Heart, 
  ExternalLink, 
  Music2, 
  Calendar,
  Users,
  Star,
  MapPin,
  Globe,
  Instagram,
  Twitter,
  Youtube,
  Facebook
} from "lucide-react";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { useLikes } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";
import ProjectCard from "@/components/project-card";
import type { Artist, Project } from "@shared/schema";

export default function ArtistProfile() {
  const [match, params] = useRoute("/artist/:id");
  const artistId = params?.id ? parseInt(params.id) : null;
  
  const { data: user } = useAuth();
  const musicPlayer = useMusicPlayer();
  const { isArtistLiked, toggleLike, isLiking } = useLikes();
  
  const { data: artist, isLoading } = useQuery<Artist>({
    queryKey: ["/api/artists", artistId],
    enabled: !!artistId,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Filter projects that include this artist
  const artistProjects = projects.filter(project => 
    project.collaborators?.includes(artist?.name || "")
  );

  const handleLike = async () => {
    if (!user || !artist) return;
    
    try {
      await toggleLike(artist.id);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handlePlay = () => {
    if (!artist) return;
    
    if (musicPlayer.currentArtist?.id === artist.id && musicPlayer.isPlaying) {
      musicPlayer.pause();
    } else {
      musicPlayer.playArtist(artist);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return Instagram;
      case 'twitter': case 'x': return Twitter;
      case 'youtube': return Youtube;
      case 'facebook': return Facebook;
      default: return Globe;
    }
  };

  if (!match || !artistId) {
    return <div>Artista não encontrado</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil do artista...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artista não encontrado</h2>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const isPlaying = musicPlayer.currentArtist?.id === artist.id && musicPlayer.isPlaying;
  const liked = user && isArtistLiked(artist.id);
  const totalLikes = artist.likesCount || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with back button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* Artist Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-shrink-0"
            >
              <Avatar className="w-48 h-48 border-4 border-primary/20">
                <AvatarImage src={artist.avatar} alt={artist.name} />
                <AvatarFallback className="text-4xl">
                  {artist.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'A'}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Artist Info */}
            <div className="flex-1 space-y-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-4xl lg:text-6xl font-bold gradient-text mb-4"
                >
                  {artist.name}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-xl text-muted-foreground leading-relaxed"
                >
                  {artist.description}
                </motion.p>
              </div>

              {/* Roles */}
              {artist.roles && artist.roles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex flex-wrap gap-2"
                >
                  {artist.roles.map((role, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {role}
                    </Badge>
                  ))}
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                {artist.musicUrl && (
                  <Button
                    onClick={handlePlay}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 mr-2" />
                    ) : (
                      <Play className="w-5 h-5 mr-2" />
                    )}
                    {isPlaying ? "Pausar" : "Tocar"}
                  </Button>
                )}

                {user && (
                  <Button
                    onClick={handleLike}
                    disabled={isLiking}
                    variant="outline"
                    size="lg"
                    className={liked ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" : ""}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-current" : ""}`} />
                    {liked ? "Curtido" : "Curtir"}
                    {totalLikes > 0 && (
                      <span className="ml-2 bg-background/20 px-2 py-1 rounded-full text-xs">
                        {totalLikes}
                      </span>
                    )}
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Projects Section */}
            {artistProjects.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music2 className="w-5 h-5" />
                      Projetos ({artistProjects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {artistProjects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          artists={[]}
                          isPlaying={false}
                          onPlay={() => {}}
                          onPause={() => {}}
                          musicPlayer={musicPlayer}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Bio Extended */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sobre o Artista</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {artist.description}
                  </p>
                </CardContent>
              </Card>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      Curtidas
                    </span>
                    <span className="font-semibold">{totalLikes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Music2 className="w-4 h-4" />
                      Projetos
                    </span>
                    <span className="font-semibold">{artistProjects.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      Funções
                    </span>
                    <span className="font-semibold">{artist.roles?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Social Links */}
            {artist.socialLinks && typeof artist.socialLinks === 'object' && Object.keys(artist.socialLinks).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Redes Sociais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(artist.socialLinks).map(([platform, url]) => {
                      const IconComponent = getSocialIcon(platform);
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                          <IconComponent className="w-5 h-5 text-primary" />
                          <span className="capitalize">{platform}</span>
                          <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
                        </a>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Music Link */}
            {artist.musicUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Música</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={artist.musicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <Play className="w-5 h-5 text-primary" />
                      <span>Ouvir no Spotify/YouTube</span>
                      <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
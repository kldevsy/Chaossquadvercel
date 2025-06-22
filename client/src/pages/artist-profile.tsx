import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Facebook,
  Edit,
  Upload,
  Volume2,
  Download
} from "lucide-react";
import { useMusicPlayer } from "@/hooks/use-music-player";
import { useLikes } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";
import ProjectCard from "@/components/project-card";
import type { Artist, Project, Track } from "@shared/schema";

export default function ArtistProfile() {
  const [match, params] = useRoute("/artist-profile/:id");
  const [, setLocation] = useLocation();
  const artistId = params?.id ? parseInt(params.id) : null;
  
  // All hooks must be at the top level and in consistent order
  const { user, isAuthenticated } = useAuth();
  const musicPlayer = useMusicPlayer();
  const { isArtistLiked, toggleLike, isLiking } = useLikes();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    avatar: '',
    banner: '',
  });
  const [trackFormData, setTrackFormData] = useState({
    title: '',
    audioUrl: '',
    coverUrl: '',
    genre: '',
    description: '',
    duration: 0,
  });
  
  const { data: artist, isLoading } = useQuery<Artist>({
    queryKey: [`/api/artists/${artistId}`],
    enabled: !!artistId,
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tracks = [] } = useQuery<Track[]>({
    queryKey: [`/api/artists/${artistId}/tracks`],
    enabled: !!artistId,
  });

  // Update form data when artist data loads
  useEffect(() => {
    if (artist) {
      setEditFormData({
        name: artist.name || '',
        description: artist.description || '',
        avatar: artist.avatar || '',
        banner: artist.banner || '',
      });
    }
  }, [artist]);

  // Early returns after all hooks
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
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

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

  const isPlaying = musicPlayer.currentArtist?.id === artist.id && musicPlayer.isPlaying;
  const liked = user && isArtistLiked(artist.id);
  const totalLikes = artist.likesCount || 0;
  const isOwner = user && artist && user.id === artist.userId;
  


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with back button - positioned above banner */}
      <div className="absolute top-4 left-4 z-50">
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Banner Section - estilo Twitter/Discord */}
      <div className="relative">
        {/* Banner Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="h-56 md:h-72 relative overflow-hidden"
          style={{
            background: artist.banner 
              ? `url(${artist.banner}) center/cover no-repeat` 
              : `linear-gradient(135deg, 
                  hsl(var(--primary)) 0%, 
                  hsl(var(--primary)) 25%, 
                  hsl(var(--secondary)) 50%, 
                  hsl(var(--accent)) 75%, 
                  hsl(var(--primary)) 100%)`
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30" />
          {/* Animated particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 4 + 2,
                  height: Math.random() * 4 + 2,
                  background: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`
                }}
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: Math.random() * 300,
                  scale: 0
                }}
                animate={{
                  y: [null, -100],
                  x: [null, Math.random() * 50 - 25],
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Floating musical notes */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`note-${i}`}
                className="absolute text-white/10 text-2xl"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                  y: 350,
                  opacity: 0
                }}
                animate={{
                  y: -50,
                  opacity: [0, 1, 0],
                  rotate: [0, 15, -15, 0]
                }}
                transition={{
                  duration: 6 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                  ease: "easeOut"
                }}
              >
                {['♪', '♫', '♬', '♩'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        </motion.div>

        {/* Profile Content */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 md:-mt-24">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Artist Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl">
                  <AvatarImage src={artist.avatar} alt={artist.name} />
                  <AvatarFallback className="text-3xl md:text-4xl">
                    {artist.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Online indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-background"
                />
              </motion.div>

              {/* Artist Info */}
              <div className="flex-1 pt-4 md:pt-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-4"
                >
                  <div>
                    <h1 className="text-3xl md:text-5xl font-bold gradient-text mb-2">
                      {artist.name}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                      {artist.description}
                    </p>
                  </div>

                  {/* Roles */}
                  {artist.roles && artist.roles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {artist.roles.map((role, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <Badge variant="secondary" className="px-3 py-1">
                            {role}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Stats inline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-6 text-sm"
                  >
                    <motion.div 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-semibold">{totalLikes}</span>
                      <span>curtidas</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Music2 className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold">{artistProjects.length}</span>
                      <span>projetos</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="font-semibold">{artist.roles?.length || 0}</span>
                      <span>funções</span>
                    </motion.div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-wrap gap-3 pt-2"
                  >
                    {artist.musicUrl && (
                      <Button
                        onClick={handlePlay}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 rounded-full px-8"
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
                        className={`rounded-full px-6 ${liked ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" : ""}`}
                      >
                        <Heart className={`w-5 h-5 mr-2 ${liked ? "fill-current" : ""}`} />
                        {liked ? "Curtido" : "Curtir"}
                      </Button>
                    )}

                    {/* Owner Controls - Positioned here for better flow */}
                    {isOwner && (
                      <>
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="lg" className="rounded-full px-6 hover:bg-accent">
                              <Edit className="w-5 h-5 mr-2" />
                              Editar Perfil
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Editar Perfil</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-name">Nome</Label>
                                <Input
                                  id="edit-name"
                                  value={editFormData.name}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-description">Descrição</Label>
                                <Textarea
                                  id="edit-description"
                                  value={editFormData.description}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-avatar">Avatar URL</Label>
                                <Input
                                  id="edit-avatar"
                                  value={editFormData.avatar}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, avatar: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-banner">Banner URL</Label>
                                <Input
                                  id="edit-banner"
                                  value={editFormData.banner}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, banner: e.target.value }))}
                                />
                              </div>
                              <Button 
                                className="w-full"
                                onClick={async () => {
                                  try {
                                    console.log('Sending update request:', editFormData);
                                    const response = await fetch(`/api/artists/${artist.id}`, {
                                      method: 'PUT',
                                      headers: { 
                                        'Content-Type': 'application/json',
                                      },
                                      credentials: 'include',
                                      body: JSON.stringify(editFormData),
                                    });
                                    
                                    if (response.ok) {
                                      console.log('Profile updated successfully');
                                      window.location.reload();
                                    } else {
                                      const errorData = await response.json();
                                      console.error('Failed to update profile:', errorData.message);
                                      alert('Erro ao atualizar perfil: ' + errorData.message);
                                    }
                                    setIsEditDialogOpen(false);
                                  } catch (error) {
                                    console.error('Error updating profile:', error);
                                    alert('Erro de conexão ao atualizar perfil');
                                  }
                                }}
                              >
                                Salvar Alterações
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isTrackDialogOpen} onOpenChange={setIsTrackDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="lg" className="bg-secondary hover:bg-secondary/90 rounded-full px-6">
                              <Upload className="w-5 h-5 mr-2" />
                              Novo Track
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Adicionar Nova Produção</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="track-title">Título</Label>
                                <Input
                                  id="track-title"
                                  value={trackFormData.title}
                                  onChange={(e) => setTrackFormData(prev => ({ ...prev, title: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="track-audioUrl">URL do Áudio</Label>
                                <Input
                                  id="track-audioUrl"
                                  value={trackFormData.audioUrl}
                                  onChange={(e) => setTrackFormData(prev => ({ ...prev, audioUrl: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="track-coverUrl">URL da Capa</Label>
                                <Input
                                  id="track-coverUrl"
                                  value={trackFormData.coverUrl}
                                  onChange={(e) => setTrackFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="track-genre">Gênero</Label>
                                <Input
                                  id="track-genre"
                                  value={trackFormData.genre}
                                  onChange={(e) => setTrackFormData(prev => ({ ...prev, genre: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="track-description">Descrição</Label>
                                <Textarea
                                  id="track-description"
                                  value={trackFormData.description}
                                  onChange={(e) => setTrackFormData(prev => ({ ...prev, description: e.target.value }))}
                                />
                              </div>
                              <Button 
                                className="w-full"
                                onClick={async () => {
                                  try {
                                    const trackData = {
                                      ...trackFormData,
                                      artistId: artistId
                                    };
                                    
                                    const response = await fetch('/api/tracks', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify(trackData),
                                    });
                                    
                                    if (response.ok) {
                                      // Invalidate the tracks cache to refresh the data
                                      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/tracks`] });
                                      setIsTrackDialogOpen(false);
                                      setTrackFormData({
                                        title: '',
                                        audioUrl: '',
                                        coverUrl: '',
                                        genre: '',
                                        description: '',
                                        duration: 0,
                                      });
                                      console.log('Track criada com sucesso!');
                                    } else {
                                      const errorData = await response.text();
                                      console.error('Erro ao criar track:', errorData);
                                    }
                                  } catch (error) {
                                    console.error('Erro ao criar track:', error);
                                  }
                                }}
                              >
                                Adicionar Produção
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 pt-8">
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

            {/* Tracks Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    Produções ({tracks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tracks.length > 0 ? (
                    <div className="space-y-4">
                      {tracks.map((track, index) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          }}
                          whileHover={{ 
                            scale: 1.02, 
                            y: -2,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                          }}
                          className="group relative flex items-center gap-4 p-5 rounded-xl border bg-gradient-to-r from-card to-card/80 hover:from-accent/10 hover:to-accent/5 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                            <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20" />
                          </div>
                          
                          {/* Track Cover */}
                          <motion.div 
                            className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/70 flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            {track.coverUrl ? (
                              <motion.img 
                                src={track.coverUrl} 
                                alt={track.title}
                                className="w-full h-full object-cover"
                                whileHover={{ scale: 1.2 }}
                                transition={{ duration: 0.3 }}
                              />
                            ) : (
                              <motion.div
                                className="relative"
                                whileHover={{ scale: 1.2 }}
                              >
                                <Music2 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                <motion.div
                                  className="absolute inset-0 bg-primary/20 rounded-full"
                                  initial={{ scale: 0, opacity: 0 }}
                                  whileHover={{ scale: 1.5, opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                />
                              </motion.div>
                            )}
                            
                            {/* Shine Effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "100%" }}
                              transition={{ duration: 0.6 }}
                            />
                          </motion.div>
                          
                          {/* Track Info */}
                          <div className="flex-1 relative z-10">
                            <motion.h4 
                              className="font-semibold text-lg group-hover:text-primary transition-colors"
                              layoutId={`title-${track.id}`}
                            >
                              {track.title}
                            </motion.h4>
                            <motion.p 
                              className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors"
                              initial={{ opacity: 0.7 }}
                              whileHover={{ opacity: 1 }}
                            >
                              {track.genre}
                            </motion.p>
                            {track.description && (
                              <motion.p 
                                className="text-xs text-muted-foreground mt-1 line-clamp-2 group-hover:text-foreground/60 transition-colors"
                                initial={{ opacity: 0.6 }}
                                whileHover={{ opacity: 0.8 }}
                              >
                                {track.description}
                              </motion.p>
                            )}
                          </div>
                          
                          {/* Track Actions */}
                          <motion.div 
                            className="flex items-center gap-2 relative z-10"
                            initial={{ opacity: 0.8 }}
                            whileHover={{ opacity: 1 }}
                          >
                            {track.audioUrl && (
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-primary/10 border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300"
                                  onClick={() => {
                                    // Create a temporary audio element to play the track
                                    const audio = new Audio(track.audioUrl);
                                    audio.volume = 0.7;
                                    audio.play().then(() => {
                                      console.log("Playing track:", track.title);
                                    }).catch((error) => {
                                      console.error("Audio playback failed:", error);
                                      // Try to open in new tab as fallback
                                      window.open(track.audioUrl, '_blank');
                                    });
                                  }}
                                >
                                  <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4"
                                  >
                                    <Play className="w-4 h-4" />
                                  </motion.div>
                                </Button>
                              </motion.div>
                            )}
                            
                            {track.audioUrl && (
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-accent/50 transition-all duration-300"
                                  asChild
                                >
                                  <a
                                    href={track.audioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <motion.div
                                      whileHover={{ y: -2 }}
                                      transition={{ type: "spring", stiffness: 400 }}
                                    >
                                      <Download className="w-4 h-4" />
                                    </motion.div>
                                  </a>
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Music2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma produção disponível</p>
                      {isOwner && (
                        <p className="text-sm mt-2">Use o botão "Novo Track" para adicionar suas produções</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.section>

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
            
            {/* Enhanced Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="relative bg-gradient-to-br from-card/90 to-card/30 backdrop-blur-lg border-primary/30 shadow-xl overflow-hidden">
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
                <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-accent/10 rounded-full blur-xl" />
                
                <CardHeader className="pb-4 relative z-10">
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-5 h-5 text-yellow-500" />
                    </motion.div>
                    <CardTitle className="text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      Estatísticas
                    </CardTitle>
                  </motion.div>
                </CardHeader>
                <CardContent className="space-y-6 relative z-10">
                  {/* Curtidas */}
                  <motion.div
                    whileHover={{ scale: 1.03, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-red-500/5 hover:from-red-500/20 hover:to-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-all duration-300 cursor-pointer group overflow-hidden"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <motion.div
                      className="relative p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 group-hover:from-red-500/30 group-hover:to-red-500/20 transition-all duration-300 shadow-lg"
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      <Heart className="w-6 h-6 text-red-500" />
                    </motion.div>
                    <div className="flex-1 relative z-10">
                      <p className="text-sm text-muted-foreground group-hover:text-red-400 transition-colors">Curtidas</p>
                      <motion.p 
                        className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent"
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {totalLikes}
                      </motion.p>
                    </div>
                    
                    {/* Floating hearts */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-red-500/50"
                          initial={{ y: 0, opacity: 0, scale: 0 }}
                          whileHover={{ 
                            y: -20, 
                            opacity: [0, 1, 0], 
                            scale: [0, 1, 0],
                            x: Math.random() * 20 - 10
                          }}
                          transition={{ 
                            duration: 1.5, 
                            delay: i * 0.2,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        >
                          ♥
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Projetos */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer group"
                  >
                    <motion.div
                      className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Music2 className="w-5 h-5 text-blue-500" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Projetos</p>
                      <motion.p 
                        className="text-2xl font-bold text-blue-500"
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        {artistProjects.length}
                      </motion.p>
                    </div>
                  </motion.div>

                  {/* Funções */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-green-500/5 hover:bg-green-500/10 transition-colors cursor-pointer group"
                  >
                    <motion.div
                      className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Users className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Funções</p>
                      <motion.p 
                        className="text-2xl font-bold text-green-500"
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        {artist.roles?.length || 0}
                      </motion.p>
                    </div>
                  </motion.div>
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
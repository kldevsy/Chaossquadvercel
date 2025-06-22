import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Heart, 
  Music, 
  Users, 
  Star, 
  Play, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Plus,
  Clock,
  MapPin,
  Calendar,
  Volume2
} from "lucide-react";
import { SiSpotify, SiYoutube, SiSoundcloud, SiInstagram, SiTwitter, SiFacebook } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import type { Artist, Project, Track, InsertTrack, User } from "@shared/schema";
import { useMusicPlayer } from "@/hooks/use-music-player";
import MusicPlayer from "@/components/music-player";

export default function ArtistProfile() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const musicPlayer = useMusicPlayer();

  // State management
  const [isAddTrackDialogOpen, setIsAddTrackDialogOpen] = useState(false);
  const [isEditTrackDialogOpen, setIsEditTrackDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [newTrack, setNewTrack] = useState<Partial<InsertTrack>>({
    title: '',
    genre: '',
    duration: '',
    audioUrl: '',
    coverUrl: ''
  });

  // Fetch artist data
  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: [`/api/artists/${id}`],
  });

  // Fetch artist projects
  const { data: artistProjects = [] } = useQuery<Project[]>({
    queryKey: [`/api/projects`],
    select: (projects) => projects.filter(p => p.artistIds?.includes(Number(id)))
  });

  // Fetch artist tracks
  const { data: tracks = [] } = useQuery<Track[]>({
    queryKey: [`/api/tracks/artist/${id}`],
  });

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/artists/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to like artist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${id}`] });
      toast({ title: "Artista curtido com sucesso!" });
    },
  });

  // Add track mutation
  const addTrackMutation = useMutation({
    mutationFn: async (trackData: Partial<InsertTrack>) => {
      const response = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...trackData, artistId: Number(id) }),
      });
      if (!response.ok) throw new Error('Failed to add track');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tracks/artist/${id}`] });
      setIsAddTrackDialogOpen(false);
      setNewTrack({ title: '', genre: '', duration: '', audioUrl: '', coverUrl: '' });
      toast({ title: "Faixa adicionada com sucesso!" });
    },
  });

  // Update track mutation
  const updateTrackMutation = useMutation({
    mutationFn: async (trackData: Track) => {
      const response = await fetch(`/api/tracks/${trackData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData),
      });
      if (!response.ok) throw new Error('Failed to update track');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tracks/artist/${id}`] });
      setIsEditTrackDialogOpen(false);
      setEditingTrack(null);
      toast({ title: "Faixa atualizada com sucesso!" });
    },
  });

  // Delete track mutation
  const deleteTrackMutation = useMutation({
    mutationFn: async (trackId: number) => {
      const response = await fetch(`/api/tracks/${trackId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete track');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tracks/artist/${id}`] });
      toast({ title: "Faixa removida com sucesso!" });
    },
  });

  // Helper functions
  const handleAddTrack = () => {
    if (newTrack.title) {
      addTrackMutation.mutate(newTrack);
    }
  };

  const handleEditTrack = () => {
    if (editingTrack?.title) {
      updateTrackMutation.mutate(editingTrack);
    }
  };

  const handleDeleteTrack = (trackId: number) => {
    if (confirm('Tem certeza que deseja remover esta faixa?')) {
      deleteTrackMutation.mutate(trackId);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify': return SiSpotify;
      case 'youtube': return SiYoutube;
      case 'soundcloud': return SiSoundcloud;
      case 'instagram': return SiInstagram;
      case 'twitter': return SiTwitter;
      case 'facebook': return SiFacebook;
      default: return ExternalLink;
    }
  };

  if (artistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Artista não encontrado</h1>
          <p className="text-muted-foreground">O artista que você está procurando não existe.</p>
        </div>
      </div>
    );
  }

  const isOwner = user && artist && user.id === artist.userId;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 text-foreground relative overflow-hidden">
        {/* Animated background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        {/* Hero Section */}
        <div className="relative">
          {/* Banner Image */}
          <div className="h-96 relative overflow-hidden">
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              {artist.banner ? (
                <img
                  src={artist.banner}
                  alt={`${artist.name} banner`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20" />
              )}
            </motion.div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/30 via-transparent to-background/30 backdrop-blur-sm" />
          </div>

          {/* Profile Content */}
          <div className="relative -mt-32 z-10">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col lg:flex-row items-start gap-8"
              >
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative"
                >
                  <Avatar className="w-48 h-48 border-4 border-background shadow-2xl">
                    <AvatarImage src={artist.avatar} alt={artist.name} />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {artist.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status indicator */}
                  {artist.isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center"
                    >
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Artist Info */}
                <div className="flex-1 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
                      {artist.name}
                    </h1>
                    
                    {/* Roles */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artist.roles.map((role, index) => (
                        <motion.div
                          key={role}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Badge 
                            variant="outline" 
                            className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                          >
                            {role}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg text-muted-foreground leading-relaxed mb-6"
                    >
                      {artist.description}
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span className="font-semibold">{artist.likesCount || 0}</span>
                        <span className="text-muted-foreground">curtidas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Music className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{tracks.length}</span>
                        <span className="text-muted-foreground">faixas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent" />
                        <span className="font-semibold">{artistProjects.length}</span>
                        <span className="text-muted-foreground">projetos</span>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-4 flex-wrap"
                  >
                    <Button
                      onClick={() => likeMutation.mutate()}
                      disabled={likeMutation.isPending}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                      </motion.div>
                      Curtir Artista
                    </Button>

                    {artist.musicUrl && (
                      <Button
                        onClick={() => musicPlayer.playArtist(artist)}
                        className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                        </motion.div>
                        Tocar Música
                      </Button>
                    )}

                    {isOwner && (
                      <Button
                        onClick={() => setIsAddTrackDialogOpen(true)}
                        variant="outline"
                        className="border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Faixa
                      </Button>
                    )}
                  </motion.div>
                </div>
              </motion.div>
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
                  transition={{ duration: 0.6 }}
                >
                  <Card className="bg-gradient-to-br from-card/80 via-card/70 to-card/60 backdrop-blur-xl border-border/30 shadow-2xl">
                    <CardHeader className="border-b border-border/20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                          <Star className="w-6 h-6 text-primary" />
                        </motion.div>
                        Projetos
                      </CardTitle>
                      <CardDescription className="text-muted-foreground/80">
                        Projetos em que o artista participa
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4">
                        {artistProjects.map((project, index) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-gradient-to-r from-accent/10 via-background/50 to-secondary/10 backdrop-blur-sm border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <h3 className="font-semibold text-lg text-foreground mb-2">{project.name}</h3>
                            <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="border-accent/30 text-accent">
                                {project.status}
                              </Badge>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {new Date(project.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {/* Tracks Section */}
              {tracks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-card/80 via-card/70 to-card/60 backdrop-blur-xl border-border/30 shadow-2xl">
                    <CardHeader className="border-b border-border/20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Music className="w-6 h-6 text-primary" />
                        </motion.div>
                        Faixas Musicais
                      </CardTitle>
                      <CardDescription className="text-muted-foreground/80">
                        Ouça as músicas do artista
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {tracks.map((track, index) => (
                          <motion.div
                            key={track.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-accent/10 via-background/50 to-secondary/10 backdrop-blur-sm border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300 group"
                          >
                            <div className="flex items-center gap-4">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="relative"
                              >
                                {track.coverUrl ? (
                                  <img
                                    src={track.coverUrl}
                                    alt={track.title}
                                    className="w-16 h-16 rounded-lg object-cover shadow-lg"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-lg flex items-center justify-center shadow-lg">
                                    <Music className="w-8 h-8 text-primary" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </motion.div>
                              
                              <div className="space-y-1">
                                <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                                  {track.title}
                                </h4>
                                {track.genre && (
                                  <p className="text-sm text-muted-foreground bg-accent/20 px-2 py-1 rounded-md inline-block">
                                    {track.genre}
                                  </p>
                                )}
                                {track.duration && (
                                  <p className="text-xs text-muted-foreground/70">
                                    Duração: {track.duration}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <motion.div
                              className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={{ opacity: 0 }}
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
                                      // Create a temporary artist object for the track
                                      const trackArtist: Artist = {
                                        ...artist,
                                        name: track.title,
                                        musicUrl: track.audioUrl,
                                        avatar: track.coverUrl || artist.avatar
                                      };
                                      musicPlayer.playArtist(trackArtist);
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
                                        className="w-4 h-4"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </motion.div>
                                    </a>
                                  </Button>
                                </motion.div>
                              )}
                              
                              {isOwner && (
                                <>
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="hover:bg-blue-500/20 hover:text-blue-400 transition-all duration-300"
                                      onClick={() => {
                                        setEditingTrack(track);
                                        setIsEditTrackDialogOpen(true);
                                      }}
                                    >
                                      <motion.div
                                        whileHover={{ rotate: 15 }}
                                        className="w-4 h-4"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </motion.div>
                                    </Button>
                                  </motion.div>
                                  
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
                                      onClick={() => handleDeleteTrack(track.id)}
                                    >
                                      <motion.div
                                        whileHover={{ rotate: 180 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-4 h-4"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </motion.div>
                                    </Button>
                                  </motion.div>
                                </>
                              )}
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {isOwner && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          className="mt-6 pt-6 border-t border-border/20"
                        >
                          <Button
                            onClick={() => setIsAddTrackDialogOpen(true)}
                            className="w-full bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Adicionar Nova Faixa
                            </motion.div>
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Social Links */}
              {artist.socialLinks && Object.keys(JSON.parse(artist.socialLinks)).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-br from-card/80 via-card/70 to-card/60 backdrop-blur-xl border-border/30 shadow-xl">
                    <CardHeader className="border-b border-border/20">
                      <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Redes Sociais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(JSON.parse(artist.socialLinks)).map(([platform, url]) => {
                        const IconComponent = getSocialIcon(platform);
                        return (
                          <a
                            key={platform}
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                          >
                            <IconComponent className="w-5 h-5" />
                            <span className="capitalize">{platform}</span>
                          </a>
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Music Player Integration */}
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

      {/* Add Track Dialog */}
      <Dialog open={isAddTrackDialogOpen} onOpenChange={setIsAddTrackDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-card/95 via-card/90 to-card/85 backdrop-blur-xl border-border/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Adicionar Nova Faixa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Título da Faixa
              </label>
              <Input
                value={newTrack.title}
                onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                placeholder="Digite o título da faixa"
                className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Gênero
              </label>
              <Input
                value={newTrack.genre || ''}
                onChange={(e) => setNewTrack({ ...newTrack, genre: e.target.value })}
                placeholder="Ex: Rock, Pop, Electronic"
                className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Duração
              </label>
              <Input
                value={newTrack.duration || ''}
                onChange={(e) => setNewTrack({ ...newTrack, duration: e.target.value })}
                placeholder="Ex: 3:45"
                className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                URL do Áudio
              </label>
              <Input
                value={newTrack.audioUrl || ''}
                onChange={(e) => setNewTrack({ ...newTrack, audioUrl: e.target.value })}
                placeholder="https://example.com/audio.mp3"
                className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                URL da Capa
              </label>
              <Input
                value={newTrack.coverUrl || ''}
                onChange={(e) => setNewTrack({ ...newTrack, coverUrl: e.target.value })}
                placeholder="https://example.com/cover.jpg"
                className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddTrackDialogOpen(false)}
              className="flex-1 border-border/30 hover:bg-accent/50 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddTrack}
              disabled={addTrackMutation.isPending || !newTrack.title}
              className="flex-1 bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-all duration-300"
            >
              {addTrackMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                'Adicionar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Track Dialog */}
      <Dialog open={isEditTrackDialogOpen} onOpenChange={setIsEditTrackDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-card/95 via-card/90 to-card/85 backdrop-blur-xl border-border/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Editar Faixa
            </DialogTitle>
          </DialogHeader>
          {editingTrack && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">
                  Título da Faixa
                </label>
                <Input
                  value={editingTrack.title}
                  onChange={(e) => setEditingTrack({ ...editingTrack, title: e.target.value })}
                  placeholder="Digite o título da faixa"
                  className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">
                  Gênero
                </label>
                <Input
                  value={editingTrack.genre || ''}
                  onChange={(e) => setEditingTrack({ ...editingTrack, genre: e.target.value })}
                  placeholder="Ex: Rock, Pop, Electronic"
                  className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">
                  Duração
                </label>
                <Input
                  value={editingTrack.duration || ''}
                  onChange={(e) => setEditingTrack({ ...editingTrack, duration: e.target.value })}
                  placeholder="Ex: 3:45"
                  className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">
                  URL do Áudio
                </label>
                <Input
                  value={editingTrack.audioUrl || ''}
                  onChange={(e) => setEditingTrack({ ...editingTrack, audioUrl: e.target.value })}
                  placeholder="https://example.com/audio.mp3"
                  className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">
                  URL da Capa
                </label>
                <Input
                  value={editingTrack.coverUrl || ''}
                  onChange={(e) => setEditingTrack({ ...editingTrack, coverUrl: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                  className="bg-background/50 border-border/30 focus:border-primary/50 transition-all duration-300"
                />
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditTrackDialogOpen(false);
                setEditingTrack(null);
              }}
              className="flex-1 border-border/30 hover:bg-accent/50 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditTrack}
              disabled={updateTrackMutation.isPending || !editingTrack?.title}
              className="flex-1 bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-all duration-300"
            >
              {updateTrackMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
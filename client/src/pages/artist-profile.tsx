import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Heart, Play, Pause, Edit, Upload, Music2, Users, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useLikes } from "@/hooks/useLikes";
import { useMusicPlayer } from "@/hooks/use-music-player";
import MusicPlayer from "@/components/music-player";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import type { Artist, Project, Track } from "@shared/schema";

export default function ArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const artistId = parseInt(id || "0");
  const { user } = useAuth();
  const { toggleLike, isArtistLiked, isLiking } = useLikes();
  const musicPlayer = useMusicPlayer();
  
  // State management
  const [liked, setLiked] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  
  // Form states
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

  // Fetch artist data
  const { data: artist, isLoading } = useQuery<Artist>({
    queryKey: [`/api/artists/${artistId}`],
    enabled: !!artistId && artistId > 0,
  });

  // Fetch artist projects
  const { data: artistProjects = [] } = useQuery<Project[]>({
    queryKey: [`/api/projects`],
    enabled: !!artist,
    select: (projects) => projects.filter(p => 
      p.collaborators?.includes(artist?.name || '') || 
      p.name?.toLowerCase().includes(artist?.name?.toLowerCase() || '')
    ),
  });

  // Fetch artist tracks
  const { data: artistTracks = [] } = useQuery<Track[]>({
    queryKey: [`/api/artists/${artistId}/tracks`],
    enabled: !!artistId && artistId > 0,
  });

  const isOwner = user && artist && user.id === artist.userId;
  const isPlaying = musicPlayer.currentArtist?.id === artistId && musicPlayer.isPlaying;

  // Initialize form data when artist loads
  useEffect(() => {
    if (artist) {
      setEditFormData({
        name: artist.name || '',
        description: artist.description || '',
        avatar: artist.avatar || '',
        banner: artist.banner || '',
      });
      setTotalLikes(artist.likesCount || 0);
    }
  }, [artist]);

  // Check if artist is liked
  useEffect(() => {
    if (user && artistId) {
      const likedStatus = isArtistLiked(artistId);
      setLiked(likedStatus);
    }
  }, [user, artistId, isArtistLiked]);

  const handlePlay = () => {
    if (!artist) return;
    
    if (isPlaying) {
      musicPlayer.pause();
    } else {
      musicPlayer.playArtist(artist);
    }
  };

  const handleLike = async () => {
    if (!user || !artist || isLiking) return;
    
    try {
      await toggleLike(artist.id);
      const newLikedStatus = !liked;
      setLiked(newLikedStatus);
      setTotalLikes(prev => newLikedStatus ? prev + 1 : Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Artista não encontrado</h1>
          <p className="text-muted-foreground">O perfil do artista que você está procurando não existe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative h-80 md:h-96 overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: artist.banner 
              ? `url(${artist.banner})` 
              : `linear-gradient(135deg, 
                  hsl(220 70% 15%) 0%, 
                  hsl(280 60% 20%) 25%, 
                  hsl(240 80% 25%) 50%, 
                  hsl(300 50% 18%) 75%, 
                  hsl(260 65% 12%) 100%)`
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
        
        {/* Dynamic Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20 backdrop-blur-sm"
              style={{
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 50}%`,
              }}
              animate={{
                y: [0, -800 - Math.random() * 200],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1.5, 0.5],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
        
        {/* Musical Symbols Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`symbol-${i}`}
              className="absolute text-white/10 text-2xl md:text-3xl font-bold"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 20}%`,
              }}
              animate={{
                y: [0, -400 - Math.random() * 100],
                x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50],
                opacity: [0, 0.6, 0],
                rotate: [0, 180 + Math.random() * 180],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 6,
                ease: "easeInOut",
              }}
            >
              {['♪', '♫', '♬', '♩', '♭', '♯', '𝄞', '𝄢'][Math.floor(Math.random() * 8)]}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Profile Section */}
      <div className="container mx-auto px-6 lg:px-8">
        <div className="relative -mt-32 md:-mt-40">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 150, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateY: 0 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.4,
                type: "spring",
                stiffness: 100
              }}
              className="relative group flex-shrink-0"
            >
              {/* Glow Effect */}
              <motion.div 
                className="absolute -inset-6 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-2xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.div
                whileHover={{ 
                  scale: 1.08,
                  rotateY: [0, 5, -5, 0],
                  transition: { duration: 0.6 }
                }}
                className="relative"
              >
                <Avatar className="w-44 h-44 md:w-52 md:h-52 shadow-2xl ring-2 ring-white/20 ring-offset-4 ring-offset-background/50">
                  <AvatarImage 
                    src={artist.avatar} 
                    alt={artist.name}
                    className="object-cover transition-all duration-500 group-hover:brightness-110"
                  />
                  <AvatarFallback className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                    {artist.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Status Indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute bottom-2 right-2"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(34, 197, 94, 0.7)",
                        "0 0 0 10px rgba(34, 197, 94, 0)",
                        "0 0 0 0 rgba(34, 197, 94, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-5 h-5 bg-green-500 rounded-full border-2 border-white"
                  />
                </motion.div>
              </motion.div>
              
              {/* Floating Elements */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/60 rounded-full"
                    style={{
                      left: `${20 + i * 8}%`,
                      top: `${10 + (i % 3) * 30}%`,
                    }}
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Artist Info */}
            <div className="flex-1 pt-8 md:pt-12 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative overflow-hidden"
              >
                <div className="relative p-10 md:p-12 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/20 shadow-2xl">
                  
                  <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                      <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent leading-none tracking-tight"
                      >
                        {artist.name}
                      </motion.h1>
                      
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: 1 }}
                        className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full shadow-lg"
                      />
                    </div>

                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.1 }}
                      className="text-xl md:text-2xl text-white/90 leading-relaxed font-light max-w-4xl"
                    >
                      {artist.description}
                    </motion.p>

                    {/* Roles */}
                    {artist.roles && artist.roles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.3 }}
                        className="space-y-4"
                      >
                        <h3 className="text-lg font-semibold text-white/80 tracking-wide uppercase">Especialidades</h3>
                        <div className="flex flex-wrap gap-3">
                          {artist.roles.map((role, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1.4 + index * 0.1 }}
                              whileHover={{ scale: 1.05, y: -2 }}
                            >
                              <div className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/30 text-white font-medium text-sm tracking-wide shadow-lg">
                                {role}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { 
                      icon: Heart, 
                      value: totalLikes, 
                      label: "Curtidas", 
                      color: "from-red-500 to-pink-500",
                      bgColor: "from-red-500/10 to-pink-500/10"
                    },
                    { 
                      icon: Music2, 
                      value: artistProjects.length, 
                      label: "Projetos", 
                      color: "from-blue-500 to-cyan-500",
                      bgColor: "from-blue-500/10 to-cyan-500/10"
                    },
                    { 
                      icon: Users, 
                      value: artist.roles?.length || 0, 
                      label: "Funções", 
                      color: "from-green-500 to-emerald-500",
                      bgColor: "from-green-500/10 to-emerald-500/10"
                    }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 1.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="group cursor-pointer"
                    >
                      <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl`}>
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white">
                              {stat.value}
                            </div>
                            <div className="text-sm text-white/70 font-medium tracking-wide">
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.9 }}
                  className="flex flex-wrap gap-4 pt-4"
                >
                  {artist.musicUrl && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handlePlay}
                        size="lg"
                        className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-2xl px-8 py-4 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="relative flex items-center gap-3">
                          {isPlaying ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                          <span>{isPlaying ? "Pausar" : "Reproduzir"}</span>
                        </div>
                      </Button>
                    </motion.div>
                  )}

                  {user && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleLike}
                        disabled={isLiking}
                        variant="outline"
                        size="lg"
                        className={`group relative overflow-hidden rounded-2xl px-8 py-4 font-semibold text-lg border-2 transition-all duration-300 ${
                          liked 
                            ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/50 text-red-400" 
                            : "bg-white/5 border-white/30 text-white hover:bg-white/10"
                        }`}
                      >
                        <div className="relative flex items-center gap-3">
                          <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                          <span>{liked ? "Curtido" : "Curtir"}</span>
                        </div>
                      </Button>
                    </motion.div>
                  )}

                  {isOwner && (
                    <>
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="lg" className="rounded-full px-6">
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
                                  const response = await fetch(`/api/artists/${artist.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    credentials: 'include',
                                    body: JSON.stringify(editFormData),
                                  });
                                  
                                  if (response.ok) {
                                    window.location.reload();
                                  }
                                  setIsEditDialogOpen(false);
                                } catch (error) {
                                  console.error('Error updating profile:', error);
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
                            <Button 
                              className="w-full"
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/tracks', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      ...trackFormData,
                                      artistId: artistId
                                    }),
                                  });
                                  
                                  if (response.ok) {
                                    queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/tracks`] });
                                    setIsTrackDialogOpen(false);
                                  }
                                } catch (error) {
                                  console.error('Error creating track:', error);
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

      {/* Content Sections */}
      <div className="bg-gradient-to-b from-transparent via-background/50 to-background">
        <div className="container mx-auto px-6 lg:px-8 pb-32 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
              
              {/* Tracks Section */}
              {artistTracks.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Headphones className="w-6 h-6" />
                        Produções ({artistTracks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {artistTracks.map((track, index) => (
                          <motion.div
                            key={track.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ 
                              scale: 1.02, 
                              x: 10,
                              transition: { duration: 0.2 }
                            }}
                            className="group relative"
                          >
                            <div className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 border border-white/10 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                              <motion.div 
                                className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                                whileHover={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 0.5 }}
                              >
                                <Music2 className="w-7 h-7 text-white" />
                                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </motion.div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white text-lg mb-1 truncate group-hover:text-purple-200 transition-colors duration-300">
                                  {track.title}
                                </h4>
                                <p className="text-sm text-white/70 mb-2">{track.genre}</p>
                                <div className="flex items-center gap-2 text-xs text-white/50">
                                  <span>3:45</span>
                                  <span>•</span>
                                  <span>MP3</span>
                                </div>
                              </div>
                              
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button 
                                  size="lg" 
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl w-12 h-12 p-0 group-hover:shadow-lg transition-all duration-300"
                                  onClick={() => {
                                    if (track.audioUrl) {
                                      // Create temporary artist object with track audio
                                      const trackArtist = {
                                        ...artist,
                                        musicUrl: track.audioUrl,
                                        name: `${artist.name} - ${track.title}`
                                      };
                                      musicPlayer.playArtist(trackArtist);
                                    }
                                  }}
                                >
                                  <motion.div
                                    animate={{ rotate: musicPlayer.isPlaying && musicPlayer.currentArtist?.musicUrl === track.audioUrl ? 360 : 0 }}
                                    transition={{ duration: 2, repeat: musicPlayer.isPlaying ? Infinity : 0, ease: "linear" }}
                                  >
                                    <Play className="w-5 h-5" />
                                  </motion.div>
                                </Button>
                              </motion.div>
                            </div>
                            
                            {/* Animated Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-pink-600/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}

              {/* Projects Section */}
              {artistProjects.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Music2 className="w-6 h-6" />
                        Projetos ({artistProjects.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {artistProjects.map((project, index) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                              delay: index * 0.15,
                              duration: 0.6,
                              type: "spring",
                              stiffness: 100
                            }}
                            whileHover={{ 
                              scale: 1.05, 
                              y: -8,
                              rotateY: 5,
                              transition: { duration: 0.3 }
                            }}
                            className="group relative overflow-hidden"
                          >
                            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-2xl">
                              {/* Animated Background Elements */}
                              <motion.div 
                                className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-2xl"
                                animate={{ 
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{ 
                                  duration: 4, 
                                  repeat: Infinity,
                                  delay: index * 0.5
                                }}
                              />
                              
                              <div className="relative z-10 space-y-4">
                                <div className="flex items-start justify-between">
                                  <motion.h4 
                                    className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300"
                                    whileHover={{ x: 5 }}
                                  >
                                    {project.name}
                                  </motion.h4>
                                  <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ 
                                      rotate: [0, 10, -10, 0],
                                      scale: 1.1,
                                      transition: { duration: 0.5 }
                                    }}
                                  >
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30 px-3 py-1"
                                    >
                                      {project.status}
                                    </Badge>
                                  </motion.div>
                                </div>
                                
                                <motion.p 
                                  className="text-white/70 text-sm leading-relaxed"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 + index * 0.1 }}
                                >
                                  {project.description}
                                </motion.p>
                                
                                <motion.div 
                                  className="flex items-center gap-2 pt-2"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                  <div className="flex -space-x-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                      <motion.div 
                                        key={i}
                                        className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white/20"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ 
                                          delay: 0.6 + index * 0.1 + i * 0.05,
                                          type: "spring",
                                          stiffness: 200
                                        }}
                                        whileHover={{ scale: 1.2, z: 10 }}
                                      />
                                    ))}
                                  </div>
                                  <motion.span 
                                    className="text-xs text-white/50 ml-2"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    +2 colaboradores
                                  </motion.span>
                                </motion.div>
                              </div>
                              
                              {/* Hover Effect Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-cyan-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-white/70" />
                    <div>
                      <p className="font-medium text-white">Funções</p>
                      <p className="text-sm text-white/70">
                        {artist.roles?.join(', ') || 'Não especificado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-white/70" />
                    <div>
                      <p className="font-medium text-white">Curtidas</p>
                      <p className="text-sm text-white/70">{totalLikes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

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
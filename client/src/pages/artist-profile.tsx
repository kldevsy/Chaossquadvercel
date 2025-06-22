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
    <>
      <div className="min-h-screen bg-background">
        {/* Enhanced Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-80 md:h-96 relative overflow-hidden"
          style={{
            background: artist.banner 
              ? `url(${artist.banner}) center/cover no-repeat` 
              : `linear-gradient(135deg, 
                  hsl(var(--primary)) 0%, 
                  hsl(var(--primary)/0.8) 25%, 
                  hsl(var(--secondary)/0.9) 50%, 
                  hsl(var(--accent)/0.7) 75%, 
                  hsl(var(--primary)/0.6) 100%)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        </motion.div>

        {/* Profile Content */}
        <div className="container mx-auto px-6">
          <div className="relative -mt-32 md:-mt-40">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Artist Avatar */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40 rounded-full blur-xl scale-110 group-hover:scale-125 transition-transform duration-500" />
                
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  <Avatar className="w-40 h-40 md:w-48 md:h-48 border-4 border-white/20 shadow-2xl ring-4 ring-primary/20 ring-offset-4 ring-offset-transparent">
                    <AvatarImage 
                      src={artist.avatar} 
                      alt={artist.name}
                      className="object-cover transition-all duration-300 group-hover:scale-110"
                    />
                    <AvatarFallback className="text-4xl md:text-5xl bg-gradient-to-br from-primary to-accent text-white">
                      {artist.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </motion.div>

              {/* Artist Info */}
              <div className="flex-1 pt-4 md:pt-8 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative p-8 rounded-3xl bg-gradient-to-br from-background/40 to-background/10 backdrop-blur-2xl border border-white/10 shadow-2xl"
                >
                  <div className="relative z-10 space-y-6">
                    <div>
                      <motion.h1 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent leading-tight mb-4"
                      >
                        {artist.name}
                      </motion.h1>
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                        className="text-xl text-white/80 leading-relaxed max-w-3xl"
                      >
                        {artist.description}
                      </motion.p>
                    </div>

                    {/* Roles */}
                    {artist.roles && artist.roles.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {artist.roles.map((role, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <Badge variant="secondary" className="px-4 py-2 rounded-full bg-white/20 text-white border-white/30">
                              {role}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Stats and Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  {/* Stats */}
                  <div className="flex gap-6 text-sm">
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
                  </div>

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
                                    const response = await fetch(`/api/artists/${artist.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      credentials: 'include',
                                      body: JSON.stringify(editFormData),
                                    });
                                    
                                    if (response.ok) {
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

      {/* Content Sections */}
      <div className="container mx-auto px-4 pb-20 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tracks Section */}
            {artistTracks.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Headphones className="w-5 h-5" />
                      Produções ({artistTracks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {artistTracks.map((track) => (
                        <div key={track.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Music2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{track.title}</h4>
                            <p className="text-sm text-muted-foreground">{track.genre}</p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

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
                        <div key={project.id} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                          <h4 className="font-semibold mb-2">{project.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                          <Badge variant="secondary">{project.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Funções</p>
                    <p className="text-sm text-muted-foreground">
                      {artist.roles?.join(', ') || 'Não especificado'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Curtidas</p>
                    <p className="text-sm text-muted-foreground">{totalLikes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
        onPlayPause={musicPlayer.togglePlay}
        onNext={musicPlayer.next}
        onPrevious={musicPlayer.previous}
        onSeek={musicPlayer.seek}
        onVolumeChange={musicPlayer.changeVolume}
        onClose={musicPlayer.closePlayer}
        onToggleMinimize={musicPlayer.toggleMinimize}
      />
    </>
  );
}
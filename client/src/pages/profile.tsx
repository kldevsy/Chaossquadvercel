import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  User, 
  Mail, 
  Calendar,
  Crown,
  Heart,
  Music2,
  Users,
  Star,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Artist, Project, Like } from "@shared/schema";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Get user's artist profile if they have one
  const { data: userArtist } = useQuery<Artist>({
    queryKey: ["/api/user/artist-profile"],
    enabled: !!user?.id,
  });

  // Get user's likes
  const { data: userLikes = [] } = useQuery<Like[]>({
    queryKey: ["/api/user/likes"],
    enabled: !!user?.id,
  });

  // Get all artists to show liked ones
  const { data: allArtists = [] } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  // Get all projects to show user's projects if they're an artist
  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Filter liked artists
  const likedArtists = allArtists.filter(artist => 
    userLikes.some(like => like.artistId === artist.id)
  );

  // Filter user's projects if they're an artist
  const userProjects = userArtist ? allProjects.filter(project => 
    project.collaborators?.includes(userArtist.name) || 
    project.collaborators?.includes(userArtist.id.toString())
  ) : [];

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
    },
  });

  const handleEditProfile = () => {
    setProfileForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acesso negado</h2>
          <p className="text-muted-foreground mb-6">Você precisa estar logado para ver seu perfil</p>
          <Button onClick={() => window.location.href = "/api/login"}>
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with back button */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="hover:bg-accent rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Profile Banner */}
      <div className="relative pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="h-48 md:h-64 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, 
              hsl(var(--primary)) 0%, 
              hsl(var(--primary)) 25%, 
              hsl(var(--secondary)) 50%, 
              hsl(var(--accent)) 75%, 
              hsl(var(--primary)) 100%)`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
        </motion.div>

        {/* Profile Content */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 md:-mt-24">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* User Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl">
                  <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || user.username} />
                  <AvatarFallback className="text-3xl md:text-4xl">
                    {(user.firstName || user.username || 'U').slice(0, 2).toUpperCase()}
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

              {/* User Info */}
              <div className="flex-1 pt-4 md:pt-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h1 className="text-3xl md:text-5xl font-bold gradient-text mb-2">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username}
                      </h1>
                      {user.email && (
                        <p className="text-lg text-muted-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </p>
                      )}
                    </div>
                    {user.isAdmin && (
                      <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-blue-500">
                        <Crown className="w-4 h-4 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>

                  {/* User Stats */}
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
                      <span className="font-semibold">{likedArtists.length}</span>
                      <span>curtidas</span>
                    </motion.div>
                    
                    {userArtist && (
                      <motion.div 
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Music2 className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{userProjects.length}</span>
                        <span>projetos</span>
                      </motion.div>
                    )}

                    <motion.div 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-xs">
                        Membro desde {new Date(user.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-wrap gap-3 pt-2"
                  >
                    <Button
                      onClick={handleEditProfile}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 rounded-full px-8"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Editar Perfil
                    </Button>

                    {user.isAdmin && (
                      <Button
                        onClick={() => window.location.href = "/admin"}
                        variant="outline"
                        size="lg"
                        className="rounded-full px-6 border-purple-500/20 text-purple-500 hover:bg-purple-500/20"
                      >
                        <Shield className="w-5 h-5 mr-2" />
                        Painel Admin
                      </Button>
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
            
            {/* Artist Profile Section */}
            {userArtist && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music2 className="w-5 h-5" />
                      Perfil de Artista
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={userArtist.avatar} />
                        <AvatarFallback>{userArtist.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{userArtist.name}</h3>
                        <p className="text-muted-foreground mb-3">{userArtist.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {userArtist.roles.map((role, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* User Projects */}
            {userProjects.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music2 className="w-5 h-5" />
                      Meus Projetos ({userProjects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userProjects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <img
                            src={project.cover}
                            alt={project.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h4 className="font-semibold">{project.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {project.genres.slice(0, 2).map((genre) => (
                              <Badge key={genre} variant="outline" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.section>
            )}

            {/* Liked Artists */}
            {likedArtists.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Artistas Curtidos ({likedArtists.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {likedArtists.map((artist) => (
                        <div 
                          key={artist.id} 
                          className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.location.href = `/artist/${artist.id}`}
                        >
                          <Avatar className="w-16 h-16 mb-2">
                            <AvatarImage src={artist.avatar} />
                            <AvatarFallback>{artist.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <h4 className="font-medium text-center text-sm">{artist.name}</h4>
                          <p className="text-xs text-muted-foreground text-center line-clamp-2">
                            {artist.roles.join(", ")}
                          </p>
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
            {/* Profile Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Curtidas */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-3 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer group"
                  >
                    <motion.div
                      className="p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Heart className="w-5 h-5 text-red-500" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Curtidas</p>
                      <p className="text-2xl font-bold text-red-500">{likedArtists.length}</p>
                    </div>
                  </motion.div>

                  {/* Projetos (se for artista) */}
                  {userArtist && (
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
                        <p className="text-2xl font-bold text-blue-500">{userProjects.length}</p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Nome de usuário</Label>
                    <p className="text-muted-foreground">{user.username}</p>
                  </div>
                  
                  {user.email && (
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-medium">Tipo de conta</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground">
                        {user.isAdmin ? "Administrador" : "Usuário"}
                      </p>
                      {user.isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Membro desde</Label>
                    <p className="text-muted-foreground">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitProfile} className="space-y-4">
            <div>
              <Label htmlFor="firstName">Nome</Label>
              <Input
                id="firstName"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                placeholder="Seu nome"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                placeholder="Seu sobrenome"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
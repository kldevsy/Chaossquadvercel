import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, Music, Users, Settings, Save, X, Bell, Send, UserCheck, Crown, Shield } from "lucide-react";
import type { Artist, Project, User, Notification } from "@shared/schema";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Redirecionando para login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }

    if (user && !user.isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return;
    }
  }, [isAuthenticated, user, toast]);

  const { data: artists = [], isLoading: loadingArtists } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.isAdmin,
  });

  const { data: notifications = [], isLoading: loadingNotifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  // Artist form state
  const [isArtistDialogOpen, setIsArtistDialogOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [artistForm, setArtistForm] = useState({
    name: "",
    avatar: "",
    description: "",
    roles: "",
    socialLinks: JSON.stringify({
      spotify: "",
      soundcloud: "",
      instagram: "",
      youtube: ""
    }),
    musicUrl: "",
    musicalStyles: "",
    artistTypes: ""
  });

  // Project form state
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: "",
    cover: "",
    description: "",
    genres: "",
    collaborators: "",
    previewUrl: "",
    previewVideoUrl: "",
    status: "em_desenvolvimento",
    releaseDate: "",
    createdAt: new Date().toISOString()
  });

  // Notification form state
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "info"
  });

  // User management state
  const [userFilter, setUserFilter] = useState("");

  // Artist mutations
  const createArtistMutation = useMutation({
    mutationFn: async (data: any) => {
      const formattedData = {
        ...data,
        roles: data.roles.split(",").map((r: string) => r.trim()),
        musicalStyles: data.musicalStyles.split(",").map((s: string) => s.trim()),
        artistTypes: data.artistTypes.split(",").map((t: string) => t.trim()),
        isActive: true
      };
      return await apiRequest("POST", "/api/admin/artists", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      setIsArtistDialogOpen(false);
      resetArtistForm();
      toast({
        title: "Sucesso!",
        description: "Artista criado com sucesso",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para esta ação",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível criar o artista",
        variant: "destructive",
      });
    },
  });

  const updateArtistMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const formattedData = {
        ...data,
        roles: data.roles.split(",").map((r: string) => r.trim()),
        musicalStyles: data.musicalStyles.split(",").map((s: string) => s.trim()),
        artistTypes: data.artistTypes.split(",").map((t: string) => t.trim()),
      };
      return await apiRequest("PUT", `/api/admin/artists/${id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      setIsArtistDialogOpen(false);
      setEditingArtist(null);
      resetArtistForm();
      toast({
        title: "Sucesso!",
        description: "Artista atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o artista",
        variant: "destructive",
      });
    },
  });

  const deleteArtistMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/artists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      toast({
        title: "Sucesso!",
        description: "Artista removido com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o artista",
        variant: "destructive",
      });
    },
  });

  // Project mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const formattedData = {
        ...data,
        genres: data.genres.split(",").map((g: string) => g.trim()),
        collaborators: data.collaborators.split(",").map((c: string) => c.trim()),
        isActive: true
      };
      return await apiRequest("POST", "/api/admin/projects", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      resetProjectForm();
      toast({
        title: "Sucesso!",
        description: "Projeto criado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o projeto",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const formattedData = {
        ...data,
        genres: data.genres.split(",").map((g: string) => g.trim()),
        collaborators: data.collaborators.split(",").map((c: string) => c.trim()),
      };
      return await apiRequest("PUT", `/api/admin/projects/${id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      setEditingProject(null);
      resetProjectForm();
      toast({
        title: "Sucesso!",
        description: "Projeto atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Sucesso!",
        description: "Projeto removido com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o projeto",
        variant: "destructive",
      });
    },
  });

  // Notification mutations
  const createNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/notifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setIsNotificationDialogOpen(false);
      resetNotificationForm();
      toast({
        title: "Sucesso!",
        description: "Notificação criada com sucesso",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para esta ação",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível criar a notificação",
        variant: "destructive",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Sucesso!",
        description: "Notificação removida com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a notificação",
        variant: "destructive",
      });
    },
  });

  // User admin mutation
  const updateUserAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      return await apiRequest("PUT", `/api/admin/users/${userId}/admin`, { isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Sucesso!",
        description: "Permissões do usuário atualizadas",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as permissões",
        variant: "destructive",
      });
    },
  });

  const resetArtistForm = () => {
    setArtistForm({
      name: "",
      avatar: "",
      description: "",
      roles: "",
      socialLinks: JSON.stringify({
        spotify: "",
        soundcloud: "",
        instagram: "",
        youtube: ""
      }),
      musicUrl: "",
      musicalStyles: "",
      artistTypes: ""
    });
  };

  const resetProjectForm = () => {
    setProjectForm({
      name: "",
      cover: "",
      description: "",
      genres: "",
      collaborators: "",
      previewUrl: "",
      previewVideoUrl: "",
      status: "em_desenvolvimento",
      releaseDate: "",
      createdAt: new Date().toISOString()
    });
  };

  const resetNotificationForm = () => {
    setNotificationForm({
      title: "",
      message: "",
      type: "info"
    });
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setArtistForm({
      name: artist.name,
      avatar: artist.avatar,
      description: artist.description,
      roles: artist.roles.join(", "),
      socialLinks: artist.socialLinks,
      musicUrl: artist.musicUrl || "",
      musicalStyles: artist.musicalStyles.join(", "),
      artistTypes: artist.artistTypes.join(", ")
    });
    setIsArtistDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      cover: project.cover,
      description: project.description,
      genres: project.genres.join(", "),
      collaborators: project.collaborators.join(", "),
      previewUrl: project.previewUrl || "",
      previewVideoUrl: project.previewVideoUrl || "",
      status: project.status,
      releaseDate: project.releaseDate || "",
      createdAt: project.createdAt
    });
    setIsProjectDialogOpen(true);
  };

  const handleSubmitArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArtist) {
      updateArtistMutation.mutate({ id: editingArtist.id, data: artistForm });
    } else {
      createArtistMutation.mutate(artistForm);
    }
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: projectForm });
    } else {
      createProjectMutation.mutate(projectForm);
    }
  };

  const handleSubmitNotification = (e: React.FormEvent) => {
    e.preventDefault();
    createNotificationMutation.mutate(notificationForm);
  };

  const handleToggleUserAdmin = (userId: string, currentStatus: boolean) => {
    updateUserAdminMutation.mutate({ userId, isAdmin: !currentStatus });
  };

  const filteredUsers = users.filter(u =>
    u.firstName?.toLowerCase().includes(userFilter.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(userFilter.toLowerCase()) ||
    u.email?.toLowerCase().includes(userFilter.toLowerCase()) ||
    u.username?.toLowerCase().includes(userFilter.toLowerCase())
  );

  if (!isAuthenticated || (user && !user.isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Verificando permissões...</h2>
          <p className="text-muted-foreground">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-xl shadow-lg"
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-6"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <Settings className="text-white text-2xl" />
                </motion.div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent"
                >
                  Painel Administrativo
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-lg"
                >
                  Central de controle da plataforma GeeKTunes
                </motion.p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/"}
                className="hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                Voltar ao Site
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Tabs defaultValue="artists" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 h-16 p-1 bg-card/50 backdrop-blur-sm rounded-xl">
              <TabsTrigger 
                value="artists" 
                className="flex flex-col items-center justify-center gap-1 h-full px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300 rounded-lg"
              >
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="font-medium text-sm">Artistas</span>
                </div>
                <span className="text-xs opacity-75">({artists.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="flex flex-col items-center justify-center gap-1 h-full px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white transition-all duration-300 rounded-lg"
              >
                <div className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  <span className="font-medium text-sm">Projetos</span>
                </div>
                <span className="text-xs opacity-75">({projects.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex flex-col items-center justify-center gap-1 h-full px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300 rounded-lg"
              >
                <div className="flex items-center gap-1">
                  <Bell className="w-4 h-4" />
                  <span className="font-medium text-sm">Notificações</span>
                </div>
                <span className="text-xs opacity-75">({notifications.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex flex-col items-center justify-center gap-1 h-full px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all duration-300 rounded-lg"
              >
                <div className="flex items-center gap-1">
                  <UserCheck className="w-4 h-4" />
                  <span className="font-medium text-sm">Usuários</span>
                </div>
                <span className="text-xs opacity-75">({users.length})</span>
              </TabsTrigger>
            </TabsList>

          {/* Artists Tab */}
          <TabsContent value="artists" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Artistas</h2>
              <Dialog open={isArtistDialogOpen} onOpenChange={setIsArtistDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingArtist(null);
                    resetArtistForm();
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Artista
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingArtist ? "Editar Artista" : "Criar Novo Artista"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitArtist} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={artistForm.name}
                          onChange={(e) => setArtistForm({ ...artistForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="avatar">Avatar URL</Label>
                        <Input
                          id="avatar"
                          value={artistForm.avatar}
                          onChange={(e) => setArtistForm({ ...artistForm, avatar: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={artistForm.description}
                        onChange={(e) => setArtistForm({ ...artistForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="roles">Funções (separadas por vírgula)</Label>
                        <Input
                          id="roles"
                          value={artistForm.roles}
                          onChange={(e) => setArtistForm({ ...artistForm, roles: e.target.value })}
                          placeholder="cantor, produtor, editor"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="musicUrl">URL da Música</Label>
                        <Input
                          id="musicUrl"
                          value={artistForm.musicUrl}
                          onChange={(e) => setArtistForm({ ...artistForm, musicUrl: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="musicalStyles">Estilos Musicais (separados por vírgula)</Label>
                        <Input
                          id="musicalStyles"
                          value={artistForm.musicalStyles}
                          onChange={(e) => setArtistForm({ ...artistForm, musicalStyles: e.target.value })}
                          placeholder="Trap, Hip-Hop, Phonk"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="artistTypes">Tipos de Artista (separados por vírgula)</Label>
                        <Input
                          id="artistTypes"
                          value={artistForm.artistTypes}
                          onChange={(e) => setArtistForm({ ...artistForm, artistTypes: e.target.value })}
                          placeholder="Geek, Autoral"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsArtistDialogOpen(false);
                          setEditingArtist(null);
                          resetArtistForm();
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createArtistMutation.isPending || updateArtistMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {editingArtist ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loadingArtists ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={artist.avatar}
                            alt={artist.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{artist.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {artist.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-4">
                              {artist.roles.slice(0, 2).map((role) => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                              {artist.roles.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{artist.roles.length - 2}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditArtist(artist)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteArtistMutation.mutate(artist.id)}
                                disabled={deleteArtistMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Projetos</h2>
              <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingProject(null);
                    resetProjectForm();
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Projeto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProject ? "Editar Projeto" : "Criar Novo Projeto"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitProject} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="projectName">Nome</Label>
                        <Input
                          id="projectName"
                          value={projectForm.name}
                          onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cover">Cover URL</Label>
                        <Input
                          id="cover"
                          value={projectForm.cover}
                          onChange={(e) => setProjectForm({ ...projectForm, cover: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="projectDescription">Descrição</Label>
                      <Textarea
                        id="projectDescription"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="genres">Gêneros (separados por vírgula)</Label>
                        <Input
                          id="genres"
                          value={projectForm.genres}
                          onChange={(e) => setProjectForm({ ...projectForm, genres: e.target.value })}
                          placeholder="Hip-Hop, Trap, Geek Rap"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="collaborators">Colaboradores (IDs separados por vírgula)</Label>
                        <Input
                          id="collaborators"
                          value={projectForm.collaborators}
                          onChange={(e) => setProjectForm({ ...projectForm, collaborators: e.target.value })}
                          placeholder="1, 2"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="previewUrl">URL de Preview</Label>
                        <Input
                          id="previewUrl"
                          value={projectForm.previewUrl}
                          onChange={(e) => setProjectForm({ ...projectForm, previewUrl: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="previewVideoUrl">URL de Vídeo Preview</Label>
                        <Input
                          id="previewVideoUrl"
                          value={projectForm.previewVideoUrl}
                          onChange={(e) => setProjectForm({ ...projectForm, previewVideoUrl: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={projectForm.status}
                          onValueChange={(value) => setProjectForm({ ...projectForm, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                            <SelectItem value="finalizado">Finalizado</SelectItem>
                            <SelectItem value="lancado">Lançado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="releaseDate">Data de Lançamento</Label>
                        <Input
                          id="releaseDate"
                          type="date"
                          value={projectForm.releaseDate}
                          onChange={(e) => setProjectForm({ ...projectForm, releaseDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsProjectDialogOpen(false);
                          setEditingProject(null);
                          resetProjectForm();
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {editingProject ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="w-full h-32 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <img
                            src={project.cover}
                            alt={project.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold text-lg truncate">{project.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-4">
                              <Badge
                                variant={
                                  project.status === "lancado" ? "default" :
                                  project.status === "finalizado" ? "secondary" : "outline"
                                }
                                className="text-xs"
                              >
                                {project.status === "em_desenvolvimento" ? "Em Desenvolvimento" :
                                 project.status === "finalizado" ? "Finalizado" : "Lançado"}
                              </Badge>
                              {project.genres.slice(0, 2).map((genre) => (
                                <Badge key={genre} variant="secondary" className="text-xs">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProject(project)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteProjectMutation.mutate(project.id)}
                                disabled={deleteProjectMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center"
            >
              <div>
                <h2 className="text-2xl font-bold">Gerenciar Notificações</h2>
                <p className="text-muted-foreground">Envie notificações para todos os usuários da plataforma</p>
              </div>
              <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => resetNotificationForm()}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Nova Notificação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Criar Nova Notificação
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitNotification} className="space-y-4">
                    <div>
                      <Label htmlFor="notificationTitle">Título</Label>
                      <Input
                        id="notificationTitle"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                        placeholder="Título da notificação"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notificationMessage">Mensagem</Label>
                      <Textarea
                        id="notificationMessage"
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                        placeholder="Conteúdo da notificação"
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notificationType">Tipo</Label>
                      <Select
                        value={notificationForm.type}
                        onValueChange={(value) => setNotificationForm({ ...notificationForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Informação</SelectItem>
                          <SelectItem value="success">Sucesso</SelectItem>
                          <SelectItem value="warning">Aviso</SelectItem>
                          <SelectItem value="error">Erro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-4 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsNotificationDialogOpen(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={createNotificationMutation.isPending}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Notificação
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>

            {loadingNotifications ? (
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge 
                                  variant={
                                    notification.type === "success" ? "default" :
                                    notification.type === "warning" ? "secondary" :
                                    notification.type === "error" ? "destructive" : "outline"
                                  }
                                >
                                  {notification.type === "info" ? "Informação" :
                                   notification.type === "success" ? "Sucesso" :
                                   notification.type === "warning" ? "Aviso" : "Erro"}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(notification.createdAt).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <h3 className="font-semibold text-lg mb-2">{notification.title}</h3>
                              <p className="text-muted-foreground">{notification.message}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteNotificationMutation.mutate(notification.id)}
                              disabled={deleteNotificationMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {notifications.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="text-center py-16 bg-gradient-to-br from-background via-background to-secondary/10 border-dashed border-2">
                      <CardContent className="space-y-6">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="relative mx-auto w-24 h-24"
                        >
                          <Bell className="w-24 h-24 text-muted-foreground/30" />
                          <Sparkles className="w-8 h-8 text-orange-500 absolute -top-2 -right-2 animate-bounce" />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="space-y-3"
                        >
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            Painel de Notificações
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                            Aqui você pode enviar mensagens importantes para todos os usuários da plataforma. 
                            Mantenha sua comunidade sempre informada! 🚀
                          </p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="pt-4"
                        >
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Sistema pronto para envio</span>
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
                  <p className="text-muted-foreground">Controle as permissões de administrador dos usuários</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-center">
                <Input
                  placeholder="Buscar usuários..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="max-w-sm"
                />
                <Badge variant="outline" className="px-3 py-1">
                  {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </motion.div>

            {loadingUsers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredUsers.map((userData, index) => (
                    <motion.div
                      key={userData.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={userData.profileImageUrl || undefined} />
                              <AvatarFallback>
                                <Users className="w-6 h-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold truncate">
                                  {userData.firstName || userData.username || 'Usuário'}
                                  {userData.lastName && ` ${userData.lastName}`}
                                </h3>
                                {userData.isAdmin && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              {userData.email && (
                                <p className="text-sm text-muted-foreground truncate mb-3">
                                  {userData.email}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={userData.isAdmin || false}
                                    onCheckedChange={() => handleToggleUserAdmin(userData.id, userData.isAdmin || false)}
                                    disabled={updateUserAdminMutation.isPending}
                                  />
                                  <Label className="text-sm">
                                    Administrador
                                  </Label>
                                </div>
                                {userData.isAdmin && (
                                  <Badge variant="default" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            
            {filteredUsers.length === 0 && !loadingUsers && (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                  <p className="text-muted-foreground">Tente ajustar os filtros de busca</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Edit, Trash2, Music, Users, Settings, Save, X } from "lucide-react";
import type { Artist, Project } from "@shared/schema";

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
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <Settings className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Painel Administrativo</h1>
                <p className="text-muted-foreground">Gerencie artistas e projetos da plataforma</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              Voltar ao Site
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="artists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="artists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Artistas ({artists.length})
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Projetos ({projects.length})
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
        </Tabs>
      </div>
    </div>
  );
}
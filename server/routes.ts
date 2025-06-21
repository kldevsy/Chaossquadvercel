import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertArtistSchema, insertProjectSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Notifications routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getActiveNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Get all artists
  app.get("/api/artists", async (req, res) => {
    try {
      const artists = await storage.getAllArtists();
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar artistas" });
    }
  });

  // Get artist by ID
  app.get("/api/artists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const artist = await storage.getArtist(id);
      if (!artist) {
        return res.status(404).json({ message: "Artista não encontrado" });
      }

      res.json(artist);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar artista" });
    }
  });

  // Get artists by role
  app.get("/api/artists/role/:role", async (req, res) => {
    try {
      const role = req.params.role;
      const artists = await storage.getArtistsByRole(role);
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar artistas por função" });
    }
  });

  // Search artists
  app.get("/api/artists/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ message: "Query de busca necessária" });
      }

      const artists = await storage.searchArtists(query);
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar artistas" });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projetos" });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projeto" });
    }
  });

  // Search projects
  app.get("/api/projects/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      const projects = await storage.searchProjects(query);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar projetos" });
    }
  });

  // Like/Unlike artist routes
  app.post("/api/artists/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (isNaN(artistId)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Check if already liked
      const isLiked = await storage.isArtistLiked(userId, artistId);
      if (isLiked) {
        return res.status(400).json({ message: "Artista já curtido" });
      }

      const like = await storage.likeArtist(userId, artistId);
      res.status(201).json(like);
    } catch (error) {
      console.error("Error liking artist:", error);
      res.status(500).json({ message: "Erro ao curtir artista" });
    }
  });

  app.delete("/api/artists/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (isNaN(artistId)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      await storage.unlikeArtist(userId, artistId);
      res.status(204).send();
    } catch (error) {
      console.error("Error unliking artist:", error);
      res.status(500).json({ message: "Erro ao descurtir artista" });
    }
  });

  // Get user's liked artists
  app.get("/api/user/likes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const likes = await storage.getUserLikes(userId);
      res.json(likes);
    } catch (error) {
      console.error("Error fetching user likes:", error);
      res.status(500).json({ message: "Erro ao buscar curtidas" });
    }
  });

  // Admin middleware
  const isAdmin: any = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Acesso negado - Apenas administradores" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  };

  // Admin routes
  // Create new artist (Admin only)
  app.post("/api/admin/artists", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(validatedData);
      res.status(201).json(artist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Error creating artist:", error);
      res.status(500).json({ message: "Erro ao criar artista" });
    }
  });

  // Update artist (Admin only)
  app.put("/api/admin/artists/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const validatedData = insertArtistSchema.parse(req.body);
      const artist = await storage.updateArtist(id, validatedData);
      if (!artist) {
        return res.status(404).json({ message: "Artista não encontrado" });
      }
      res.json(artist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Error updating artist:", error);
      res.status(500).json({ message: "Erro ao atualizar artista" });
    }
  });

  // Delete artist (Admin only)
  app.delete("/api/admin/artists/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      await storage.deleteArtist(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting artist:", error);
      res.status(500).json({ message: "Erro ao deletar artista" });
    }
  });

  // Create new project (Admin only)
  app.post("/api/admin/projects", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Erro ao criar projeto" });
    }
  });

  // Update project (Admin only)
  app.put("/api/admin/projects/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Erro ao atualizar projeto" });
    }
  });

  // Delete project (Admin only)
  app.delete("/api/admin/projects/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Erro ao deletar projeto" });
    }
  });

  // Check if artist is liked
  app.get("/api/artists/:id/liked", isAuthenticated, async (req: any, res) => {
    try {
      const artistId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      if (isNaN(artistId)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const isLiked = await storage.isArtistLiked(userId, artistId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking if artist is liked:", error);
      res.status(500).json({ message: "Erro ao verificar curtida" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

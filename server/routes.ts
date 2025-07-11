import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertArtistSchema, insertProjectSchema, insertNotificationSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const typingUsers = new Map<string, { username: string, timeout: NodeJS.Timeout }>();
  
  const broadcastTypingUsers = () => {
    const users = Array.from(typingUsers.values()).map(u => u.username);
    wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'typing',
          users
        }));
      }
    });
  };
  
  wss.on('connection', (ws) => {
    console.log('Nova conexão WebSocket estabelecida');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('WebSocket message received:', message);
        
        if (message.type === 'typing') {
          const { userId, username } = message;
          
          // Clear existing timeout for this user
          if (typingUsers.has(userId)) {
            clearTimeout(typingUsers.get(userId)!.timeout);
          }
          
          // Set new timeout to remove user from typing list
          const timeout = setTimeout(() => {
            typingUsers.delete(userId);
            broadcastTypingUsers();
          }, 2000);
          
          typingUsers.set(userId, { username, timeout });
          broadcastTypingUsers();
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Conexão WebSocket fechada');
    });
    
    ws.on('error', (error) => {
      console.error('Erro WebSocket:', error);
    });
  });

  // Auth middleware
  await setupAuth(app);

  // Notifications routes - public access
  app.get("/api/notifications", async (req: any, res) => {
    try {
      const notifications = await storage.getActiveNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Auth routes - now handled by auth.ts
  // app.get('/api/auth/user') is now app.get('/api/user') in auth.ts

  // User profile routes
  app.get('/api/user/artist-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const artistProfile = await storage.getUserArtistProfile(userId);
      res.json(artistProfile);
    } catch (error) {
      console.error("Error fetching user artist profile:", error);
      res.status(500).json({ message: "Failed to fetch artist profile" });
    }
  });

  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;
      
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...existingUser,
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        email: email || existingUser.email,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
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

  // Update artist
  app.put("/api/artists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verificação direta de autenticação
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const user = (req as any).user;
      const userId = user?.claims?.sub || user?.id;
      
      console.log("PUT Artist - Auth check:", {
        isAuthenticated: req.isAuthenticated(),
        user: user,
        userId: userId
      });
      
      if (!user || !userId) {
        return res.status(401).json({ message: "Usuário não encontrado na sessão" });
      }
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Verificar se o usuário é o dono do perfil
      const existingArtist = await storage.getArtist(id);
      console.log("Ownership check:", { 
        existingArtist: existingArtist?.userId, 
        user: userId, 
        match: existingArtist?.userId === userId 
      });
      
      if (!existingArtist || existingArtist.userId !== userId) {
        return res.status(403).json({ message: "Não autorizado para editar este perfil" });
      }

      console.log("Updating artist with data:", req.body);
      const artist = await storage.updateArtist(id, req.body);
      if (!artist) {
        return res.status(404).json({ message: "Artista não encontrado" });
      }

      console.log("Artist updated successfully:", artist);
      res.json(artist);
    } catch (error) {
      console.error("Error updating artist:", error);
      res.status(500).json({ message: "Erro ao atualizar artista" });
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      
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

  // Admin notification routes
  // Create new notification (Admin only)
  app.post("/api/admin/notifications", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Erro ao criar notificação" });
    }
  });

  // Delete notification (Admin only)
  app.delete("/api/admin/notifications/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      await storage.deleteNotification(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Erro ao deletar notificação" });
    }
  });

  // Get all users (Admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  // Get all users (for mentions) - limited info
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Return only essential info for mentions
      const publicUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        isAdmin: user.isAdmin
      }));
      res.json(publicUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erro ao buscar usuários" });
    }
  });

  // Update user admin status (Admin only)
  app.put("/api/admin/users/:id/admin", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { isAdmin: newAdminStatus } = req.body;
      
      if (typeof newAdminStatus !== 'boolean') {
        return res.status(400).json({ message: "Status de admin deve ser boolean" });
      }

      const user = await storage.updateUserAdminStatus(userId, newAdminStatus);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({ message: "Erro ao atualizar status de admin" });
    }
  });

  // Track routes
  app.get("/api/tracks", async (req, res) => {
    try {
      const tracks = await storage.getAllTracks();
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar tracks" });
    }
  });

  app.get("/api/tracks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const track = await storage.getTrack(id);
      if (!track) {
        return res.status(404).json({ message: "Track não encontrada" });
      }

      res.json(track);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar track" });
    }
  });

  app.get("/api/artists/:id/tracks", async (req, res) => {
    try {
      const artistId = parseInt(req.params.id);
      if (isNaN(artistId)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const tracks = await storage.getArtistTracks(artistId);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar tracks do artista" });
    }
  });

  app.post("/api/tracks", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user.claims.sub;
      
      // Verificar se o usuário tem um perfil de artista
      const artistProfile = await storage.getUserArtistProfile(userId);
      
      if (!artistProfile) {
        return res.status(403).json({ message: "Apenas artistas podem criar tracks" });
      }

      const trackData = {
        ...req.body,
        artistId: artistProfile.id
      };

      const track = await storage.createTrack(trackData);
      res.status(201).json(track);
    } catch (error) {
      console.error("Error creating track:", error);
      res.status(500).json({ message: "Erro ao criar track" });
    }
  });

  app.put("/api/tracks/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const trackId = parseInt(req.params.id);
      
      if (isNaN(trackId)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const track = await storage.getTrack(trackId);
      if (!track) {
        return res.status(404).json({ message: "Track não encontrada" });
      }

      // Verificar se o usuário é o dono da track
      const artistProfile = await storage.getUserArtistProfile(user.id);
      if (!artistProfile || track.artistId !== artistProfile.id) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      const updatedTrack = await storage.updateTrack(trackId, req.body);
      res.json(updatedTrack);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar track" });
    }
  });

  app.delete("/api/tracks/:id", isAuthenticated, async (req, res) => {
    try {
      const user = (req as any).user;
      const trackId = parseInt(req.params.id);
      
      if (isNaN(trackId)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      const track = await storage.getTrack(trackId);
      if (!track) {
        return res.status(404).json({ message: "Track não encontrada" });
      }

      // Verificar se o usuário é o dono da track
      const artistProfile = await storage.getUserArtistProfile(user.id);
      if (!artistProfile || track.artistId !== artistProfile.id) {
        return res.status(403).json({ message: "Não autorizado" });
      }

      await storage.deleteTrack(trackId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar track" });
    }
  });

  // Chat routes
  app.get("/api/chat/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getAllChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  app.post("/api/chat/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { message } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ message: "Mensagem é obrigatória" });
      }

      if (message.length > 500) {
        return res.status(400).json({ message: "Mensagem muito longa (máximo 500 caracteres)" });
      }

      const newMessage = await storage.createChatMessage({
        userId,
        message: message.trim(),
      });

      // Detect mentions in the message and create notifications
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;
      
      while ((match = mentionRegex.exec(message)) !== null) {
        const mentionedUsername = match[1];
        mentions.push(mentionedUsername);
      }

      // Process mentions and create notifications
      if (mentions.length > 0) {
        const allUsers = await storage.getAllUsers();
        const senderUser = await storage.getUser(userId);
        
        for (const mentionedUsername of mentions) {
          // Find user by username or by artist name
          const mentionedUser = allUsers.find(u => u.username === mentionedUsername);
          const mentionedArtist = await storage.getAllArtists().then(artists => 
            artists.find(a => a.name === mentionedUsername && a.userId)
          );
          
          let targetUserId = null;
          if (mentionedUser) {
            targetUserId = mentionedUser.id;
          } else if (mentionedArtist) {
            targetUserId = mentionedArtist.userId;
          }

          // Only create notification if user exists and it's not self-mention
          if (targetUserId && targetUserId !== userId) {
            await storage.createNotification({
              title: "Você foi mencionado no chat",
              message: `${senderUser?.username || 'Alguém'} mencionou você: "${message.length > 50 ? message.substring(0, 50) + '...' : message}"`,
              type: "mention",
              userId: targetUserId,
              targetType: "specific_user",
              relatedMessageId: newMessage.id,
            });
          }
        }
      }

      // Broadcast to all WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify({
            type: 'new_message',
            message: newMessage
          }));
        }
      });

      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Erro ao enviar mensagem" });
    }
  });

  return httpServer;
}

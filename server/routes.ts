import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}

import { users, artists, projects, likes, type User, type UpsertUser, type InsertUser, type Artist, type InsertArtist, type Project, type InsertProject, type Like, type InsertLike } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Artist operations
  getAllArtists(): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistsByRole(role: string): Promise<Artist[]>;
  searchArtists(query: string): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByStatus(status: string): Promise<Project[]>;
  searchProjects(query: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  
  // Like operations
  likeArtist(userId: string, artistId: number): Promise<Like>;
  unlikeArtist(userId: string, artistId: number): Promise<void>;
  getUserLikes(userId: string): Promise<Like[]>;
  isArtistLiked(userId: string, artistId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userId = Date.now().toString();
    const userData = {
      id: userId,
      ...insertUser,
      email: null,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
    };
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Artist operations
  async getAllArtists(): Promise<Artist[]> {
    return await db.select().from(artists).where(eq(artists.isActive, true));
  }

  async getArtist(id: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist || undefined;
  }

  async getArtistsByRole(role: string): Promise<Artist[]> {
    const allArtists = await this.getAllArtists();
    return allArtists.filter(artist => artist.roles.includes(role));
  }

  async searchArtists(query: string): Promise<Artist[]> {
    const allArtists = await this.getAllArtists();
    const lowercaseQuery = query.toLowerCase();
    return allArtists.filter(artist =>
      artist.name.toLowerCase().includes(lowercaseQuery) ||
      artist.description.toLowerCase().includes(lowercaseQuery) ||
      artist.roles.some(role => role.toLowerCase().includes(lowercaseQuery))
    );
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const [artist] = await db.insert(artists).values(insertArtist).returning();
    return artist;
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.isActive, true));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByStatus(status: string): Promise<Project[]> {
    return await db.select().from(projects).where(and(
      eq(projects.status, status),
      eq(projects.isActive, true)
    ));
  }

  async searchProjects(query: string): Promise<Project[]> {
    const allProjects = await this.getAllProjects();
    const lowercaseQuery = query.toLowerCase();
    return allProjects.filter(project =>
      project.name.toLowerCase().includes(lowercaseQuery) ||
      project.description.toLowerCase().includes(lowercaseQuery) ||
      project.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery))
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  // Like operations
  async likeArtist(userId: string, artistId: number): Promise<Like> {
    const [like] = await db.insert(likes).values({
      userId,
      artistId,
    }).returning();
    return like;
  }

  async unlikeArtist(userId: string, artistId: number): Promise<void> {
    await db.delete(likes).where(and(
      eq(likes.userId, userId),
      eq(likes.artistId, artistId)
    ));
  }

  async getUserLikes(userId: string): Promise<Like[]> {
    return await db.select().from(likes).where(eq(likes.userId, userId));
  }

  async isArtistLiked(userId: string, artistId: number): Promise<boolean> {
    const [like] = await db.select().from(likes).where(and(
      eq(likes.userId, userId),
      eq(likes.artistId, artistId)
    )).limit(1);
    return !!like;
  }
}

// Keep MemStorage for fallback/development
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private artists: Map<number, Artist>;
  private projects: Map<number, Project>;
  private likes: Map<string, Like>;
  private currentArtistId: number;
  private currentProjectId: number;
  private currentLikeId: number;

  constructor() {
    this.users = new Map();
    this.artists = new Map();
    this.projects = new Map();
    this.likes = new Map();
    this.currentArtistId = 1;
    this.currentProjectId = 1;
    this.currentLikeId = 1;
    
    // Initialize with sample data
    this.initializeArtists();
    this.initializeProjects();
  }

  private initializeArtists() {
    const sampleArtists: InsertArtist[] = [
      {
        name: "klzinn",
        avatar: "https://i.pinimg.com/originals/ee/8c/21/ee8c21cbc213428ae44f6c968f8264e4.gif",
        description: "cantor geek desde 2023.",
        roles: ["cantor", "editor"],
        socialLinks: JSON.stringify({
          spotify: "#",
          soundcloud: "#",
          instagram: "#",
          youtube: "#"
        }),
        musicUrl: "https://yhdtpoqjntehiruphsjd.supabase.co/storage/v1/object/public/teste//klzinn_estilo_rengoku.mp3",
        isActive: true,
        musicalStyles: ["Trap", "Funk", "Hip-Hop", "Phonk"],
        artistTypes: ["Geek", "Autoral"],
        likesCount: 12
      },
      {
        name: "KAISH",
        avatar: "https://cdn.discordapp.com/attachments/979267903989899264/1385732810781884526/IMG-20250620-WA0362.jpg?ex=685723bf&is=6855d23f&hm=f8a1b2fe8697fa8a8054668852439d26383074bb7eecef2c5ecdbe4d6bb72c8b&",
        description: "ᴍᴇsᴍᴏ ǫᴜᴇ ᴛɪᴠᴇssᴇᴍ ᴀsᴀs, ᴀɪɴᴅᴀ ᴀssɪᴍ ɴãᴏ ᴍᴇ ᴀʟᴄᴀɴᴄᴀʀɪᴀᴍ.",
        roles: ["compositor", "cantor", "streamer"],
        socialLinks: JSON.stringify({
          spotify: "#",
          soundcloud: "#",
          instagram: "https://www.instagram.com/kaishoficial/",
          youtube: "https://www.youtube.com/@Kaisholas"
        }),
        musicUrl: "https://yhdtpoqjntehiruphsjd.supabase.co/storage/v1/object/public/itachi89//ASSASINO_DE_SHAMANS(1).mp3",
        isActive: true,
        musicalStyles: ["trap", "New Jazz", "detroit"],
        artistTypes: ["Geek", "Autoral"]
      }
    ];

    sampleArtists.forEach(artist => {
      const id = this.currentArtistId++;
      const newArtist: Artist = { 
        ...artist, 
        id,
        musicUrl: artist.musicUrl || null,
        isActive: artist.isActive ?? true,
        musicalStyles: artist.musicalStyles || [],
        artistTypes: artist.artistTypes || []
      };
      this.artists.set(id, newArtist);
    });
  }

  private initializeProjects() {
    const sampleProjects: InsertProject[] = [
      {
        name: "Cypher Geek Vol. 1",
        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        description: "Primeiro volume da cypher geek com os melhores MCs do cenário",
        genres: ["Hip-Hop", "Geek Rap"],
        collaborators: ["1", "2"],
        previewUrl: "https://yhdtpoqjntehiruphsjd.supabase.co/storage/v1/object/public/teste//klzinn_estilo_rengoku.mp3",
        status: "finalizado",
        releaseDate: "2024-03-15",
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        name: "Trap dos Animes",
        cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
        description: "EP colaborativo com beats inspirados em animes clássicos",
        genres: ["Trap", "Anime", "Beat"],
        collaborators: ["1"],
        previewUrl: "https://yhdtpoqjntehiruphsjd.supabase.co/storage/v1/object/public/itachi89//ASSASINO_DE_SHAMANS(1).mp3",
        previewVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        status: "em_desenvolvimento",
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];

    sampleProjects.forEach(project => {
      const id = this.currentProjectId++;
      const newProject: Project = { 
        ...project, 
        id,
        status: project.status || "em_desenvolvimento",
        isActive: project.isActive ?? true,
        previewUrl: project.previewUrl || null,
        previewVideoUrl: project.previewVideoUrl || null,
        releaseDate: project.releaseDate || null
      };
      this.projects.set(id, newProject);
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = Date.now().toString();
    const user: User = { 
      id,
      ...insertUser,
      email: null,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date()
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Artist operations
  async getAllArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values()).filter(artist => artist.isActive);
  }

  async getArtist(id: number): Promise<Artist | undefined> {
    return this.artists.get(id);
  }

  async getArtistsByRole(role: string): Promise<Artist[]> {
    return Array.from(this.artists.values()).filter(
      artist => artist.isActive && artist.roles.includes(role)
    );
  }

  async searchArtists(query: string): Promise<Artist[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.artists.values()).filter(
      artist =>
        artist.isActive &&
        (artist.name.toLowerCase().includes(lowercaseQuery) ||
        artist.description.toLowerCase().includes(lowercaseQuery) ||
        artist.roles.some(role => role.toLowerCase().includes(lowercaseQuery)))
    );
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const id = this.currentArtistId++;
    const artist: Artist = { 
      ...insertArtist, 
      id,
      musicUrl: insertArtist.musicUrl || null,
      isActive: insertArtist.isActive ?? true,
      musicalStyles: insertArtist.musicalStyles || [],
      artistTypes: insertArtist.artistTypes || []
    };
    this.artists.set(id, artist);
    return artist;
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.isActive);
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByStatus(status: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.isActive && project.status === status
    );
  }

  async searchProjects(query: string): Promise<Project[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.projects.values()).filter(
      project =>
        project.isActive &&
        (project.name.toLowerCase().includes(lowercaseQuery) ||
        project.description.toLowerCase().includes(lowercaseQuery) ||
        project.genres.some(genre => genre.toLowerCase().includes(lowercaseQuery)))
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id,
      status: insertProject.status || "em_desenvolvimento",
      isActive: insertProject.isActive ?? true,
      previewUrl: insertProject.previewUrl || null,
      previewVideoUrl: insertProject.previewVideoUrl || null,
      releaseDate: insertProject.releaseDate || null
    };
    this.projects.set(id, project);
    return project;
  }

  // Like operations
  async likeArtist(userId: string, artistId: number): Promise<Like> {
    const id = this.currentLikeId++;
    const like: Like = {
      id,
      userId,
      artistId,
      createdAt: new Date()
    };
    this.likes.set(`${userId}-${artistId}`, like);
    return like;
  }

  async unlikeArtist(userId: string, artistId: number): Promise<void> {
    this.likes.delete(`${userId}-${artistId}`);
  }

  async getUserLikes(userId: string): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(like => like.userId === userId);
  }

  async isArtistLiked(userId: string, artistId: number): Promise<boolean> {
    return this.likes.has(`${userId}-${artistId}`);
  }
}

export const storage = new MemStorage();
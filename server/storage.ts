import { users, artists, projects, likes, notifications, tracks, chatMessages, type User, type UpsertUser, type InsertUser, type Artist, type InsertArtist, type Project, type InsertProject, type Like, type InsertLike, type Notification, type InsertNotification, type Track, type InsertTrack, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, or, exists } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserArtistProfile(userId: string): Promise<Artist | undefined>;
  
  // Artist operations
  getAllArtists(): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistsByRole(role: string): Promise<Artist[]>;
  searchArtists(query: string): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: number, artist: Partial<InsertArtist>): Promise<Artist | undefined>;
  deleteArtist(id: number): Promise<void>;
  
  // Project operations
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByStatus(status: string): Promise<Project[]>;
  searchProjects(query: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: InsertProject): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;
  
  // Like operations
  likeArtist(userId: string, artistId: number): Promise<Like>;
  unlikeArtist(userId: string, artistId: number): Promise<void>;
  getUserLikes(userId: string): Promise<Like[]>;
  isArtistLiked(userId: string, artistId: number): Promise<boolean>;
  
  // Notification operations
  getAllNotifications(): Promise<Notification[]>;
  getActiveNotifications(): Promise<Notification[]>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  deleteNotification(id: number): Promise<void>;
  
  // Admin user operations
  getAllUsers(): Promise<User[]>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User | undefined>;
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
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userData = {
      id: userId,
      ...insertUser,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
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

  async getUserArtistProfile(userId: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    return artist || undefined;
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

  async updateArtist(id: number, updateData: Partial<InsertArtist>): Promise<Artist | undefined> {
    try {
      console.log("Updating artist in database:", { id, updateData });
      const [artist] = await db
        .update(artists)
        .set(updateData)
        .where(eq(artists.id, id))
        .returning();
      console.log("Artist updated in database:", artist);
      return artist || undefined;
    } catch (error) {
      console.error("Error updating artist in database:", error);
      throw new Error("Failed to update artist");
    }
  }

  async deleteArtist(id: number): Promise<void> {
    await db.update(artists)
      .set({ isActive: false })
      .where(eq(artists.id, id));
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

  async updateProject(id: number, insertProject: InsertProject): Promise<Project | undefined> {
    const [project] = await db.update(projects)
      .set(insertProject)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<void> {
    await db.update(projects)
      .set({ isActive: false })
      .where(eq(projects.id, id));
  }

  // Like operations
  async likeArtist(userId: string, artistId: number): Promise<Like> {
    return await db.transaction(async (tx) => {
      // Insert the like
      const [like] = await tx
        .insert(likes)
        .values({
          userId,
          artistId,
        })
        .returning();

      // Update the likes count
      await tx
        .update(artists)
        .set({
          likesCount: sql`COALESCE(${artists.likesCount}, 0) + 1`,
        })
        .where(eq(artists.id, artistId));

      return like;
    });
  }

  async unlikeArtist(userId: string, artistId: number): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete the like
      await tx
        .delete(likes)
        .where(and(eq(likes.userId, userId), eq(likes.artistId, artistId)));

      // Update the likes count
      await tx
        .update(artists)
        .set({
          likesCount: sql`GREATEST(0, COALESCE(${artists.likesCount}, 0) - 1)`,
        })
        .where(eq(artists.id, artistId));
    });
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

  // Notification operations
  async getAllNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async getActiveNotifications(): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.isActive, true))
      .orderBy(desc(notifications.createdAt));
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.isActive, true),
        or(
          eq(notifications.userId, userId), // Specific user notification
          eq(notifications.targetType, "all"), // All users notification
          and(
            eq(notifications.targetType, "artists_only"),
            // Check if user is an artist
            exists(
              db.select().from(artists).where(eq(artists.userId, userId))
            )
          )
        )
      ))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        title: insertNotification.title,
        message: insertNotification.message,
        type: insertNotification.type || "info",
        userId: insertNotification.userId,
        targetType: insertNotification.targetType || "all",
        relatedMessageId: insertNotification.relatedMessageId,
        isActive: true,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return notification;
  }

  async deleteNotification(id: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }
  
  // Admin user operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isAdmin, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Track operations
  async getArtistTracks(artistId: number): Promise<Track[]> {
    try {
      const artistTracks = await db.select().from(tracks).where(eq(tracks.artistId, artistId)).orderBy(desc(tracks.createdAt));
      return artistTracks;
    } catch (error) {
      console.error("Error fetching artist tracks:", error);
      throw new Error("Failed to fetch artist tracks");
    }
  }

  async getAllTracks(): Promise<Track[]> {
    try {
      const allTracks = await db.select().from(tracks).orderBy(desc(tracks.createdAt));
      return allTracks;
    } catch (error) {
      console.error("Error fetching tracks:", error);
      throw new Error("Failed to fetch tracks");
    }
  }

  async getTrack(id: number): Promise<Track | undefined> {
    try {
      const [track] = await db.select().from(tracks).where(eq(tracks.id, id));
      return track;
    } catch (error) {
      console.error("Error fetching track:", error);
      throw new Error("Failed to fetch track");
    }
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    try {
      const [track] = await db.insert(tracks).values(insertTrack).returning();
      return track;
    } catch (error) {
      console.error("Error creating track:", error);
      throw new Error("Failed to create track");
    }
  }

  async updateTrack(id: number, updateData: Partial<InsertTrack>): Promise<Track | undefined> {
    try {
      const [track] = await db.update(tracks)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(tracks.id, id))
        .returning();
      return track;
    } catch (error) {
      console.error("Error updating track:", error);
      throw new Error("Failed to update track");
    }
  }

  async deleteTrack(id: number): Promise<void> {
    try {
      await db.delete(tracks).where(eq(tracks.id, id));
    } catch (error) {
      console.error("Error deleting track:", error);
      throw new Error("Failed to delete track");
    }
  }

  // Chat operations
  async getAllChatMessages(): Promise<any[]> {
    const result = await db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        editedAt: chatMessages.editedAt,
        isDeleted: chatMessages.isDeleted,
        user: {
          id: users.id,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
          isAdmin: users.isAdmin,
        },
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.isDeleted, false))
      .orderBy(chatMessages.createdAt);
    
    return result;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<any> {
    const [newMessage] = await db.insert(chatMessages).values(insertMessage).returning();
    
    // Get the message with user data
    const result = await db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        editedAt: chatMessages.editedAt,
        isDeleted: chatMessages.isDeleted,
        user: {
          id: users.id,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
          isAdmin: users.isAdmin,
        },
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.id, newMessage.id));
    
    return result[0];
  }

  async deleteChatMessage(id: number): Promise<void> {
    await db.update(chatMessages)
      .set({ isDeleted: true })
      .where(eq(chatMessages.id, id));
  }
}

// Keep MemStorage for fallback/development
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private artists: Map<number, Artist>;
  private projects: Map<number, Project>;
  private likes: Map<string, Like>;
  private notifications: Map<number, Notification>;
  private chatMessages: Map<number, any>;
  private currentArtistId: number;
  private currentProjectId: number;
  private currentLikeId: number;
  private currentNotificationId: number;
  private currentChatMessageId: number;

  constructor() {
    this.users = new Map();
    this.artists = new Map();
    this.projects = new Map();
    this.likes = new Map();
    this.notifications = new Map();
    this.chatMessages = new Map();
    this.currentArtistId = 1;
    this.currentProjectId = 1;
    this.currentLikeId = 1;
    this.currentNotificationId = 1;
    this.currentChatMessageId = 1;
    
    // Initialize with sample data
    this.initializeArtists();
    this.initializeProjects();
    this.initializeNotifications();
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
        likesCount: 0
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
        userId: artist.userId || null,
        banner: artist.banner || null,
        musicUrl: artist.musicUrl || null,
        isActive: artist.isActive ?? true,
        musicalStyles: artist.musicalStyles || [],
        artistTypes: artist.artistTypes || [],
        likesCount: artist.likesCount ?? 0
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

  private initializeNotifications() {
    const sampleNotifications = [
      {
        title: "Bem-vindo ao GeeKTunes!",
        message: "Descubra uma nova dimensão da música geek. Explore artistas únicos, projetos colaborativos e conecte-se com a comunidade!",
        type: "info" as const,
        targetType: "all" as const,
        userId: null,
        relatedMessageId: null
      },
      {
        title: "Novo Projeto Lançado",
        message: "O projeto 'Cyber City' foi lançado! Confira esta incrível colaboração entre artistas cyberpunk.",
        type: "success" as const,
        targetType: "all" as const,
        userId: null,
        relatedMessageId: null
      },
      {
        title: "Comunidade Crescendo",
        message: "Já somos mais de 1000 artistas conectados! Junte-se à revolução da música geek.",
        type: "info" as const,
        targetType: "all" as const,
        userId: null,
        relatedMessageId: null
      }
    ];

    sampleNotifications.forEach(notif => {
      const id = this.currentNotificationId++;
      const notification: Notification = {
        id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        userId: notif.userId,
        targetType: notif.targetType,
        relatedMessageId: notif.relatedMessageId,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      this.notifications.set(id, notification);
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
      isAdmin: false,
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
      isAdmin: userData.isAdmin ?? false,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date()
    };
    this.users.set(userData.id, user);
    return user;
  }

  async getUserArtistProfile(userId: string): Promise<Artist | undefined> {
    return Array.from(this.artists.values()).find(
      (artist) => artist.userId === userId && artist.isActive,
    );
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
      id,
      name: insertArtist.name,
      avatar: insertArtist.avatar,
      banner: insertArtist.banner || null,
      description: insertArtist.description,
      roles: insertArtist.roles,
      socialLinks: insertArtist.socialLinks,
      musicUrl: insertArtist.musicUrl || null,
      isActive: insertArtist.isActive ?? true,
      musicalStyles: insertArtist.musicalStyles || [],
      artistTypes: insertArtist.artistTypes || [],
      likesCount: insertArtist.likesCount ?? 0,
      userId: insertArtist.userId || null
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

  async updateProject(id: number, insertProject: InsertProject): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject: Project = {
      ...existingProject,
      ...insertProject,
      id,
      previewUrl: insertProject.previewUrl || null,
      previewVideoUrl: insertProject.previewVideoUrl || null,
      releaseDate: insertProject.releaseDate || null
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      project.isActive = false;
      this.projects.set(id, project);
    }
  }

  async updateArtist(id: number, insertArtist: InsertArtist): Promise<Artist | undefined> {
    const existingArtist = this.artists.get(id);
    if (!existingArtist) return undefined;
    
    const updatedArtist: Artist = {
      ...existingArtist,
      ...insertArtist,
      id,
      musicUrl: insertArtist.musicUrl || null,
      isActive: insertArtist.isActive ?? true,
      musicalStyles: insertArtist.musicalStyles || [],
      artistTypes: insertArtist.artistTypes || []
    };
    this.artists.set(id, updatedArtist);
    return updatedArtist;
  }

  async deleteArtist(id: number): Promise<void> {
    const artist = this.artists.get(id);
    if (artist) {
      artist.isActive = false;
      this.artists.set(id, artist);
    }
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
  
  // Notification operations
  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getActiveNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.isActive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => {
        if (!notification.isActive) return false;
        
        // All users notification
        if (notification.targetType === "all") return true;
        
        // Specific user notification
        if (notification.targetType === "specific_user" && notification.userId === userId) return true;
        
        // Artists only notification - check if user has an artist profile
        if (notification.targetType === "artists_only") {
          const userArtist = Array.from(this.artists.values()).find(artist => artist.userId === userId);
          return !!userArtist;
        }
        
        return false;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = {
      id,
      title: insertNotification.title,
      message: insertNotification.message,
      type: insertNotification.type || "info",
      userId: insertNotification.userId || null,
      targetType: insertNotification.targetType || "all",
      relatedMessageId: insertNotification.relatedMessageId || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async deleteNotification(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isActive = false;
      this.notifications.set(id, notification);
    }
  }
  
  // Admin user operations
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      isAdmin,
      updatedAt: new Date(),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Chat operations
  async getAllChatMessages(): Promise<any[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(msg => !msg.isDeleted)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return messages.map(msg => ({
      ...msg,
      user: this.users.get(msg.userId) || {
        id: msg.userId,
        username: "Usuário Removido",
        profileImageUrl: null,
        isAdmin: false
      }
    }));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<any> {
    const user = this.users.get(insertMessage.userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const message = {
      id: this.currentChatMessageId++,
      ...insertMessage,
      createdAt: new Date().toISOString(),
      editedAt: null,
      isDeleted: false,
    };

    this.chatMessages.set(message.id, message);

    return {
      ...message,
      user: {
        id: user.id,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        isAdmin: user.isAdmin,
      }
    };
  }

  async deleteChatMessage(id: number): Promise<void> {
    const message = this.chatMessages.get(id);
    if (message) {
      message.isDeleted = true;
      this.chatMessages.set(id, message);
    }
  }
}

export const storage = new DatabaseStorage();
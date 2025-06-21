import { users, artists, projects, type User, type InsertUser, type Artist, type InsertArtist, type Project, type InsertProject } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllArtists(): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistsByRole(role: string): Promise<Artist[]>;
  searchArtists(query: string): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByStatus(status: string): Promise<Project[]>;
  searchProjects(query: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artists: Map<number, Artist>;
  private projects: Map<number, Project>;
  private currentUserId: number;
  private currentArtistId: number;
  private currentProjectId: number;

  constructor() {
    this.users = new Map();
    this.artists = new Map();
    this.projects = new Map();
    this.currentUserId = 1;
    this.currentArtistId = 1;
    this.currentProjectId = 1;
    
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
        artistTypes: ["Geek", "Autoral"]
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

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

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

  private initializeProjects() {
    const sampleProjects: InsertProject[] = [
      {
        name: "Cyber Beats Vol. 1",
        cover: "https://i.pinimg.com/736x/a2/3f/8e/a23f8e4d7c6b9a8f5e3d2c1b4e7a9f6c.jpg",
        description: "Álbum colaborativo de trap geek com referências de cyberpunk e anime futurista",
        genres: ["Trap", "Cyberpunk", "Synthwave"],
        collaborators: ["1", "2"], // klzinn e MC Nerdcore
        previewUrl: "https://example.com/preview/cyber-beats-vol1.mp3",
        previewVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        status: "em_desenvolvimento",
        releaseDate: null,
        createdAt: "2024-01-15",
        isActive: true
      },
      {
        name: "Batalha dos Animes",
        cover: "https://i.pinimg.com/736x/5d/8a/2c/5d8a2c9e6f1b4a7d3e8c5f9b2a6e4d7c.jpg",
        description: "EP de rap battle com temas de anime e cultura otaku",
        genres: ["Rap", "Hip-Hop", "Geek"],
        collaborators: ["2", "3"], // MC Nerdcore e Beatmaker Otaku
        previewUrl: null,
        previewVideoUrl: "https://vimeo.com/123456789",
        status: "finalizado",
        releaseDate: "2024-02-20",
        createdAt: "2023-12-01",
        isActive: true
      },
      {
        name: "Retro Gaming Soundtrack",
        cover: "https://i.pinimg.com/736x/7f/2b/6d/7f2b6d5a8e1c9f3b7a4e2d8c6f1a5b9e.jpg",
        description: "Trilha sonora inspirada em jogos retrô com elementos de chiptune e synthwave",
        genres: ["Synthwave", "Chiptune", "Gaming"],
        collaborators: ["4"], // Synthwave Gamer
        previewUrl: "https://example.com/preview/retro-gaming.mp3",
        previewVideoUrl: "https://www.instagram.com/p/ABC123/",
        status: "lancado",
        releaseDate: "2024-01-10",
        createdAt: "2023-11-15",
        isActive: true
      }
    ];

    sampleProjects.forEach(project => {
      const id = this.currentProjectId++;
      const newProject: Project = { 
        ...project, 
        id,
        previewUrl: project.previewUrl || null,
        previewVideoUrl: project.previewVideoUrl || null,
        releaseDate: project.releaseDate || null,
        isActive: project.isActive ?? true,
        status: project.status || "em_desenvolvimento"
      };
      this.projects.set(id, newProject);
    });
  }

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
      previewUrl: insertProject.previewUrl || null,
      previewVideoUrl: insertProject.previewVideoUrl || null,
      releaseDate: insertProject.releaseDate || null,
      isActive: insertProject.isActive ?? true,
      status: insertProject.status || "em_desenvolvimento"
    };
    this.projects.set(id, project);
    return project;
  }
}

export const storage = new MemStorage();

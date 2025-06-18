import { users, artists, type User, type InsertUser, type Artist, type InsertArtist } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllArtists(): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistsByRole(role: string): Promise<Artist[]>;
  searchArtists(query: string): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artists: Map<number, Artist>;
  private currentUserId: number;
  private currentArtistId: number;

  constructor() {
    this.users = new Map();
    this.artists = new Map();
    this.currentUserId = 1;
    this.currentArtistId = 1;
    
    // Initialize with sample artists
    this.initializeArtists();
  }

  private initializeArtists() {
    const sampleArtists: InsertArtist[] = [
      {
        name: "DJ TechnoGeek",
        avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
        description: "Especialista em música eletrônica com referências geek e gaming. Produz desde 2018.",
        roles: ["cantor", "compositor"],
        socialLinks: JSON.stringify({
          spotify: "#",
          soundcloud: "#",
          instagram: "#",
          youtube: "#"
        }),
        musicUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        isActive: true
      },
      {
        name: "Luna Beats",
        avatar: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
        description: "Criadora de beats únicos inspirados em trilhas sonoras de jogos retro e animes.",
        roles: ["beatmaker", "mixer"],
        socialLinks: JSON.stringify({
          spotify: "#",
          soundcloud: "#",
          instagram: "#",
          youtube: "#"
        }),
        musicUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        isActive: true
      },
      {
        name: "Cyber Voice",
        avatar: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
        description: "Vocalista com influências cyberpunk e sci-fi. Especialista em vocal processing.",
        roles: ["cantor", "editor"],
        socialLinks: JSON.stringify({
          spotify: "#",
          soundcloud: "#",
          instagram: "#",
          youtube: "#"
        }),
        musicUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        isActive: true
      },
      {
        name: "RetroWave",
        avatar: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
        description: "Compositor de trilhas sonoras para jogos indie com estética anos 80-90.",
        roles: ["compositor", "beatmaker"],
        socialLinks: JSON.stringify({
          spotify: "#",
          soundcloud: "#",
          instagram: "#",
          youtube: "#"
        }),
        musicUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        isActive: true
      },
      {
        name: "Bass Engineer",
        avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
        description: "Engenheiro de áudio especializado em mixagem de música eletrônica e chiptune.",
        roles: ["mixer", "editor"],
        socialLinks: JSON.stringify({
          spotify: "#",
          soundcloud: "#",
          instagram: "#",
          youtube: "#"
        }),
        musicUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        isActive: true
      },
      {
        name: "Otaku Melody",
        avatar: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
        description: "Artista completa especializada em J-pop, K-pop e música de anime com influências geek.",
        roles: ["cantor", "compositor", "beatmaker"],
        socialLinks: JSON.stringify({
          spotify: "#",
          soundcloud: "#",
          instagram: "#",
          youtube: "#"
        }),
        musicUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        isActive: true
      }
    ];

    sampleArtists.forEach(artist => {
      const id = this.currentArtistId++;
      const newArtist: Artist = { 
        ...artist, 
        id,
        musicUrl: artist.musicUrl || null,
        isActive: artist.isActive ?? true
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
      isActive: insertArtist.isActive ?? true
    };
    this.artists.set(id, artist);
    return artist;
  }
}

export const storage = new MemStorage();

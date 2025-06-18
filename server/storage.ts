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

// Vercel serverless function entry point
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, artists, projects, notifications } from "../shared/schema";
import { eq, and, or, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema: { users, artists, projects, notifications } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  
  try {
    // Route handling
    if (url === '/api/artists' && method === 'GET') {
      const allArtists = await db.select().from(artists).where(eq(artists.isActive, true));
      return res.json(allArtists);
    }
    
    if (url === '/api/projects' && method === 'GET') {
      const allProjects = await db.select().from(projects).where(eq(projects.isActive, true));
      return res.json(allProjects);
    }
    
    if (url === '/api/notifications' && method === 'GET') {
      const allNotifications = await db.select()
        .from(notifications)
        .where(eq(notifications.isActive, true))
        .orderBy(desc(notifications.createdAt));
      return res.json(allNotifications);
    }
    
    if (url === '/api/register' && method === 'POST') {
      const { username, password, email, firstName, lastName } = req.body;
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = Math.random().toString(36).substring(7);
      
      const [user] = await db.insert(users).values({
        id: userId,
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        isAdmin: false
      }).returning();
      
      return res.json({ user: { id: user.id, username: user.username } });
    }
    
    if (url === '/api/login' && method === 'POST') {
      const { username, password } = req.body;
      
      const [user] = await db.select().from(users).where(eq(users.username, username));
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      return res.json({ user: { id: user.id, username: user.username } });
    }
    
    if (url === '/api/user' && method === 'GET') {
      // For now, return a basic response - authentication will need to be handled client-side
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Default response for unmatched routes
    return res.status(404).json({ error: 'Not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
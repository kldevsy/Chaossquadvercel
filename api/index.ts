// Vercel serverless function - minimal dependencies
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Database connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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
    // Artists endpoint
    if (url === '/api/artists' && method === 'GET') {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM artists WHERE "isActive" = true ORDER BY "createdAt" DESC');
        return res.json(result.rows);
      } finally {
        client.release();
      }
    }
    
    // Projects endpoint
    if (url === '/api/projects' && method === 'GET') {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM projects WHERE "isActive" = true ORDER BY "createdAt" DESC');
        return res.json(result.rows);
      } finally {
        client.release();
      }
    }
    
    // Notifications endpoint
    if (url === '/api/notifications' && method === 'GET') {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM notifications WHERE "isActive" = true ORDER BY "createdAt" DESC');
        return res.json(result.rows);
      } finally {
        client.release();
      }
    }
    
    // Register endpoint
    if (url === '/api/register' && method === 'POST') {
      const { username, password, email, firstName, lastName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      
      const client = await pool.connect();
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = Math.random().toString(36).substring(7);
        
        const result = await client.query(
          'INSERT INTO users (id, username, password, email, "firstName", "lastName", "isAdmin") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, username, email, "firstName", "lastName"',
          [userId, username, hashedPassword, email, firstName, lastName, false]
        );
        
        return res.json({ user: result.rows[0] });
      } catch (error: any) {
        if (error.code === '23505') {
          return res.status(400).json({ error: 'Username already exists' });
        }
        throw error;
      } finally {
        client.release();
      }
    }
    
    // Login endpoint
    if (url === '/api/login' && method === 'POST') {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];
        
        if (!user || !await bcrypt.compare(password, user.password)) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        return res.json({ 
          user: { 
            id: user.id, 
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isAdmin: user.isAdmin
          } 
        });
      } finally {
        client.release();
      }
    }
    
    // Health check
    if (url === '/api/health' && method === 'GET') {
      return res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    }
    
    return res.status(404).json({ error: 'Endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
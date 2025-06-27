// Vercel serverless function - zero imports
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  
  try {
    // Health check endpoint
    if (url === '/api/health' && method === 'GET') {
      return res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'GeeKTunes API funcionando perfeitamente'
      });
    }
    
    // Artists endpoint
    if (url === '/api/artists' && method === 'GET') {
      const artists = [
        {
          id: 1,
          name: "Cyber Punk",
          avatar: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
          description: "Eletrônica futurista com beats cyberpunk",
          role: "Producer",
          musicUrl: "https://example.com/music1.mp3",
          socialLinks: '{"instagram": "https://instagram.com/cyberpunk", "twitter": "https://twitter.com/cyberpunk"}',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: "Neon Dreams",
          avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
          description: "Synthwave nostálgico dos anos 80",
          role: "Artist",
          musicUrl: "https://example.com/music2.mp3",
          socialLinks: '{"instagram": "https://instagram.com/neondreams", "youtube": "https://youtube.com/neondreams"}',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: "Digital Samurai",
          avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
          description: "Fusão de música tradicional japonesa com eletrônica moderna",
          role: "Composer",
          musicUrl: "https://example.com/music3.mp3",
          socialLinks: '{"youtube": "https://youtube.com/digitalsamurai", "soundcloud": "https://soundcloud.com/digitalsamurai"}',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      return res.json(artists);
    }
    
    // Projects endpoint
    if (url === '/api/projects' && method === 'GET') {
      const projects = [
        {
          id: 1,
          title: "Cyber City",
          description: "Álbum colaborativo de música eletrônica cyberpunk que explora temas futurísticos",
          coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400",
          previewVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          status: "active",
          collaborators: "Cyber Punk, Neon Dreams",
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: "Retro Wave",
          description: "Projeto nostálgico que traz de volta os sons clássicos dos anos 80",
          coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
          previewVideoUrl: "https://www.youtube.com/watch?v=example2",
          status: "active",
          collaborators: "Neon Dreams, Digital Samurai",
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      return res.json(projects);
    }
    
    // Notifications endpoint - public access
    if (url === '/api/notifications' && method === 'GET') {
      const notifications = [
        {
          id: 1,
          title: "Bem-vindo ao GeeKTunes!",
          message: "Descubra uma nova dimensão da música geek. Explore artistas únicos, projetos colaborativos e conecte-se com a comunidade!",
          type: "info",
          targetType: "all",
          targetUserId: null,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: "Novo Projeto Lançado",
          message: "O projeto 'Cyber City' foi lançado! Confira esta incrível colaboração entre artistas cyberpunk.",
          type: "success",
          targetType: "all",
          targetUserId: null,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: "Comunidade Crescendo",
          message: "Já somos mais de 1000 artistas conectados! Junte-se à revolução da música geek.",
          type: "info",
          targetType: "all",
          targetUserId: null,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      return res.json(notifications);
    }
    
    // Register endpoint
    if (url === '/api/register' && method === 'POST') {
      const { username, password, email, firstName, lastName } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username e password são obrigatórios' });
      }
      
      const userId = Math.random().toString(36).substring(7);
      
      return res.json({ 
        user: { 
          id: userId, 
          username,
          email: email || `${username}@geektunes.com`,
          firstName: firstName || username,
          lastName: lastName || 'User',
          isAdmin: false
        } 
      });
    }
    
    // Login endpoint
    if (url === '/api/login' && method === 'POST') {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username e password são obrigatórios' });
      }
      
      // Admin login
      if (username === 'admin' && password === 'admin') {
        return res.json({ 
          user: { 
            id: 'admin123', 
            username: 'admin',
            email: 'admin@geektunes.com',
            firstName: 'Admin',
            lastName: 'GeeKTunes',
            isAdmin: true
          } 
        });
      }
      
      // Regular user login
      return res.json({ 
        user: { 
          id: Math.random().toString(36).substring(7), 
          username,
          email: `${username}@geektunes.com`,
          firstName: username,
          lastName: 'User',
          isAdmin: false
        } 
      });
    }
    
    // User endpoint - check for authentication token in headers (both /api/user and /api/usuário)
    if ((url === '/api/user' || url === '/api/usuário') && method === 'GET') {
      // For demo purposes on Vercel, we'll check Authorization header
      const authHeader = req.headers.authorization;
      const userToken = req.headers['x-user-token'];
      
      // If we have a user token from localStorage (via headers), validate it
      if (userToken) {
        try {
          const userData = JSON.parse(decodeURIComponent(userToken));
          return res.json(userData);
        } catch (error) {
          return res.status(401).json({ message: "Invalid user token" });
        }
      }
      
      // Demo admin user for testing
      if (authHeader === 'Bearer admin-token') {
        return res.json({
          id: 'admin123', 
          username: 'admin',
          email: 'admin@geektunes.com',
          firstName: 'Admin',
          lastName: 'GeeKTunes',
          isAdmin: true
        });
      }
      
      return res.status(401).json({ message: "Authentication required" });
    }
    
    return res.status(404).json({ error: 'Endpoint não encontrado' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
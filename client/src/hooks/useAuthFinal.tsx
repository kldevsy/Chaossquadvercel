import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { User as SelectUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false for Vercel

  // Initialize auth state immediately from localStorage
  useEffect(() => {
    console.log('🔥 FINAL AUTH: Initializing');
    
    // Don't set loading state, check immediately
    if (typeof window !== 'undefined') {
      try {
        const storedUser = window.localStorage.getItem('geektunes-user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData?.id && userData?.username) {
            console.log('🔥 FINAL AUTH: User found:', userData.username);
            setUser(userData);
          } else {
            console.log('🔥 FINAL AUTH: Invalid user data, clearing');
            window.localStorage.removeItem('geektunes-user');
          }
        } else {
          console.log('🔥 FINAL AUTH: No stored user');
        }
      } catch (error) {
        console.error('🔥 FINAL AUTH: Error:', error);
        try {
          window.localStorage.removeItem('geektunes-user');
        } catch (e) {
          console.error('🔥 FINAL AUTH: Clear error:', e);
        }
      }
    }
    
    console.log('🔥 FINAL AUTH: Initialization complete');
  }, []);

  const login = async (username: string, password: string) => {
    console.log('🔥 FINAL AUTH: Starting login for:', username);
    setIsLoading(true);
    
    try {
      // Use absolute URL for Vercel
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const apiUrl = `${baseUrl}/api/login`;
      
      console.log('🔥 FINAL AUTH: Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('🔥 FINAL AUTH: API response:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 FINAL AUTH: API error:', errorText);
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userData = data.user;
      console.log('🔥 FINAL AUTH: Login successful:', userData.username);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('geektunes-user', JSON.stringify(userData));
      }
      setUser(userData);

      toast({
        title: "Login realizado",
        description: `Bem-vindo de volta, ${userData.username}!`,
      });
      
    } catch (error) {
      console.error('🔥 FINAL AUTH: Login error:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, email?: string, firstName?: string, lastName?: string) => {
    console.log('🔥 FINAL AUTH: Starting registration for:', username);
    setIsLoading(true);
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const apiUrl = `${baseUrl}/api/register`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, firstName, lastName }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 FINAL AUTH: Registration error:', errorText);
        throw new Error('Registration failed');
      }

      const data = await response.json();
      const userData = data.user;
      console.log('🔥 FINAL AUTH: Registration successful:', userData.username);

      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('geektunes-user', JSON.stringify(userData));
      }
      setUser(userData);

      toast({
        title: "Conta criada",
        description: `Bem-vindo ao GeeKTunes, ${userData.username}!`,
      });
      
    } catch (error) {
      console.error('🔥 FINAL AUTH: Registration error:', error);
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🔥 FINAL AUTH: Logging out');
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('geektunes-user');
      }
      setUser(null);
      toast({
        title: "Logout realizado",
        description: "Até a próxima!",
      });
    } catch (error) {
      console.error('🔥 FINAL AUTH: Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  const currentState = {
    hasUser: !!user,
    isLoading,
    isAuthenticated: !!user,
    username: user?.username || 'none'
  };
  
  console.log('🔥 FINAL AUTH: Current state:', currentState);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
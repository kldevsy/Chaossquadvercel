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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage - Vercel optimized
  useEffect(() => {
    console.log('AuthProvider: Starting Vercel auth initialization');
    
    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Immediate check without any delays for Vercel
    try {
      const storedUser = window.localStorage.getItem('geektunes-user');
      console.log('AuthProvider: Stored user data:', storedUser ? 'found' : 'not found');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('AuthProvider: Parsed user data:', userData);
        
        if (userData && userData.id && userData.username) {
          console.log('AuthProvider: Valid user found, setting state:', userData.username);
          setUser(userData);
        } else {
          console.log('AuthProvider: Invalid user data, clearing localStorage');
          window.localStorage.removeItem('geektunes-user');
        }
      }
    } catch (error) {
      console.error('AuthProvider: Error reading localStorage:', error);
      try {
        window.localStorage.removeItem('geektunes-user');
      } catch (e) {
        console.error('AuthProvider: Error clearing localStorage:', e);
      }
    }
    
    console.log('AuthProvider: Initialization complete, setting loading to false');
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    console.log('AuthProvider: Starting login for:', username);
    setIsLoading(true);
    
    try {
      // Use the correct Vercel API endpoint
      const apiUrl = window.location.origin + '/api/login';
      console.log('AuthProvider: Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('AuthProvider: API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthProvider: API error response:', errorText);
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userData = data.user;
      console.log('AuthProvider: Login successful, user data:', userData);

      // Save to localStorage
      window.localStorage.setItem('geektunes-user', JSON.stringify(userData));
      setUser(userData);

      toast({
        title: "Login realizado",
        description: `Bem-vindo de volta, ${userData.username}!`,
      });
      
      console.log('AuthProvider: Login process completed successfully');
    } catch (error) {
      console.error('AuthProvider: Login error:', error);
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
    console.log('AuthProvider: Starting registration for:', username);
    setIsLoading(true);
    
    try {
      const apiUrl = window.location.origin + '/api/register';
      console.log('AuthProvider: Calling registration API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, firstName, lastName }),
      });

      console.log('AuthProvider: Registration API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AuthProvider: Registration API error:', errorText);
        throw new Error('Registration failed');
      }

      const data = await response.json();
      const userData = data.user;
      console.log('AuthProvider: Registration successful, user data:', userData);

      // Save to localStorage
      window.localStorage.setItem('geektunes-user', JSON.stringify(userData));
      setUser(userData);

      toast({
        title: "Conta criada",
        description: `Bem-vindo ao GeeKTunes, ${userData.username}!`,
      });
      
      console.log('AuthProvider: Registration process completed successfully');
    } catch (error) {
      console.error('AuthProvider: Registration error:', error);
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
    console.log('AuthProvider: Logging out user');
    try {
      window.localStorage.removeItem('geektunes-user');
      setUser(null);
      toast({
        title: "Logout realizado",
        description: "Até a próxima!",
      });
    } catch (error) {
      console.error('AuthProvider: Error during logout:', error);
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

  console.log('AuthProvider: Current state:', {
    hasUser: !!user,
    isLoading,
    isAuthenticated: !!user,
    username: user?.username
  });

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
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

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        const storedUser = localStorage.getItem('geektunes-user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData && userData.id && userData.username) {
            console.log('AuthProvider: Found stored user:', userData.username);
            setUser(userData);
          } else {
            console.log('AuthProvider: Invalid stored user data, clearing');
            localStorage.removeItem('geektunes-user');
          }
        } else {
          console.log('AuthProvider: No stored user found');
        }
      } catch (error) {
        console.error('AuthProvider: Error loading stored user:', error);
        localStorage.removeItem('geektunes-user');
      }
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      const userData = data.user;

      // Save to localStorage
      localStorage.setItem('geektunes-user', JSON.stringify(userData));
      setUser(userData);

      toast({
        title: "Login realizado",
        description: `Bem-vindo de volta, ${userData.username}!`,
      });
    } catch (error) {
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
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, firstName, lastName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      const userData = data.user;

      // Save to localStorage
      localStorage.setItem('geektunes-user', JSON.stringify(userData));
      setUser(userData);

      toast({
        title: "Conta criada",
        description: `Bem-vindo ao GeeKTunes, ${userData.username}!`,
      });
    } catch (error) {
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
    localStorage.removeItem('geektunes-user');
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Até a próxima!",
    });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

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
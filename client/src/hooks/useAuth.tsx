import React, { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  isAuthenticated: boolean;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    retry: false,
    queryFn: async () => {
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('geektunes-user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          localStorage.removeItem('geektunes-user');
        }
      }
      
      // If no stored user, try API (will likely return 401)
      const res = await fetch('/api/user');
      if (!res.ok) {
        return null;
      }
      return res.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Login failed");
      }
      const data = await res.json();
      return data.user;
    },
    onSuccess: (user: SelectUser) => {
      // Save to localStorage for persistence
      localStorage.setItem('geektunes-user', JSON.stringify(user));
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Login realizado",
        description: `Bem-vindo de volta, ${user.username}!`,
      });
      // Force page refresh to ensure state is updated
      setTimeout(() => window.location.href = '/', 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }
      const data = await res.json();
      return data.user;
    },
    onSuccess: (user: SelectUser) => {
      // Save to localStorage for persistence
      localStorage.setItem('geektunes-user', JSON.stringify(user));
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Conta criada",
        description: `Bem-vindo ao GeeKTunes, ${user.username}!`,
      });
      // Force page refresh to ensure state is updated
      setTimeout(() => window.location.href = '/', 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Remove from localStorage
      localStorage.removeItem('geektunes-user');
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Logout realizado",
        description: "Até a próxima!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        isAuthenticated: !!user,
      }}
    >
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
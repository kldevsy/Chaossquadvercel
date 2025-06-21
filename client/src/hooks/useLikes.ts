import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "./useAuth";

export function useLikes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Get user's likes
  const { data: userLikes = [] } = useQuery<any[]>({
    queryKey: ["/api/user/likes"],
    enabled: isAuthenticated,
    retry: false,
  });

  // Like an artist
  const likeMutation = useMutation({
    mutationFn: async (artistId: number) => {
      if (!isAuthenticated) {
        throw new Error("UNAUTHENTICATED");
      }
      return await apiRequest("POST", `/api/artists/${artistId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/likes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      toast({
        title: "Curtido!",
        description: "Artista adicionado aos seus favoritos",
      });
    },
    onError: (error) => {
      if (error.message === "UNAUTHENTICATED" || isUnauthorizedError(error)) {
        toast({
          title: "Login necessário",
          description: "Faça login para curtir artistas. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível curtir o artista",
        variant: "destructive",
      });
    },
  });

  // Unlike an artist
  const unlikeMutation = useMutation({
    mutationFn: async (artistId: number) => {
      if (!isAuthenticated) {
        throw new Error("UNAUTHENTICATED");
      }
      return await apiRequest("DELETE", `/api/artists/${artistId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/likes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      toast({
        title: "Descurtido",
        description: "Artista removido dos seus favoritos",
      });
    },
    onError: (error) => {
      if (error.message === "UNAUTHENTICATED" || isUnauthorizedError(error)) {
        toast({
          title: "Login necessário",
          description: "Faça login para gerenciar curtidas. Redirecionando...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
        return;
      }
      toast({
        title: "Erro",
        description: "Não foi possível descurtir o artista",
        variant: "destructive",
      });
    },
  });

  const isArtistLiked = (artistId: number) => {
    return userLikes.some((like: any) => like.artistId === artistId);
  };

  const toggleLike = async (artistId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir artistas",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    try {
      if (isArtistLiked(artistId)) {
        await unlikeMutation.mutateAsync(artistId);
      } else {
        await likeMutation.mutateAsync(artistId);
      }
    } catch (error) {
      // Error handling is done in mutation onError
    }
  };

  return {
    userLikes,
    isArtistLiked,
    toggleLike,
    isLiking: likeMutation.isPending,
    isUnliking: unlikeMutation.isPending,
  };
}
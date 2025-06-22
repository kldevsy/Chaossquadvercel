import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Send, Users, MessageCircle, Music, Crown } from "lucide-react";
import type { ChatMessage, User } from "@shared/schema";

interface ChatMessageWithUser extends ChatMessage {
  user: User;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessageWithUser[]>({
    queryKey: ["/api/chat/messages"],
    enabled: isAuthenticated,
  });

  // Connect to WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket conectado");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") {
          // Invalidate queries to refresh messages
          queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
        }
      } catch (error) {
        console.error("Erro ao processar mensagem WebSocket:", error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket desconectado");
    };

    wsRef.current.onerror = (error) => {
      console.error("Erro WebSocket:", error);
      setIsConnected(false);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      return await apiRequest("POST", "/api/chat/messages", { message: messageText });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isAuthenticated) return;
    
    sendMessageMutation.mutate(message.trim());
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Login Necessário</h2>
            <p className="text-muted-foreground mb-4">
              Faça login para participar do chat da comunidade
            </p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Chat da Comunidade</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  {isConnected ? "Conectado" : "Desconectado"}
                  <span>•</span>
                  <Users className="w-4 h-4" />
                  Online
                </div>
              </div>
            </div>
            
            <Badge variant="secondary" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              GeeKTunes Chat
            </Badge>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)]">
        <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm border-border/50">
          {/* Messages Area */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                        <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <MessageCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Seja o primeiro a conversar!</h3>
                  <p className="text-muted-foreground">
                    Inicie uma conversa e conecte-se com outros músicos da comunidade
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const isOwnMessage = msg.userId === user?.id;
                      const showAvatar = index === 0 || messages[index - 1]?.userId !== msg.userId;
                      
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                        >
                          {showAvatar && (
                            <Avatar className="w-10 h-10 border-2 border-border/50">
                              <AvatarImage src={msg.user.profileImageUrl || undefined} />
                              <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                {getInitials(msg.user.username)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          {!showAvatar && <div className="w-10" />}
                          
                          <div className={`flex-1 max-w-[80%] ${isOwnMessage ? 'text-right' : ''}`}>
                            {showAvatar && (
                              <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                                <span className="text-sm font-semibold text-foreground">
                                  {msg.user.username}
                                </span>
                                {msg.user.isAdmin && (
                                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(msg.createdAt)}
                                </span>
                              </div>
                            )}
                            
                            <div
                              className={`inline-block p-3 rounded-2xl max-w-full break-words ${
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground ml-auto'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {msg.message}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="border-t border-border/50 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="pr-12 bg-background/50 border-border/50 focus:border-primary/50"
                  maxLength={500}
                  disabled={!isConnected || sendMessageMutation.isPending}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {message.length}/500
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={!message.trim() || !isConnected || sendMessageMutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {sendMessageMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
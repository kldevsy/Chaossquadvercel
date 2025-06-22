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
import { Send, Users, MessageCircle, Music, Crown, AtSign } from "lucide-react";
import type { ChatMessage, User } from "@shared/schema";

interface ChatMessageWithUser extends ChatMessage {
  user: User;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessageWithUser[]>({
    queryKey: ["/api/chat/messages"],
    enabled: isAuthenticated,
  });

  // Fetch all users for mentions - available to all authenticated users
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated,
  });

  // Fetch artists to get artist profiles
  const { data: artists = [] } = useQuery({
    queryKey: ["/api/artists"],
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

  // Handle message input change and mention detection
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;
    
    setMessage(value);
    setCursorPosition(position);
    
    // Check for @ mentions
    const textBeforeCursor = value.slice(0, position);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's no space after @
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setMentionSearch(textAfterAt);
        setShowMentions(true);
        return;
      }
    }
    
    setShowMentions(false);
    setMentionSearch("");
  };

  // Filter users for mentions
  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(mentionSearch.toLowerCase()) &&
    u.id !== user?.id
  ).slice(0, 5);

  // Handle mention selection
  const handleMentionSelect = (selectedUser: User) => {
    const textBeforeCursor = message.slice(0, cursorPosition);
    const textAfterCursor = message.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const beforeAt = textBeforeCursor.slice(0, lastAtIndex);
      const newMessage = `${beforeAt}@${selectedUser.username} ${textAfterCursor}`;
      setMessage(newMessage);
      
      // Set cursor position after the mention
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = beforeAt.length + selectedUser.username.length + 2;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          inputRef.current.focus();
        }
      }, 0);
    }
    
    setShowMentions(false);
    setMentionSearch("");
  };

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

  // Get user display info (name from artist profile if available)
  const getUserDisplayInfo = (userId: string, username: string) => {
    const artist = artists.find(a => a.userId === userId);
    return {
      displayName: artist?.name || username,
      avatar: artist?.avatar || null,
      isArtist: !!artist
    };
  };

  // Render message with mentions highlighted
  const renderMessageWithMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = text.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a username (odd indices after split)
        const mentionedUser = allUsers.find(u => u.username === part);
        const isCurrentUser = user?.username === part;
        
        return (
          <span
            key={index}
            className={`font-semibold px-1 py-0.5 rounded text-xs ${
              isCurrentUser 
                ? 'bg-primary/20 text-primary' 
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            @{part}
          </span>
        );
      }
      return part;
    });
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
                                {renderMessageWithMentions(msg.message)}
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
                  ref={inputRef}
                  value={message}
                  onChange={handleMessageChange}
                  placeholder="Digite sua mensagem... (use @ para mencionar usuários)"
                  className="pr-20 pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                  maxLength={500}
                  disabled={!isConnected || sendMessageMutation.isPending}
                />
                
                {/* Mentions Dropdown */}
                {showMentions && filteredUsers.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 p-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <AtSign className="w-3 h-3" />
                        Mencionar usuário
                      </div>
                      {filteredUsers.map((filteredUser) => {
                        const userDisplayInfo = getUserDisplayInfo(filteredUser.id, filteredUser.username);
                        return (
                          <div
                            key={filteredUser.id}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => handleMentionSelect(filteredUser)}
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={userDisplayInfo.avatar || filteredUser.profileImageUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {getInitials(userDisplayInfo.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">{userDisplayInfo.displayName}</span>
                                {userDisplayInfo.isArtist && (
                                  <Music className="w-3 h-3 text-purple-500" />
                                )}
                                {filteredUser.isAdmin && (
                                  <Crown className="w-3 h-3 text-yellow-500" />
                                )}
                              </div>
                              {userDisplayInfo.displayName !== filteredUser.username && (
                                <div className="text-xs text-muted-foreground">@{filteredUser.username}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {filteredUsers.length === 0 && mentionSearch && (
                        <div className="p-2 text-xs text-muted-foreground text-center">
                          Nenhum usuário encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Header */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-b border-border/30 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg"
      >
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                animate={{ 
                  boxShadow: ["0 0 20px rgba(139, 92, 246, 0.3)", "0 0 30px rgba(236, 72, 153, 0.4)", "0 0 20px rgba(139, 92, 246, 0.3)"] 
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <MessageCircle className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Chat da Comunidade
                </motion.h1>
                <motion.div 
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                      animate={{ scale: isConnected ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                      {isConnected ? "Conectado" : "Desconectado"}
                    </span>
                  </div>
                  <span className="text-muted-foreground/60">•</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Comunidade Online</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Badge 
                variant="secondary" 
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-600"
              >
                <Music className="w-4 h-4" />
                GeeKTunes Live
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <div className="container mx-auto px-6 py-8 h-[calc(100vh-140px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="h-full flex flex-col bg-card/90 backdrop-blur-xl border-border/30 shadow-2xl rounded-3xl overflow-hidden">
            {/* Messages Area */}
            <CardContent className="flex-1 p-0 overflow-hidden relative">
              {/* Gradient overlay for better readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/5 pointer-events-none z-10" />
              
              <ScrollArea className="h-full p-8 relative z-20">
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
                <motion.div 
                  className="flex flex-col items-center justify-center h-full text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 mb-6 border border-purple-500/20"
                    whileHover={{ scale: 1.05 }}
                    animate={{ 
                      boxShadow: ["0 0 20px rgba(139, 92, 246, 0.1)", "0 0 30px rgba(236, 72, 153, 0.15)", "0 0 20px rgba(139, 92, 246, 0.1)"] 
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <MessageCircle className="w-12 h-12 text-purple-500" />
                  </motion.div>
                  <motion.h3 
                    className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Seja o primeiro a conversar!
                  </motion.h3>
                  <motion.p 
                    className="text-muted-foreground text-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Inicie uma conversa e conecte-se com outros músicos da comunidade
                  </motion.p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const isOwnMessage = msg.userId === user?.id;
                      const userDisplayInfo = getUserDisplayInfo(msg.userId, msg.user?.username || 'Usuário');
                      const showAvatar = index === 0 || messages[index - 1]?.userId !== msg.userId;
                      const messageTime = new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className={`flex gap-3 group hover:bg-muted/20 p-2 rounded-2xl transition-all duration-300 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {showAvatar && !isOwnMessage && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-border group-hover:ring-purple-500/50 transition-all duration-300 shadow-lg">
                                <AvatarImage src={userDisplayInfo.avatar || msg.user?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500/20 to-pink-500/20 font-semibold">
                                  {getInitials(userDisplayInfo.displayName)}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                          )}
                          
                          {!showAvatar && !isOwnMessage && (
                            <div className="w-10 h-10 flex-shrink-0" />
                          )}
                          
                          <div className={`max-w-[75%] ${isOwnMessage ? 'order-first' : ''}`}>
                            {showAvatar && !isOwnMessage && (
                              <motion.div 
                                className="flex items-center gap-2 mb-1 px-1"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <span className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                  {userDisplayInfo.displayName}
                                </span>
                                {userDisplayInfo.isArtist && (
                                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-purple-500/20 text-purple-600 border-purple-500/30 font-medium">
                                    <Music className="w-3 h-3 mr-1" />
                                    Artista
                                  </Badge>
                                )}
                                {msg.user?.isAdmin && (
                                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-600 border-yellow-500/30 font-medium">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                  {messageTime}
                                </span>
                              </motion.div>
                            )}
                            
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                              className={`px-4 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300 relative shadow-lg ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-auto shadow-purple-500/25'
                                  : 'bg-card/90 text-foreground border border-border/30 shadow-black/5'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                {renderMessageWithMentions(msg.message)}
                              </p>
                              
                              <div className={`absolute text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                                isOwnMessage ? '-left-16 top-1/2 -translate-y-1/2' : '-right-16 top-1/2 -translate-y-1/2'
                              } text-muted-foreground`}>
                                {messageTime}
                              </div>
                            </motion.div>
                          </div>

                          {showAvatar && isOwnMessage && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-border group-hover:ring-purple-500/50 transition-all duration-300 shadow-lg">
                                <AvatarImage src={userDisplayInfo.avatar || msg.user?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500/20 to-pink-500/20 font-semibold">
                                  {getInitials(userDisplayInfo.displayName)}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                          )}
                          
                          {!showAvatar && isOwnMessage && (
                            <div className="w-10 h-10 flex-shrink-0" />
                          )}
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
          <motion.div 
            className="border-t border-border/30 p-6 bg-card/50 backdrop-blur-xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <form onSubmit={handleSendMessage} className="flex items-center gap-4">
              <div className="flex-1 relative">
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Digite sua mensagem... (use @ para mencionar usuários)"
                    className="pr-24 pl-12 py-4 text-base bg-background/80 border-2 border-border/30 focus:border-purple-500/50 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300"
                    maxLength={500}
                    disabled={!isConnected || sendMessageMutation.isPending}
                  />
                </motion.div>
                
                {/* Mentions Dropdown */}
                {showMentions && filteredUsers.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-3 w-72 bg-card/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl z-50 p-3"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 px-2">
                        <AtSign className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">Mencionar usuário</span>
                      </div>
                      {filteredUsers.map((filteredUser) => {
                        const userDisplayInfo = getUserDisplayInfo(filteredUser.id, filteredUser.username);
                        return (
                          <motion.div
                            key={filteredUser.id}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-500/10 cursor-pointer transition-all duration-200 border border-transparent hover:border-purple-500/20"
                            onClick={() => handleMentionSelect(filteredUser)}
                          >
                            <Avatar className="w-8 h-8 ring-1 ring-border">
                              <AvatarImage src={userDisplayInfo.avatar || filteredUser.profileImageUrl || undefined} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                {getInitials(userDisplayInfo.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-foreground">{userDisplayInfo.displayName}</span>
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
                          </motion.div>
                        );
                      })}
                      {filteredUsers.length === 0 && mentionSearch && (
                        <div className="p-3 text-xs text-muted-foreground text-center rounded-xl bg-muted/20">
                          Nenhum usuário encontrado
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
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
          </motion.div>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}
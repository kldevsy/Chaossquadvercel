import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Info, CheckCircle, AlertTriangle, AlertCircle, Sparkles, Settings, ChevronDown, ChevronUp } from "lucide-react";
import type { Notification } from "@shared/schema";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState<Notification | null>(null);
  const [expandedInline, setExpandedInline] = useState<Set<number>>(new Set());
  const [viewedNotifications, setViewedNotifications] = useState<Set<number>>(() => {
    // Load viewed notifications from localStorage
    const saved = localStorage.getItem('viewedNotifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notifications.filter(n => !viewedNotifications.has(n.id)).length;

  // Save viewed notifications to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('viewedNotifications', JSON.stringify([...viewedNotifications]));
  }, [viewedNotifications]);

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Mark all current notifications as viewed when opening
      const newViewed = new Set(viewedNotifications);
      notifications.forEach(n => newViewed.add(n.id));
      setViewedNotifications(newViewed);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'system':
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const truncateMessage = (message: string, maxLength: number = 100) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.message.length > 100) {
      setExpandedNotification(notification);
      setIsOpen(false); // Close the popover when opening the dialog
    }
  };

  const toggleInlineExpansion = (notificationId: number) => {
    const newExpanded = new Set(expandedInline);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedInline(newExpanded);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={handleOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hover:bg-accent"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />
            </motion.div>
            
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Badge 
                    variant="destructive" 
                    className="h-5 min-w-[20px] px-1 text-xs flex items-center justify-center rounded-full animate-pulse"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="border-b px-4 py-3">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} nova{unreadCount !== 1 ? 's' : ''} notificaç{unreadCount !== 1 ? 'ões' : 'ão'}
              </p>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-3"
                >
                  <div className="relative mx-auto w-16 h-16">
                    <Bell className="w-16 h-16 text-muted-foreground/30" />
                    <Sparkles className="w-6 h-6 text-primary absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium">Tudo em dia! ✨</p>
                    <p className="text-sm text-muted-foreground/70">Nenhuma notificação no momento</p>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {notifications.map((notification, index) => {
                  const isUnread = !viewedNotifications.has(notification.id);
                  const isLongMessage = notification.message.length > 100;
                  const isExpanded = expandedInline.has(notification.id);
                  const displayMessage = isLongMessage && !isExpanded 
                    ? truncateMessage(notification.message) 
                    : notification.message;
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${getNotificationColor(notification.type)} ${isUnread ? 'ring-2 ring-primary/20' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <CardContent className="p-3 relative">
                          {isUnread && (
                            <div className="absolute top-2 right-2">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                              >
                                {getNotificationIcon(notification.type)}
                              </motion.div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm line-clamp-1 ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h4>
                              <div className="mt-1">
                                <p className={`text-xs text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
                                  {displayMessage}
                                </p>
                                {isLongMessage && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 mt-1 text-xs text-primary hover:bg-transparent"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleInlineExpansion(notification.id);
                                    }}
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="w-3 h-3 mr-1" />
                                        Ler menos
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                        Ler mais
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(notification.createdAt)}
                                </p>
                                {isUnread && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                    Novo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="border-t p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => handleOpen(false)}
              >
                Fechar
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Dialog for expanded notification */}
      <Dialog open={!!expandedNotification} onOpenChange={() => setExpandedNotification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {expandedNotification && getNotificationIcon(expandedNotification.type)}
              {expandedNotification?.title}
            </DialogTitle>
          </DialogHeader>
          {expandedNotification && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    expandedNotification.type === "success" ? "default" :
                    expandedNotification.type === "warning" ? "secondary" :
                    expandedNotification.type === "error" ? "destructive" :
                    expandedNotification.type === "system" ? "outline" : "outline"
                  }
                >
                  {expandedNotification.type === "info" ? "Informação" :
                   expandedNotification.type === "success" ? "Sucesso" :
                   expandedNotification.type === "warning" ? "Aviso" :
                   expandedNotification.type === "system" ? "Sistema" : "Erro"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(expandedNotification.createdAt)}
                </span>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {expandedNotification.message}
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setExpandedNotification(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
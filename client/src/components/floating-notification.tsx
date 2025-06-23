import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Notification } from "@shared/schema";

interface FloatingNotificationProps {
  notification: Notification | null;
  onClose: () => void;
  onNavigate: () => void;
}

export default function FloatingNotification({ 
  notification, 
  onClose, 
  onNavigate 
}: FloatingNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleClick = () => {
    onNavigate();
    handleClose();
  };

  if (!notification) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <MessageCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'mention':
        return 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/50';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/50';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.3
          }}
          className="fixed top-4 right-4 z-[9999] max-w-sm"
        >
          <Card className={`
            shadow-2xl border-2 backdrop-blur-xl
            ${getNotificationStyle(notification.type)}
            hover:shadow-3xl transition-all duration-200
            cursor-pointer
          `}
          onClick={handleClick}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  
                  {/* Call to action for mentions */}
                  {notification.type === 'mention' && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                        Clique para ver a mensagem →
                      </span>
                    </div>
                  )}
                </div>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              {/* Progress bar */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-b-lg"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";

export function useFloatingNotifications() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [lastProcessedId, setLastProcessedId] = useState<number>(0);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 2000, // Check every 2 seconds for faster detection
  });

  useEffect(() => {
    if (notifications.length > 0) {
      // Sort notifications by ID to get the newest
      const sortedNotifications = [...notifications].sort((a, b) => b.id - a.id);
      const newestNotification = sortedNotifications[0];

      // Initialize lastProcessedId if it's the first time
      if (lastProcessedId === 0) {
        setLastProcessedId(newestNotification.id);
        return;
      }

      // Check if this is a new notification we haven't seen
      if (newestNotification.id > lastProcessedId) {
        console.log('Nova notificação detectada:', newestNotification);
        
        // Only show floating notification if there's no current one
        if (!currentNotification) {
          setCurrentNotification(newestNotification);
        }

        // Update the last processed ID
        setLastProcessedId(newestNotification.id);
      }
    }
  }, [notifications, currentNotification, lastProcessedId]);

  const closeNotification = () => {
    setCurrentNotification(null);
  };

  const handleNavigate = () => {
    if (currentNotification?.type === 'mention') {
      window.location.href = '/chat';
    }
    closeNotification();
  };

  return {
    currentNotification,
    closeNotification,
    handleNavigate,
  };
}
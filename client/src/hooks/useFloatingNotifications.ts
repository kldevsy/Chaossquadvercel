import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";

export function useFloatingNotifications() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [processedIds, setProcessedIds] = useState<Set<number>>(new Set());
  const lastNotificationCount = useRef<number>(0);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 5000, // Check every 5 seconds for new notifications
  });

  useEffect(() => {
    // Check for new notifications
    if (notifications.length > lastNotificationCount.current) {
      // Find the newest notification that hasn't been processed
      const newNotifications = notifications.filter(
        notification => !processedIds.has(notification.id)
      );

      if (newNotifications.length > 0) {
        // Sort by creation date and get the newest
        const newestNotification = newNotifications.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        // Only show floating notification if there's no current one
        if (!currentNotification) {
          setCurrentNotification(newestNotification);
        }

        // Mark all new notifications as processed
        setProcessedIds(prev => {
          const newSet = new Set(prev);
          newNotifications.forEach(n => newSet.add(n.id));
          return newSet;
        });
      }
    }

    lastNotificationCount.current = notifications.length;
  }, [notifications, currentNotification, processedIds]);

  const closeNotification = () => {
    setCurrentNotification(null);
  };

  const handleNavigate = () => {
    if (currentNotification?.type === 'mention') {
      window.location.href = '/chat';
    }
  };

  return {
    currentNotification,
    closeNotification,
    handleNavigate,
  };
}
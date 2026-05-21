import { useEffect } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll for unread count every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refresh: fetchNotifications,
  };
}

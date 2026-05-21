import { create } from 'zustand';
import type { Notification } from '@/types';
import { notificationService } from '@/services/api';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationService.getAll(1, 50);
      set({
        notifications: response.data,
        unreadCount: response.data.filter((n) => !n.isRead).length,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar notificaciones';
      set({ isLoading: false, error: message });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      set({ unreadCount: response.data.count });
    } catch {
      // Silently fail
    }
  },

  addNotification: (notification) => {
    const { notifications, unreadCount } = get();
    set({
      notifications: [notification, ...notifications],
      unreadCount: notification.isRead ? unreadCount : unreadCount + 1,
    });
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      const { notifications } = get();
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
      );
      set({
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      });
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      const { notifications } = get();
      const updated = notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString(),
      }));
      set({ notifications: updated, unreadCount: 0 });
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  },

  removeNotification: async (id) => {
    try {
      await notificationService.delete(id);
      const { notifications } = get();
      const filtered = notifications.filter((n) => n.id !== id);
      set({
        notifications: filtered,
        unreadCount: filtered.filter((n) => !n.isRead).length,
      });
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

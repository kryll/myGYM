import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { Notification, SocketEvents } from '@/types';

interface UseRealtimeSyncOptions {
  enabled?: boolean;
}

export function useRealtimeSync(options: UseRealtimeSyncOptions = {}) {
  const { enabled = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { tokens, tenant, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const connectSocket = useCallback(() => {
    if (!isAuthenticated || !tokens?.accessToken || !enabled) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: tokens.accessToken,
        tenantSlug: tenant?.slug,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.info('[Socket] Conectado al servidor en tiempo real');
    });

    socket.on('disconnect', (reason) => {
      console.info(`[Socket] Desconectado: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Error de conexión:', error.message);
    });

    // Handle notification events
    socket.on('notification:new', (notification: Notification) => {
      addNotification(notification);
    });

    // Handle workout events
    socket.on('workout:completed', ({ sessionId }: SocketEvents['workout:completed']) => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      console.info('[Socket] Entrenamiento completado:', sessionId);
    });

    // Handle measurement events
    socket.on('measurement:added', () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // Handle challenge events
    socket.on('challenge:updated', ({ challengeId, progress }: SocketEvents['challenge:updated']) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      console.info(`[Socket] Reto actualizado: ${challengeId}, progreso: ${progress}`);
    });

    // Handle device events
    socket.on('device:connected', () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    });

    socket.on('device:disconnected', () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    });

    return socket;
  }, [isAuthenticated, tokens, tenant, enabled, queryClient, addNotification]);

  useEffect(() => {
    if (enabled && isAuthenticated) {
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled, isAuthenticated, connectSocket]);

  const emit = useCallback(<K extends keyof SocketEvents>(
    event: K,
    data: SocketEvents[K],
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const isConnected = socketRef.current?.connected ?? false;

  return {
    socket: socketRef.current,
    isConnected,
    emit,
  };
}

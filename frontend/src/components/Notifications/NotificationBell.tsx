import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trophy, Target, Bot, Dumbbell, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Notification } from '@/types';

function NotificationIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: React.ElementType; color: string }> = {
    workout_reminder: { icon: Dumbbell, color: 'text-electric-400' },
    challenge_completed: { icon: Trophy, color: 'text-warning' },
    goal_achieved: { icon: Target, color: 'text-neon-400' },
    ai_insight: { icon: Bot, color: 'text-electric-400' },
    system: { icon: AlertCircle, color: 'text-gray-400' },
    challenge_invite: { icon: Trophy, color: 'text-warning' },
    plan_update: { icon: Dumbbell, color: 'text-electric-400' },
    measurement_reminder: { icon: AlertCircle, color: 'text-info' },
    friend_activity: { icon: Target, color: 'text-neon-400' },
  };

  const config = icons[type] ?? icons.system;
  const Icon = config.icon;
  return <Icon size={16} className={config.color} />;
}

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={clsx(
        'flex gap-3 p-3 rounded-xl transition-colors cursor-pointer hover:bg-dark-hover',
        !notification.isRead && 'bg-electric-500/5',
      )}
      onClick={() => {
        if (!notification.isRead) onRead(notification.id);
      }}
    >
      <div className="w-8 h-8 rounded-lg bg-dark-elevated border border-dark-border flex items-center justify-center flex-shrink-0">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-white leading-snug truncate">
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-electric-500 rounded-full flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-gray-600 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: es,
          })}
        </p>
      </div>
    </motion.div>
  );
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();

  // Close on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-dark-hover rounded-xl transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center leading-none"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-dark-card border border-dark-border rounded-2xl shadow-card-hover overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
              <h3 className="text-sm font-semibold text-white">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-electric-500/15 text-electric-400 text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-1 text-xs text-electric-400 hover:text-electric-300 transition-colors"
                >
                  <CheckCheck size={14} />
                  Leer todas
                </button>
              )}
            </div>

            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {recentNotifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={32} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin notificaciones</p>
                </div>
              ) : (
                recentNotifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-dark-border p-3">
              <button
                onClick={() => { navigate('/notifications'); setIsOpen(false); }}
                className="w-full text-center text-sm text-electric-400 hover:text-electric-300 transition-colors py-1"
              >
                Ver todas las notificaciones
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;

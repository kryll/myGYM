import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Trophy, Target, Bot, Dumbbell, AlertCircle } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx } from 'clsx';
import type { Notification } from '@/types';

function NotificationIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: React.ElementType; className: string }> = {
    workout_reminder: { icon: Dumbbell, className: 'text-electric-400 bg-electric-500/10' },
    challenge_completed: { icon: Trophy, className: 'text-warning bg-warning/10' },
    goal_achieved: { icon: Target, className: 'text-neon-400 bg-neon-500/10' },
    ai_insight: { icon: Bot, className: 'text-electric-400 bg-electric-500/10' },
    system: { icon: AlertCircle, className: 'text-gray-400 bg-dark-muted' },
    challenge_invite: { icon: Trophy, className: 'text-warning bg-warning/10' },
    plan_update: { icon: Dumbbell, className: 'text-electric-400 bg-electric-500/10' },
    measurement_reminder: { icon: AlertCircle, className: 'text-info bg-info/10' },
    friend_activity: { icon: Target, className: 'text-neon-400 bg-neon-500/10' },
  };
  const config = icons[type] ?? icons.system;
  const Icon = config.icon;
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-dark-border ${config.className}`}>
      <Icon size={18} />
    </div>
  );
}

function NotificationItem({ notification, onRead, onDelete }: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={clsx(
        'flex gap-4 p-4 rounded-2xl border transition-all group',
        !notification.isRead
          ? 'bg-electric-500/3 border-electric-500/10'
          : 'bg-dark-card border-dark-border',
      )}
    >
      <NotificationIcon type={notification.type} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
              {notification.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notification.message}</p>
          </div>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-electric-500 rounded-full flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-xs text-gray-600 mt-1.5">
          {format(new Date(notification.createdAt), "dd 'de' MMMM 'a las' HH:mm", { locale: es })}
        </p>
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <button
            onClick={() => onRead(notification.id)}
            className="p-1.5 text-gray-500 hover:text-electric-400 hover:bg-electric-500/10 rounded-lg transition-all"
            title="Marcar como leída"
          >
            <CheckCheck size={14} />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="p-1.5 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
          title="Eliminar"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  if (isLoading) return <PageLoader label="Cargando notificaciones..." />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Notificaciones</h1>
          {unreadCount > 0 && (
            <p className="text-gray-400 text-sm mt-1">{unreadCount} sin leer</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<CheckCheck size={16} />}
            onClick={() => markAllAsRead()}
          >
            Leer todas
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <Bell size={48} className="text-gray-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-400">Sin notificaciones</p>
            <p className="text-sm text-gray-600 mt-1">Estás al día con todo</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification, i) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <NotificationItem
                notification={notification}
                onRead={markAsRead}
                onDelete={removeNotification}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

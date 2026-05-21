import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Dumbbell,
  ClipboardList,
  Bot,
  Scale,
  Trophy,
  Target,
  Bell,
  User,
  Cpu,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationStore } from '@/store/notificationStore';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { path: '/exercises', label: 'Ejercicios', icon: Dumbbell },
  { path: '/training', label: 'Planes', icon: ClipboardList },
  { path: '/ai-coach', label: 'Entrenador IA', icon: Bot },
  { path: '/measurements', label: 'Medidas', icon: Scale },
  { path: '/challenges', label: 'Retos', icon: Trophy },
  { path: '/goals', label: 'Objetivos', icon: Target },
  { path: '/notifications', label: 'Notificaciones', icon: Bell },
  { path: '/profile', label: 'Perfil', icon: User },
  { path: '/profile/devices', label: 'Dispositivos', icon: Cpu },
  { path: '/admin', label: 'Administración', icon: Settings, adminOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

function NavItemComponent({ item, unreadCount }: { item: NavItem; unreadCount: number }) {
  const location = useLocation();
  const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  const badgeCount = item.path === '/notifications' ? unreadCount : (item.badge ?? 0);

  return (
    <NavLink
      to={item.path}
      className={clsx(
        'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
        isActive
          ? 'bg-electric-500/15 text-electric-400 border border-electric-500/30'
          : 'text-gray-400 hover:text-white hover:bg-dark-hover border border-transparent',
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-electric-500 rounded-r-full"
        />
      )}

      <item.icon
        size={20}
        className={clsx(
          'flex-shrink-0 transition-colors',
          isActive ? 'text-electric-400' : 'text-gray-500 group-hover:text-gray-300',
        )}
      />

      <span className="flex-1 text-sm font-medium truncate">{item.label}</span>

      {badgeCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {badgeCount > 99 ? '99+' : badgeCount}
        </motion.span>
      )}

      {isActive && (
        <ChevronRight size={14} className="text-electric-400 flex-shrink-0" />
      )}
    </NavLink>
  );
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const { logout, isAdmin, fullName, user, tenant } = useAuth();
  const { unreadCount } = useNotificationStore();

  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-electric-500 to-neon-500 rounded-xl flex items-center justify-center shadow-electric">
            <Zap size={18} className="text-dark-bg" fill="currentColor" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-none">
              {tenant?.name ?? 'myGYM'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">Fitness con IA</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        {filteredItems.map((item) => (
          <NavItemComponent key={item.path} item={item} unreadCount={unreadCount} />
        ))}
      </nav>

      {/* Active workout indicator */}
      {/* User section */}
      <div className="p-4 border-t border-dark-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
            {user?.profile.avatar ? (
              <img
                src={user.profile.avatar}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-electric-500/30 to-neon-500/30 flex items-center justify-center">
                <span className="text-sm font-bold text-electric-400">
                  {fullName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{fullName}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all duration-200 border border-transparent hover:border-danger/20"
        >
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-dark-card border-r border-dark-border z-50 overflow-hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-dark-card border-r border-dark-border overflow-hidden fixed top-0 left-0 bottom-0 z-30">
      {sidebarContent}
    </aside>
  );
}

export default Sidebar;

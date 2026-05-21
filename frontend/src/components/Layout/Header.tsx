import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, X, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/Notifications/NotificationBell';

interface HeaderProps {
  onMenuClick: () => void;
}

function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/exercises?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-hover rounded-xl transition-all"
          title="Buscar"
        >
          <Search size={20} />
        </button>
      ) : (
        <AnimatePresence>
          <motion.form
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-dark-elevated border border-dark-border rounded-xl px-3 py-2"
          >
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ejercicios..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
            />
            <button
              type="button"
              onClick={() => { setIsOpen(false); setQuery(''); }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.form>
        </AnimatePresence>
      )}
    </div>
  );
}

export function Header({ onMenuClick }: HeaderProps) {
  const { fullName, user, tenant } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 bg-dark-bg/80 backdrop-blur-md border-b border-dark-border">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Mobile menu + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-dark-hover rounded-xl transition-all"
          >
            <Menu size={22} />
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-electric-500 to-neon-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-dark-bg" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-white">
              {tenant?.name ?? 'myGYM'}
            </span>
          </div>
        </div>

        {/* Right: Search + notifications + user */}
        <div className="flex items-center gap-2">
          <SearchBar />
          <NotificationBell />

          {/* User avatar */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1.5 hover:bg-dark-hover rounded-xl transition-all"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              {user?.profile.avatar ? (
                <img
                  src={user.profile.avatar}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-electric-500/30 to-neon-500/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-electric-400">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-medium text-white leading-none">{fullName}</div>
              <div className="text-xs text-gray-500 mt-0.5 capitalize">
                {user?.role === 'admin' ? 'Administrador' : user?.role === 'trainer' ? 'Entrenador' : 'Miembro'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

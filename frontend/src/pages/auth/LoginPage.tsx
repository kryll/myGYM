import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/UI/Button';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-electric-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-neon-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-500/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-card-hover">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-electric-500 to-neon-500 rounded-2xl flex items-center justify-center shadow-electric mb-4"
            >
              <Zap size={32} className="text-dark-bg" fill="currentColor" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-white">myGYM</h1>
            <p className="text-gray-400 text-sm mt-1">Tu entrenador personal con IA</p>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Bienvenido de nuevo</h2>
            <p className="text-sm text-gray-400 mt-1">Inicia sesión en tu cuenta</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 focus:ring-1 focus:ring-electric-500/30 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 focus:ring-1 focus:ring-electric-500/30 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs text-electric-400 hover:text-electric-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Iniciar sesión
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-dark-border" />
            <span className="text-xs text-gray-600">o continúa con</span>
            <div className="flex-1 h-px bg-dark-border" />
          </div>

          {/* Social login placeholder */}
          <div className="grid grid-cols-2 gap-3">
            {['Google', 'Apple'].map((provider) => (
              <button
                key={provider}
                type="button"
                disabled
                className="flex items-center justify-center gap-2 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-sm text-gray-400 opacity-50 cursor-not-allowed"
              >
                {provider}
              </button>
            ))}
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="text-electric-400 hover:text-electric-300 font-medium transition-colors"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Entrenador IA', desc: 'Powered by Claude' },
            { label: 'Báscula Mi', desc: 'Bluetooth sync' },
            { label: 'Amazfit', desc: 'Smartwatch ready' },
          ].map((f) => (
            <div
              key={f.label}
              className="text-center p-3 rounded-2xl bg-dark-card border border-dark-border"
            >
              <p className="text-xs font-medium text-electric-400">{f.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/UI/Button';

const fitnessLevels = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    fitnessLevel: 'beginner',
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register({
        email: form.email,
        password: form.password,
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
      });
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-neon-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-electric-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-dark-card border border-dark-border rounded-3xl p-8 shadow-card-hover">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-electric-500 to-neon-500 rounded-2xl flex items-center justify-center shadow-electric mb-3">
              <Zap size={28} className="text-dark-bg" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Crea tu cuenta</h1>
            <p className="text-gray-400 text-sm mt-1">Únete a myGYM gratis</p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s
                      ? 'bg-electric-500 text-dark-bg'
                      : 'bg-dark-elevated border border-dark-border text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 2 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full transition-all ${
                      step > s ? 'bg-electric-500' : 'bg-dark-border'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
            <span className="text-xs text-gray-500 ml-2">
              {step === 1 ? 'Datos básicos' : 'Tu perfil fitness'}
            </span>
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

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => update('firstName', e.target.value)}
                      placeholder="Carlos"
                      required
                      className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => update('lastName', e.target.value)}
                      placeholder="García"
                      required
                      className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => update('username', e.target.value)}
                      placeholder="carlos_fit"
                      required
                      className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="Mín. 8 caracteres"
                      required
                      minLength={8}
                      className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-9 pr-10 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight size={18} />}
                  disabled={!form.email || !form.password || !form.username || !form.firstName}
                >
                  Siguiente
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Nivel de experiencia fitness
                  </label>
                  <div className="space-y-2">
                    {fitnessLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => update('fitnessLevel', level.value)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                          form.fitnessLevel === level.value
                            ? 'border-electric-500/50 bg-electric-500/10 text-white'
                            : 'border-dark-border bg-dark-elevated text-gray-400 hover:border-dark-muted'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            form.fitnessLevel === level.value
                              ? 'border-electric-500 bg-electric-500'
                              : 'border-dark-muted'
                          }`}
                        />
                        <span className="text-sm font-medium">{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Al registrarte aceptas nuestros{' '}
                  <span className="text-electric-400">Términos de Servicio</span> y{' '}
                  <span className="text-electric-400">Política de Privacidad</span>
                </p>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setStep(1)}
                    variant="ghost"
                    size="lg"
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex-1"
                    isLoading={isLoading}
                    rightIcon={<Zap size={18} />}
                  >
                    Crear cuenta
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-electric-400 hover:text-electric-300 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

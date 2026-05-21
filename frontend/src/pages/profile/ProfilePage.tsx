import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Scale, Dumbbell, Cpu, Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { Badge } from '@/components/UI/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, fullName, tenant } = useAuth();
  const { latest } = useBodyMeasurements();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.profile.firstName ?? '',
    lastName: user?.profile.lastName ?? '',
    phone: user?.profile.phone ?? '',
    bio: user?.profile.bio ?? '',
  });

  const fitnessLevelLabel = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  const roleLabel = {
    admin: 'Administrador',
    trainer: 'Entrenador',
    member: 'Miembro',
  };

  const avatarInitial = fullName.charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold text-white">Mi Perfil</h1>

      {/* Avatar & basic info */}
      <Card padding="md">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-electric-500/30 to-neon-500/30 border-2 border-electric-500/30 flex items-center justify-center">
              {user?.profile.avatar ? (
                <img src={user.profile.avatar} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-display font-bold text-electric-400">{avatarInitial}</span>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-white">{fullName}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="primary">{roleLabel[user?.role ?? 'member']}</Badge>
              {user?.profile.fitnessLevel && (
                <Badge variant="default">
                  {fitnessLevelLabel[user.profile.fitnessLevel]}
                </Badge>
              )}
              {tenant && <Badge variant="info">{tenant.name}</Badge>}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={isEditing ? <X size={16} /> : <Edit3 size={16} />}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>
      </Card>

      {/* Edit form */}
      {isEditing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="md">
            <h3 className="text-sm font-semibold text-white mb-4">Editar perfil</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-electric-500/70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Apellido</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                    className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-electric-500/70"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-electric-500/70"
                  placeholder="+34 600 000 000"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-electric-500/70 resize-none"
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>
              <Button variant="primary" size="md" leftIcon={<Save size={16} />} onClick={() => setIsEditing(false)}>
                Guardar cambios
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-white mb-4">Mi información fitness</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Altura', value: user?.profile.height ? `${user.profile.height} cm` : '--', icon: Scale },
            { label: 'Fecha de nacimiento', value: user?.profile.dateOfBirth
              ? format(new Date(user.profile.dateOfBirth), 'dd/MM/yyyy')
              : '--', icon: Calendar },
            { label: 'Género', value: user?.profile.gender === 'male' ? 'Masculino' : user?.profile.gender === 'female' ? 'Femenino' : '--', icon: User },
            { label: 'Peso actual', value: latest?.weight ? `${latest.weight.toFixed(1)} kg` : '--', icon: Scale },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 bg-dark-elevated rounded-xl border border-dark-border">
              <item.icon size={16} className="text-electric-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-medium text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick links */}
      <Card padding="none">
        <div className="divide-y divide-dark-border">
          {[
            { label: 'Gestionar dispositivos', desc: 'Báscula Mi Scale, Amazfit...', icon: Cpu, path: '/profile/devices' },
            { label: 'Historial de entrenamientos', desc: 'Ver todas las sesiones', icon: Dumbbell, path: '/training' },
            { label: 'Evolución de medidas', desc: 'Ver gráficas y estadísticas', icon: Scale, path: '/measurements' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 p-4 hover:bg-dark-hover transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center flex-shrink-0">
                <item.icon size={18} className="text-electric-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

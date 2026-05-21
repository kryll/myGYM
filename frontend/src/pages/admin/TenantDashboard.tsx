import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Settings,
  Users,
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  Star,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/UI/Card';
import { Badge } from '@/components/UI/Badge';
import { Button } from '@/components/UI/Button';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { tenantService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

const planFeatureMap: Record<string, string[]> = {
  free: ['5 usuarios', 'Biblioteca básica de ejercicios', 'Planes predefinidos'],
  basic: ['25 usuarios', 'Biblioteca completa', 'Planes personalizados', 'Notificaciones'],
  premium: ['100 usuarios', 'Entrenador IA', 'Dispositivos Bluetooth', 'Retos y objetivos', 'Analíticas avanzadas'],
  enterprise: ['Ilimitado', 'Marca personalizada', 'API acceso', 'Soporte prioritario', 'Todo Premium'],
};

function StatBox({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className={`p-4 rounded-2xl bg-dark-elevated border border-dark-border`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={16} className="text-white" />
        </div>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
    </div>
  );
}

export default function TenantDashboard() {
  const { tenant, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['tenant', 'members'],
    queryFn: () => tenantService.getMembers(1, 20),
    enabled: isAdmin,
  });

  useQuery({
    queryKey: ['tenant', 'stats'],
    queryFn: () => tenantService.getStats(),
    enabled: isAdmin,
  });

  if (isLoading) return <PageLoader label="Cargando panel..." />;

  const members = membersData?.data ?? [];
  const planFeatures = planFeatureMap[tenant?.plan ?? 'free'] ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-electric-500 to-neon-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-dark-bg" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">
              Panel de Administración
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Gestiona {tenant?.name}</p>
        </div>
        <Badge
          variant={
            tenant?.plan === 'enterprise' ? 'success' :
            tenant?.plan === 'premium' ? 'primary' :
            tenant?.plan === 'basic' ? 'warning' : 'default'
          }
          size="md"
        >
          <Star size={12} className="mr-1" />
          Plan {tenant?.plan?.charAt(0).toUpperCase()}{tenant?.plan?.slice(1)}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-elevated border border-dark-border rounded-xl p-1 w-fit">
        {([
          { key: 'overview', label: 'Resumen', icon: BarChart3 },
          { key: 'members', label: 'Miembros', icon: Users },
          { key: 'settings', label: 'Configuración', icon: Settings },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-electric-500/15 text-electric-400 border border-electric-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox label="Miembros activos" value={membersData?.pagination.total ?? 0} icon={Users} color="bg-electric-500/20" />
            <StatBox label="Plan actual" value={tenant?.plan?.toUpperCase() ?? 'FREE'} icon={Star} color="bg-warning/20" />
            <StatBox label="Max. usuarios" value={tenant?.settings.maxUsers ?? 5} icon={Shield} color="bg-neon-500/20" />
            <StatBox label="Funciones activas" value={tenant?.settings.features.length ?? 0} icon={Zap} color="bg-danger/20" />
          </div>

          {/* Plan features */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-white mb-4">Características de tu plan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {planFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-neon-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            {tenant?.plan !== 'enterprise' && (
              <div className="mt-4 pt-4 border-t border-dark-border">
                <Button variant="primary" size="sm" leftIcon={<TrendingUp size={16} />}>
                  Actualizar plan
                </Button>
              </div>
            )}
          </Card>

          {/* Feature toggles */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-white mb-4">Estado de funcionalidades</h3>
            <div className="space-y-3">
              {[
                { label: 'Entrenador IA', key: 'allowAI', enabled: tenant?.settings.allowAI ?? false },
                { label: 'Dispositivos Bluetooth', key: 'allowBluetooth', enabled: tenant?.settings.allowBluetooth ?? false },
                { label: 'Retos y Competiciones', key: 'allowChallenges', enabled: tenant?.settings.allowChallenges ?? false },
                { label: 'Marca personalizada', key: 'customBranding', enabled: tenant?.settings.customBranding ?? false },
              ].map((feature) => (
                <div key={feature.key} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                  <span className="text-sm text-gray-300">{feature.label}</span>
                  <div className="flex items-center gap-2">
                    {feature.enabled ? (
                      <CheckCircle size={18} className="text-neon-400" />
                    ) : (
                      <XCircle size={18} className="text-gray-600" />
                    )}
                    <span className={`text-xs ${feature.enabled ? 'text-neon-400' : 'text-gray-600'}`}>
                      {feature.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card padding="none">
            <div className="p-5 border-b border-dark-border flex items-center justify-between">
              <div>
                <CardTitle>Miembros</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  {membersData?.pagination.total ?? 0} de {tenant?.settings.maxUsers ?? 5} max.
                </p>
              </div>
              <Button variant="primary" size="sm" leftIcon={<Users size={16} />}>
                Invitar miembro
              </Button>
            </div>
            <div className="divide-y divide-dark-border">
              {members.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Sin miembros registrados</p>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-4">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-dark-elevated border border-dark-border flex items-center justify-center flex-shrink-0">
                      {member.profile.avatar ? (
                        <img src={member.profile.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-electric-400">
                          {member.profile.firstName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {member.profile.firstName} {member.profile.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    <Badge
                      variant={member.role === 'admin' ? 'danger' : member.role === 'trainer' ? 'warning' : 'default'}
                      size="xs"
                    >
                      {member.role === 'admin' ? 'Admin' : member.role === 'trainer' ? 'Entrenador' : 'Miembro'}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-neon-500' : 'bg-gray-600'}`} />
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card padding="md">
            <h3 className="text-sm font-semibold text-white mb-4">Configuración del centro</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Nombre del centro</label>
                <input
                  type="text"
                  defaultValue={tenant?.name}
                  className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-electric-500/70"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Slug (URL)</label>
                <input
                  type="text"
                  defaultValue={tenant?.slug}
                  disabled
                  className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-gray-500 text-sm cursor-not-allowed"
                />
              </div>
              <Button variant="primary" size="md">
                Guardar cambios
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

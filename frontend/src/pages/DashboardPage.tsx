import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  Dumbbell,
  Trophy,
  Target,
  ArrowRight,
  Play,
  Bot,
  Scale,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { Card, CardTitle } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { ProgressBar } from '@/components/UI/ProgressBar';
import { Badge } from '@/components/UI/Badge';
import { WeightChart } from '@/components/Charts/WeightChart';
import { WorkoutFrequencyChart } from '@/components/Charts/WorkoutFrequencyChart';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { dashboardService } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useBodyMeasurements } from '@/hooks/useBodyMeasurements';
import { useWorkout } from '@/hooks/useWorkout';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  color = 'electric',
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  trend?: number;
  color?: 'electric' | 'neon' | 'warning' | 'danger';
}) {
  const colorMap = {
    electric: { bg: 'bg-electric-500/10', text: 'text-electric-400', border: 'border-electric-500/20' },
    neon: { bg: 'bg-neon-500/10', text: 'text-neon-400', border: 'border-neon-500/20' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
    danger: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
  };
  const c = colorMap[color];

  return (
    <motion.div variants={itemVariants}>
      <Card padding="md">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
            <Icon size={20} className={c.text} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-neon-400' : 'text-danger'}`}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <div className="flex items-end gap-1">
            <span className="text-2xl font-display font-bold text-white">{value}</span>
            {unit && <span className="text-sm text-gray-400 mb-0.5">{unit}</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { fullName, user } = useAuth();
  const { weightData, latest, weightChange } = useBodyMeasurements();
  const { activeSession } = useWorkout();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const { data: recentWorkoutsData } = useQuery({
    queryKey: ['dashboard', 'recent-workouts'],
    queryFn: () => dashboardService.getRecentWorkouts(3),
  });

  const { data: aiTipData } = useQuery({
    queryKey: ['dashboard', 'ai-tip'],
    queryFn: () => dashboardService.getAITip(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const stats = statsData?.data;
  const recentWorkouts = recentWorkoutsData?.data ?? [];
  const aiTip = aiTipData?.data;

  if (statsLoading) return <PageLoader label="Cargando panel..." />;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {greeting()}, {user?.profile.firstName ?? fullName.split(' ')[0]}!
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeSession
              ? 'Tienes un entrenamiento activo en progreso'
              : 'Listo para entrenar hoy?'}
          </p>
        </div>
        {stats?.currentStreak && stats.currentStreak > 0 ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/20 rounded-xl">
            <Flame size={18} className="text-warning" />
            <span className="text-sm font-bold text-warning">{stats.currentStreak} días</span>
          </div>
        ) : null}
      </motion.div>

      {/* Active workout banner */}
      {activeSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-electric-500/15 to-neon-500/10 border border-electric-500/30 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-electric-500/20 rounded-xl flex items-center justify-center">
              <Dumbbell size={20} className="text-electric-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{activeSession.name}</p>
              <p className="text-xs text-electric-400">Entrenamiento en progreso</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/workout/active')}
            variant="primary"
            size="sm"
            leftIcon={<Play size={16} fill="currentColor" />}
          >
            Continuar
          </Button>
        </motion.div>
      )}

      {/* Stats grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          label="Entrenamientos totales"
          value={stats?.totalWorkouts ?? 0}
          icon={Dumbbell}
          color="electric"
        />
        <StatCard
          label="Esta semana"
          value={stats?.workoutsThisWeek ?? 0}
          icon={Calendar}
          color="neon"
        />
        <StatCard
          label="Volumen total"
          value={stats?.totalVolume ? Math.round(stats.totalVolume / 1000) : 0}
          unit="t"
          icon={TrendingUp}
          color="warning"
        />
        <StatCard
          label="Retos activos"
          value={stats?.activeChallenges ?? 0}
          icon={Trophy}
          color="danger"
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={itemVariants} initial="hidden" animate="show">
        <Card padding="none">
          <div className="p-5 border-b border-dark-border">
            <CardTitle>Acciones rápidas</CardTitle>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y divide-dark-border sm:divide-y-0">
            {[
              { label: 'Entrenar ahora', icon: Play, path: '/training', color: 'electric', primary: true },
              { label: 'Entrenador IA', icon: Bot, path: '/ai-coach', color: 'neon' },
              { label: 'Añadir medida', icon: Scale, path: '/measurements/add', color: 'warning' },
              { label: 'Ver retos', icon: Trophy, path: '/challenges', color: 'danger' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-5 hover:bg-dark-hover transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${
                    action.primary
                      ? 'bg-gradient-to-br from-electric-500 to-neon-500 shadow-electric'
                      : `bg-${action.color}-500/10 border border-${action.color}-500/20`
                  }`}
                >
                  <action.icon
                    size={20}
                    className={action.primary ? 'text-dark-bg' : `text-${action.color}-400`}
                    fill={action.primary ? 'currentColor' : 'none'}
                  />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weight chart - 2 cols */}
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-2">
          <Card padding="none">
            <div className="p-5 border-b border-dark-border flex items-center justify-between">
              <div>
                <CardTitle>Evolución del peso</CardTitle>
                {latest?.weight && (
                  <p className="text-sm text-gray-400 mt-0.5">
                    Actual: <span className="text-white font-semibold">{latest.weight.toFixed(1)} kg</span>
                    {weightChange !== 0 && (
                      <span className={`ml-2 text-xs ${weightChange < 0 ? 'text-neon-400' : 'text-danger'}`}>
                        {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                      </span>
                    )}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/measurements')}
                rightIcon={<ArrowRight size={14} />}
              >
                Ver todo
              </Button>
            </div>
            <div className="p-5">
              <WeightChart data={weightData.slice(-30)} height={240} />
              {weightData.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Scale size={40} className="text-gray-600" />
                  <p className="text-sm text-gray-500">Sin medidas registradas</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/measurements/add')}
                  >
                    Añadir primera medida
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Sidebar cards - 1 col */}
        <div className="space-y-6">
          {/* AI Tip */}
          {aiTip && (
            <motion.div variants={itemVariants} initial="hidden" animate="show">
              <Card glow glowColor="blue" padding="md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-electric-500/30 to-neon-500/30 rounded-lg flex items-center justify-center">
                    <Bot size={14} className="text-electric-400" />
                  </div>
                  <span className="text-sm font-medium text-electric-400">Consejo IA</span>
                  <Badge variant="primary" size="xs">Claude</Badge>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{aiTip.tip}</p>
                <button
                  onClick={() => navigate('/ai-coach')}
                  className="mt-3 flex items-center gap-1.5 text-xs text-electric-400 hover:text-electric-300 transition-colors"
                >
                  Habla con tu entrenador IA
                  <ArrowRight size={12} />
                </button>
              </Card>
            </motion.div>
          )}

          {/* Goals progress */}
          <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card padding="none">
              <div className="p-4 border-b border-dark-border flex items-center justify-between">
                <CardTitle>Mis objetivos</CardTitle>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => navigate('/goals')}
                  rightIcon={<ArrowRight size={12} />}
                >
                  Ver
                </Button>
              </div>
              <div className="p-4 space-y-4">
                {[
                  { label: 'Bajar de peso', current: 72, target: 68, unit: 'kg', color: 'electric' as const },
                  { label: 'Fuerza en press banca', current: 85, target: 100, unit: 'kg', color: 'neon' as const },
                  { label: 'Días entrenados', current: stats?.workoutsThisWeek ?? 0, target: 5, unit: 'días/sem', color: 'warning' as const },
                ].map((goal) => (
                  <div key={goal.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-300">{goal.label}</span>
                      <span className="text-xs text-gray-500">
                        {goal.current}/{goal.target} {goal.unit}
                      </span>
                    </div>
                    <ProgressBar
                      value={goal.current}
                      max={goal.target}
                      size="sm"
                      color={goal.color}
                    />
                  </div>
                ))}
                {stats?.goalsAchieved ? (
                  <div className="flex items-center gap-2 pt-2 border-t border-dark-border">
                    <Target size={14} className="text-neon-400" />
                    <span className="text-xs text-neon-400">
                      {stats.goalsAchieved} objetivo{stats.goalsAchieved !== 1 ? 's' : ''} conseguido{stats.goalsAchieved !== 1 ? 's' : ''}
                    </span>
                  </div>
                ) : null}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Workout frequency + recent workouts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Frequency chart */}
        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <Card padding="none">
            <div className="p-5 border-b border-dark-border">
              <CardTitle>Frecuencia de entrenamiento</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Últimas 8 semanas</p>
            </div>
            <div className="p-5">
              <WorkoutFrequencyChart data={[]} height={180} weeks={8} />
            </div>
          </Card>
        </motion.div>

        {/* Recent workouts */}
        <motion.div variants={itemVariants} initial="hidden" animate="show">
          <Card padding="none">
            <div className="p-5 border-b border-dark-border flex items-center justify-between">
              <CardTitle>Últimos entrenamientos</CardTitle>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => navigate('/training')}
                rightIcon={<ArrowRight size={12} />}
              >
                Ver historial
              </Button>
            </div>
            <div className="divide-y divide-dark-border">
              {recentWorkouts.length === 0 ? (
                <div className="p-8 text-center">
                  <Dumbbell size={36} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin entrenamientos recientes</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate('/training')}
                  >
                    Empezar a entrenar
                  </Button>
                </div>
              ) : (
                recentWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center gap-3 p-4 hover:bg-dark-hover transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center flex-shrink-0">
                      <Dumbbell size={16} className="text-electric-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{workout.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(workout.startedAt), { addSuffix: true, locale: es })}
                        {workout.duration && ` • ${Math.round(workout.duration / 60)} min`}
                      </p>
                    </div>
                    {workout.isCompleted && (
                      <Badge variant="success" size="xs">Completado</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

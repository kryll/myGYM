import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Search, Home, Building2, Star, Users, Clock } from 'lucide-react';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { Badge, DifficultyBadge, EnvironmentBadge } from '@/components/UI/Badge';
import { ProgressBar } from '@/components/UI/ProgressBar';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { planService } from '@/services/api';
import type { TrainingPlan, PlanGoal, PlanDifficulty, PlanEnvironment } from '@/types';

const goalLabels: Record<PlanGoal, string> = {
  weight_loss: 'Pérdida de peso',
  muscle_gain: 'Ganancia muscular',
  endurance: 'Resistencia',
  flexibility: 'Flexibilidad',
  strength: 'Fuerza',
  general_fitness: 'Fitness general',
};

const goalVariants: Record<PlanGoal, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  weight_loss: 'danger',
  muscle_gain: 'success',
  endurance: 'warning',
  flexibility: 'info',
  strength: 'primary',
  general_fitness: 'default',
};

function PlanCard({ plan }: { plan: TrainingPlan }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => navigate(`/training/${plan.id}`)}
      className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden cursor-pointer hover:border-electric-500/20 hover:shadow-card-hover transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-video bg-dark-elevated">
        {plan.imageUrl ? (
          <img src={plan.imageUrl} alt={plan.nameEs ?? plan.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ClipboardList size={40} className="text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <DifficultyBadge difficulty={plan.difficulty} />
          {plan.isPremium && (
            <Badge variant="warning" size="sm">
              <Star size={10} className="mr-0.5" /> Premium
            </Badge>
          )}
        </div>

        {/* Bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <Badge variant={goalVariants[plan.goal]}>
            {goalLabels[plan.goal]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">
          {plan.nameEs ?? plan.name}
        </h3>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
          {plan.descriptionEs ?? plan.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {plan.durationWeeks} semanas
          </span>
          <span>{plan.workoutsPerWeek}x/semana</span>
          <span>{plan.estimatedMinutes} min/sesión</span>
        </div>

        <div className="flex items-center justify-between">
          <EnvironmentBadge environment={plan.environment} />
          {plan.enrolledCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Users size={12} />
              {plan.enrolledCount.toLocaleString()}
            </span>
          )}
        </div>

        {plan.rating && (
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={star <= Math.round(plan.rating!) ? 'text-warning fill-warning' : 'text-gray-600'}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">{plan.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TrainingPlansPage() {
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState<PlanEnvironment | ''>('');
  const [diffFilter, setDiffFilter] = useState<PlanDifficulty | ''>('');
  const [goalFilter, setGoalFilter] = useState<PlanGoal | ''>('');

  const filters = {
    search: search || undefined,
    environment: envFilter || undefined,
    difficulty: diffFilter || undefined,
    goal: goalFilter || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['plans', filters],
    queryFn: () => planService.getAll(filters, 1, 24),
  });

  const { data: enrollmentData } = useQuery({
    queryKey: ['plans', 'enrollment'],
    queryFn: () => planService.getEnrollment(),
  });

  const plans = data?.data ?? [];
  const enrollment = enrollmentData?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Planes de Entrenamiento</h1>
        <p className="text-gray-400 text-sm mt-1">
          Planes estructurados para todos los niveles
        </p>
      </div>

      {/* Active plan banner */}
      {enrollment && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-electric-500/5 border border-electric-500/20 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-electric-400 font-medium uppercase tracking-wider mb-0.5">Plan activo</p>
              <h3 className="text-base font-semibold text-white">{enrollment.plan?.name}</h3>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => { /* navigate to active plan */ }}
            >
              Continuar
            </Button>
          </div>
          <ProgressBar
            value={enrollment.completedWorkouts}
            max={enrollment.totalWorkouts}
            showValue
            label={`Semana ${enrollment.currentWeek} • ${enrollment.completedWorkouts}/${enrollment.totalWorkouts} sesiones`}
            color="electric"
          />
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-40">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar planes..."
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-9 pr-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 text-sm"
          />
        </div>

        {/* Environment filter */}
        <div className="flex items-center gap-1 bg-dark-card border border-dark-border rounded-xl p-1">
          {([
            { value: '', label: 'Todos', icon: null },
            { value: 'gym', label: 'Gym', icon: Building2 },
            { value: 'home', label: 'Casa', icon: Home },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setEnvFilter(opt.value as PlanEnvironment | '')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                envFilter === opt.value
                  ? 'bg-electric-500/15 text-electric-400 border border-electric-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {opt.icon && <opt.icon size={14} />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plans grid */}
      {isLoading ? (
        <PageLoader label="Cargando planes..." />
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <ClipboardList size={48} className="text-gray-600" />
          <p className="text-gray-400">No se encontraron planes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PlanCard plan={plan} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

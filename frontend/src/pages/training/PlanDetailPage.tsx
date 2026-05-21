import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Play,
  Clock,
  Calendar,
  Users,
  Star,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Badge, DifficultyBadge, EnvironmentBadge } from '@/components/UI/Badge';
import { Card } from '@/components/UI/Card';
import { ProgressBar } from '@/components/UI/ProgressBar';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { planService } from '@/services/api';
import { ExerciseCard } from '@/components/Workout/ExerciseCard';

const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const goalLabels: Record<string, string> = {
  weight_loss: 'Pérdida de peso', muscle_gain: 'Ganancia muscular',
  endurance: 'Resistencia', flexibility: 'Flexibilidad',
  strength: 'Fuerza', general_fitness: 'Fitness general',
};

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedWeek, setExpandedWeek] = useState(1);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['plan', id],
    queryFn: () => planService.getById(id!),
    enabled: !!id,
  });

  const { data: enrollmentData } = useQuery({
    queryKey: ['plans', 'enrollment'],
    queryFn: () => planService.getEnrollment(),
  });

  const enrollMutation = useMutation({
    mutationFn: () => planService.enroll(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'enrollment'] });
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: () => planService.unenroll(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'enrollment'] });
    },
  });

  const plan = data?.data;
  const enrollment = enrollmentData?.data;
  const isEnrolled = enrollment?.planId === id;

  if (isLoading) return <PageLoader label="Cargando plan..." />;
  if (!plan) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <AlertCircle size={48} className="text-danger" />
        <p className="text-gray-400">Plan no encontrado</p>
        <Button variant="outline" onClick={() => navigate('/training')}>Volver</Button>
      </div>
    );
  }

  // Group workouts by week
  const workoutsByWeek = plan.workouts.reduce((acc, w) => {
    if (!acc[w.weekNumber]) acc[w.weekNumber] = [];
    acc[w.weekNumber].push(w);
    return acc;
  }, {} as Record<number, typeof plan.workouts>);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft size={16} />}>
        Volver
      </Button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-dark-elevated border border-dark-border">
        <div className="aspect-[16/6]">
          {plan.imageUrl ? (
            <img src={plan.imageUrl} alt={plan.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell size={64} className="text-gray-600" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/90 via-dark-bg/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DifficultyBadge difficulty={plan.difficulty} />
            <EnvironmentBadge environment={plan.environment} />
            <Badge variant="default">{goalLabels[plan.goal]}</Badge>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">{plan.nameEs ?? plan.name}</h1>
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        {isEnrolled ? (
          <>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play size={18} fill="currentColor" />}
              className="flex-1"
              onClick={() => navigate('/workout/active')}
            >
              Continuar plan
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={() => unenrollMutation.mutate()}
              isLoading={unenrollMutation.isPending}
            >
              Abandonar
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Play size={18} fill="currentColor" />}
            onClick={() => enrollMutation.mutate()}
            isLoading={enrollMutation.isPending}
          >
            Iniciar este plan
          </Button>
        )}
      </div>

      {/* Enrollment progress */}
      {isEnrolled && enrollment && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Tu progreso</h3>
            <Badge variant="primary" dot>En progreso</Badge>
          </div>
          <ProgressBar
            value={enrollment.completedWorkouts}
            max={enrollment.totalWorkouts}
            showValue
            label={`${enrollment.completedWorkouts} de ${enrollment.totalWorkouts} sesiones completadas`}
            color="electric"
          />
          <p className="text-xs text-gray-500 mt-2">
            Semana {enrollment.currentWeek} de {plan.durationWeeks}
          </p>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Duración', value: `${plan.durationWeeks} semanas`, icon: Calendar },
          { label: 'Frecuencia', value: `${plan.workoutsPerWeek}x/semana`, icon: Calendar },
          { label: 'Por sesión', value: `${plan.estimatedMinutes} min`, icon: Clock },
          { label: 'Participantes', value: plan.enrolledCount.toLocaleString(), icon: Users },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-elevated border border-dark-border rounded-xl p-3 text-center">
            <stat.icon size={18} className="text-electric-400 mx-auto mb-1" />
            <p className="text-base font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <Card padding="md">
        <h2 className="text-base font-semibold text-white mb-3">Descripción</h2>
        <p className="text-sm text-gray-300 leading-relaxed">{plan.descriptionEs ?? plan.description}</p>
        {plan.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {plan.tags.map((tag) => (
              <Badge key={tag} variant="default" size="xs">#{tag}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Weekly schedule */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Plan semanal</h2>
        <div className="space-y-3">
          {Array.from({ length: plan.durationWeeks }, (_, i) => i + 1).map((week) => {
            const weekWorkouts = workoutsByWeek[week] ?? [];
            const isCurrentWeek = isEnrolled && enrollment?.currentWeek === week;

            return (
              <div
                key={week}
                className={`border rounded-2xl overflow-hidden transition-all ${
                  isCurrentWeek ? 'border-electric-500/30 bg-electric-500/3' : 'border-dark-border bg-dark-card'
                }`}
              >
                <button
                  onClick={() => setExpandedWeek(expandedWeek === week ? 0 : week)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    {isCurrentWeek && (
                      <div className="w-2 h-2 bg-electric-500 rounded-full animate-pulse" />
                    )}
                    <span className="font-medium text-white">Semana {week}</span>
                    <span className="text-xs text-gray-500">{weekWorkouts.length} sesiones</span>
                  </div>
                  {expandedWeek === week ? (
                    <ChevronDown size={18} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={18} className="text-gray-400" />
                  )}
                </button>

                {expandedWeek === week && weekWorkouts.length > 0 && (
                  <div className="px-4 pb-4 space-y-2">
                    {weekWorkouts.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((workout) => {
                      const dayKey = `${week}-${workout.dayOfWeek}`;
                      const isExpanded = expandedDay === dayKey;

                      return (
                        <div key={workout.id} className="bg-dark-elevated border border-dark-border rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedDay(isExpanded ? null : dayKey)}
                            className="w-full flex items-center justify-between p-3 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-dark-muted flex items-center justify-center text-xs font-bold text-gray-400">
                                {dayNames[workout.dayOfWeek - 1] ?? `D${workout.dayOfWeek}`}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{workout.nameEs ?? workout.name}</p>
                                <p className="text-xs text-gray-500">
                                  {workout.exercises.length} ejercicios • {workout.estimatedMinutes} min
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              size={14}
                              className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            />
                          </button>

                          {isExpanded && workout.exercises.length > 0 && (
                            <div className="px-3 pb-3 space-y-2">
                              {workout.exercises.map((we) => (
                                <div key={we.id} className="flex items-center gap-3 p-2 bg-dark-card rounded-lg">
                                  <div className="w-6 h-6 rounded bg-electric-500/10 flex items-center justify-center text-xs font-bold text-electric-400">
                                    {we.order}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-white">
                                      {we.exercise?.nameEs ?? we.exercise?.name ?? 'Ejercicio'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {we.sets} × {we.reps ?? `${we.duration}s`} • {we.rest}s descanso
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

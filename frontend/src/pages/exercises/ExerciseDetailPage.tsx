import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Play,
  Dumbbell,
  Clock,
  BarChart3,
  CheckCircle,
  Lightbulb,
  Video,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { Badge, DifficultyBadge } from '@/components/UI/Badge';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { Card } from '@/components/UI/Card';
import { exerciseService } from '@/services/api';
import { useWorkout } from '@/hooks/useWorkout';

const muscleGroupLabels: Record<string, string> = {
  chest: 'Pecho', back: 'Espalda', shoulders: 'Hombros', biceps: 'Bíceps',
  triceps: 'Tríceps', forearms: 'Antebrazos', core: 'Core', glutes: 'Glúteos',
  quadriceps: 'Cuádriceps', hamstrings: 'Isquiotibiales', calves: 'Pantorrillas',
  full_body: 'Cuerpo completo', cardio: 'Cardio',
};

const equipmentLabels: Record<string, string> = {
  barbell: 'Barra olímpica', dumbbell: 'Mancuernas', kettlebell: 'Kettlebell',
  cable: 'Polea cable', machine: 'Máquina', bodyweight: 'Peso corporal',
  resistance_band: 'Banda elástica', pull_up_bar: 'Barra dominadas',
  bench: 'Banco', none: 'Sin equipo',
};

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const { activeSession, addExercise } = useWorkout();

  const { data, isLoading, error } = useQuery({
    queryKey: ['exercise', id],
    queryFn: () => exerciseService.getById(id!),
    enabled: !!id,
  });

  const exercise = data?.data;

  if (isLoading) return <PageLoader label="Cargando ejercicio..." />;

  if (error || !exercise) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={48} className="text-danger" />
        <div className="text-center">
          <p className="text-lg font-medium text-white">Ejercicio no encontrado</p>
          <p className="text-sm text-gray-400 mt-1">No pudimos cargar este ejercicio</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/exercises')}>
          Volver a ejercicios
        </Button>
      </div>
    );
  }

  const handleAddToWorkout = () => {
    addExercise(exercise);
    navigate('/workout/active');
  };

  const handleStartWorkout = () => {
    navigate('/training');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        leftIcon={<ArrowLeft size={16} />}
      >
        Volver
      </Button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-dark-elevated border border-dark-border">
        <div className="aspect-video">
          {showVideo && exercise.videoUrl ? (
            <video
              src={exercise.videoUrl}
              autoPlay
              loop
              muted
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            exercise.imageUrl ? (
              <img
                src={exercise.imageUrl}
                alt={exercise.nameEs ?? exercise.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Dumbbell size={64} className="text-gray-600" />
              </div>
            )
          )}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent pointer-events-none" />

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DifficultyBadge difficulty={exercise.difficulty} />
                {exercise.equipment.slice(0, 2).map((eq) => (
                  <Badge key={eq} variant="default" size="sm">{equipmentLabels[eq]}</Badge>
                ))}
              </div>
              <h1 className="text-2xl font-display font-bold text-white">
                {exercise.nameEs ?? exercise.name}
              </h1>
            </div>

            {/* Video button */}
            {exercise.videoUrl && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  showVideo
                    ? 'bg-electric-500/20 border-electric-500/40 text-electric-400'
                    : 'bg-dark-card/80 border-dark-border text-gray-300 hover:text-white'
                }`}
              >
                {showVideo ? <Video size={16} /> : <Play size={16} />}
                {showVideo ? 'Foto' : 'Ver vídeo'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {activeSession ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToWorkout}
            leftIcon={<Play size={18} fill="currentColor" />}
            className="flex-1"
          >
            Añadir al entrenamiento activo
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleStartWorkout}
            leftIcon={<Play size={18} fill="currentColor" />}
            className="flex-1"
          >
            Empezar entrenamiento
          </Button>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - instructions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card padding="md">
            <h2 className="text-base font-semibold text-white mb-3">Descripción</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {exercise.descriptionEs ?? exercise.description}
            </p>
          </Card>

          {/* Instructions */}
          {(exercise.instructionsEs ?? exercise.instructions).length > 0 && (
            <Card padding="md">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-electric-400" />
                Instrucciones paso a paso
              </h2>
              <ol className="space-y-3">
                {(exercise.instructionsEs ?? exercise.instructions).map((instruction, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-electric-500/15 border border-electric-500/30 flex items-center justify-center text-xs font-bold text-electric-400 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{instruction}</p>
                  </motion.li>
                ))}
              </ol>
            </Card>
          )}

          {/* Tips */}
          {(exercise.tipsEs ?? exercise.tips ?? []).length > 0 && (
            <Card padding="md">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-warning" />
                Consejos y errores comunes
              </h2>
              <ul className="space-y-2">
                {(exercise.tipsEs ?? exercise.tips ?? []).map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-warning mt-0.5 flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Right - details */}
        <div className="space-y-6">
          {/* Muscle info */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-white mb-4">Músculos trabajados</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Principales</p>
                <Badge variant="primary">
                  {muscleGroupLabels[exercise.muscleGroup] ?? exercise.muscleGroup}
                </Badge>
              </div>
              {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Secundarios</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.secondaryMuscles.map((m) => (
                      <Badge key={m} variant="default" size="xs">
                        {muscleGroupLabels[m] ?? m}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Default metrics */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-electric-400" />
              Parámetros recomendados
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Series', value: exercise.metrics.defaultSets, unit: '' },
                { label: 'Repeticiones', value: exercise.metrics.defaultReps, unit: '' },
                { label: 'Duración', value: exercise.metrics.defaultDuration, unit: 's' },
                { label: 'Descanso', value: exercise.metrics.defaultRest, unit: 's' },
              ].filter((m) => m.value).map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{metric.label}</span>
                  <span className="text-sm font-semibold text-white">
                    {metric.value}{metric.unit}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Equipment */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Dumbbell size={16} className="text-electric-400" />
              Equipamiento necesario
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {exercise.equipment.map((eq) => (
                <Badge key={eq} variant="default">
                  {equipmentLabels[eq] ?? eq}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Category */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Clock size={16} className="text-electric-400" />
              Categoría
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="primary">
                {exercise.category === 'strength' ? 'Fuerza' :
                 exercise.category === 'cardio' ? 'Cardio' :
                 exercise.category === 'flexibility' ? 'Flexibilidad' :
                 exercise.category === 'balance' ? 'Equilibrio' :
                 exercise.category === 'plyometric' ? 'Pliométrico' : exercise.category}
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

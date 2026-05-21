import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Dumbbell, Clock, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { DifficultyBadge, Badge } from '@/components/UI/Badge';
import type { Exercise } from '@/types';

const muscleGroupLabels: Record<string, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebrazos',
  core: 'Core',
  glutes: 'Glúteos',
  quadriceps: 'Cuádriceps',
  hamstrings: 'Isquiotibiales',
  calves: 'Pantorrillas',
  full_body: 'Cuerpo completo',
  cardio: 'Cardio',
};

const equipmentLabels: Record<string, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  kettlebell: 'Kettlebell',
  cable: 'Polea',
  machine: 'Máquina',
  bodyweight: 'Peso corporal',
  resistance_band: 'Banda elástica',
  pull_up_bar: 'Barra dominadas',
  bench: 'Banco',
  none: 'Sin equipo',
};

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function ExerciseCard({
  exercise,
  onSelect,
  showActions = true,
  compact = false,
}: ExerciseCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onSelect) {
      onSelect(exercise);
    } else {
      navigate(`/exercises/${exercise.id}`);
    }
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ x: 2 }}
        onClick={handleClick}
        className="flex items-center gap-3 p-3 bg-dark-elevated border border-dark-border rounded-xl cursor-pointer hover:border-electric-500/30 transition-all"
      >
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-dark-muted flex-shrink-0">
          {exercise.thumbnailUrl || exercise.imageUrl ? (
            <img
              src={exercise.thumbnailUrl ?? exercise.imageUrl}
              alt={exercise.nameEs ?? exercise.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dumbbell size={18} className="text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {exercise.nameEs ?? exercise.name}
          </p>
          <p className="text-xs text-gray-500">{muscleGroupLabels[exercise.muscleGroup]}</p>
        </div>
        <ChevronRight size={16} className="text-gray-500 flex-shrink-0" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden group cursor-pointer shadow-card hover:shadow-card-hover hover:border-electric-500/20 transition-all duration-300"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-elevated overflow-hidden">
        {exercise.thumbnailUrl || exercise.imageUrl ? (
          <img
            src={exercise.thumbnailUrl ?? exercise.imageUrl}
            alt={exercise.nameEs ?? exercise.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Dumbbell size={40} className="text-gray-600" />
            <span className="text-xs text-gray-600">Sin imagen</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />

        {/* Difficulty badge */}
        <div className="absolute top-3 left-3">
          <DifficultyBadge difficulty={exercise.difficulty} />
        </div>

        {/* Play button on hover */}
        {showActions && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-electric-500 rounded-full flex items-center justify-center shadow-electric">
              <Play size={20} className="text-dark-bg ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">
          {exercise.nameEs ?? exercise.name}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {exercise.descriptionEs ?? exercise.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="primary" size="xs">
            {muscleGroupLabels[exercise.muscleGroup]}
          </Badge>
          {exercise.equipment.slice(0, 2).map((eq) => (
            <Badge key={eq} variant="default" size="xs">
              {equipmentLabels[eq]}
            </Badge>
          ))}
        </div>

        {/* Metrics */}
        {(exercise.metrics.defaultSets || exercise.metrics.defaultDuration) && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-border">
            {exercise.metrics.defaultSets && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Dumbbell size={12} className="text-electric-500" />
                <span>{exercise.metrics.defaultSets} series</span>
              </div>
            )}
            {exercise.metrics.defaultReps && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <span>{exercise.metrics.defaultReps} reps</span>
              </div>
            )}
            {exercise.metrics.defaultDuration && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock size={12} className="text-electric-500" />
                <span>{exercise.metrics.defaultDuration}s</span>
              </div>
            )}
            {exercise.metrics.defaultRest && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock size={12} className="text-gray-500" />
                <span>{exercise.metrics.defaultRest}s descanso</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ExerciseCard;

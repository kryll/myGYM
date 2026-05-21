import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, X, Dumbbell } from 'lucide-react';
import { ExerciseCard } from '@/components/Workout/ExerciseCard';
import { PageLoader } from '@/components/UI/LoadingSpinner';
import { Button } from '@/components/UI/Button';
import { exerciseService } from '@/services/api';
import type { MuscleGroup, Equipment, ExerciseDifficulty } from '@/types';

const muscleGroups: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'core', label: 'Core' },
  { value: 'glutes', label: 'Glúteos' },
  { value: 'quadriceps', label: 'Cuádriceps' },
  { value: 'hamstrings', label: 'Isquiotibiales' },
  { value: 'calves', label: 'Pantorrillas' },
  { value: 'full_body', label: 'Cuerpo completo' },
  { value: 'cardio', label: 'Cardio' },
];

const equipmentList: { value: Equipment; label: string }[] = [
  { value: 'barbell', label: 'Barra' },
  { value: 'dumbbell', label: 'Mancuernas' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'cable', label: 'Polea' },
  { value: 'machine', label: 'Máquina' },
  { value: 'bodyweight', label: 'Peso corporal' },
  { value: 'resistance_band', label: 'Banda elástica' },
  { value: 'pull_up_bar', label: 'Barra dominadas' },
];

const difficulties: { value: ExerciseDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
];

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${
        selected
          ? 'bg-electric-500/15 text-electric-400 border-electric-500/40'
          : 'bg-dark-elevated text-gray-400 border-dark-border hover:border-dark-muted hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

export default function ExercisesPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | ''>('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExerciseDifficulty | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const filters = {
    search: search || undefined,
    muscleGroup: selectedMuscle || undefined,
    equipment: selectedEquipment || undefined,
    difficulty: selectedDifficulty || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['exercises', filters, page],
    queryFn: () => exerciseService.getAll(filters, page, 20),
  });

  const exercises = data?.data ?? [];
  const pagination = data?.pagination;

  const hasFilters = !!(search || selectedMuscle || selectedEquipment || selectedDifficulty);

  const clearFilters = () => {
    setSearch('');
    setSelectedMuscle('');
    setSelectedEquipment('');
    setSelectedDifficulty('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Biblioteca de Ejercicios</h1>
        <p className="text-gray-400 text-sm mt-1">
          Explora {pagination?.total ?? 0}+ ejercicios con instrucciones detalladas
        </p>
      </div>

      {/* Search & filter bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar ejercicios..."
            className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-electric-500/70 transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          size="md"
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter size={16} />}
        >
          Filtros
          {hasFilters && (
            <span className="ml-1.5 w-5 h-5 bg-electric-500 text-dark-bg text-xs rounded-full flex items-center justify-center font-bold">
              {[selectedMuscle, selectedEquipment, selectedDifficulty].filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasFilters && (
          <Button variant="ghost" size="md" onClick={clearFilters}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4"
        >
          {/* Muscle group */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Grupo muscular
            </p>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map((m) => (
                <FilterChip
                  key={m.value}
                  label={m.label}
                  selected={selectedMuscle === m.value}
                  onClick={() => {
                    setSelectedMuscle(selectedMuscle === m.value ? '' : m.value);
                    setPage(1);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Equipamiento
            </p>
            <div className="flex flex-wrap gap-2">
              {equipmentList.map((e) => (
                <FilterChip
                  key={e.value}
                  label={e.label}
                  selected={selectedEquipment === e.value}
                  onClick={() => {
                    setSelectedEquipment(selectedEquipment === e.value ? '' : e.value);
                    setPage(1);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Dificultad
            </p>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <FilterChip
                  key={d.value}
                  label={d.label}
                  selected={selectedDifficulty === d.value}
                  onClick={() => {
                    setSelectedDifficulty(selectedDifficulty === d.value ? '' : d.value);
                    setPage(1);
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {isLoading ? (
        <PageLoader label="Cargando ejercicios..." />
      ) : exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Dumbbell size={48} className="text-gray-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-400">No se encontraron ejercicios</p>
            <p className="text-sm text-gray-600 mt-1">Intenta con otros filtros</p>
          </div>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {pagination?.total ?? exercises.length} ejercicios encontrados
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {exercises.map((exercise, i) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ExerciseCard exercise={exercise} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => setPage(page - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-400">
                {page} / {pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => setPage(page + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

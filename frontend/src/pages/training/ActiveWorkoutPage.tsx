import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pause,
  Play,
  SkipForward,
  SkipBack,
  Check,
  X,
  Dumbbell,
} from 'lucide-react';
import { Button } from '@/components/UI/Button';
import { SetLogger } from '@/components/Workout/SetLogger';
import { RestTimer } from '@/components/Workout/RestTimer';
import { ProgressBar } from '@/components/UI/ProgressBar';
import { Modal } from '@/components/UI/Modal';
import { useWorkout } from '@/hooks/useWorkout';
import { useState } from 'react';

export default function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const [showEndModal, setShowEndModal] = useState(false);

  const {
    activeSession,
    currentExercise,
    currentExerciseIndex,
    currentSetIndex,
    isResting,
    restTimeRemaining,
    elapsedTime,
    isPaused,
    totalExercises,
    isLastExercise,
    isFirstExercise,
    isCompleting,
    pauseSession,
    resumeSession,
    completeWorkout,
    nextExercise,
    prevExercise,
    logSet,
    startRest,
    stopRest,
    setCurrentSet,
    formatElapsedTime,
  } = useWorkout();

  // Redirect if no active session
  useEffect(() => {
    if (!activeSession) {
      navigate('/training');
    }
  }, [activeSession, navigate]);

  if (!activeSession || !currentExercise) {
    return null;
  }

  const exercise = currentExercise.exercise;
  const completedSets = currentExercise.sets.filter((s) => s.isCompleted).length;
  const totalSets = currentExercise.sets.length;
  const sessionProgress = ((currentExerciseIndex) / totalExercises) * 100;

  const handleCompleteWorkout = async () => {
    await completeWorkout();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-dark-bg/95 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Entrenando</p>
              <h1 className="text-base font-semibold text-white">{activeSession.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Timer */}
              <div className="font-mono text-lg font-bold text-electric-400">
                {formatElapsedTime(elapsedTime)}
              </div>
              <button
                onClick={isPaused ? resumeSession : pauseSession}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  isPaused
                    ? 'bg-neon-500/15 border-neon-500/30 text-neon-400'
                    : 'bg-dark-elevated border-dark-border text-gray-400 hover:text-white'
                }`}
              >
                {isPaused ? <Play size={18} /> : <Pause size={18} />}
              </button>
              <button
                onClick={() => setShowEndModal(true)}
                className="w-10 h-10 rounded-xl bg-dark-elevated border border-dark-border text-gray-400 hover:text-danger hover:border-danger/30 flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Session progress */}
          <ProgressBar
            value={sessionProgress}
            size="xs"
            color="gradient"
            animated={false}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-600">
              Ejercicio {currentExerciseIndex + 1} de {totalExercises}
            </span>
            <span className="text-xs text-gray-600">
              {completedSets}/{totalSets} series completadas
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Current exercise */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExerciseIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Exercise header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-dark-elevated border border-dark-border flex-shrink-0">
                {exercise?.imageUrl ? (
                  <img src={exercise.imageUrl} alt={exercise.nameEs ?? exercise.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Dumbbell size={24} className="text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-display font-bold text-white">
                  {exercise?.nameEs ?? exercise?.name ?? 'Ejercicio'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-400">
                    {totalSets} series × {exercise?.metrics.defaultReps ?? '?'} reps
                  </span>
                  {exercise?.metrics.defaultRest && (
                    <span className="text-xs text-gray-500">
                      • {exercise.metrics.defaultRest}s descanso
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-3">
              {currentExercise.sets.map((set, index) => (
                <SetLogger
                  key={`${currentExerciseIndex}-${index}`}
                  setNumber={index + 1}
                  set={set}
                  previousSet={undefined}
                  onLog={(data) => {
                    logSet(currentExercise.exerciseId, data);
                    setCurrentSet(index + 1);
                  }}
                  onStartRest={startRest}
                  trackWeight={exercise?.metrics.trackWeight ?? true}
                  trackReps={exercise?.metrics.trackReps ?? true}
                  trackDuration={exercise?.metrics.trackDuration ?? false}
                  defaultRest={exercise?.metrics.defaultRest ?? 90}
                  isActive={index === currentSetIndex || set.isCompleted}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={prevExercise}
            disabled={isFirstExercise}
            leftIcon={<SkipBack size={18} />}
          >
            Anterior
          </Button>
          {isLastExercise ? (
            <Button
              variant="success"
              size="md"
              fullWidth
              leftIcon={<Check size={18} />}
              onClick={() => setShowEndModal(true)}
            >
              Finalizar entrenamiento
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              fullWidth
              rightIcon={<SkipForward size={18} />}
              onClick={nextExercise}
            >
              Siguiente ejercicio
            </Button>
          )}
        </div>

        {/* All exercises list */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Todos los ejercicios ({totalExercises})
          </h3>
          <div className="space-y-2">
            {activeSession.exercises.map((ex, i) => {
              const isActive = i === currentExerciseIndex;
              const completedCount = ex.sets.filter((s) => s.isCompleted).length;
              const isDone = completedCount === ex.sets.length && ex.sets.length > 0;

              return (
                <button
                  key={ex.id}
                  onClick={() => { /* setCurrentExercise(i) */ }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'border-electric-500/30 bg-electric-500/5'
                      : isDone
                      ? 'border-neon-500/20 bg-neon-500/5'
                      : 'border-dark-border bg-dark-elevated hover:border-dark-muted'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isDone ? 'bg-neon-500/20 text-neon-400' : isActive ? 'bg-electric-500/20 text-electric-400' : 'bg-dark-muted text-gray-500'
                  }`}>
                    {isDone ? <Check size={14} /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {ex.exercise?.nameEs ?? ex.exercise?.name ?? 'Ejercicio'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {completedCount}/{ex.sets.length} series
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-electric-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rest timer */}
      <RestTimer
        isVisible={isResting}
        timeRemaining={restTimeRemaining}
        totalTime={exercise?.metrics.defaultRest ?? 90}
        onSkip={stopRest}
        onAddTime={(s) => startRest(restTimeRemaining + s)}
      />

      {/* Paused overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="text-center"
            >
              <div className="text-5xl font-display font-bold text-white mb-4">PAUSADO</div>
              <Button variant="primary" size="xl" leftIcon={<Play size={24} />} onClick={resumeSession}>
                Reanudar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End workout modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="Finalizar entrenamiento"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            ¿Estás seguro de que quieres finalizar el entrenamiento?
          </p>
          <div className="grid grid-cols-2 gap-3 p-3 bg-dark-elevated rounded-xl">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{formatElapsedTime(elapsedTime)}</p>
              <p className="text-xs text-gray-500">Tiempo total</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {activeSession.exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length, 0)}
              </p>
              <p className="text-xs text-gray-500">Series completadas</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="md" className="flex-1" onClick={() => setShowEndModal(false)}>
              Seguir
            </Button>
            <Button
              variant="success"
              size="md"
              className="flex-1"
              isLoading={isCompleting}
              onClick={handleCompleteWorkout}
            >
              Finalizar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

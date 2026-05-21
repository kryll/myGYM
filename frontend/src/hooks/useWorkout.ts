import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkoutStore } from '@/store/workoutStore';
import { workoutService } from '@/services/api';
import type { WorkoutSession, SessionSet, Exercise } from '@/types';

export function useWorkout() {
  const queryClient = useQueryClient();
  const timerRef = useRef<number | null>(null);
  const restTimerRef = useRef<number | null>(null);

  const {
    activeSession,
    currentExerciseIndex,
    currentSetIndex,
    isResting,
    restTimeRemaining,
    elapsedTime,
    isPaused,
    startSession: storeStartSession,
    pauseSession,
    resumeSession,
    endSession: storeEndSession,
    setCurrentExercise,
    nextExercise,
    prevExercise,
    logSet: storeLogSet,
    startRest,
    stopRest,
    decrementRestTime,
    addExerciseToSession,
    updateElapsedTime,
    setCurrentSet,
  } = useWorkoutStore();

  // Update elapsed time every second
  useEffect(() => {
    if (activeSession && !isPaused) {
      timerRef.current = window.setInterval(() => {
        updateElapsedTime();
      }, 1000);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [activeSession, isPaused, updateElapsedTime]);

  // Rest timer countdown
  useEffect(() => {
    if (isResting) {
      restTimerRef.current = window.setInterval(() => {
        decrementRestTime();
      }, 1000);
    } else {
      if (restTimerRef.current) window.clearInterval(restTimerRef.current);
    }
    return () => {
      if (restTimerRef.current) window.clearInterval(restTimerRef.current);
    };
  }, [isResting, decrementRestTime]);

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: (sessionData: Partial<WorkoutSession>) =>
      workoutService.startSession(sessionData),
    onSuccess: (response) => {
      storeStartSession(response.data);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  // Complete session mutation
  const completeSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkoutSession> }) =>
      workoutService.completeSession(id, data),
    onSuccess: () => {
      storeEndSession();
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Get user sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['workouts', 'sessions'],
    queryFn: () => workoutService.getUserSessions(1, 20),
    enabled: !activeSession,
  });

  const startWorkout = useCallback(
    async (name: string, planId?: string, planWorkoutId?: string) => {
      await startSessionMutation.mutateAsync({
        name,
        planId,
        planWorkoutId,
        startedAt: new Date().toISOString(),
        exercises: [],
        isCompleted: false,
        source: planId ? 'plan' : 'manual',
      });
    },
    [startSessionMutation],
  );

  const completeWorkout = useCallback(async () => {
    if (!activeSession) return;

    const elapsedSeconds = useWorkoutStore.getState().getElapsedSeconds();

    await completeSessionMutation.mutateAsync({
      id: activeSession.id,
      data: {
        completedAt: new Date().toISOString(),
        duration: elapsedSeconds,
        isCompleted: true,
      },
    });
  }, [activeSession, completeSessionMutation]);

  const logSet = useCallback(
    (exerciseId: string, setData: Partial<SessionSet>) => {
      storeLogSet(exerciseId, setData);
    },
    [storeLogSet],
  );

  const currentExercise = activeSession?.exercises[currentExerciseIndex] ?? null;
  const currentSet = currentExercise?.sets[currentSetIndex] ?? null;
  const totalExercises = activeSession?.exercises.length ?? 0;
  const isLastExercise = currentExerciseIndex === totalExercises - 1;
  const isFirstExercise = currentExerciseIndex === 0;

  const formatElapsedTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const addExercise = useCallback(
    (exercise: Exercise) => {
      addExerciseToSession(exercise);
    },
    [addExerciseToSession],
  );

  return {
    activeSession,
    currentExerciseIndex,
    currentSetIndex,
    currentExercise,
    currentSet,
    isResting,
    restTimeRemaining,
    elapsedTime,
    isPaused,
    totalExercises,
    isLastExercise,
    isFirstExercise,
    sessions: sessionsData?.data ?? [],
    sessionsLoading,
    isStarting: startSessionMutation.isPending,
    isCompleting: completeSessionMutation.isPending,

    startWorkout,
    completeWorkout,
    pauseSession,
    resumeSession,
    logSet,
    startRest,
    stopRest,
    nextExercise,
    prevExercise,
    setCurrentExercise,
    setCurrentSet,
    addExercise,
    formatElapsedTime,
  };
}

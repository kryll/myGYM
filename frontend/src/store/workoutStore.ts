import { create } from 'zustand';
import type { WorkoutSession, SessionExercise, SessionSet, Exercise } from '@/types';

interface WorkoutStore {
  activeSession: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
  elapsedTime: number;
  isPaused: boolean;
  sessionStartTime: number | null;
  pausedAt: number | null;
  totalPausedTime: number;

  // Actions
  startSession: (session: WorkoutSession) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  setCurrentExercise: (index: number) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  setCurrentSet: (index: number) => void;
  logSet: (exerciseId: string, setData: Partial<SessionSet>) => void;
  startRest: (seconds: number) => void;
  stopRest: () => void;
  decrementRestTime: () => void;
  addExerciseToSession: (exercise: Exercise) => void;
  updateElapsedTime: () => void;
  getElapsedSeconds: () => number;
}

const createEmptySet = (setNumber: number): SessionSet => ({
  id: `set-${Date.now()}-${setNumber}`,
  setNumber,
  isCompleted: false,
});

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  activeSession: null,
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  isResting: false,
  restTimeRemaining: 0,
  elapsedTime: 0,
  isPaused: false,
  sessionStartTime: null,
  pausedAt: null,
  totalPausedTime: 0,

  startSession: (session) => {
    set({
      activeSession: session,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isResting: false,
      restTimeRemaining: 0,
      elapsedTime: 0,
      isPaused: false,
      sessionStartTime: Date.now(),
      pausedAt: null,
      totalPausedTime: 0,
    });
  },

  pauseSession: () => {
    const { isPaused } = get();
    if (!isPaused) {
      set({ isPaused: true, pausedAt: Date.now() });
    }
  },

  resumeSession: () => {
    const { isPaused, pausedAt, totalPausedTime } = get();
    if (isPaused && pausedAt) {
      const additionalPausedTime = Date.now() - pausedAt;
      set({
        isPaused: false,
        pausedAt: null,
        totalPausedTime: totalPausedTime + additionalPausedTime,
      });
    }
  },

  endSession: () => {
    set({
      activeSession: null,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isResting: false,
      restTimeRemaining: 0,
      elapsedTime: 0,
      isPaused: false,
      sessionStartTime: null,
      pausedAt: null,
      totalPausedTime: 0,
    });
  },

  setCurrentExercise: (index) => {
    set({ currentExerciseIndex: index, currentSetIndex: 0 });
  },

  nextExercise: () => {
    const { currentExerciseIndex, activeSession } = get();
    if (!activeSession) return;
    const maxIndex = activeSession.exercises.length - 1;
    if (currentExerciseIndex < maxIndex) {
      set({ currentExerciseIndex: currentExerciseIndex + 1, currentSetIndex: 0 });
    }
  },

  prevExercise: () => {
    const { currentExerciseIndex } = get();
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1, currentSetIndex: 0 });
    }
  },

  setCurrentSet: (index) => {
    set({ currentSetIndex: index });
  },

  logSet: (exerciseId, setData) => {
    const { activeSession, currentSetIndex } = get();
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((ex: SessionExercise) => {
      if (ex.exerciseId !== exerciseId) return ex;

      const updatedSets = [...ex.sets];
      const setIndex = currentSetIndex;

      if (setIndex < updatedSets.length) {
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          ...setData,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        };
      } else {
        updatedSets.push({
          ...createEmptySet(setIndex + 1),
          ...setData,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        });
      }

      return { ...ex, sets: updatedSets };
    });

    set({
      activeSession: { ...activeSession, exercises: updatedExercises },
    });
  },

  startRest: (seconds) => {
    set({ isResting: true, restTimeRemaining: seconds });
  },

  stopRest: () => {
    set({ isResting: false, restTimeRemaining: 0 });
  },

  decrementRestTime: () => {
    const { restTimeRemaining } = get();
    if (restTimeRemaining <= 1) {
      set({ isResting: false, restTimeRemaining: 0 });
    } else {
      set({ restTimeRemaining: restTimeRemaining - 1 });
    }
  },

  addExerciseToSession: (exercise) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const newExercise: SessionExercise = {
      id: `se-${Date.now()}`,
      sessionId: activeSession.id,
      exerciseId: exercise.id,
      exercise,
      sets: [createEmptySet(1), createEmptySet(2), createEmptySet(3)],
      order: activeSession.exercises.length,
    };

    set({
      activeSession: {
        ...activeSession,
        exercises: [...activeSession.exercises, newExercise],
      },
    });
  },

  updateElapsedTime: () => {
    const { sessionStartTime, isPaused, totalPausedTime, pausedAt } = get();
    if (!sessionStartTime || isPaused) return;

    const now = Date.now();
    const currentPausedTime = pausedAt ? now - pausedAt : 0;
    const elapsed = Math.floor((now - sessionStartTime - totalPausedTime - currentPausedTime) / 1000);
    set({ elapsedTime: elapsed });
  },

  getElapsedSeconds: () => {
    const { sessionStartTime, totalPausedTime, pausedAt, isPaused } = get();
    if (!sessionStartTime) return 0;

    const now = Date.now();
    const currentPausedTime = isPaused && pausedAt ? now - pausedAt : 0;
    return Math.floor((now - sessionStartTime - totalPausedTime - currentPausedTime) / 1000);
  },
}));

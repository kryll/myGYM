// ============================================================
// myGYM - TypeScript Interfaces
// ============================================================

// --- Tenant ---
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  isActive: boolean;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  maxUsers: number;
  allowAI: boolean;
  allowBluetooth: boolean;
  allowChallenges: boolean;
  customBranding: boolean;
  features: string[];
}

// --- User ---
export type UserRole = 'admin' | 'trainer' | 'member';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  username: string;
  role: UserRole;
  profile: UserProfile;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  bio?: string;
  phone?: string;
}

// --- Muscle Groups & Equipment ---
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'full_body'
  | 'cardio';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'resistance_band'
  | 'pull_up_bar'
  | 'bench'
  | 'none';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  tenantId: string;
  name: string;
  nameEs?: string;
  description: string;
  descriptionEs?: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment[];
  difficulty: ExerciseDifficulty;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric';
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  instructions: string[];
  instructionsEs?: string[];
  tips?: string[];
  tipsEs?: string[];
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  metrics: ExerciseMetrics;
}

export interface ExerciseMetrics {
  defaultSets?: number;
  defaultReps?: number;
  defaultDuration?: number; // seconds
  defaultRest?: number; // seconds
  trackWeight: boolean;
  trackReps: boolean;
  trackDuration: boolean;
  trackDistance: boolean;
}

// --- Training Plans ---
export type PlanDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type PlanEnvironment = 'gym' | 'home' | 'outdoor' | 'mixed';
export type PlanGoal = 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'strength' | 'general_fitness';

export interface TrainingPlan {
  id: string;
  tenantId: string;
  name: string;
  nameEs?: string;
  description: string;
  descriptionEs?: string;
  difficulty: PlanDifficulty;
  environment: PlanEnvironment;
  goal: PlanGoal;
  durationWeeks: number;
  workoutsPerWeek: number;
  estimatedMinutes: number;
  imageUrl?: string;
  tags: string[];
  isPublic: boolean;
  isPremium: boolean;
  createdBy?: string;
  workouts: PlanWorkout[];
  enrolledCount: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanWorkout {
  id: string;
  planId: string;
  weekNumber: number;
  dayOfWeek: number; // 0-6
  name: string;
  nameEs?: string;
  description?: string;
  estimatedMinutes: number;
  exercises: WorkoutExercise[];
  order: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise?: Exercise;
  sets: number;
  reps?: number;
  duration?: number; // seconds
  rest: number; // seconds
  notes?: string;
  notesEs?: string;
  order: number;
  superset?: string; // group id for supersets
}

// --- User Plan Enrollment ---
export interface UserPlanEnrollment {
  id: string;
  userId: string;
  planId: string;
  plan?: TrainingPlan;
  startDate: string;
  endDate?: string;
  currentWeek: number;
  currentDay: number;
  completedWorkouts: number;
  totalWorkouts: number;
  isActive: boolean;
  completedAt?: string;
}

// --- Workout Sessions ---
export interface WorkoutSession {
  id: string;
  userId: string;
  tenantId: string;
  planId?: string;
  planWorkoutId?: string;
  name: string;
  notes?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number; // seconds
  exercises: SessionExercise[];
  totalVolume?: number; // kg
  caloriesBurned?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  rating?: number;
  isCompleted: boolean;
  source?: 'manual' | 'plan' | 'ai_generated';
}

export interface SessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  exercise?: Exercise;
  sets: SessionSet[];
  notes?: string;
  order: number;
  completedAt?: string;
}

export interface SessionSet {
  id: string;
  setNumber: number;
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds
  distance?: number; // meters
  rpe?: number; // 1-10 Rate of Perceived Exertion
  isCompleted: boolean;
  completedAt?: string;
}

// --- Body Measurements ---
export interface BodyMeasurement {
  id: string;
  userId: string;
  tenantId: string;
  recordedAt: string;
  weight?: number; // kg
  bodyFatPercentage?: number;
  muscleMass?: number; // kg
  boneMass?: number; // kg
  waterPercentage?: number;
  bmi?: number;
  visceralFat?: number;
  metabolicAge?: number;
  chest?: number; // cm
  waist?: number; // cm
  hips?: number; // cm
  thighLeft?: number; // cm
  thighRight?: number; // cm
  armLeft?: number; // cm
  armRight?: number; // cm
  neck?: number; // cm
  notes?: string;
  source?: 'manual' | 'xiaomi_scale' | 'amazfit' | 'api';
  deviceId?: string;
}

// --- Challenges ---
export type ChallengeType = 'workout_count' | 'volume' | 'streak' | 'specific_exercise' | 'weight_loss' | 'distance';
export type ChallengeStatus = 'upcoming' | 'active' | 'completed' | 'expired';

export interface Challenge {
  id: string;
  tenantId: string;
  name: string;
  nameEs?: string;
  description: string;
  descriptionEs?: string;
  type: ChallengeType;
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  imageUrl?: string;
  reward?: string;
  rewardEs?: string;
  participantsCount: number;
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge?: Challenge;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  joinedAt: string;
  rank?: number;
}

// --- Goals ---
export type GoalType = 'weight' | 'strength' | 'endurance' | 'body_fat' | 'custom';
export type GoalStatus = 'active' | 'achieved' | 'abandoned';

export interface Goal {
  id: string;
  userId: string;
  tenantId: string;
  type: GoalType;
  title: string;
  titleEs?: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate?: string;
  status: GoalStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  achievedAt?: string;
}

// --- Notifications ---
export type NotificationType =
  | 'workout_reminder'
  | 'plan_update'
  | 'challenge_invite'
  | 'challenge_completed'
  | 'goal_achieved'
  | 'measurement_reminder'
  | 'ai_insight'
  | 'system'
  | 'friend_activity';

export interface Notification {
  id: string;
  userId: string;
  tenantId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  actionUrl?: string;
  imageUrl?: string;
}

// --- AI Conversation ---
export type AIMessageRole = 'user' | 'assistant' | 'system';

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  tokens?: number;
  metadata?: {
    planGenerated?: boolean;
    exercisesRecommended?: string[];
    analysisType?: string;
  };
}

export interface AIConversation {
  id: string;
  userId: string;
  tenantId: string;
  title: string;
  messages: AIMessage[];
  context?: {
    currentPlanId?: string;
    lastMeasurementId?: string;
    recentWorkoutIds?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// --- Device Connections ---
export type DeviceType = 'xiaomi_scale' | 'amazfit' | 'fitbit' | 'garmin' | 'apple_watch' | 'other';
export type DeviceStatus = 'connected' | 'disconnected' | 'pairing' | 'error';
export type ConnectionProtocol = 'bluetooth' | 'wifi' | 'api' | 'manual';

export interface DeviceConnection {
  id: string;
  userId: string;
  tenantId: string;
  type: DeviceType;
  name: string;
  deviceId: string;
  protocol: ConnectionProtocol;
  status: DeviceStatus;
  lastSync?: string;
  batteryLevel?: number;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  deviceType?: DeviceType;
  gattDevice?: BluetoothDevice;
}

// --- Xiaomi Scale Data ---
export interface XiaomiScaleData {
  weight: number; // kg
  unit: 'kg' | 'lb' | 'jin';
  isStabilized: boolean;
  isWeightRemoved: boolean;
  timestamp: Date;
  impedance?: number;
}

export interface XiaomiScaleMetrics extends XiaomiScaleData {
  bodyFatPercentage?: number;
  muscleMass?: number;
  boneMass?: number;
  waterPercentage?: number;
  bmi?: number;
  visceralFat?: number;
  metabolicAge?: number;
  userHeight: number;
  userAge: number;
  userGender: 'male' | 'female';
}

// --- API Responses ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  timestamp: string;
}

// --- Auth ---
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  tenantSlug?: string;
  inviteCode?: string;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// --- Dashboard ---
export interface DashboardStats {
  totalWorkouts: number;
  workoutsThisWeek: number;
  totalVolume: number; // kg
  currentStreak: number; // days
  longestStreak: number;
  activeChallenges: number;
  goalsAchieved: number;
  lastWorkout?: string;
}

export interface WorkoutFrequency {
  date: string;
  count: number;
}

// --- Filter & Search ---
export interface ExerciseFilters {
  search?: string;
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
  difficulty?: ExerciseDifficulty;
  category?: string;
}

export interface PlanFilters {
  search?: string;
  difficulty?: PlanDifficulty;
  environment?: PlanEnvironment;
  goal?: PlanGoal;
  maxWeeks?: number;
}

// --- Active Workout State ---
export interface ActiveWorkoutState {
  session: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
  elapsedTime: number;
  isPaused: boolean;
}

// --- Socket Events ---
export interface SocketEvents {
  'workout:started': { sessionId: string };
  'workout:completed': { sessionId: string; duration: number };
  'measurement:added': { measurementId: string };
  'notification:new': Notification;
  'challenge:updated': { challengeId: string; progress: number };
  'device:connected': { deviceId: string; type: DeviceType };
  'device:disconnected': { deviceId: string };
  'ai:streaming': { conversationId: string; chunk: string };
  'ai:completed': { conversationId: string; messageId: string };
}

<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\AICoachController;
use App\Http\Controllers\Api\BodyMeasurementController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\TrainingPlanController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\Api\WorkoutSessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| myGYM API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::put('password', [AuthController::class, 'updatePassword']);
    });

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);

    // User Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [UserProfileController::class, 'show']);
        Route::put('/', [UserProfileController::class, 'update']);
        Route::get('analysis', [UserProfileController::class, 'bodyAnalysis']);
    });

    // Exercises
    Route::prefix('exercises')->group(function () {
        Route::get('/', [ExerciseController::class, 'index']);
        Route::get('{exercise}', [ExerciseController::class, 'show']);
        Route::get('{exercise}/tip', [ExerciseController::class, 'getTip']);
        Route::middleware('role:admin,trainer')->group(function () {
            Route::post('/', [ExerciseController::class, 'store']);
            Route::put('{exercise}', [ExerciseController::class, 'update']);
            Route::delete('{exercise}', [ExerciseController::class, 'destroy']);
        });
    });

    // Training Plans
    Route::prefix('training-plans')->group(function () {
        Route::get('/', [TrainingPlanController::class, 'index']);
        Route::get('my-plans', [TrainingPlanController::class, 'myPlans']);
        Route::get('{plan}', [TrainingPlanController::class, 'show']);
        Route::post('{plan}/subscribe', [TrainingPlanController::class, 'subscribe']);
        Route::delete('{plan}/subscribe', [TrainingPlanController::class, 'unsubscribe']);
        Route::post('/', [TrainingPlanController::class, 'store']);
    });

    // Workout Sessions
    Route::prefix('workout-sessions')->group(function () {
        Route::get('/', [WorkoutSessionController::class, 'index']);
        Route::get('active', [WorkoutSessionController::class, 'active']);
        Route::get('stats', [WorkoutSessionController::class, 'stats']);
        Route::post('start', [WorkoutSessionController::class, 'start']);
        Route::get('{session}', [WorkoutSessionController::class, 'show']);
        Route::post('{session}/exercises', [WorkoutSessionController::class, 'logExercise']);
        Route::post('{session}/complete', [WorkoutSessionController::class, 'complete']);
        Route::delete('{session}', [WorkoutSessionController::class, 'destroy']);
    });

    // Body Measurements
    Route::prefix('measurements')->group(function () {
        Route::get('/', [BodyMeasurementController::class, 'index']);
        Route::get('stats', [BodyMeasurementController::class, 'stats']);
        Route::post('/', [BodyMeasurementController::class, 'store']);
        Route::post('from-scale', [BodyMeasurementController::class, 'fromScale']);
        Route::delete('{measurement}', [BodyMeasurementController::class, 'destroy']);
    });

    // AI Coach
    Route::prefix('ai')->group(function () {
        Route::get('conversations', [AICoachController::class, 'conversations']);
        Route::post('conversations', [AICoachController::class, 'createConversation']);
        Route::post('conversations/{conversation}/chat', [AICoachController::class, 'chat']);
        Route::get('conversations/{conversation}/stream', [AICoachController::class, 'chatStream']);
        Route::post('generate-plan', [AICoachController::class, 'generatePlan']);
        Route::post('analyze-progress', [AICoachController::class, 'analyzeProgress']);
        Route::post('exercise-tip', [AICoachController::class, 'getExerciseTip']);
        Route::post('sessions/{session}/summarize', [AICoachController::class, 'summarizeSession']);
    });

    // Challenges
    Route::prefix('challenges')->group(function () {
        Route::get('/', [ChallengeController::class, 'index']);
        Route::get('my-challenges', [ChallengeController::class, 'myChallenges']);
        Route::post('{challenge}/join', [ChallengeController::class, 'join']);
        Route::put('{challenge}/progress', [ChallengeController::class, 'updateProgress']);
    });

    // Goals
    Route::prefix('goals')->group(function () {
        Route::get('/', [GoalController::class, 'index']);
        Route::post('/', [GoalController::class, 'store']);
        Route::put('{goal}', [GoalController::class, 'update']);
        Route::delete('{goal}', [GoalController::class, 'destroy']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::put('{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('read-all', [NotificationController::class, 'markAllAsRead']);
        Route::post('push-subscription', [NotificationController::class, 'updatePushSubscription']);
        Route::delete('{notification}', [NotificationController::class, 'destroy']);
    });

    // Devices
    Route::prefix('devices')->group(function () {
        Route::get('/', [DeviceController::class, 'index']);
        Route::post('xiaomi-scale', [DeviceController::class, 'connectScale']);
        Route::post('amazfit', [DeviceController::class, 'connectAmazfit']);
        Route::post('{device}/sync', [DeviceController::class, 'sync']);
        Route::delete('{device}', [DeviceController::class, 'disconnect']);
    });

    // Tenant Management
    Route::prefix('tenant')->group(function () {
        Route::get('/', [TenantController::class, 'show']);
        Route::get('stats', [TenantController::class, 'stats'])->middleware('role:admin,super_admin');
        Route::put('/', [TenantController::class, 'update'])->middleware('role:admin,super_admin');
        Route::prefix('users')->middleware('role:admin,super_admin,trainer')->group(function () {
            Route::get('/', [TenantController::class, 'users']);
            Route::post('/', [TenantController::class, 'createUser'])->middleware('role:admin,super_admin');
            Route::put('{user}', [TenantController::class, 'updateUser'])->middleware('role:admin,super_admin');
            Route::delete('{user}', [TenantController::class, 'deleteUser'])->middleware('role:admin,super_admin');
        });
    });

    // Super Admin routes
    Route::prefix('admin')->middleware('role:super_admin')->group(function () {
        Route::get('tenants', [TenantController::class, 'index']);
        Route::post('tenants', [TenantController::class, 'store']);
    });
});

// Health check
Route::get('health', fn() => response()->json([
    'status' => 'ok',
    'app' => 'myGYM API',
    'version' => '1.0.0',
    'timestamp' => now()->toISOString(),
]));

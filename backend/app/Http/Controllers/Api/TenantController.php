<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    /**
     * Get all tenants (super admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $tenants = Tenant::withCount('users')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $tenants,
        ]);
    }

    /**
     * Get current tenant details
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenant = $user->tenant->load(['users']);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'slug' => $tenant->slug,
                'plan' => $tenant->plan,
                'plan_limits' => $tenant->plan_limits,
                'settings' => $tenant->settings,
                'is_active' => $tenant->is_active,
                'owner_name' => $tenant->owner_name,
                'owner_email' => $tenant->owner_email,
                'phone' => $tenant->phone,
                'address' => $tenant->address,
                'city' => $tenant->city,
                'country' => $tenant->country,
                'timezone' => $tenant->timezone,
                'logo_url' => $tenant->logo_url,
                'primary_color' => $tenant->primary_color,
                'max_users' => $tenant->max_users,
                'total_users' => $tenant->users->count(),
                'trial_ends_at' => $tenant->trial_ends_at,
                'subscription_expires_at' => $tenant->subscription_expires_at,
                'is_subscription_active' => $tenant->is_subscription_active,
                'created_at' => $tenant->created_at,
            ],
        ]);
    }

    /**
     * Create a new tenant (super admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:100|unique:tenants,slug|alpha_dash',
            'plan' => 'required|in:trial,basic,pro,enterprise',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:users,email',
            'owner_password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:50',
            'max_users' => 'nullable|integer|min:1',
        ]);

        $slug = $request->slug ?? Str::slug($request->name);

        // Ensure unique slug
        $originalSlug = $slug;
        $counter = 1;
        while (Tenant::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $tenant = Tenant::create([
            'name' => $request->name,
            'slug' => $slug,
            'plan' => $request->plan,
            'is_active' => true,
            'owner_name' => $request->owner_name,
            'owner_email' => $request->owner_email,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'timezone' => $request->timezone ?? 'Europe/Madrid',
            'max_users' => $request->max_users ?? Tenant::$plans[$request->plan]['max_users'],
            'trial_ends_at' => $request->plan === 'trial' ? now()->addDays(14) : null,
        ]);

        // Create admin user for this tenant
        $adminUser = User::create([
            'tenant_id' => $tenant->id,
            'name' => $request->owner_name,
            'email' => $request->owner_email,
            'password' => Hash::make($request->owner_password),
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
            'email_verified_at' => now(),
            'language' => 'es',
            'timezone' => $request->timezone ?? 'Europe/Madrid',
        ]);

        UserProfile::create(['user_id' => $adminUser->id]);

        return response()->json([
            'success' => true,
            'data' => [
                'tenant' => $tenant,
                'admin_user' => [
                    'id' => $adminUser->id,
                    'name' => $adminUser->name,
                    'email' => $adminUser->email,
                    'role' => $adminUser->role,
                ],
            ],
            'message' => "Tenant '{$tenant->name}' creado correctamente",
        ], 201);
    }

    /**
     * Update current tenant settings (admin only)
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenant = $user->tenant;

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'owner_name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'timezone' => 'nullable|string|max:50',
            'logo_url' => 'nullable|url',
            'primary_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'settings' => 'nullable|array',
        ]);

        $tenant->update($request->only([
            'name', 'owner_name', 'phone', 'address', 'city', 'country',
            'timezone', 'logo_url', 'primary_color',
        ]));

        if ($request->has('settings')) {
            $currentSettings = $tenant->settings ?? [];
            $tenant->update(['settings' => array_merge($currentSettings, $request->settings)]);
        }

        return response()->json([
            'success' => true,
            'data' => $tenant->fresh(),
            'message' => 'Configuración del tenant actualizada',
        ]);
    }

    /**
     * Get users for current tenant (admin only)
     */
    public function users(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $query = User::where('tenant_id', $tenantId)
            ->with('profile')
            ->orderBy('role')
            ->orderBy('name');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                  ->orWhere('email', 'LIKE', "%{$request->search}%");
            });
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->active !== null) {
            $query->where('is_active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }

        $users = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'is_active' => $u->is_active,
                'avatar_url' => $u->avatar_url,
                'phone' => $u->phone,
                'last_login_at' => $u->last_login_at,
                'fitness_level' => $u->profile?->fitness_level,
                'primary_goal' => $u->profile?->primary_goal,
                'created_at' => $u->created_at,
            ]),
            'meta' => [
                'total' => $users->total(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    /**
     * Invite/create a new user for the current tenant (admin/trainer)
     */
    public function createUser(Request $request): JsonResponse
    {
        $admin = $request->user();
        $tenant = $admin->tenant;

        // Check user limit
        $userCount = User::where('tenant_id', $tenant->id)->count();
        if ($tenant->max_users > 0 && $userCount >= $tenant->max_users) {
            return response()->json([
                'success' => false,
                'message' => "Has alcanzado el límite máximo de {$tenant->max_users} usuarios para tu plan.",
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,trainer,user',
            'phone' => 'nullable|string|max:30',
            'trainer_id' => 'nullable|exists:users,id',
            'language' => 'nullable|string|max:10',
        ]);

        // Only super_admin can create admin users
        if ($request->role === 'admin' && !$admin->isSuperAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Solo el super administrador puede crear usuarios administradores',
            ], 403);
        }

        $user = User::create([
            'tenant_id' => $tenant->id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'trainer_id' => $request->trainer_id,
            'language' => $request->language ?? 'es',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        UserProfile::create(['user_id' => $user->id]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'message' => "Usuario '{$user->name}' creado correctamente",
        ], 201);
    }

    /**
     * Update a user in the tenant (admin only)
     */
    public function updateUser(Request $request, User $user): JsonResponse
    {
        $admin = $request->user();

        // Ensure user belongs to the same tenant
        if ($user->tenant_id !== $admin->tenant_id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:admin,trainer,user',
            'is_active' => 'sometimes|boolean',
            'phone' => 'nullable|string|max:30',
            'trainer_id' => 'nullable|exists:users,id',
        ]);

        // Cannot demote yourself
        if ($user->id === $admin->id && $request->has('role')) {
            return response()->json([
                'success' => false,
                'message' => 'No puedes cambiar tu propio rol',
            ], 400);
        }

        $user->update($request->only(['name', 'role', 'is_active', 'phone', 'trainer_id']));

        return response()->json([
            'success' => true,
            'data' => $user->fresh(['profile']),
            'message' => 'Usuario actualizado correctamente',
        ]);
    }

    /**
     * Delete a user from the tenant (admin only)
     */
    public function deleteUser(Request $request, User $user): JsonResponse
    {
        $admin = $request->user();

        if ($user->tenant_id !== $admin->tenant_id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        if ($user->id === $admin->id) {
            return response()->json([
                'success' => false,
                'message' => 'No puedes eliminar tu propia cuenta',
            ], 400);
        }

        // Soft delete
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => "Usuario '{$user->name}' eliminado correctamente",
        ]);
    }

    /**
     * Get tenant statistics (admin only)
     */
    public function stats(Request $request): JsonResponse
    {
        $tenantId = $request->user()->tenant_id;

        $totalUsers = User::where('tenant_id', $tenantId)->count();
        $activeUsers = User::where('tenant_id', $tenantId)->where('is_active', true)->count();
        $trainers = User::where('tenant_id', $tenantId)->where('role', 'trainer')->count();

        $totalSessions = \App\Models\WorkoutSession::whereHas('user', fn($q) => $q->where('tenant_id', $tenantId))
            ->whereNotNull('completed_at')
            ->count();

        $sessionsThisMonth = \App\Models\WorkoutSession::whereHas('user', fn($q) => $q->where('tenant_id', $tenantId))
            ->whereNotNull('completed_at')
            ->where('started_at', '>=', now()->startOfMonth())
            ->count();

        $totalMeasurements = \App\Models\BodyMeasurement::whereHas('user', fn($q) => $q->where('tenant_id', $tenantId))
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'trainers' => $trainers,
                    'regular_users' => $totalUsers - $trainers,
                ],
                'workouts' => [
                    'total_sessions' => $totalSessions,
                    'sessions_this_month' => $sessionsThisMonth,
                ],
                'measurements' => [
                    'total' => $totalMeasurements,
                ],
                'plan' => [
                    'name' => $request->user()->tenant->plan,
                    'max_users' => $request->user()->tenant->max_users,
                    'usage_percent' => $request->user()->tenant->max_users > 0
                        ? round(($totalUsers / $request->user()->tenant->max_users) * 100, 1)
                        : 0,
                ],
            ],
        ]);
    }
}

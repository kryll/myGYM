<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;

class TenantService
{
    /**
     * Resolve the current tenant from the request.
     * Resolution order: X-Tenant-ID header → X-Tenant-Slug header → subdomain → authenticated user's tenant
     */
    public function resolveTenant(Request $request): ?Tenant
    {
        // 1. From X-Tenant-ID header (mobile apps, direct ID)
        if ($tenantId = $request->header('X-Tenant-ID')) {
            return Tenant::where('id', $tenantId)->where('is_active', true)->first();
        }

        // 2. From X-Tenant-Slug header (mobile apps, slug)
        if ($tenantSlug = $request->header('X-Tenant-Slug')) {
            return Tenant::where('slug', $tenantSlug)->where('is_active', true)->first();
        }

        // 3. From subdomain (web app)
        $host = $request->getHost();
        $parts = explode('.', $host);
        if (count($parts) >= 3) {
            $subdomain = $parts[0];
            if (!in_array($subdomain, ['www', 'api', 'app', 'admin'])) {
                $tenant = Tenant::where('slug', $subdomain)->where('is_active', true)->first();
                if ($tenant) {
                    return $tenant;
                }
            }
        }

        // 4. From authenticated user
        if ($request->user()) {
            return $request->user()->tenant;
        }

        return null;
    }

    /**
     * Get the currently bound tenant from the app container.
     */
    public function current(): ?Tenant
    {
        try {
            return app('tenant');
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Check if the current tenant has a specific feature enabled.
     */
    public function hasFeature(string $feature, ?Tenant $tenant = null): bool
    {
        $tenant = $tenant ?? $this->current();

        if (!$tenant) {
            return false;
        }

        return (bool) data_get($tenant->settings, "features.{$feature}", false);
    }

    /**
     * Check if the tenant has reached its user limit.
     */
    public function hasReachedUserLimit(Tenant $tenant): bool
    {
        if ($tenant->max_users <= 0) {
            return false; // Unlimited
        }

        $currentUsers = User::where('tenant_id', $tenant->id)->count();
        return $currentUsers >= $tenant->max_users;
    }

    /**
     * Get plan-based limits for the tenant.
     */
    public function getLimits(Tenant $tenant): array
    {
        return Tenant::$plans[$tenant->plan] ?? Tenant::$plans[Tenant::PLAN_TRIAL];
    }

    /**
     * Check if the tenant's subscription is active.
     */
    public function isSubscriptionActive(Tenant $tenant): bool
    {
        if (!$tenant->is_active) {
            return false;
        }

        if ($tenant->plan === Tenant::PLAN_TRIAL) {
            return !$tenant->trial_ends_at || $tenant->trial_ends_at->isFuture();
        }

        return !$tenant->subscription_expires_at || $tenant->subscription_expires_at->isFuture();
    }

    /**
     * Get tenant statistics for the admin dashboard.
     */
    public function getStats(Tenant $tenant): array
    {
        $userCounts = User::where('tenant_id', $tenant->id)
            ->selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        $totalUsers = array_sum($userCounts);

        return [
            'users' => [
                'total' => $totalUsers,
                'admins' => $userCounts[User::ROLE_ADMIN] ?? 0,
                'trainers' => $userCounts[User::ROLE_TRAINER] ?? 0,
                'regular' => $userCounts[User::ROLE_USER] ?? 0,
                'limit' => $tenant->max_users,
                'usage_percent' => $tenant->max_users > 0
                    ? min(100, round(($totalUsers / $tenant->max_users) * 100, 1))
                    : 0,
            ],
            'plan' => [
                'name' => $tenant->plan,
                'limits' => $this->getLimits($tenant),
                'is_active' => $this->isSubscriptionActive($tenant),
                'expires_at' => $tenant->subscription_expires_at ?? $tenant->trial_ends_at,
            ],
        ];
    }

    /**
     * Apply a tenant scope to a query builder.
     * This is used to ensure data isolation between tenants.
     */
    public function scopeQuery($query, ?Tenant $tenant = null): mixed
    {
        $tenant = $tenant ?? $this->current();

        if (!$tenant) {
            return $query;
        }

        return $query->where('tenant_id', $tenant->id);
    }

    /**
     * Get tenant-specific configuration value.
     */
    public function getConfig(string $key, mixed $default = null, ?Tenant $tenant = null): mixed
    {
        $tenant = $tenant ?? $this->current();

        if (!$tenant) {
            return $default;
        }

        return data_get($tenant->settings, $key, $default);
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->resolveTenant($request);

        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant no encontrado o inactivo',
            ], 404);
        }

        if (!$tenant->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Este tenant está desactivado',
            ], 403);
        }

        app()->instance('tenant', $tenant);
        $request->attributes->set('tenant', $tenant);

        return $next($request);
    }

    private function resolveTenant(Request $request): ?Tenant
    {
        // 1. From X-Tenant-ID header (mobile apps)
        $tenantId = $request->header('X-Tenant-ID');
        if ($tenantId) {
            return Tenant::where('id', $tenantId)->where('is_active', true)->first();
        }

        // 2. From subdomain (web app)
        $host = $request->getHost();
        $parts = explode('.', $host);
        if (count($parts) >= 3) {
            $subdomain = $parts[0];
            if ($subdomain !== 'www' && $subdomain !== 'api') {
                return Tenant::where('slug', $subdomain)->where('is_active', true)->first();
            }
        }

        // 3. From authenticated user's tenant
        if ($request->user()) {
            return $request->user()->tenant;
        }

        // 4. From X-Tenant-Slug header
        $tenantSlug = $request->header('X-Tenant-Slug');
        if ($tenantSlug) {
            return Tenant::where('slug', $tenantSlug)->where('is_active', true)->first();
        }

        // 5. Default tenant (for single-tenant deployments)
        return Tenant::where('is_active', true)->first();
    }
}

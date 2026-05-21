<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeviceConnection;
use App\Services\AmazfitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function __construct(private AmazfitService $amazfitService)
    {}

    public function index(Request $request): JsonResponse
    {
        $devices = DeviceConnection::where('user_id', $request->user()->id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $devices->map(fn($d) => [
                'id' => $d->id,
                'device_type' => $d->device_type,
                'device_name' => $d->device_name,
                'device_mac' => $d->device_mac,
                'is_active' => $d->is_active,
                'last_sync_at' => $d->last_sync_at,
            ]),
        ]);
    }

    public function connectScale(Request $request): JsonResponse
    {
        $request->validate([
            'device_name' => 'required|string|max:255',
            'device_mac' => 'required|string|max:20',
        ]);

        $device = DeviceConnection::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'device_type' => 'xiaomi_scale',
            ],
            [
                'device_name' => $request->device_name,
                'device_mac' => $request->device_mac,
                'is_active' => true,
                'settings' => [
                    'auto_sync' => true,
                    'notify_on_sync' => true,
                ],
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $device,
            'message' => "¡Báscula {$request->device_name} conectada correctamente!",
        ]);
    }

    public function connectAmazfit(Request $request): JsonResponse
    {
        $request->validate([
            'device_name' => 'required|string|max:255',
            'zepp_email' => 'required|email',
            'zepp_password' => 'required|string',
        ]);

        $authData = $this->amazfitService->authenticate(
            $request->zepp_email,
            $request->zepp_password
        );

        if (!$authData) {
            return response()->json([
                'success' => false,
                'message' => 'No se pudo autenticar con Zepp Health. Verifica tus credenciales.',
            ], 401);
        }

        $device = DeviceConnection::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'device_type' => 'amazfit',
            ],
            [
                'device_name' => $request->device_name,
                'access_token' => $authData['token'] ?? null,
                'refresh_token' => $authData['refresh_token'] ?? null,
                'is_active' => true,
                'settings' => [
                    'email' => $request->zepp_email,
                    'auto_sync' => true,
                    'sync_interval_minutes' => 30,
                ],
            ]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $device->id,
                'device_type' => $device->device_type,
                'device_name' => $device->device_name,
                'is_active' => $device->is_active,
            ],
            'message' => "¡{$request->device_name} conectado! Los datos se sincronizarán automáticamente.",
        ]);
    }

    public function sync(Request $request, DeviceConnection $device): JsonResponse
    {
        if ($device->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $success = false;

        if ($device->device_type === 'amazfit') {
            $success = $this->amazfitService->syncData($device);
        }

        if ($success) {
            $device->update(['last_sync_at' => now()]);
        }

        return response()->json([
            'success' => $success,
            'message' => $success
                ? '¡Datos sincronizados correctamente!'
                : 'Error durante la sincronización. Intenta de nuevo.',
        ]);
    }

    public function disconnect(Request $request, DeviceConnection $device): JsonResponse
    {
        if ($device->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $device->update([
            'is_active' => false,
            'access_token' => null,
            'refresh_token' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dispositivo desconectado',
        ]);
    }
}

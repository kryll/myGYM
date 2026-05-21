<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BodyMeasurement;
use App\Services\WorkoutAnalyticsService;
use App\Services\XiaomiScaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BodyMeasurementController extends Controller
{
    public function __construct(
        private WorkoutAnalyticsService $analytics,
        private XiaomiScaleService $xiaomiService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $measurements = BodyMeasurement::where('user_id', $request->user()->id)
            ->orderByDesc('measured_at')
            ->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $measurements,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'measured_at' => 'nullable|date',
            'weight_kg' => 'required|numeric|min:20|max:300',
            'body_fat_percent' => 'nullable|numeric|min:0|max:80',
            'muscle_mass_kg' => 'nullable|numeric|min:0|max:150',
            'water_percent' => 'nullable|numeric|min:0|max:100',
            'bone_mass_kg' => 'nullable|numeric|min:0|max:10',
            'visceral_fat' => 'nullable|integer|min:0|max:25',
            'metabolic_age' => 'nullable|integer|min:10|max:100',
            'source' => 'nullable|in:manual,xiaomi_scale,amazfit',
        ]);

        $user = $request->user()->load('profile');
        $heightCm = $user->profile?->height_cm;

        $bmi = null;
        if ($heightCm && $request->weight_kg) {
            $bmi = round($request->weight_kg / (($heightCm / 100) ** 2), 1);
        }

        $measurement = BodyMeasurement::create([
            'user_id' => $user->id,
            'measured_at' => $request->measured_at ?? now(),
            'weight_kg' => $request->weight_kg,
            'bmi' => $bmi,
            'body_fat_percent' => $request->body_fat_percent,
            'muscle_mass_kg' => $request->muscle_mass_kg,
            'water_percent' => $request->water_percent,
            'bone_mass_kg' => $request->bone_mass_kg,
            'visceral_fat' => $request->visceral_fat,
            'metabolic_age' => $request->metabolic_age,
            'source' => $request->source ?? 'manual',
        ]);

        if ($user->profile) {
            $user->profile->update(['weight_kg' => $request->weight_kg]);
        }

        return response()->json([
            'success' => true,
            'data' => $measurement,
            'message' => 'Medición registrada correctamente',
        ], 201);
    }

    public function fromScale(Request $request): JsonResponse
    {
        $request->validate([
            'weight' => 'required|numeric|min:20|max:300',
            'impedance' => 'nullable|numeric',
        ]);

        try {
            $measurement = $this->xiaomiService->processMeasurement(
                $request->user()->id,
                $request->all()
            );

            return response()->json([
                'success' => true,
                'data' => $measurement,
                'message' => '¡Medición de la báscula registrada!',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error procesando datos de la báscula: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function stats(Request $request): JsonResponse
    {
        $days = (int) $request->get('days', 90);
        $progress = $this->analytics->getBodyProgress($request->user()->id, $days);

        $latest = BodyMeasurement::where('user_id', $request->user()->id)
            ->latest('measured_at')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'latest' => $latest,
                'progress' => $progress,
            ],
        ]);
    }

    public function destroy(Request $request, BodyMeasurement $measurement): JsonResponse
    {
        if ($measurement->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $measurement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Medición eliminada',
        ]);
    }
}

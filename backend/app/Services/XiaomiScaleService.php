<?php

namespace App\Services;

use App\Models\BodyMeasurement;
use App\Models\UserProfile;
use App\Events\MeasurementRecorded;

class XiaomiScaleService
{
    /**
     * Process Xiaomi Mi Body Composition Scale 2 data.
     * Data comes from Web Bluetooth API (GATT) parsed on the frontend.
     *
     * Scale UUID: 0000181b-0000-1000-8000-00805f9b34fb (Body Composition)
     * Characteristic: 0x2A9C
     */
    public function processMeasurement(int $userId, array $data): BodyMeasurement
    {
        $profile = UserProfile::where('user_id', $userId)->first();

        $weight = $data['weight'] ?? 0;
        $impedance = $data['impedance'] ?? null;

        $calculations = [];
        if ($profile && $impedance) {
            $calculations = $this->calculateBodyComposition($profile, $weight, $impedance);
        }

        $bmi = null;
        if ($profile && $profile->height_cm && $weight) {
            $bmi = round($weight / (($profile->height_cm / 100) ** 2), 1);
        }

        $measurement = BodyMeasurement::create([
            'user_id' => $userId,
            'measured_at' => now(),
            'weight_kg' => $weight,
            'bmi' => $bmi,
            'body_fat_percent' => $calculations['body_fat'] ?? null,
            'muscle_mass_kg' => $calculations['muscle_mass'] ?? null,
            'water_percent' => $calculations['water_percent'] ?? null,
            'bone_mass_kg' => $calculations['bone_mass'] ?? null,
            'visceral_fat' => $calculations['visceral_fat'] ?? null,
            'metabolic_age' => $calculations['metabolic_age'] ?? null,
            'source' => 'xiaomi_scale',
        ]);

        // Update user profile weight
        if ($profile) {
            $profile->update(['weight_kg' => $weight]);
        }

        event(new MeasurementRecorded($measurement));

        return $measurement;
    }

    /**
     * Calculate body composition metrics using Xiaomi's algorithm
     * Based on the bioelectrical impedance analysis (BIA) method.
     */
    private function calculateBodyComposition(UserProfile $profile, float $weight, float $impedance): array
    {
        $age = $profile->date_of_birth
            ? \Carbon\Carbon::parse($profile->date_of_birth)->age
            : 30;
        $height = $profile->height_cm ?? 170;
        $sex = $profile->sex ?? 'male';
        $isMale = $sex === 'male';

        // Body Fat % (using BIA formula)
        if ($isMale) {
            $lbm = ($height * 9.058) / 100;
            $lbm += ($height * 0.15) - ($impedance * 0.15) - ($age * 0.15) + 0.0;
        } else {
            $lbm = ($height * 9.058) / 100;
            $lbm += ($height * 0.10) - ($impedance * 0.10) - ($age * 0.20) - 7.0;
        }

        $lbm = max(0, $lbm);
        $fat = max(0, ($weight - $lbm) / $weight * 100);

        // Muscle mass
        $coef = $isMale ? 0.825 : 0.776;
        $muscleMass = max(0, ($lbm * $coef) - 0.8);

        // Water %
        $waterCoef = $isMale ? 0.70 : 0.60;
        $waterPercent = max(0, min(100, ($lbm * $waterCoef / $weight) * 100));

        // Bone mass
        $boneMass = $isMale
            ? 0.05958 * $lbm - 0.78
            : 0.04779 * $lbm - 0.23;
        $boneMass = max(0.5, $boneMass);

        // Visceral fat (simplified)
        $visceralFat = 0;
        if ($isMale) {
            if ($fat <= 23.0) {
                $visceralFat = max(1, ($fat + $age * 0.1) * 0.09 + 1);
            } else {
                $visceralFat = ($fat - 23.0) * 0.2 + $age * 0.15 + 2.2;
            }
        } else {
            if ($fat <= 32.0) {
                $visceralFat = max(1, ($fat + $age * 0.1) * 0.05 + 0.5);
            } else {
                $visceralFat = ($fat - 32.0) * 0.1 + $age * 0.10 + 1.5;
            }
        }

        // Metabolic age
        if ($isMale) {
            $metabolicAge = round(($muscleMass / $lbm) * $age * 0.8 + ($fat / 100) * 30);
        } else {
            $metabolicAge = round(($muscleMass / $lbm) * $age * 0.85 + ($fat / 100) * 25);
        }

        return [
            'body_fat' => round($fat, 1),
            'muscle_mass' => round($muscleMass, 2),
            'water_percent' => round($waterPercent, 1),
            'bone_mass' => round($boneMass, 2),
            'visceral_fat' => (int) round($visceralFat),
            'metabolic_age' => $metabolicAge,
        ];
    }
}

<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('tenant.{tenantId}', function ($user, $tenantId) {
    return (int) $user->tenant_id === (int) $tenantId;
});

Broadcast::channel('workout.{sessionId}', function ($user, $sessionId) {
    $session = \App\Models\WorkoutSession::find($sessionId);
    return $session && (int) $session->user_id === (int) $user->id;
});

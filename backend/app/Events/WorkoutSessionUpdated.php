<?php

namespace App\Events;

use App\Models\WorkoutSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WorkoutSessionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public WorkoutSession $session)
    {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel("user.{$this->session->user_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'workout.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->session->id,
            'status' => $this->session->completed_at ? 'completed' : 'active',
            'duration' => $this->session->total_duration_minutes,
            'calories' => $this->session->calories_burned,
        ];
    }
}

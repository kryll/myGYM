<?php

namespace App\Events;

use App\Models\BodyMeasurement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MeasurementRecorded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public BodyMeasurement $measurement)
    {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel("user.{$this->measurement->user_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'measurement.recorded';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->measurement->id,
            'weight_kg' => $this->measurement->weight_kg,
            'bmi' => $this->measurement->bmi,
            'body_fat_percent' => $this->measurement->body_fat_percent,
            'source' => $this->measurement->source,
            'measured_at' => $this->measurement->measured_at,
        ];
    }
}

<?php

namespace App\Events;

use App\Models\CropDamageRecord;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CropDamageRecordCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $cropDamageRecord;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(CropDamageRecord $cropDamageRecord)
    {
        $this->cropDamageRecord = $cropDamageRecord->load([
            'farmer',
            'farmParcel',
            'damageCategory',
        ]);
        $this->message = "New crop damage record submitted";
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('farmers'),
            new Channel('technicians'),
            new Channel('admin'),
            new Channel('super-admin'),
            new Channel("crop-damage.{$this->cropDamageRecord->id}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'crop-damage.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->cropDamageRecord->id,
            'farmer_name' => $this->cropDamageRecord->farmer?->full_name,
            'farm_parcel' => $this->cropDamageRecord->farmParcel?->parcel_name,
            'damage_category' => $this->cropDamageRecord->damageCategory?->name,
            'severity' => $this->cropDamageRecord->severity,
            'affected_area' => $this->cropDamageRecord->affected_area,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}

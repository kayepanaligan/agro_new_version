<?php

namespace App\Events;

use App\Models\Farmer;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FarmerCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $farmer;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Farmer $farmer)
    {
        $this->farmer = $farmer->load(['profile', 'location']);
        $this->message = "New farmer registered: {$farmer->first_name} {$farmer->last_name}";
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
            new Channel('admin'),
            new Channel('super-admin'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'farmer.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->farmer->id,
            'name' => "{$this->farmer->first_name} {$this->farmer->last_name}",
            'lfid' => $this->farmer->lfid,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}

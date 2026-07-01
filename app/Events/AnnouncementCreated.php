<?php

namespace App\Events;

use App\Models\Announcement;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AnnouncementCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $announcement;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Announcement $announcement)
    {
        $this->announcement = $announcement;
        $this->message = "New announcement: {$announcement->title}";
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
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'announcement.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->announcement->id,
            'title' => $this->announcement->title,
            'content' => $this->announcement->content,
            'priority' => $this->announcement->priority,
            'published_at' => $this->announcement->published_at,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}

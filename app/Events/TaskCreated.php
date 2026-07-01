<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Task $task)
    {
        $this->task = $task->load(['assignee', 'creator']);
        $this->message = "New task assigned: {$task->title}";
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new Channel('admin'),
            new Channel('super-admin'),
        ];

        // Add task-specific channel
        $channels[] = new Channel("task.{$this->task->id}");

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'task.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->task->id,
            'title' => $this->task->title,
            'assigned_to' => $this->task->assignee?->name,
            'priority' => $this->task->priority,
            'due_date' => $this->task->due_date,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}

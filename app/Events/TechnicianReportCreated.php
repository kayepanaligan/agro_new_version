<?php

namespace App\Events;

use App\Models\TechnicianReport;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TechnicianReportCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $report;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(TechnicianReport $report)
    {
        $this->report = $report->load(['technician', 'task']);
        $this->message = "New technician report submitted by {$report->technician?->name}";
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('technicians'),
            new Channel('admin'),
            new Channel('super-admin'),
            new Channel('reports'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'technician-report.created';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->report->id,
            'technician_name' => $this->report->technician?->name,
            'task_title' => $this->report->task?->title,
            'status' => $this->report->status,
            'date' => $this->report->date,
            'message' => $this->message,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}

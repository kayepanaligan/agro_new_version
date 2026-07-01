<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Role-based channels for real-time updates
Broadcast::channel('farmers', function ($user) {
    return $user->role === 'farmer' || $user->role === 'admin' || $user->role === 'super_admin';
});

Broadcast::channel('technicians', function ($user) {
    return $user->role === 'technician' || $user->role === 'admin' || $user->role === 'super_admin';
});

Broadcast::channel('admin', function ($user) {
    return $user->role === 'admin' || $user->role === 'super_admin';
});

Broadcast::channel('super-admin', function ($user) {
    return $user->role === 'super_admin';
});

// Model-specific channels
Broadcast::channel('farmer.{farmerId}', function ($user, $farmerId) {
    return true; // Public channel for farmer updates
});

Broadcast::channel('crop-damage.{recordId}', function ($user, $recordId) {
    return true; // Public channel for crop damage updates
});

Broadcast::channel('task.{taskId}', function ($user, $taskId) {
    return true; // Public channel for task updates
});

Broadcast::channel('reports', function ($user) {
    return $user->role === 'admin' || $user->role === 'super_admin';
});

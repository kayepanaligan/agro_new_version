<?php

use App\Http\Middleware\AiRateLimiter;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AuditLogMiddleware;
use App\Http\Middleware\CheckPermission;
use App\Http\Middleware\FarmerMiddleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SuperAdminMiddleware;
use App\Http\Middleware\TechnicianMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        $middleware->alias([
            'super-admin' => SuperAdminMiddleware::class,
            'admin' => AdminMiddleware::class,
            'technician' => TechnicianMiddleware::class,
            'farmer' => FarmerMiddleware::class,
            'ai-rate-limit' => AiRateLimiter::class,
            'audit-log' => AuditLogMiddleware::class,
            'permission' => CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

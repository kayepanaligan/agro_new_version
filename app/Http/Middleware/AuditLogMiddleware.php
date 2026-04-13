<?php

namespace App\Http\Middleware;

use App\Services\AuditLogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLogMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only log POST, PUT, DELETE requests
        if (in_array($request->method(), ['POST', 'PUT', 'DELETE'])) {
            $response = $next($request);
            
            // Log after successful response
            if ($response->getStatusCode() < 400) {
                $this->logRequest($request);
            }
            
            return $response;
        }
        
        return $next($request);
    }

    /**
     * Log the request activity.
     */
    protected function logRequest(Request $request): void
    {
        $path = $request->path();
        $method = $request->method();
        
        // Extract module from path
        // Examples: admin/categories -> categories, super-admin/commodities -> commodities
        $segments = explode('/', $path);
        
        // Skip audit log routes to prevent infinite loops
        if (in_array('audit-logs', $segments)) {
            return;
        }
        
        // Find the module name (usually the last meaningful segment)
        $module = end($segments);
        
        // Remove ID segments if present
        if (is_numeric($module)) {
            $module = prev($segments) ?? $module;
        }
        
        // Map HTTP method to event
        $event = match($method) {
            'POST' => 'created',
            'PUT' => 'updated',
            'DELETE' => 'deleted',
            default => null,
        };
        
        if ($event && $module) {
            AuditLogService::log(
                $event,
                $module,
                null,
                null,
                null,
                $request->except(['_token', '_method']),
                null
            );
        }
    }
}

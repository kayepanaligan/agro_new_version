<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class AiRateLimiter
{
    /**
     * Handle an incoming request with AI-specific rate limiting.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->user()?->id ?? $request->ip();
        $maxAttempts = config('services.gemini.rate_limit', 10); // 10 requests per minute
        $decayMinutes = 1;

        if (RateLimiter::tooManyAttempts("ai-requests:{$userId}", $maxAttempts)) {
            $retryAfter = RateLimiter::availableIn("ai-requests:{$userId}");
            
            return response()->json([
                'success' => false,
                'message' => 'Too many AI generation requests. Please try again in ' . $retryAfter . ' seconds.',
                'retry_after' => $retryAfter,
            ], 429);
        }

        RateLimiter::hit("ai-requests:{$userId}", $decayMinutes * 60);

        return $next($request);
    }
}

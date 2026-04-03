<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\RateLimiter;

class AiController extends Controller
{
    protected GeminiService $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    /**
     * Generate an AI image based on a text prompt using Google Imagen 3.0
     * Returns base64-encoded image data for direct frontend rendering
     */
    public function generateImage(Request $request): JsonResponse
    {
        try {
            // Validate input with strict rules
            $validated = $request->validate([
                'prompt' => ['required', 'string', 'min:10', 'max:1000'],
                'size' => ['nullable', 'string', 'in:512x512,1024x1024'],
                'save_to_storage' => ['nullable', 'boolean'],
            ], [
                'prompt.required' => 'Prompt is required for image generation.',
                'prompt.min' => 'Prompt must be at least 10 characters.',
                'prompt.max' => 'Prompt must not exceed 1000 characters.',
            ]);

            $prompt = $validated['prompt'];
            $size = $validated['size'] ?? '1024x1024';
            $saveToStorage = $validated['save_to_storage'] ?? true; // Default to saving

            Log::info('AI image generation request', [
                'user_id' => $request->user()?->id,
                'prompt_preview' => substr($prompt, 0, 100),
                'size' => $size,
            ]);

            // Sanitize prompt (prevent injection attacks)
            $sanitizedPrompt = $this->sanitizePrompt($prompt);

            // Generate image using Gemini Imagen 3.0
            $imageData = $this->geminiService->generateImage($sanitizedPrompt, $size);

            if (!$imageData || empty($imageData['base64'])) {
                throw new \Exception('Failed to generate image data from API response');
            }

            $response = [
                'success' => true,
                'message' => 'Image generated successfully',
                'data' => [
                    'base64' => $imageData['base64'],
                    'mimeType' => $imageData['mimeType'],
                    'dataUri' => 'data:' . $imageData['mimeType'] . ';base64,' . $imageData['base64'],
                ],
            ];

            // Optionally save to storage for persistence
            if ($saveToStorage) {
                try {
                    $imagePath = $this->geminiService->saveImageToStorage($imageData, 'gemini');
                    $response['data']['storage_path'] = $imagePath;
                    $response['data']['url'] = Storage::disk('public')->url($imagePath);
                    
                    Log::info('Image saved to storage', ['path' => $imagePath]);
                } catch (\Exception $e) {
                    Log::warning('Failed to save image to storage', ['error' => $e->getMessage()]);
                    // Don't fail the entire request if storage fails
                }
            }

            return response()->json($response);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('AI image validation failed', [
                'errors' => $e->errors(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid input parameters',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('AI image generation error', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            $statusCode = $this->determineErrorStatusCode($e);
            
            return response()->json([
                'success' => false,
                'message' => $this->getUserFriendlyErrorMessage($e),
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], $statusCode);
        }
    }

    /**
     * Sanitize user prompt to prevent injection attacks
     */
    protected function sanitizePrompt(string $prompt): string
    {
        // Remove potentially dangerous content
        $sanitized = trim($prompt);
        $sanitized = preg_replace('/[\x00-\x08\x0B-\x0C\x0E-\x1F]/', '', $sanitized);
        
        return $sanitized;
    }

    /**
     * Determine appropriate HTTP status code based on error type
     */
    protected function determineErrorStatusCode(\Exception $e): int
    {
        $message = $e->getMessage();
        
        if (str_contains($message, '400')) {
            return 400; // Bad request
        }
        
        if (str_contains($message, '401') || str_contains($message, 'API key')) {
            return 500; // Server misconfiguration (hide API key issues from client)
        }
        
        if (str_contains($message, '403') || str_contains($message, 'quota') || str_contains($message, 'billing')) {
            return 503; // Service unavailable
        }
        
        if (str_contains($message, '429')) {
            return 429; // Rate limited
        }
        
        if (str_contains($message, 'timeout')) {
            return 504; // Gateway timeout
        }
        
        return 500; // Default server error
    }

    /**
     * Generate user-friendly error message
     */
    protected function getUserFriendlyErrorMessage(\Exception $e): string
    {
        $message = $e->getMessage();
        
        if (str_contains($message, 'API key')) {
            return 'AI service configuration error. Please contact support.';
        }
        
        if (str_contains($message, 'quota') || str_contains($message, 'billing')) {
            return 'AI service quota exceeded. Please try again later.';
        }
        
        if (str_contains($message, 'timeout')) {
            return 'AI service request timed out. Please try again.';
        }
        
        if (str_contains($message, 'prompt')) {
            return 'Invalid prompt. Please provide a valid description.';
        }
        
        return 'Failed to generate image. Please try again in a few moments.';
    }

    /**
     * Generate text content using AI (for descriptions, etc.)
     */
    public function generateText(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'prompt' => ['required', 'string', 'max:2000'],
            ]);

            $prompt = $validated['prompt'];

            // Generate text using Gemini
            $generatedText = $this->geminiService->generateText($prompt);

            if (!$generatedText) {
                throw new \Exception('Failed to generate text from API response');
            }

            return response()->json([
                'success' => true,
                'text' => $generatedText,
                'message' => 'Text generated successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('AI text generation error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while generating the text.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}

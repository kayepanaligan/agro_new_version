<?php

namespace App\Services;

use Gemini\Client;
use Gemini\Resources\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class GeminiService
{
    protected Client $client;
    protected string $imageModel;
    protected string $textModel;

    public function __construct()
    {
        // Initialize the official Gemini client using factory pattern
        $apiKey = config('gemini.api_key');
        $timeout = (int) config('gemini.request_timeout', 30);
        $baseUrl = config('gemini.base_url');
        
        $this->client = \Gemini::factory()
            ->withApiKey($apiKey)
            ->withHttpClient(new \GuzzleHttp\Client(['timeout' => $timeout]))
            ->make();
        
        if (!empty($baseUrl)) {
            $this->client = \Gemini::factory()
                ->withApiKey($apiKey)
                ->withBaseUrl($baseUrl)
                ->make();
        }
        
        $this->imageModel = config('services.gemini.image_model', 'gemini-2.0-flash-exp');
        $this->textModel = config('services.gemini.text_model', 'gemini-pro');
    }

    /**
     * Generate an image using AI
     * Uses Pollinations.ai (free, reliable, no API key needed)
     * Returns base64-encoded image data with MIME type
     */
    public function generateImage(string $prompt, string $size = '1024x1024'): ?array
    {
        try {
            Log::info('Starting AI image generation', [
                'prompt_length' => strlen($prompt),
                'size' => $size,
            ]);

            // Validate prompt
            if (empty(trim($prompt))) {
                throw new Exception('Prompt cannot be empty');
            }

            // Use Pollinations.ai (reliable, free, no API key needed)
            $imageData = $this->generateWithPollinations($prompt, $size);

            if (!$imageData) {
                throw new Exception('Failed to generate image from Pollinations.ai');
            }

            Log::info('Image generated successfully', [
                'mime_type' => $imageData['mimeType'],
                'base64_length' => strlen($imageData['base64']),
            ]);

            return $imageData;

        } catch (Exception $e) {
            Log::error('AI image generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            throw $e;
        }
    }

    /**
     * Generate image using Pollinations.ai (Free, reliable)
     * Returns base64-encoded image data
     */
    protected function generateWithPollinations(string $prompt, string $size): ?array
    {
        $width = 1024;
        $height = 1024;
        
        if ($size === '512x512') {
            $width = 512;
            $height = 512;
        }

        // Encode the prompt for URL
        $encodedPrompt = urlencode($prompt);
        $imageUrl = "https://image.pollinations.ai/prompt/{$encodedPrompt}?width={$width}&height={$height}&nologo=true&model=flux";
        
        Log::info('Attempting Pollinations.ai request', ['url' => substr($imageUrl, 0, 200)]);
        
        try {
            // Download the image with timeout
            $response = Http::withOptions([
                'verify' => false,
                'timeout' => 60, // 60 second timeout
            ])->get($imageUrl);

            if ($response->successful() && strlen($response->body()) > 1000) {
                // Convert to base64
                $base64 = base64_encode($response->body());
                
                Log::info('Pollinations.ai image generated', [
                    'size_bytes' => strlen($response->body()),
                    'base64_length' => strlen($base64),
                ]);

                return [
                    'base64' => $base64,
                    'mimeType' => 'image/jpeg',
                ];
            }

            Log::warning('Pollinations.ai image generation failed', [
                'status' => $response->status(),
                'body_length' => strlen($response->body()),
            ]);
            return null;
            
        } catch (Exception $e) {
            Log::error('Pollinations.ai request failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Parse Imagen 3.0 API response to extract base64 image data
     */
    protected function parseImagenResponse(array $data): ?array
    {
        // Validate response structure
        if (!isset($data['predictions']) || !is_array($data['predictions'])) {
            Log::error('Invalid API response: missing predictions', ['data' => $data]);
            return null;
        }

        $predictions = $data['predictions'];
        
        if (empty($predictions)) {
            Log::error('Empty predictions array in API response');
            return null;
        }

        $firstPrediction = $predictions[0];

        // Check for bytesBase64Encoded field (Imagen 3.0 format)
        if (isset($firstPrediction['bytesBase64Encoded'])) {
            return [
                'base64' => $firstPrediction['bytesBase64Encoded'],
                'mimeType' => $firstPrediction['mimeType'] ?? 'image/png',
            ];
        }

        // Alternative: check for base64 field
        if (isset($firstPrediction['base64'])) {
            return [
                'base64' => $firstPrediction['base64'],
                'mimeType' => $firstPrediction['mimeType'] ?? 'image/png',
            ];
        }

        // Alternative: check for imageBytes field
        if (isset($firstPrediction['imageBytes'])) {
            return [
                'base64' => base64_encode($firstPrediction['imageBytes']),
                'mimeType' => 'image/png',
            ];
        }

        Log::error('Unrecognized response format', ['prediction' => $firstPrediction]);
        return null;
    }

    /**
     * Convert size string to aspect ratio for Imagen API
     */
    protected function getAspectRatio(string $size): string
    {
        return match($size) {
            '512x512' => '1:1',
            '1024x1024' => '1:1',
            '1024x768' => '4:3',
            '768x1024' => '3:4',
            default => '1:1',
        };
    }

    /**
     * Save base64 image data to storage
     */
    public function saveImageToStorage(array $imageData, string $prefix = 'gemini'): string
    {
        try {
            // Decode base64
            $imageContent = base64_decode($imageData['base64']);
            
            if ($imageContent === false) {
                throw new Exception('Failed to decode base64 image data');
            }

            // Generate unique filename
            $extension = $this->getExtensionFromMimeType($imageData['mimeType']);
            $filename = "{$prefix}_" . uniqid() . '_' . time() . ".{$extension}";
            $path = "commodities/{$filename}";

            // Save to storage
            Storage::disk('public')->put($path, $imageContent);

            Log::info('Image saved to storage', ['path' => $path]);

            return $path;

        } catch (Exception $e) {
            Log::error('Failed to save image to storage', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Get file extension from MIME type
     */
    protected function getExtensionFromMimeType(string $mimeType): string
    {
        return match($mimeType) {
            'image/jpeg', 'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            default => 'png',
        };
    }

    /**
     * Generate text content using Gemini (for descriptions, etc.)
     */
    public function generateText(string $prompt): ?string
    {
        try {
            $response = Http::post("{$this->baseUrl}/models/{$this->textModel}:generateContent", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            }

            Log::error('Gemini text generation failed', ['status' => $response->status()]);
            return null;
        } catch (Exception $e) {
            Log::error('Failed to generate text with Gemini: ' . $e->getMessage());
            return null;
        }
    }
}

# Google Gemini Imagen 3.0 Integration Guide

## Overview

This system now uses **Google Gemini API with Imagen 3.0** for production-grade AI image generation. The implementation includes enterprise-level security, rate limiting, input validation, and robust error handling.

## Architecture

### Backend Components

#### 1. **GeminiService** (`app/Services/GeminiService.php`)
Encapsulates all Google Gemini API communication:

```php
// Usage Example
$geminiService = app(GeminiService::class);

// Generate image (returns base64 + mimeType)
$imageData = $geminiService->generateImage(
    'High quality product photo of fresh carrots',
    '1024x1024'
);

// Returns:
// [
//   'base64' => 'iVBORw0KGgoAAAANSUhEUg...',
//   'mimeType' => 'image/png'
// ]

// Save to storage
$path = $geminiService->saveImageToStorage($imageData, 'commodities');
```

**Key Features:**
- Uses `imagen-3.0-generate-001` model explicitly
- Parses API response to extract base64 image data
- Validates response structure (handles missing candidates)
- Saves images to storage with proper MIME type handling
- Comprehensive logging for debugging

#### 2. **AiController** (`app/Http/Controllers/Api/AiController.php`)
Handles HTTP requests with strict validation:

**Input Validation:**
- Prompt: required, 10-1000 characters
- Size: 512x512 or 1024x1024
- save_to_storage: boolean (default: true)
- Prompt sanitization to prevent injection attacks

**Response Format:**
```json
{
  "success": true,
  "message": "Image generated successfully",
  "data": {
    "base64": "iVBORw0KGgoAAAANSUhEUg...",
    "mimeType": "image/png",
    "dataUri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "storage_path": "commodities/gemini_65f1234567890_1712073600.png",
    "url": "http://localhost:8000/storage/commodities/gemini_65f1234567890_1712073600.png"
  }
}
```

**Error Handling:**
- 422: Validation errors (detailed field-specific messages)
- 429: Rate limit exceeded (includes retry_after seconds)
- 500: Server errors (API key issues, malformed responses)
- 503: Service unavailable (quota exceeded, billing issues)
- 504: Gateway timeout

#### 3. **AiRateLimiter Middleware** (`app/Http/Middleware/AiRateLimiter.php`)
Production safeguards against abuse:

- **Limit**: 10 requests per minute per user/IP
- **Tracking**: User ID if authenticated, otherwise IP address
- **Response**: 429 status with retry_after information
- **Configurable**: Via `config/services.php`

```php
// Configuration
'gemini' => [
    'rate_limit' => 10, // requests per minute
],
```

### Frontend Components

#### Commodities Page (`resources/js/pages/admin/commodities.tsx`)

**Enhanced Error Handling:**
```typescript
const generateAiImage = async (name: string, description: string) => {
  try {
    const response = await axios.post('/admin/ai/generate-image', {
      prompt: detailedPrompt,
      size: '1024x1024',
      save_to_storage: true,
    }, {
      timeout: 90000, // 90 second timeout
    });

    if (response.data.success && response.data.data?.base64) {
      // Display base64 image directly
      setGeneratedImageUrl(response.data.data.dataUri);
    }
  } catch (error) {
    // Specific error messages for each scenario:
    // - Timeout (90s)
    // - Rate limit (429) with retry countdown
    // - Validation errors (422)
    // - Service unavailable (503)
    // - Server error (500)
  }
};
```

**Features:**
- Base64 data URI rendering (no server round-trip needed for preview)
- Loading states during generation
- Rate limit awareness with countdown
- Validation error display
- 90-second timeout for Imagen 3.0 API

## Security Features

### 1. **API Key Protection**
✅ **NEVER exposed to client**
- Stored exclusively in `.env`
- Accessed via `config('services.gemini.api_key')`
- Used only server-side in GeminiService

### 2. **Input Validation**
```php
// Strict validation rules
'prompt' => ['required', 'string', 'min:10', 'max:1000'],
'size' => ['nullable', 'string', 'in:512x512,1024x1024'],
'save_to_storage' => ['nullable', 'boolean'],
```

### 3. **Prompt Sanitization**
```php
protected function sanitizePrompt(string $prompt): string
{
    // Remove null bytes and control characters
    $sanitized = preg_replace('/[\x00-\x08\x0B-\x0C\x0E-\x1F]/', '', $prompt);
    return trim($sanitized);
}
```

### 4. **Rate Limiting**
- Prevents API abuse
- Per-user tracking (or per-IP for guests)
- Configurable limits
- Clear error messages with retry information

### 5. **Separation of Concerns**
- **Frontend**: Presentation layer only (displays images, shows loading states)
- **Backend**: All API communication, security, validation, error handling
- **No business logic in frontend**

## Environment Configuration

### Required Variables (`.env`)

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_IMAGE_MODEL=imagen-3.0-generate-001
GEMINI_TEXT_MODEL=gemini-pro
```

### Optional Configuration (`config/services.php`)

```php
'gemini' => [
    'api_key' => env('GEMINI_API_KEY'),
    'image_model' => env('GEMINI_IMAGE_MODEL', 'imagen-3.0-generate-001'),
    'text_model' => env('GEMINI_TEXT_MODEL', 'gemini-pro'),
    'rate_limit' => 10, // requests per minute
],
```

## API Endpoints

### POST `/admin/ai/generate-image`

**Request:**
```json
{
  "prompt": "High quality professional product photo of fresh carrots",
  "size": "1024x1024",
  "save_to_storage": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image generated successfully",
  "data": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIA...",
    "mimeType": "image/png",
    "dataUri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "storage_path": "commodities/gemini_65f1234567890_1712073600.png",
    "url": "http://localhost:8000/storage/commodities/gemini_65f1234567890_1712073600.png"
  }
}
```

**Error Responses:**

**422 Validation Error:**
```json
{
  "success": false,
  "message": "Invalid input parameters",
  "errors": {
    "prompt": ["The prompt must be at least 10 characters."]
  }
}
```

**429 Rate Limited:**
```json
{
  "success": false,
  "message": "Too many AI generation requests. Please try again in 45 seconds.",
  "retry_after": 45
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Failed to generate image. Please try again in a few moments.",
  "error": "API request failed: 500 - Internal Server Error" // Only in debug mode
}
```

## Usage Examples

### Basic Image Generation

```typescript
// Frontend React component
const handleGenerateImage = async () => {
  try {
    setIsGenerating(true);
    
    const response = await axios.post('/admin/ai/generate-image', {
      prompt: 'Professional product photo of fresh organic tomatoes',
      size: '1024x1024',
      save_to_storage: true,
    });

    if (response.data.success) {
      // Display image using data URI
      setImageSrc(response.data.data.dataUri);
      
      // Store path for form submission
      setStoragePath(response.data.data.storage_path);
    }
  } catch (error) {
    console.error('Generation failed:', error);
    alert(getErrorMessage(error));
  } finally {
    setIsGenerating(false);
  }
};
```

### Rendering Base64 Image

```tsx
// Direct rendering with data URI
<img 
  src={generatedImageUrl} // "data:image/png;base64,iVBORw0KGgo..."
  alt="AI Generated commodity"
  className="w-full h-auto rounded-lg"
/>

// Or construct data URI manually
{generatedImageData && (
  <img 
    src={`data:${generatedImageData.mimeType};base64,${generatedImageData.base64}`}
    alt="Generated"
  />
)}
```

## Error Handling Guide

### Common Errors & Solutions

#### 1. **"Prompt must be at least 10 characters" (422)**
**Cause**: Input validation failed  
**Solution**: Provide more detailed prompt (minimum 10 characters)

#### 2. **"Rate limit exceeded" (429)**
**Cause**: Too many requests in short time  
**Solution**: Wait the specified `retry_after` seconds before trying again

#### 3. **"Request timed out" (Client-side)**
**Cause**: API took longer than 90 seconds  
**Solution**: 
- Check internet connection
- Try again (service may be temporarily busy)
- Reduce image complexity in prompt

#### 4. **"AI service quota exceeded" (503)**
**Cause**: Google API quota or billing issue  
**Solution**: 
- Check Google Cloud Console for quota status
- Verify billing is enabled
- Wait until quota resets

#### 5. **"No image data found in API response" (500)**
**Cause**: Malformed API response or parsing error  
**Solution**: 
- Check Laravel logs for details
- Verify API key is valid
- Check Google Cloud status

## Logging & Debugging

### Log Locations
All AI generation attempts are logged to `storage/logs/laravel.log`:

**Successful Generation:**
```
[2026-04-02 15:30:00] local.INFO: Starting Gemini image generation
{"model":"imagen-3.0-generate-001","prompt_length":85,"size":"1024x1024"}

[2026-04-02 15:30:05] local.INFO: Image generated successfully
{"mime_type":"image/png","base64_length":245678}

[2026-04-02 15:30:05] local.INFO: Image saved to storage
{"path":"commodities/gemini_65f1234567890_1712073600.png"}
```

**Failed Generation:**
```
[2026-04-02 15:35:00] local.ERROR: Gemini image generation failed
{"error":"API request failed: 403","trace":"..."}
```

### Debug Mode
Enable detailed error messages in development:
```env
APP_DEBUG=true
```

In production, keep it disabled to hide sensitive information:
```env
APP_DEBUG=false
```

## Performance Considerations

### Response Times
- **Typical**: 5-15 seconds
- **Peak hours**: 15-30 seconds
- **Timeout threshold**: 90 seconds

### Storage
Images are automatically saved to:
- Path: `storage/app/public/commodities/`
- Accessible via: `/storage/commodities/{filename}`
- Format: PNG (lossless quality)

### Caching Strategy
- Images are persisted to storage by default
- Can be disabled by sending `save_to_storage: false`
- Reuse existing images when possible (don't regenerate unnecessarily)

## Best Practices

### 1. **Prompt Engineering**
```typescript
// ✅ Good prompt (detailed, specific)
const prompt = `High quality professional product photo of fresh ${name}. 
                ${description}. Studio lighting, white background, 
                commercial photography style, photorealistic.`;

// ❌ Bad prompt (too vague)
const prompt = `${name} picture`;
```

### 2. **Rate Limit Awareness**
```typescript
// Implement client-side throttling
const [lastRequestTime, setLastRequestTime] = useState<number>(0);

const canMakeRequest = () => {
  const now = Date.now();
  return (now - lastRequestTime) > 6000; // At least 6 seconds between requests
};
```

### 3. **Error Recovery**
```typescript
// Automatic retry with exponential backoff
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

### 4. **Image Optimization**
```typescript
// Compress base64 before displaying (if needed)
const compressBase64Image = (base64: string, maxWidth = 800): string => {
  // Implementation depends on your needs
  // Consider using canvas API or libraries like browser-image-compression
};
```

## Testing Checklist

- [ ] API key is configured and valid
- [ ] Rate limiting works (try 11 rapid requests)
- [ ] Validation rejects prompts < 10 chars
- [ ] Validation rejects prompts > 1000 chars
- [ ] Base64 image displays correctly in UI
- [ ] Images are saved to storage
- [ ] Storage URLs are accessible
- [ ] Error messages are user-friendly
- [ ] Logs capture all attempts
- [ ] Timeout works (90 seconds)
- [ ] Loading states display properly

## Troubleshooting

See `AI_TROUBLESHOOTING.md` for detailed troubleshooting guide.

---

**Last Updated**: April 2, 2026  
**Version**: 3.0 (Google Gemini Imagen 3.0 Integration)  
**Model**: imagen-3.0-generate-001

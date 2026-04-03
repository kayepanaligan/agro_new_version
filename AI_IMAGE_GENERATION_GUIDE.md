# AI Image Generation Integration Guide

## Overview
This guide explains the AI image generation feature that has been integrated into the commodity management module. The system now supports automatic generation of product images using AI based on commodity name and description.

## Issues Fixed

### 1. Migration Error
**Problem**: The `sync_logs` table migration had an invalid timestamp default value for MySQL.

**Solution**: Updated the migration to use proper timestamp defaults:
- Made `timestamp` field nullable
- Added `useCurrent()` to `synced_at` field

### 2. AI Generate Checkbox Not Working
**Problem**: The AI generate checkbox was only showing placeholder images and not actually generating real AI images.

**Solution**: Implemented a complete AI image generation service with multiple provider options.

## Architecture

### Backend Components

#### 1. GeminiService (`app/Services/GeminiService.php`)
A service class that handles AI image and text generation with support for multiple providers:

- **Pollinations.ai** (Default - Free, no API key required)
  - Uses Flux model
  - Generates high-quality images
  - No configuration needed
  
- **Stability AI** (Optional - Requires API key)
  - Production-grade image generation
  - Commented out by default, can be enabled by adding API key
  
- **Hugging Face** (Optional - Requires token)
  - Uses Stable Diffusion XL
  - Falls back to Pollinations if token not configured

- **Gemini Text Generation**
  - Uses your existing GEMINI_API_KEY from .env
  - For generating text content (descriptions, etc.)

#### 2. AI Controller (`app/Http/Controllers/Api/AiController.php`)
API controller with two endpoints:
- `POST /api/ai/generate-image` - Generate images from text prompts
- `POST /api/ai/generate-text` - Generate text content using Gemini

#### 3. CommodityController Updates
- Integrated GeminiService
- Updated `generateAiImage()` method to use real AI generation
- Creates detailed prompts including commodity name and description

### Frontend Components

#### 1. Commodities Page (`resources/js/pages/admin/commodities.tsx`)
Enhanced features:
- Real AI image generation via API calls
- "Generate AI Image Now" button (appears when AI checkbox is checked)
- Loading states with spinner during generation
- Success/error notifications
- Image preview after generation

Key functions:
- `generateAiImage(name, description)` - Calls the AI API
- Handles image upload to FormData when submitting form

## Configuration

### Environment Variables

The system uses your existing `.env` configuration:

```env
# Already configured
GEMINI_API_KEY=AIzaSyDMMvcBxXU6rNGr9MMBZE0KnkqCnIUY7M4

# Optional: Add Stability AI key for production use
# STABILITY_AI_API_KEY=your_key_here

# Optional: Add Hugging Face token
# HUGGINGFACE_TOKEN=your_token_here
```

### Service Configuration

Added to `config/services.php`:
```php
'gemini' => [
    'api_key' => env('GEMINI_API_KEY'),
],
```

## Usage

### Creating a Commodity with AI Image

1. Navigate to Admin → Commodities
2. Click "Add Commodity"
3. Fill in the details:
   - Select Category
   - Enter Name (e.g., "Carrot")
   - Enter Description (e.g., "Fresh orange carrots")
4. Check the "AI-Generate Image" checkbox
5. A "Generate AI Image Now" button will appear
6. Click the button to generate an image
7. Wait for the AI to generate the image (shows loading state)
8. Preview the generated image
9. Click "Create Commodity" to save

### Editing a Commodity with AI Image

1. Click the menu (⋮) on any commodity
2. Select "Edit"
3. Check "AI-Generate Image" checkbox
4. Click "Generate AI Image Now"
5. Save changes

## API Endpoints

### Generate Image (Web Route - Recommended for Admin UI)
```http
POST /admin/ai/generate-image
Content-Type: application/json

{
    "prompt": "High quality professional product photo of fresh Carrot. Fresh orange carrots. Studio lighting, white background, commercial photography style.",
    "size": "1024x1024"
}
```

Response:
```json
{
    "success": true,
    "image_url": "http://localhost:8000/storage/commodities/ai_65f1234567890.jpg",
    "image_path": "commodities/ai_65f1234567890.jpg",
    "message": "Image generated successfully"
}
```

### Generate Image (API Route - For Mobile/External Apps)
```http
POST /api/ai/generate-image
Content-Type: application/json
Authorization: Bearer {token}

{
    "prompt": "High quality professional product photo of fresh Carrot. Fresh orange carrots. Studio lighting, white background, commercial photography style.",
    "size": "1024x1024"
}
```

### Generate Text
```http
POST /api/ai/generate-text
Content-Type: application/json
Authorization: Bearer {token}

{
    "prompt": "Write a description for organic tomatoes"
}
```

## Storage

Generated images are stored in:
- Path: `storage/app/public/commodities/`
- Filename format: `ai_{uniqueid}_{timestamp}.jpg`
- Accessible via: `/storage/commodities/{filename}`

## Troubleshooting

### Image Generation Fails

1. **Check logs**: `storage/logs/laravel.log`
2. **Verify storage link**: Run `php artisan storage:link`
3. **Clear cache**: Run `php artisan config:clear && php artisan cache:clear`
4. **Check permissions**: Ensure `storage/app/public` is writable

### API Returns 500 Error

Common causes:
- Network connectivity issues (for external APIs)
- Invalid prompt content
- Server memory limits

Solutions:
- Check error logs
- Verify API keys are valid
- Increase PHP memory limit if needed

### CSRF Token Errors

The app.blade.php includes the CSRF token meta tag automatically. If you still get errors:
1. Clear browser cache
2. Refresh the page
3. Check that `@inertiaHead` is in the layout

## Future Enhancements

Possible improvements:
1. **Multiple Image Generation**: Generate 2-4 variations
2. **Image Style Selection**: Choose between photo, illustration, etc.
3. **Batch Generation**: Generate images for multiple commodities at once
4. **Image Editing**: Modify existing images with AI
5. **Progress Indicator**: Show actual progress bar during generation
6. **Image History**: Keep track of previously generated images

## Provider Comparison

| Provider | Cost | Quality | Speed | Setup |
|----------|------|---------|-------|-------|
| Pollinations.ai | Free | Good | Fast | None |
| Stability AI | Paid | Excellent | Medium | API Key |
| Hugging Face | Freemium | Very Good | Medium | Token |

## Security Notes

- **Web routes** (`/admin/ai/*`) use session-based authentication via Laravel's web middleware
- **API routes** (`/api/ai/*`) are protected by Sanctum token authentication
- Only authenticated admin users can generate images
- File uploads are validated (max 2MB, image types only)
- Generated images are stored securely in storage/app
- CSRF protection is automatically handled by axios for web routes

## Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Review this guide
3. Check browser console for frontend errors
4. Verify environment configuration

---

**Last Updated**: April 2, 2026
**Version**: 1.0

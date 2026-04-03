# AI Image Generation Troubleshooting Guide

## Recent Issues Fixed

### ✅ Issue 1: 401 Unauthorized Error
**Problem**: Frontend was calling `/api/ai/generate-image` which requires Sanctum token authentication.

**Solution**: Created web routes at `/admin/ai/generate-image` that use session-based authentication.

### ✅ Issue 2: 500 Internal Server Error - Pollinations.ai 502 Bad Gateway
**Problem**: Pollinations.ai service was returning 502 errors, likely due to:
- Rate limiting from too many requests
- Service temporarily unavailable
- Network connectivity issues

**Solutions Implemented**:

1. **Improved Error Handling**
   - Added detailed logging at each step
   - Better error messages for users
   - Specific handling for timeouts (60 second timeout)

2. **Fallback Mechanism**
   - Primary: Pollinations.ai (free, no API key)
   - Fallback: Hugging Face (requires token, optional)
   - Graceful degradation if all services fail

3. **Enhanced Reliability**
   - Increased timeout from default to 60 seconds
   - Validates image size (>1000 bytes) before saving
   - Detailed logging for debugging

## Current Architecture

```
Admin User → /admin/ai/generate-image (web route)
                ↓
        Session Authentication ✓
                ↓
        AiController@generateImage
                ↓
        GeminiService.generateImage()
                ↓
        Try Pollinations.ai (60s timeout)
                ↓ (if fails)
        Try Hugging Face (if configured)
                ↓ (if fails)
        Return error with helpful message
```

## Testing Instructions

### Test 1: Basic Functionality
1. Go to Admin → Commodities
2. Click "Add Commodity"
3. Fill in:
   - Category: Choose any
   - Name: "Test Carrot"
   - Description: "Fresh orange carrots"
4. Check "AI-Generate Image" checkbox
5. Click "Generate AI Image Now"
6. Wait up to 60 seconds (shows loading state)
7. Expected: Success message with image preview

### Test 2: Timeout Handling
1. Follow steps above
2. If Pollinations.ai is slow/unavailable:
   - Expected: Loading spinner for up to 60 seconds
   - Then: Helpful error message about timeout
   - You can try again immediately

### Test 3: Error Messages
Different scenarios show different messages:

**Timeout (60 seconds)**:
> ⚠️ Failed to generate AI image. The request timed out. The AI service may be busy. Please try again.

**Service Unavailable (503)**:
> ⚠️ Failed to generate AI image. The AI service is temporarily unavailable. Please try again in a few moments.

**Server Error (500)**:
> ⚠️ Failed to generate AI image. An internal server error occurred. Please check the logs and try again.

## Debugging Steps

### Check if Pollinations.ai is Accessible
Open PowerShell and run:
```powershell
$response = Invoke-RestMethod -Uri "https://image.pollinations.ai/prompt/test?width=256&height=256" -TimeoutSec 10
Write-Host "Status: OK, Length: $($response.Length) bytes"
```

Expected: Should return image data (10000+ bytes)

### Check Laravel Logs
```bash
# View recent AI generation attempts
Get-Content storage\logs\laravel.log -Tail 50 | Select-String "AI|Pollinations|generateImage"
```

Look for:
- ✅ `AI image generation request` - Request received
- ✅ `Attempting Pollinations.ai request` - Trying primary service
- ✅ `Pollinations.ai image saved` - Success!
- ⚠️ `Pollinations.ai image generation failed` - Service returned invalid response
- ❌ `All AI image generation methods failed` - All providers failed

### Check Browser Console
Open DevTools (F12) → Console tab

Expected successful flow:
```
POST http://127.0.0.1:8000/admin/ai/generate-image 200 (OK)
✅ AI image generated successfully!
```

Error flow:
```
POST http://127.0.0.1:8000/admin/ai/generate-image 503 (Service Unavailable)
⚠️ Failed to generate AI image...
```

## Common Issues & Solutions

### Issue: "Failed to generate image" immediately (within 1-2 seconds)
**Cause**: Pollinations.ai returned invalid response or error

**Solutions**:
1. Wait 30 seconds and try again (temporary rate limit)
2. Check your internet connection
3. Verify Pollinations.ai status by running the test command above

### Issue: Loading forever then timeout error
**Cause**: Pollinations.ai server not responding

**Solutions**:
1. Check firewall/antivirus isn't blocking external requests
2. Try again in a few minutes
3. Consider adding Hugging Face token as backup (see below)

### Issue: 404 errors in console for /api/commodities
**Cause**: PWA service worker trying to cache non-existent API endpoints

**Impact**: None - this is unrelated to AI image generation

**Solution**: These are warnings from the offline PWA feature and can be ignored. They don't affect commodity management or AI generation.

## Advanced Configuration

### Option 1: Add Hugging Face as Backup (Recommended for Production)

1. Get free token from https://huggingface.co/settings/tokens
2. Add to `.env`:
   ```env
   HUGGINGFACE_TOKEN=your_token_here
   ```
3. Clear config cache:
   ```bash
   php artisan config:clear
   ```

Benefits:
- More reliable than Pollinations alone
- Higher quality images from Stable Diffusion
- Falls back gracefully if token not configured

### Option 2: Use Stability AI (Production Grade)

1. Get API key from https://platform.stability.ai/
2. Add to `.env`:
   ```env
   STABILITY_AI_API_KEY=your_key_here
   ```
3. Uncomment `generateWithStabilityAI` method in `GeminiService.php`
4. Update `generateImage()` to call it

Benefits:
- Enterprise-grade reliability
- Highest quality images
- SLA guarantee

## Performance Tips

1. **Generate images during off-peak hours** - Free services may be slower during peak times
2. **Use smaller image size for testing** - Change to '512x512' in development
3. **Cache generated images** - Images are automatically saved, reuse them when editing
4. **Batch operations** - Generate all commodity images at once if creating multiple items

## Monitoring

### Success Rate Tracking
Check logs daily:
```bash
# Count successful generations
Get-Content storage\logs\laravel.log | Select-String "AI image generated successfully" | Measure-Object | Select-Object -ExpandProperty Count

# Count failures  
Get-Content storage\logs\laravel.log | Select-String "AI image generation failed" | Measure-Object | Select-Object -ExpandProperty Count
```

Good success rate: >90%
Acceptable: >80%
Investigate if: <80%

## Support Resources

- **Documentation**: `AI_IMAGE_GENERATION_GUIDE.md`
- **Service Status**: https://pollinations.ai/status (if available)
- **Logs**: `storage/logs/laravel.log`
- **Browser Console**: F12 → Console tab

## Known Limitations

1. **Free Service Limits**: Pollinations.ai may rate limit after many requests
2. **Generation Time**: Can take 10-60 seconds depending on server load
3. **Image Quality**: May vary; not professional photography quality
4. **Content Restrictions**: Some prompts may be rejected by the AI

## Future Improvements

Potential enhancements:
- [ ] Queue system for background generation
- [ ] Email notification when image ready
- [ ] Multiple image variations
- [ ] Image style selection (photo, illustration, etc.)
- [ ] Progress bar with percentage
- [ ] Retry button with exponential backoff

---

**Last Updated**: April 2, 2026
**Version**: 2.0 (with fallback support)

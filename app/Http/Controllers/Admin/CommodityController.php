<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Commodity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommodityController extends Controller
{
    /**
     * Display commodities page.
     */
    public function index(): Response
    {
        $commodities = Commodity::with('category')->orderBy('name', 'asc')->get();
        $categories = Category::orderBy('name', 'asc')->get(['id', 'name']);

        return Inertia::render('admin/commodities', [
            'commodities' => $commodities,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a new commodity.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:commodities,name',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'use_ai_generated' => 'nullable|boolean',
        ], [
            'name.unique' => 'A commodity with this name already exists. Please use a unique name.',
        ]);

        $useAiGenerated = $request->boolean('use_ai_generated');

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('commodities', 'public');
        } elseif ($useAiGenerated && !empty($validated['name'])) {
            // Generate image using AI based on name and description
            $imagePath = $this->generateAiImage(
                $validated['name'],
                $validated['description'] ?? ''
            );
            if ($imagePath) {
                $validated['image_path'] = $imagePath;
            }
        }

        Commodity::create($validated);

        return back()->with('success', 'Commodity created successfully.');
    }

    /**
     * Update an existing commodity.
     */
    public function update(Request $request, Commodity $commodity): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255|unique:commodities,name,' . $commodity->id,
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'use_ai_generated' => 'nullable|boolean',
        ], [
            'name.unique' => 'A commodity with this name already exists. Please use a unique name.',
        ]);

        $useAiGenerated = $request->boolean('use_ai_generated');

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($commodity->image_path) {
                \Storage::disk('public')->delete($commodity->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('commodities', 'public');
        } elseif ($useAiGenerated && !empty($validated['name']) && !$commodity->image_path) {
            // Generate image using AI only if there's no existing image
            $imagePath = $this->generateAiImage(
                $validated['name'],
                $validated['description'] ?? ''
            );
            if ($imagePath) {
                $validated['image_path'] = $imagePath;
            }
        }

        $commodity->update($validated);

        return back()->with('success', 'Commodity updated successfully.');
    }

    /**
     * Generate an AI image based on commodity details.
     * This is a placeholder - in production, you would integrate with an AI image generation API
     * like DALL-E, Stable Diffusion, Midjourney, etc.
     */
    private function generateAiImage(string $name, string $description): ?string
    {
        // TODO: Integrate with actual AI image generation API
        // For now, this returns null and the commodity will be created without an image
        
        // Example integration with an AI service:
        // $prompt = "High quality product photo of {$name}. {$description}";
        // $response = Http::post('https://api.example.com/generate-image', [
        //     'prompt' => $prompt,
        //     'size' => '1024x1024',
        // ]);
        // $imageUrl = $response->json('image_url');
        // $imageContent = file_get_contents($imageUrl);
        // $filename = 'commodities/ai_' . uniqid() . '.png';
        // Storage::disk('public')->put($filename, $imageContent);
        // return $filename;
        
        return null;
    }

    /**
     * Delete a commodity.
     */
    public function destroy(Commodity $commodity): RedirectResponse
    {
        // Delete image if exists
        if ($commodity->image_path) {
            \Storage::disk('public')->delete($commodity->image_path);
        }

        $commodity->delete();

        return back()->with('success', 'Commodity deleted successfully.');
    }
}

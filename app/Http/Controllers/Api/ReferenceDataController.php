<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commodity;
use App\Models\Variety;
use App\Models\DamageType;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ReferenceDataController extends Controller
{
    /**
     * Get all commodities
     */
    public function commodities(): ResourceCollection
    {
        $commodities = Commodity::with('category')->get();
        
        return new ResourceCollection($commodities);
    }

    /**
     * Get all varieties
     */
    public function varieties(): ResourceCollection
    {
        $varieties = Variety::with('commodity')->get();
        
        return new ResourceCollection($varieties);
    }

    /**
     * Get all damage types
     */
    public function damageTypes(): ResourceCollection
    {
        $damageTypes = DamageType::with('damageCategory')->get();
        
        return new ResourceCollection($damageTypes);
    }

    /**
     * Get all programs
     */
    public function programs(): ResourceCollection
    {
        $programs = Program::all();
        
        return new ResourceCollection($programs);
    }
}

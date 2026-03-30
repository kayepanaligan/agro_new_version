<?php

namespace Database\Seeders;

use App\Models\Commodity;
use App\Models\Variety;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VarietySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $carrot = Commodity::where('name', 'Carrot')->first();
        $tomato = Commodity::where('name', 'Tomato')->first();
        $banana = Commodity::where('name', 'Banana')->first();
        $mango = Commodity::where('name', 'Mango')->first();
        $rice = Commodity::where('name', 'Rice')->first();
        $potato = Commodity::where('name', 'Potato')->first();

        $varieties = [
            // Carrot varieties
            [
                'commodity_id' => $carrot->id,
                'name' => 'Nantes',
                'description' => 'Sweet, crisp, and cylindrical orange carrots',
            ],
            [
                'commodity_id' => $carrot->id,
                'name' => 'Chantenay',
                'description' => 'Short, broad carrots with strong shoulders',
            ],
            // Tomato varieties
            [
                'commodity_id' => $tomato->id,
                'name' => 'Roma',
                'description' => 'Plum tomatoes, ideal for sauces and paste',
            ],
            [
                'commodity_id' => $tomato->id,
                'name' => 'Beefsteak',
                'description' => 'Large slicing tomatoes with meaty flesh',
            ],
            [
                'commodity_id' => $tomato->id,
                'name' => 'Cherry',
                'description' => 'Small, sweet tomatoes perfect for salads',
            ],
            // Banana varieties
            [
                'commodity_id' => $banana->id,
                'name' => 'Cavendish',
                'description' => 'Most common commercial banana variety',
            ],
            [
                'commodity_id' => $banana->id,
                'name' => 'Saba',
                'description' => 'Cooking banana, starchy and slightly sweet',
            ],
            [
                'commodity_id' => $banana->id,
                'name' => 'Lakatan',
                'description' => 'Sweet Philippine banana variety',
            ],
            // Mango varieties
            [
                'commodity_id' => $mango->id,
                'name' => 'Carabao',
                'description' => 'Sweet Philippine mango variety, also known as Manila mango',
            ],
            [
                'commodity_id' => $mango->id,
                'name' => 'Pico',
                'description' => 'Small mango variety with fibrous flesh',
            ],
            // Rice varieties
            [
                'commodity_id' => $rice->id,
                'name' => 'Jasmine',
                'description' => 'Fragrant long-grain rice',
            ],
            [
                'commodity_id' => $rice->id,
                'name' => 'Basmati',
                'description' => 'Aromatic long-grain rice from India',
            ],
            [
                'commodity_id' => $rice->id,
                'name' => 'Glutinous',
                'description' => 'Sticky rice used in desserts',
            ],
            // Potato varieties
            [
                'commodity_id' => $potato->id,
                'name' => 'Russet',
                'description' => 'Brown-skinned potato, ideal for baking and frying',
            ],
            [
                'commodity_id' => $potato->id,
                'name' => 'Red',
                'description' => 'Red-skinned waxy potatoes, great for boiling',
            ],
        ];

        foreach ($varieties as $variety) {
            Variety::create($variety);
        }
    }
}

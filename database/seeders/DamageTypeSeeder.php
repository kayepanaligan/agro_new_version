<?php

namespace Database\Seeders;

use App\Models\DamageCategory;
use App\Models\DamageType;
use Illuminate\Database\Seeder;

class DamageTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pestCategory = DamageCategory::where('damage_category_name', 'Pest Damage')->first();
        $diseaseCategory = DamageCategory::where('damage_category_name', 'Disease Damage')->first();
        $weatherCategory = DamageCategory::where('damage_category_name', 'Weather Damage')->first();
        $nutrientCategory = DamageCategory::where('damage_category_name', 'Nutrient Deficiency')->first();

        $damageTypes = [
            // Pest Damage
            [
                'damage_type_name' => 'Stem Borer Damage',
                'damage_category_id' => $pestCategory?->damage_category_id,
                'damage_type_description' => 'Damage caused by stem borers attacking plant stems',
                'is_ai_generated' => false,
            ],
            [
                'damage_type_name' => 'Leaf Folder Damage',
                'damage_category_id' => $pestCategory?->damage_category_id,
                'damage_type_description' => 'Damage caused by leaf folders folding and feeding on leaves',
                'is_ai_generated' => false,
            ],
            [
                'damage_type_name' => 'Planthopper Damage',
                'damage_category_id' => $pestCategory?->damage_category_id,
                'damage_type_description' => 'Damage caused by planthoppers sucking plant sap',
                'is_ai_generated' => false,
            ],
            
            // Disease Damage
            [
                'damage_type_name' => 'Blast Disease',
                'damage_category_id' => $diseaseCategory?->damage_category_id,
                'damage_type_description' => 'Fungal disease causing lesions on leaves, nodes, and panicles',
                'is_ai_generated' => false,
            ],
            [
                'damage_type_name' => 'Sheath Blight',
                'damage_category_id' => $diseaseCategory?->damage_category_id,
                'damage_type_description' => 'Fungal disease affecting leaf sheaths and stems',
                'is_ai_generated' => false,
            ],
            [
                'damage_type_name' => 'Bacterial Leaf Streak',
                'damage_category_id' => $diseaseCategory?->damage_category_id,
                'damage_type_description' => 'Bacterial infection causing water-soaked streaks on leaves',
                'is_ai_generated' => false,
            ],
            
            // Weather Damage
            [
                'damage_type_name' => 'Lodging',
                'damage_category_id' => $weatherCategory?->damage_category_id,
                'damage_type_description' => 'Plants falling over due to strong winds or heavy rain',
                'is_ai_generated' => false,
            ],
            [
                'damage_type_name' => 'Drought Stress',
                'damage_category_id' => $weatherCategory?->damage_category_id,
                'damage_type_description' => 'Damage from prolonged lack of water',
                'is_ai_generated' => false,
            ],
            [
                'damage_type_name' => 'Flood Damage',
                'damage_category_id' => $weatherCategory?->damage_category_id,
                'damage_type_description' => 'Damage from excessive water submergence',
                'is_ai_generated' => false,
            ],
            
            // Nutrient Deficiency
            [
                'damage_type_name' => 'Nitrogen Deficiency',
                'damage_category_id' => $nutrientCategory?->damage_category_id,
                'damage_type_description' => 'Yellowing of older leaves, stunted growth',
                'is_ai_generated' => false,
            ],
            [
                'damage_type_name' => 'Phosphorus Deficiency',
                'damage_category_id' => $nutrientCategory?->damage_category_id,
                'damage_type_description' => 'Dark green leaves with purple tips, delayed maturity',
                'is_ai_generated' => false,
            ],
            [
                'damage_type_name' => 'Potassium Deficiency',
                'damage_category_id' => $nutrientCategory?->damage_category_id,
                'damage_type_description' => 'Brown spots on leaf margins, weak stems',
                'is_ai_generated' => false,
            ],
        ];

        foreach ($damageTypes as $type) {
            DamageType::create($type);
        }
    }
}

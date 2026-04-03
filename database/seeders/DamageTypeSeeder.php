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
            ],
            [
                'damage_type_name' => 'Leaf Folder Damage',
                'damage_category_id' => $pestCategory?->damage_category_id,
                'damage_type_description' => 'Damage caused by leaf folders folding and feeding on leaves',
            ],
            [
                'damage_type_name' => 'Brown Planthopper Damage',
                'damage_category_id' => $pestCategory?->damage_category_id,
                'damage_type_description' => 'Damage caused by planthoppers sucking plant sap causing hopper burn',
            ],
            
            // Disease Damage
            [
                'damage_type_name' => 'Rice Blast Disease',
                'damage_category_id' => $diseaseCategory?->damage_category_id,
                'damage_type_description' => 'Fungal disease causing diamond-shaped lesions on leaves, nodes, and panicles',
            ],
            [
                'damage_type_name' => 'Sheath Blight',
                'damage_category_id' => $diseaseCategory?->damage_category_id,
                'damage_type_description' => 'Fungal disease affecting leaf sheaths and stems',
            ],
            [
                'damage_type_name' => 'Bacterial Leaf Streak',
                'damage_category_id' => $diseaseCategory?->damage_category_id,
                'damage_type_description' => 'Bacterial infection causing water-soaked streaks on leaves',
            ],
            
            // Weather Damage
            [
                'damage_type_name' => 'Lodging',
                'damage_category_id' => $weatherCategory?->damage_category_id,
                'damage_type_description' => 'Plants falling over due to strong winds or heavy rain',
            ],
            [
                'damage_type_name' => 'Drought Stress',
                'damage_category_id' => $weatherCategory?->damage_category_id,
                'damage_type_description' => 'Damage from prolonged lack of water causing leaf rolling and stunting',
            ],
            [
                'damage_type_name' => 'Flood Damage',
                'damage_category_id' => $weatherCategory?->damage_category_id,
                'damage_type_description' => 'Damage from excessive water submergence',
            ],
            
            // Nutrient Deficiency
            [
                'damage_type_name' => 'Nitrogen Deficiency',
                'damage_category_id' => $nutrientCategory?->damage_category_id,
                'damage_type_description' => 'Yellowing of older leaves, stunted growth and reduced tillering',
            ],
            [
                'damage_type_name' => 'Phosphorus Deficiency',
                'damage_category_id' => $nutrientCategory?->damage_category_id,
                'damage_type_description' => 'Dark green leaves with purple tips, delayed maturity',
            ],
            [
                'damage_type_name' => 'Potassium Deficiency',
                'damage_category_id' => $nutrientCategory?->damage_category_id,
                'damage_type_description' => 'Brown spots on leaf margins, weak stems prone to lodging',
            ],
            [
                'damage_type_name' => 'Zinc Deficiency',
                'damage_category_id' => $nutrientCategory?->damage_category_id,
                'damage_type_description' => 'Interveinal chlorosis, brown spots and reddish-brown coloration on basal leaves',
            ],
        ];

        foreach ($damageTypes as $type) {
            DamageType::create($type);
        }
    }
}

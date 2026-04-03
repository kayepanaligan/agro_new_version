# How to Seed Crop Damage Records Data

## Quick Start

### Option 1: Seed All Data (Fresh Database)
If you have a fresh database or want to reseed everything:

```bash
php artisan db:seed
```

This will run all seeders in the correct order:
1. Roles
2. Categories → Commodities → Varieties
3. Programs
4. Units of Measure
5. Organizations
6. Farmers
7. **Damage Categories** ← Required for crop damage
8. **Damage Types** ← Required for crop damage  
9. Allocation Types
10. Eligibility Rules
11. Allocation Policies
12. Distribution Records
13. Acknowledgements
14. **Crop Damage Records** ← Our new data!

### Option 2: Seed Specific Tables Only
If you already have base data and just want crop damage records:

```bash
# Step 1: Seed damage categories (if not exists)
php artisan db:seed --class=DamageCategorySeeder

# Step 2: Seed damage types (if not exists)
php artisan db:seed --class=DamageTypeSeeder

# Step 3: Seed crop damage records
php artisan db:seed --class=CropDamageRecordSeeder
```

### Option 3: Fresh Migration + Seeding
For completely fresh start:

```bash
# Warning: This deletes all data!
php artisan migrate:fresh --seed
```

## Expected Output

### Successful Damage Category Seeding:
```
INFO  Seeding database.
Database\Seeders\DamageCategorySeeder ........................ RUNNING  
Database\Seeders\DamageCategorySeeder ...................... DONE  
```

### Successful Damage Type Seeding:
```
INFO  Seeding database.
Database\Seeders\DamageTypeSeeder ............................ RUNNING  
Database\Seeders\DamageTypeSeeder .......................... DONE  
```

### Successful Crop Damage Record Seeding:
```
INFO  Seeding database.
Database\Seeders\CropDamageRecordSeeder ..................... RUNNING  
15 crop damage records seeded successfully!
Database\Seeders\CropDamageRecordSeeder .................... DONE  
```

## Troubleshooting

### Error: "No farmers or damage types found"
**Cause**: Missing prerequisite data
**Solution**: Run full seeder or seed damage categories/types first

```bash
php artisan db:seed --class=DamageCategorySeeder
php artisan db:seed --class=DamageTypeSeeder
php artisan db:seed --class=FarmerSeeder
php artisan db:seed --class=CropDamageRecordSeeder
```

### Error: "Duplicate entry" 
**Cause**: Data already exists in database
**Solution**: This is normal if running seeder multiple times. Skip or refresh database.

```bash
# To clear and reseed:
php artisan migrate:fresh --seed
```

### Error: "Column 'is_ai_generated' not found"
**Cause**: Old seeder code with removed column
**Solution**: Already fixed in updated seeder. Pull latest changes.

## Verification

After seeding, verify data in Laravel Tinker:

```bash
php artisan tinker
```

Then run these commands:

```php
// Check damage categories count
App\Models\DamageCategory::count()
// Should return: 5

// Check damage types count
App\Models\DamageType::count()
// Should return: 14

// Check crop damage records count
App\Models\CropDamageRecord::count()
// Should return: 15

// View a sample record
App\Models\CropDamageRecord::with(['farm', 'damageType'])->first()
// Should show complete record with relationships

// Check severity distribution
App\Models\CropDamageRecord::selectRaw('damage_severity, count(*) as count')
    ->groupBy('damage_severity')
    ->get()
// Should show: high: 6, medium: 5, low: 4

// Check status distribution  
App\Models\CropDamageRecord::selectRaw('status, count(*) as count')
    ->groupBy('status')
    ->get()
// Should show: closed: 7, verified: 6, pending: 2
```

## Testing in Browser

1. Navigate to: `http://localhost:8000/admin/crop-damage-records`
2. You should see:
   - 15 crop damage records in card view
   - Toggle to list view to see table layout
   - Test filters (severity, status)
   - Test sorting (click column headers)
   - Test search functionality
   - Test pagination

### Sample Search Terms:
- "blast" - Find rice blast records
- "stem borer" - Find pest damage
- "drought" - Find weather damage
- "nitrogen" - Find nutrient deficiency

### Sample Filter Combinations:
- Severity: High | Status: Verified (6 records)
- Severity: Low | Status: Closed (3 records)
- All Severities | Status: Pending (2 records)

## Data Relationships

Visual representation of seeded data:

```
Farmer (from FarmerSeeder)
  ↓
Farm (auto-created during seeding)
  ↓
CropDamageRecord (15 records)
  ├── Photo/Proof (null - can be added via UI)
  ├── DamageType (linked to 14 types)
  │     └── DamageCategory (5 categories)
  ├── Commodity (Rice, etc.)
  └── Variety (PSB Rc82, NSIC Rc222, etc.)
```

## Next Steps After Seeding

1. ✅ View records in card/list mode
2. ✅ Test filtering and sorting
3. ✅ Click records to view details
4. ✅ Edit existing records
5. ✅ Create new records
6. ✅ Upload photos for records
7. ✅ Change status workflows
8. ✅ Export/search functionality

## Seed Data Highlights

The fake data includes realistic scenarios like:
- **Typhoon damage** with 60% crop loss
- **Rice blast outbreaks** affecting 3 hectares
- **Drought stress** with irrigation issues
- **Nutrient deficiencies** with treatment plans
- **Combined pest/disease pressure** scenarios

All records have:
- Realistic dates (2-35 days ago)
- Detailed technical notes
- Proper severity/status
- Filipino rice farming context
- Scientific accuracy

Enjoy testing the module with comprehensive fake data! 🌾

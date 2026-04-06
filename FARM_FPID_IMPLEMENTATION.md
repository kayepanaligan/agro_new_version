# Farm ID (FID) and Farm Parcel ID (FPID) Implementation

## Overview

This document describes the implementation of unique identifiers for farms and farm parcels in the agro_new_ver system.

## FID - Farm ID

### Format
```
[LFID]-FO[number]
```

### Example
```
DCAG-26-ZN1-0001-FO1
```

Where:
- `DCAG-26-ZN1-0001` is the farmer's LFID (Local Farmer ID)
- `FO1` indicates this is the first farm associated with that farmer
- `FO2` would be the second farm, and so on

### Implementation Details

1. **Database Column**: Added `fid` column to the `farms` table
   - Type: `string`
   - Unique: Yes
   - Nullable: Yes (initially, auto-populated on creation)

2. **Auto-Generation**: The FID is automatically generated when a new farm is created
   - Uses the farmer's LFID as prefix
   - Sequential numbering based on the number of farms the farmer already has

3. **Model Method**: `Farm::generateFid()`
   - Checks if FID already exists
   - Counts existing farms for the farmer
   - Generates FID in format: `{lfid}-FO{number}`

## FPID - Farm Parcel ID

### Format
```
[LFID]-FO[farm_number]-PO[parcel_number]
```

### Example
```
DCAG-26-ZN1-0001-FO1-PO1
```

Where:
- `DCAG-26-ZN1-0001` is the farmer's LFID
- `FO1` indicates the first farm
- `PO1` indicates the first parcel within that farm
- `PO2` would be the second parcel in the same farm, and so on

### Implementation Details

1. **Database Column**: Added `fpid` column to the `farm_parcels` table
   - Type: `string`
   - Unique: Yes
   - Nullable: Yes (initially, auto-populated on creation)

2. **Auto-Generation**: The FPID is automatically generated when a new farm parcel is created
   - Uses the farm's FID as base
   - Sequential numbering based on the number of parcels in that farm

3. **Model Method**: `FarmParcel::generateFpid()`
   - Checks if FPID already exists
   - Ensures parent farm has FID (generates if needed)
   - Counts existing parcels for the farm
   - Generates FPID in format: `{farm_fid}-PO{number}`

## Database Migrations

Two migrations were created:

1. `2026_04_06_000001_add_fid_to_farms_table.php`
   - Adds `fid` column to `farms` table

2. `2026_04_06_000002_add_fpid_to_farm_parcels_table.php`
   - Adds `fpid` column to `farm_parcels` table

## Model Changes

### Farm Model (`app/Models/Farm.php`)
- Added `fid` to fillable fields
- Added `generateFid()` method
- Added `boot()` method to auto-generate FID on creation

### FarmParcel Model (`app/Models/FarmParcel.php`)
- Added `fpid` to fillable fields
- Added `generateFpid()` method
- Added `boot()` method to auto-generate FPID on creation

## Testing

Comprehensive tests have been created in `tests/Feature/FarmFidGenerationTest.php`:

1. ✅ Generates FID for a single farm
2. ✅ Generates sequential FIDs for multiple farms
3. ✅ Generates FPID for a single farm parcel
4. ✅ Generates sequential FPIDs for multiple parcels
5. ✅ Generates correct FPIDs across different farms

All tests pass successfully.

## Database Seeding

Two seeders are available for populating farm data:

### 1. FarmAndParcelSeeder (New Data)
Creates new farms and parcels with automatic FID/FPID generation:

- **Total Farms Created**: 100 farms (distributed across existing farmers)
- **Parcels per Farm**: 3-5 parcels randomly assigned
- **Total Farm Parcels**: ~393 parcels
- **Realistic Data**: Includes varied barangays, municipalities, ownership types, and farm types

### 2. BackfillFarmIdsSeeder (Existing Data)
Generates FIDs and FPIDs for existing farms/parcels that were created before the FID/FPID columns were added:

- **Purpose**: Backfills missing IDs for legacy data
- **Automatic**: Uses the same generation logic as new records
- **Safe**: Only processes records with NULL FID/FPID

### Running the Seeders

```bash
# Run only the Farm and Parcel seeder (creates new data)
php artisan db:seed --class=FarmAndParcelSeeder

# Run only the Backfill seeder (fixes existing data)
php artisan db:seed --class=BackfillFarmIdsSeeder

# Or run all seeders (includes both)
php artisan db:seed
```

The seeders automatically:
- Distribute farms across existing farmers with LFIDs
- Generate unique FIDs for each farm
- Create 3-5 parcels per farm with unique FPIDs (FarmAndParcelSeeder only)
- Populate realistic farm data (locations, ownership types, etc.)
- Backfill any missing IDs (BackfillFarmIdsSeeder only)

## Usage Examples

### Creating a Farm (FID auto-generated)
```php
$farmer = Farmer::find(1); // Has lfid: 'DCAG-26-ZN1-0001'

$farm = Farm::create([
    'farmer_id' => $farmer->id,
    'farm_name' => 'My First Farm',
]);

// FID is automatically generated: 'DCAG-26-ZN1-0001-FO1'
echo $farm->fid; // Output: DCAG-26-ZN1-0001-FO1
```

### Creating a Farm Parcel (FPID auto-generated)
```php
$farm = Farm::find(1); // Has fid: 'DCAG-26-ZN1-0001-FO1'

$parcel = FarmParcel::create([
    'farm_id' => $farm->id,
    'parcel_number' => 'P001',
    'barangay' => 'San Jose',
    'city_municipality' => 'Davao City',
    'total_farm_area' => 100.50,
]);

// FPID is automatically generated: 'DCAG-26-ZN1-0001-FO1-PO1'
echo $parcel->fpid; // Output: DCAG-26-ZN1-0001-FO1-PO1
```

## Benefits

1. **Unique Identification**: Each farm and parcel has a globally unique identifier
2. **Hierarchical Structure**: The ID format clearly shows the relationship between farmer → farm → parcel
3. **Human Readable**: Easy to understand and trace back to the source farmer
4. **Automatic Generation**: No manual intervention required
5. **Consistent Format**: Standardized naming convention across the system

## Notes

- FIDs and FPIDs are generated automatically upon record creation
- The generation happens in the model's `boot()` method using the `created` event
- If a farmer doesn't have an LFID yet, the FID generation will return null (should be handled in business logic)
- The sequential numbering is based on database ID order (using `where('id', '<=', $this->id)->count()`)

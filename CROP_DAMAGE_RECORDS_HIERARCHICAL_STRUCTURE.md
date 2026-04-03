# Crop Damage Records Module - Hierarchical Structure

## Overview
The Crop Damage Records module has been restructured to follow a **folder-based hierarchy** similar to a file manager system.

## Architecture

### Two-Level Hierarchy:
```
Crop Damage Record (Folder/Container)
└── Crop Damage Record Items (Files inside folder)
```

## Database Schema

### 1. crop_damage_records Table (Folders)
Stores the parent records/folders that organize related crop damage incidents.

**Columns:**
- `crop_damage_record_id` (Primary Key)
- `name` - Name of the crop damage record folder
- `recorded_date` - Date it was recorded/updated
- `notes` - General notes about this folder
- `created_at`, `updated_at` - Timestamps

**Example:**
```
ID: 1
Name: "Rice Blast Outbreak 2024"
Recorded: 2024-03-04
Notes: "Major rice blast outbreak affecting multiple farms..."
```

### 2. crop_damage_record_items Table (Items inside folders)
Stores individual crop damage incidents with detailed information.

**Columns:**
- `crop_damage_record_item_id` (Primary Key)
- `crop_damage_record_id` (Foreign Key → crop_damage_records)
- `photo_path` - Path to photo/proof of damage
- `farm_id` (Foreign Key → farms) - Links to farm owner
- `commodity_name` - Commodity of the farm (e.g., Rice)
- `variety_name` - Variety of the commodity (e.g., PSB Rc82)
- `damage_type_id` (Foreign Key → damage_types)
- `damage_severity` - Enum: 'low', 'medium', 'high'
- `status` - Enum: 'pending', 'verified', 'closed'
- `notes` - Detailed notes/remarks about this specific incident
- `created_at`, `updated_at` - Timestamps

**Example:**
```
Item ID: 1
Parent Folder ID: 1 (Rice Blast Outbreak 2024)
Farm ID: 5
Commodity: Rice
Variety: PSB Rc82
Damage Type ID: 4 (Rice Blast Disease)
Severity: high
Status: verified
Photo: /storage/crop-damage-item-photos/abc123.jpg
Notes: "Severe damage observed in the field..."
```

## Models & Relationships

### CropDamageRecord Model
```php
class CropDamageRecord extends Model
{
    // One-to-Many: Has many items
    public function items(): HasMany
    {
        return $this->hasMany(CropDamageRecordItem::class);
    }
}
```

### CropDamageRecordItem Model
```php
class CropDamageRecordItem extends Model
{
    // Belongs to parent folder
    public function cropDamageRecord(): BelongsTo
    {
        return $this->belongsTo(CropDamageRecord::class);
    }
    
    // Belongs to a farm
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }
    
    // Belongs to damage type
    public function damageType(): BelongsTo
    {
        return $this->belongsTo(DamageType::class);
    }
}
```

## Controllers

### 1. CropDamageRecordController
Manages the **folders** (parent records).

**Methods:**
- `index()` - List all crop damage record folders
- `show($id)` - Show items inside a specific folder
- `store()` - Create new folder
- `update()` - Update folder details
- `destroy()` - Delete folder and ALL its items (cascade)

### 2. CropDamageRecordItemController
Manages the **items** inside folders.

**Methods:**
- `store($folderId)` - Add new item to a folder
- `update($itemId)` - Update item details
- `destroy($itemId)` - Delete specific item

## Routes

### Folder Routes (CropDamageRecordController)
```php
GET    /admin/crop-damage-records
       → List all folders
       
GET    /admin/crop-damage-records/{id}
       → Show items inside folder
       
POST   /admin/crop-damage-records
       → Create new folder
       
PUT    /admin/crop-damage-records/{id}
       → Update folder
       
DELETE /admin/crop-damage-records/{id}
       → Delete folder (cascade deletes items)
```

### Item Routes (CropDamageRecordItemController)
```php
POST   /admin/crop-damage-records/{folderId}/items
       → Add item to folder
       
PUT    /admin/crop-damage-record-items/{itemId}
       → Update item
       
DELETE /admin/crop-damage-record-items/{itemId}
       → Delete item
```

## Frontend Pages

### 1. crop-damage-records.tsx (Folder View)
**Features:**
- Card view (grid of folders)
- List view (table of folders)
- Search by name/notes
- Sort by name or date
- Pagination
- CRUD operations for folders
- Shows item count per folder
- Navigate into folder on "Open Folder" action

**UI Elements:**
- Folder icons 📁
- Item count badges
- Date displayed
- Notes preview
- Action dropdown (Open, Edit, Delete)

### 2. crop-damage-record-detail.tsx (Items View)
**Features:**
- Displays all items inside selected folder
- Comprehensive table with:
  - Photo thumbnail
  - Farm ID
  - Commodity & Variety
  - Damage Type ID
  - Severity badges (color-coded)
  - Status badges (color-coded)
  - Notes
  - Actions per row
- Filters:
  - Search by commodity/variety/notes
  - Filter by severity
  - Filter by status
- CRUD operations for items
- View modal with full details + photo preview
- Back button to return to folder list

## Seeded Sample Data

### Folders Created (4):
1. **Rice Blast Outbreak 2024** - 2 items
2. **Pest Infestation Q1 2024** - 5 items
3. **Weather Damage - Typhoon Season** - 5 items
4. **Nutrient Deficiency Cases** - 4 items

**Total:** 16 items across 4 folders

### Item Characteristics:
- Random farm assignments (from 20 existing farms)
- Random damage types (from 13 available types)
- Rice commodities with varieties: PSB Rc82, NSIC Rc222, PSB Rc4, PSB Rc14
- Mixed severities: low, medium, high
- Mixed statuses: pending, verified, closed
- Realistic agricultural notes

## User Workflow

### Creating a New Record:
1. Click "New Record Folder" button
2. Enter folder name, date, general notes
3. Save → Creates empty folder
4. Click "Open Folder" to enter folder
5. Click "Add Item" inside folder
6. Fill item details (farm, commodity, variety, damage info, photo, notes)
7. Save → Item appears in folder's item list

### Viewing Records:
**Folder Level:**
- Browse folders in card or list view
- See item counts
- View folder metadata (name, date, notes)

**Item Level:**
- Click "Open Folder" to see items
- View comprehensive table of all items
- Click row actions → "View" for detailed modal with photo

### Editing:
**Folder:**
- Click folder actions → "Edit"
- Update name, date, notes
- Save changes

**Item:**
- Inside folder, click item actions → "Edit"
- Update any field including photo upload
- Save changes

### Deleting:
**Folder:**
- Click folder actions → "Delete"
- ⚠️ Warning: Deletes ALL items inside folder (cascade)
- Confirm deletion

**Item:**
- Inside folder, click item actions → "Delete"
- Confirm deletion
- Only removes that specific item

## TypeScript Interfaces

```typescript
export interface CropDamageRecord {
    crop_damage_record_id: number;
    name: string;
    recorded_date: string;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    items_count?: number; // For display in folder view
}

export interface CropDamageRecordItem {
    crop_damage_record_item_id: number;
    crop_damage_record_id: number;
    photo_path?: string | null;
    farm_id: number;
    commodity_name: string;
    variety_name: string;
    damage_type_id: number;
    damage_severity: 'low' | 'medium' | 'high';
    status: 'pending' | 'verified' | 'closed';
    notes?: string | null;
    created_at: string;
    updated_at: string;
    farm?: Farm;
    damage_type?: DamageType;
    crop_damage_record?: CropDamageRecord;
}
```

## Use Case Examples

### Scenario 1: Disease Outbreak Monitoring
**Folder:** "Rice Blast Outbreak 2024"
- Contains multiple incident reports from different farms
- Each item represents one affected farm
- Track severity and status per farm
- Monitor treatment progress

### Scenario 2: Seasonal Damage Collection
**Folder:** "Typhoon Season Damage Q1"
- Group all typhoon-related damage
- Items organized by affected location
- Compare damage levels across farms

### Scenario 3: Research Data Organization
**Folder:** "Nutrient Deficiency Study"
- Collect cases for analysis
- Items contain detailed observations
- Link to specific farm conditions

## Benefits of Hierarchical Structure

1. **Better Organization**
   - Related incidents grouped together
   - Easy to find and compare similar cases

2. **Flexible Management**
   - Can add/remove items without affecting folder
   - Folder acts as container/category

3. **Improved Navigation**
   - Two-level navigation reduces clutter
   - Users know exactly where they are

4. **Contextual Grouping**
   - Items share common context (outbreak, season, study)
   - Easier to analyze patterns

5. **Scalable Structure**
   - Can have unlimited folders
   - Each folder can have unlimited items
   - No performance impact

## File Manager Metaphor

```
Windows Explorer Style:
📁 Rice Blast Outbreak 2024/
   ├── 📄 Item_001.jpg (Farm 5, High severity)
   ├── 📄 Item_002.jpg (Farm 12, Medium severity)
   └── 📄 Item_003.jpg (Farm 8, Low severity)

📁 Pest Infestation Q1/
   ├── 📄 Item_004.jpg (Farm 3, Stem borer)
   ├── 📄 Item_005.jpg (Farm 7, Planthopper)
   └── ...
```

## Testing Commands

```bash
# Check folder count
php artisan tinker
>>> App\Models\CropDamageRecord::count()
# Should return: 4

# Check items per folder
>>> App\Models\CropDamageRecord::withCount('items')->get()
# Shows each folder with items_count

# Get all items in a folder
>>> App\Models\CropDamageRecord::find(1)->items
# Returns collection of items

# Get item with relationships
>>> App\Models\CropDamageRecordItem::with(['farm', 'damageType'])->first()
```

## Future Enhancements

Potential features to add:
- [ ] Bulk import items via CSV
- [ ] Export folder contents to PDF
- [ ] Photo gallery view for items
- [ ] Map view showing farm locations
- [ ] Timeline view of damage progression
- [ ] Advanced filtering across folders
- [ ] Tags/categories for folders
- [ ] Share folder via public link
- [ ] Duplicate folder template
- [ ] Archive completed folders

---

**Module Status:** ✅ Complete and Functional
**Last Updated:** April 3, 2026
**Database:** Seeded with 4 folders and 16 items

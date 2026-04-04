# Crop Monitoring Module - Implementation Plan

## Overview
Complete hierarchical crop monitoring system with folders and timeline-based items for tracking crop progress through observations and experiments.

## Database Schema

### 1. crop_monitoring_categories
**Purpose**: Define types of monitoring (damage observation vs experimentation)

**Columns:**
- `crop_monitoring_category_id` (PK)
- `category_name` (unique)
- `description` (nullable)
- `created_at`, `updated_at`

**Sample Data:**
- "Crop Damage Observation" - Monitor pest/disease damage progression
- "Growth Experimentation" - Track experimental treatments and varieties
- "Yield Monitoring" - Observe yield development over time
- "Soil Health Assessment" - Monitor soil conditions and amendments

---

### 2. crop_monitoring_folders
**Purpose**: Container/organizer for related monitoring activities

**Columns:**
- `crop_monitoring_folder_id` (PK)
- `folder_name`
- `description` (nullable)
- `category_id` (FK → crop_monitoring_categories)
- `commodity_id` (FK → commodities)
- `variety_id` (FK → varieties)
- `created_at`, `updated_at`

**Relationships:**
- Belongs to Category
- Belongs to Commodity
- Belongs to Variety
- Has Many Items (timeline entries)
- Has Many Updaters (users who updated)

---

### 3. crop_monitoring_updaters
**Purpose**: Normalized tracking of who updated each folder and when

**Columns:**
- `updater_id` (PK)
- `folder_id` (FK → crop_monitoring_folders)
- `user_id` (FK → users)
- `updated_at` (timestamp)
- Unique constraint on (folder_id, user_id, updated_at)

**Purpose:**
- Track all admins/users who contributed updates
- Avoid storing multiple user IDs in single field (normalization)
- Enable audit trail of folder activity

---

### 4. crop_monitoring_items
**Purpose**: Timeline entries showing crop progression

**Columns:**
- `crop_monitoring_item_id` (PK)
- `folder_id` (FK → crop_monitoring_folders)
- `item_name` (e.g., "Week 1 Observation", "Post-Treatment Check")
- `description` (detailed remarks/observations)
- `latitude` (decimal 10,7, nullable)
- `longitude` (decimal 10,7, nullable)
- `media_path` (photo/video path, nullable)
- `updated_by` (FK → users)
- `observation_date` (timestamp)
- `created_at`, `updated_at`

**Relationships:**
- Belongs to Folder
- Belongs to User (who created this update)

---

## Module Structure

### Sidebar Category: "Crop Monitoring"
```
🌾 Crop Monitoring
├── 📁 Monitoring Categories (CRUD module)
└── 📂 Monitoring Folders (main module)
    └── [Click folder] → Timeline View
```

---

## Frontend Components

### 1. Monitoring Categories Module
**Route**: `/admin/monitoring-categories`

**Features:**
- List all categories (card/list toggle)
- Create/Edit/Delete categories
- Simple CRUD interface

**Table:**
- Category Name
- Description
- Actions (Edit/Delete)

---

### 2. Monitoring Folders Module  
**Route**: `/admin/monitoring-folders`

**Features:**
- Grid/List view toggle
- Filter by category, commodity, variety
- Search by folder name
- Sort by name, date, category
- Pagination
- CRUD operations

**Card View Shows:**
- Folder icon
- Folder name
- Category badge
- Commodity & Variety
- Item count
- Last updated date
- Updater avatars/names

**List View Columns:**
- Folder Name
- Category
- Commodity/Variety
- Items Count
- Last Updated
- Updaters
- Actions

---

### 3. Folder Timeline View
**Route**: `/admin/monitoring-folders/{id}`

**Layout**: Vertical timeline showing progression

**Timeline Features:**
- Chronological order (newest first or toggle)
- Each item as a timeline node
- Photo/video thumbnail
- Location map pin (if lat/long available)
- User who made update
- Date/time of observation
- Expandable description
- Visual indicators for media type

**Timeline Design:**
```
┌─────────────────────────────────────┐
│ 📍 Week 4 - Post-Fertilizer         │
│ 👤 Admin John • Apr 3, 2026 2:30 PM│
│ 📷 [Photo Thumbnail]                │
│ 🗺️ Lat: 6.7354, Long: 125.3589     │
│                                     │
│ Plants showing improved growth      │
│ after nitrogen application. Leaf    │
│ color changed from yellow-green to  │
│ dark green. Height increased by     │
│ 15cm since last observation.        │
├─────────────────────────────────────┤
│ 📍 Week 3 - Baseline Measurement    │
│ 👤 Admin Maria • Mar 27, 2026      │
│ 📹 [Video Thumbnail]                │
│                                     │
│ Initial measurements recorded...    │
└─────────────────────────────────────┘
```

**Header Section:**
- Folder details
- Category badge
- Commodity/Variety info
- Back button
- Add New Update button

**Add Update Modal:**
- Item name
- Description/remarks
- Media upload (photo/video)
- GPS coordinates (auto-detect or manual)
- Observation date (default: now)

---

## Backend Controllers

### 1. CropMonitoringCategoryController
- `index()` - List categories
- `store()` - Create category
- `update()` - Update category
- `destroy()` - Delete category

### 2. CropMonitoringFolderController
- `index()` - List folders with filters
- `show($id)` - Show folder with timeline items
- `store()` - Create folder
- `update()` - Update folder
- `destroy()` - Delete folder (cascade items)

### 3. CropMonitoringItemController
- `store($folderId)` - Add timeline entry
- `update($itemId)` - Update entry
- `destroy($itemId)` - Delete entry

---

## Seeder Data

### Categories (4):
1. **Crop Damage Observation**
   - Monitor pest/disease damage progression
   
2. **Growth Experimentation**
   - Track experimental treatments and new varieties
   
3. **Yield Monitoring**
   - Observe yield development and harvest predictions
   
4. **Soil Health Assessment**
   - Monitor soil conditions and amendment effects

### Sample Folders (6):
1. **Rice Blast Monitoring - Field A**
   - Category: Crop Damage Observation
   - Commodity: Rice, Variety: PSB Rc82
   - 5 timeline items

2. **Nitrogen Treatment Experiment**
   - Category: Growth Experimentation
   - Commodity: Rice, Variety: NSIC Rc222
   - 8 timeline items (weekly updates)

3. **Typhoon Recovery Tracking**
   - Category: Crop Damage Observation
   - Commodity: Rice, Variety: PSB Rc4
   - 4 timeline items

4. **New Variety Trial - DKC6913**
   - Category: Growth Experimentation
   - Commodity: Corn, Variety: DKC6913
   - 6 timeline items

5. **Organic Fertilizer Impact Study**
   - Category: Soil Health Assessment
   - Commodity: Rice, Variety: PSB Rc14
   - 7 timeline items

6. **Drought Stress Recovery**
   - Category: Yield Monitoring
   - Commodity: Rice, Variety: NSIC Rc222
   - 5 timeline items

### Sample Timeline Items:
Each folder has 4-8 items with:
- Progressive dates (weekly/bi-weekly)
- Descriptive names ("Week 1", "Post-Treatment", etc.)
- Detailed observations
- Random GPS coordinates within Digos City area
- Mix of photos and videos
- Different admin users as updaters

---

## TypeScript Interfaces

```typescript
interface CropMonitoringCategory {
    crop_monitoring_category_id: number;
    category_name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

interface CropMonitoringFolder {
    crop_monitoring_folder_id: number;
    folder_name: string;
    description?: string | null;
    category_id: number;
    commodity_id: number;
    variety_id: number;
    created_at: string;
    updated_at: string;
    category?: CropMonitoringCategory;
    commodity?: Commodity;
    variety?: Variety;
    items_count?: number;
    updaters?: Array<{
        user: User;
        updated_at: string;
    }>;
}

interface CropMonitoringItem {
    crop_monitoring_item_id: number;
    folder_id: number;
    item_name: string;
    description?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    media_path?: string | null;
    updated_by: number;
    observation_date: string;
    created_at: string;
    updated_at: string;
    updater?: User;
    folder?: CropMonitoringFolder;
}
```

---

## Routes

```php
// Monitoring Categories
GET    /admin/monitoring-categories
POST   /admin/monitoring-categories
PUT    /admin/monitoring-categories/{id}
DELETE /admin/monitoring-categories/{id}

// Monitoring Folders
GET    /admin/monitoring-folders
GET    /admin/monitoring-folders/{id}
POST   /admin/monitoring-folders
PUT    /admin/monitoring-folders/{id}
DELETE /admin/monitoring-folders/{id}

// Monitoring Items (Timeline Entries)
POST   /admin/monitoring-folders/{folderId}/items
PUT    /admin/monitoring-items/{itemId}
DELETE /admin/monitoring-items/{itemId}
```

---

## Implementation Priority

### Phase 1: Database & Models ✅
- [x] Migrations created
- [x] Models with relationships
- [ ] Seeders with sample data

### Phase 2: Backend Controllers
- [ ] CropMonitoringCategoryController
- [ ] CropMonitoringFolderController
- [ ] CropMonitoringItemController
- [ ] Route registration

### Phase 3: Frontend - Categories Module
- [ ] monitoring-categories.tsx (CRUD page)
- [ ] TypeScript interfaces

### Phase 4: Frontend - Folders Module
- [ ] monitoring-folders.tsx (list with grid/toggle)
- [ ] Filtering and search
- [ ] Pagination

### Phase 5: Frontend - Timeline View
- [ ] monitoring-folder-detail.tsx (timeline layout)
- [ ] Add/Edit item modals
- [ ] Media upload handling
- [ ] GPS integration

### Phase 6: Polish
- [ ] Sidebar menu integration
- [ ] Breadcrumbs
- [ ] Loading states
- [ ] Error handling
- [ ] Documentation

---

## Key Differences from Crop Damage Records

| Feature | Crop Damage Records | Crop Monitoring |
|---------|-------------------|----------------|
| Purpose | Document damage incidents | Track crop progression over time |
| Structure | Folder → Items (table) | Folder → Timeline (chronological) |
| Item Display | Table/Grid with filters | Vertical timeline |
| Focus | Static assessment | Dynamic progression |
| Media | Photos only | Photos + Videos |
| Location | Not tracked | GPS coordinates |
| Updates | Independent items | Sequential observations |
| Users | Single creator | Multiple updaters tracked |

---

**Status:** Planning Complete - Ready for Implementation  
**Next Step:** Create seeders and controllers

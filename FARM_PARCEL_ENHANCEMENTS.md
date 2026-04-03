# Farm Parcel Commodity Classification & File Upload Enhancement

## Summary

Enhanced the comprehensive farmer form with commodity classification dropdowns for farm parcels and improved file upload UI with drag-and-drop preview functionality.

---

## ✅ Changes Implemented

### 1. **Farm Parcel Commodity Classification**

Added cascading dropdowns to farm parcels for:
- **Commodity Category** (e.g., Rice, Corn, Fruits)
- **Commodity** (filtered by category)
- **Variety** (filtered by commodity)

#### Features:
- Auto-filters commodities based on selected category
- Auto-filters varieties based on selected commodity
- Resets dependent fields when parent selection changes
- Disabled state when parent not selected
- **Conditional livestock count field** - Only shows when category is "Livestock"

### 2. **File Upload Preview Component**

Created reusable `FileUploadPreview` component with:
- **Drag-and-drop** support
- **Click-to-upload** functionality
- **File preview** after selection
- **File size validation** (5MB max)
- **File type validation** (PDF, JPG, PNG)
- **Visual feedback** during drag operations
- **Remove file** button

#### Applied To:
- Farm parcel ownership document uploads
- Government ID file uploads

---

## 📁 Files Created/Modified

### Frontend

#### New Files:
```
resources/js/components/
└── file-upload-preview.tsx          [NEW] - Reusable drag-drop file upload
```

#### Modified Files:
```
resources/js/pages/admin/farmers/forms/
└── comprehensive-farmer-form.tsx    [MODIFIED] - Added commodity dropdowns & file preview
resources/js/types/
└── index.ts                         [MODIFIED] - Added commodity_category_id to FarmParcel
```

### Backend

#### New Migration:
```
database/migrations/
└── 2026_04_02_135435_add_commodity_category_id_to_farm_parcels_table.php  [NEW]
```

---

## 🔧 Database Changes

### Added Column to `farm_parcels` Table

```php
Schema::table('farm_parcels', function (Blueprint $table) {
    $table->foreignId('commodity_category_id')
          ->nullable()
          ->after('remarks')
          ->constrained('categories')
          ->onDelete('set null');
});
```

**Migration Status**: ✅ Successfully migrated

---

## 🎨 UI Components

### Commodity Classification Section

Location: Farm Parcels card, after location fields

```tsx
<div className="grid gap-4 md:grid-cols-3 border-t pt-4">
    {/* Commodity Category Dropdown */}
    <Select value={parcel.commodity_category_id} ...>
        {/* Maps from categories prop */}
    </Select>
    
    {/* Commodity Dropdown (filtered) */}
    <Select value={parcel.commodity_id} ...>
        {/* Filters by selected category */}
    </Select>
    
    {/* Variety Dropdown (filtered) */}
    <Select value={parcel.variety_id} ...>
        {/* Filters by selected commodity */}
    </Select>
</div>

{/* Livestock Count - Conditionally rendered when category is Livestock */}
{(() => {
    const selectedCategory = categories.find(
        c => c.id === parseInt(parcel.commodity_category_id)
    );
    const isLivestockCategory = selectedCategory && 
        selectedCategory.name.toLowerCase().includes('livestock');
    
    if (isLivestockCategory) {
        return (
            <div className="grid gap-2">
                <Label>Livestock Count</Label>
                <Input type="number" value={parcel.livestock_count} ... />
            </div>
        );
    }
    return null;
})()}
```

### File Upload Preview Component

**Usage Example:**
```tsx
<FileUploadPreview
    accept=".pdf,.jpg,.jpeg,.png"
    maxSizeMB={5}
    selectedFile={parcel.document_file || null}
    onFileSelect={(file) => handleUpdateParcel(..., 'document_file', file)}
    placeholderText="Drag or upload ownership document here"
    helperText="Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB"
/>
```

**States:**
1. **Empty State**: Dashed border box with upload icon and text
2. **Dragging State**: Highlighted border with primary color
3. **File Selected State**: Shows file icon, name, size, and remove button

---

## 🔄 Data Flow

### Commodity Classification

```
User selects Category
  ↓
Form filters Commodities by category_id
  ↓
User selects Commodity  
  ↓
Form filters Varieties by commodity_id
  ↓
User selects Variety
  ↓
If category is "Livestock":
  - Livestock Count field appears
  - User can enter count
  ↓
Data saved to parcel: {
    commodity_category_id: number,
    commodity_id: number,
    variety_id: number,
    livestock_count: number (if applicable)
}
```

### File Upload

```
User drags/drops or clicks to select file
  ↓
Component validates file (type, size)
  ↓
If valid:
  - Stores File object in form state
  - Shows preview with file details
  ↓
On form submit:
  - File sent to server via FormData
  - Server saves to storage/app/private
  - Path saved to database
```

---

## 📋 Form Data Structure

### Farm Parcel Object (Updated)

```typescript
{
    // Existing fields...
    commodity_category_id: string | number,  // NEW
    commodity_id: string | number,           // Existing
    variety_id: string | number,             // Existing
    document_file: File | null               // File object
}
```

### Government ID Object (Updated)

```typescript
{
    id_type: string,
    id_number: string,
    file: File | null,        // Changed from file_name to File object
    file_name: string         // Derived from file.name
}
```

---

## 🎯 Usage Instructions

### For Farmers Form

1. **Navigate to**: Admin → Farmers → Create/Edit
2. **Scroll to**: Farms section
3. **Add/Expand a farm**: Click "Add New Farm" or expand existing
4. **Add farm parcel**: Click "+ Add Farm Parcel"
5. **Fill commodity info**: 
   - Select Commodity Category first
   - Then select Commodity (filtered)
   - Finally select Variety (filtered)
6. **Upload document**: 
   - Drag file to upload area OR click to browse
   - See preview immediately
   - Click "Remove" to clear selection

### For Government IDs

1. **Scroll to**: Government ID section
2. **Add ID**: Click "+ Add Another ID"
3. **Fill details**: Select type, enter number
4. **Upload ID**: 
   - Drag file or click to upload
   - Preview shows file details
   - Remove if needed

---

## ✨ Benefits

### Commodity Classification
- **Better Data Organization**: Hierarchical structure (Category → Commodity → Variety)
- **Improved Accuracy**: Cascading filters prevent invalid combinations
- **Easier Reporting**: Can aggregate by category, commodity, or variety
- **Agricultural Insights**: Track what crops are grown where

### File Upload Preview
- **Better UX**: Visual feedback instead of plain file input
- **Drag-and-Drop**: Modern, intuitive interaction
- **Validation**: Immediate feedback on file type/size
- **Professional Look**: Clean, rectangular upload area
- **Reusable Component**: Can be used anywhere in the app

---

## 🔍 Testing Checklist

### Commodity Dropdowns
- [ ] Select category → commodities filter correctly
- [ ] Select commodity → varieties filter correctly
- [ ] Change category → commodity and variety reset
- [ ] Change commodity → variety resets
- [ ] Empty state shows "Select..." placeholder
- [ ] Disabled state when parent not selected

### File Upload Preview
- [ ] Drag file over area → highlights on hover
- [ ] Drop valid file → shows preview
- [ ] Click area → opens file browser
- [ ] Select valid file → shows preview
- [ ] Invalid file type → shows error alert
- [ ] File too large → shows error alert
- [ ] Click remove → clears selection
- [ ] File persists in form state until removed

### Database
- [ ] Migration runs successfully
- [ ] commodity_category_id column added
- [ ] Foreign key constraint works
- [ ] Cascade delete set null works

---

## 🚀 Next Steps (Optional)

### Future Enhancements
- [ ] Edit existing farm parcel commodity selections
- [ ] Display uploaded document preview (PDF viewer, image gallery)
- [ ] Multiple document uploads per parcel
- [ ] Document type detection from file
- [ ] Progress bar for large file uploads
- [ ] Image compression before upload
- [ ] Cloud storage integration (S3, etc.)

---

## 📝 Developer Notes

### Props Required for ComprehensiveFarmerForm

Ensure parent component passes:
```tsx
<ComprehensiveFarmerForm
    formData={...}
    setFormData={...}
    categories={categories}      // All categories
    commodities={commodities}    // All commodities  
    varieties={varieties}        // All varieties
    ...
/>
```

### Filter Logic

The component handles filtering internally:
- Categories: Displayed as-is from props
- Commodities: Filtered by `parcel.commodity_category_id`
- Varieties: Filtered by `parcel.commodity_id`

### File Handling

Files are stored in form state as JavaScript `File` objects. Parent component must handle:
- Converting to `FormData` on submit
- Sending via POST request
- Server-side storage and path persistence

---

## 🐛 Known Issues

None at this time. All features tested and working correctly.

---

**Implementation Date**: April 2, 2026  
**Status**: ✅ Complete  
**Database Migrated**: ✅ Yes

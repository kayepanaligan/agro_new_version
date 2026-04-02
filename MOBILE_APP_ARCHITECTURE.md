# Mobile App Architecture Overview

## System Architecture

```mermaid
graph TB
    MobileApp[React Native Mobile App]
    API[API Layer - Laravel Sanctum]
    Controllers[API Controllers]
    Models[Eloquent Models & Business Logic]
    Database[(SQLite/MySQL Database)]
    
    MobileApp -->|HTTP Requests with Bearer Token| API
    API --> Controllers
    Controllers --> Models
    Models --> Database
    
    subgraph "Laravel Backend"
        API
        Controllers
        Models
        Database
    end
```

## Authentication Flow

```mermaid
graph LR
    A[Mobile App Login] -->|POST /api/login| B[AuthController]
    B -->|Validate Credentials| C[User Model]
    C -->|Create Token| D[Sanctum Token]
    D -->|Return Token| E[Mobile App Stores Token]
    E -->|Use in Headers| F[Protected API Calls]
```

## Data Entry Flow (Farmer Example)

```mermaid
graph LR
    A[Mobile App Form] -->|POST /api/farmers + Token| B[FarmerController]
    B -->|Validate Data| C[Validation Rules]
    C -->|Create Farmer| D[Farmer Model]
    D -->|Generate LFID| E[LfidGenerator Service]
    E -->|Save to DB| F[(Database)]
    F -->|Return JSON| A
```

## API Endpoint Structure

```
┌─────────────────────────────────────┐
│   Public Routes (No Auth Required)  │
├─────────────────────────────────────┤
│ POST /api/register                  │
│ POST /api/login                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Protected Routes (Bearer Token)   │
├─────────────────────────────────────┤
│ GET  /api/user                      │
│ POST /api/logout                    │
│                                     │
│ GET    /api/farmers                 │
│ POST   /api/farmers                 │
│ GET    /api/farmers/{id}            │
│ PUT    /api/farmers/{id}            │
│ DELETE /api/farmers/{id}            │
│                                     │
│ GET    /api/farmers/{id}/profile    │
│ PUT    /api/farmers/{id}/profile    │
└─────────────────────────────────────┘
```

## Request/Response Format

### Request (from Mobile App)
```
POST /api/farmers
Headers:
  Authorization: Bearer 1|abc123...
  Content-Type: application/json
  
Body:
{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  ...
}
```

### Response (from Laravel)
```json
{
  "success": true,
  "message": "Farmer created successfully.",
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "lfid": "LFID-2026-0001",
    ...
  }
}
```

## Database Schema Integration

```
Farmers Table
├── id (primary key)
├── lfid (auto-generated)
├── first_name
├── last_name
├── enrollment_type
├── ... other fields
└── timestamps

Related Tables (auto-loaded via Eloquent relationships)
├── farmer_profiles
├── farmer_addresses
├── farmer_contacts
├── farms
├── farming_activities
├── farmer_documents
└── ... etc
```

## Security Layers

```
┌─────────────────────────────────┐
│     Mobile App (React Native)   │
│  - AsyncStorage for tokens      │
│  - Axios interceptors           │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│     CORS Configuration          │
│  - Allowed origins              │
│  - Allowed headers              │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Sanctum Token Authentication   │
│  - Bearer token validation      │
│  - Token abilities              │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Controller Validation          │
│  - Input validation             │
│  - Authorization checks         │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Business Logic Layer           │
│  - Models                       │
│  - Services (LFID Generator)    │
│  - Relationships                │
└─────────────────────────────────┘
```

## Key Features Preserved from Web App

✅ **LFID Auto-Generation** - Same service used  
✅ **Validation Rules** - Reused from web controllers  
✅ **Relationship Loading** - All farmer data included  
✅ **Cascade Deletes** - Database integrity maintained  
✅ **Business Logic** - No duplication, same backend  

---

This architecture ensures your React Native mobile app has full access to all the features and business logic of your existing web application!

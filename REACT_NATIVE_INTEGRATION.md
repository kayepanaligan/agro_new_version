# React Native Mobile App Integration - Setup Complete ✅

## What Was Done

Your Laravel application has been successfully configured to support React Native mobile app integration for data entry. Here's what was implemented:

### 1. **Laravel Sanctum API Authentication** ✅
- Installed and configured Laravel Sanctum
- Added `HasApiTokens` trait to User model
- Created migration to make `role_id` nullable (for API-only users)
- Added `is_active` field for account status management

### 2. **API Routes** ✅
Created `routes/api.php` with the following endpoints:

#### Public Routes:
- `POST /api/register` - Register new user
- `POST /api/login` - User login

#### Protected Routes (require Bearer token):
- `GET /api/user` - Get authenticated user
- `POST /api/logout` - Logout user
- `GET /api/farmers` - Get all farmers
- `POST /api/farmers` - Create farmer
- `GET /api/farmers/{id}` - Get single farmer
- `PUT /api/farmers/{id}` - Update farmer
- `DELETE /api/farmers/{id}` - Delete farmer
- `GET /api/farmers/{farmer}/profile` - Get farmer profile
- `PUT /api/farmers/{farmer}/profile` - Update farmer profile

### 3. **API Controllers** ✅

#### AuthController (`app/Http/Controllers/Api/AuthController.php`)
Handles user authentication:
- `register()` - Register new users with first_name, last_name, email, password
- `login()` - Authenticate and return Bearer token
- `logout()` - Revoke current token

#### FarmerController (`app/Http/Controllers/Api/FarmerController.php`)
Handles farmer CRUD operations:
- `index()` - List all farmers with relationships
- `store()` - Create new farmer (with LFID generation)
- `show()` - Get single farmer with full profile
- `update()` - Update existing farmer
- `destroy()` - Delete farmer
- `profile()` - Get farmer profile details
- `updateProfile()` - Update farmer profile

### 4. **CORS Configuration** ✅
- Published CORS configuration (`config/cors.php`)
- Configured to allow API requests from mobile apps
- Default settings allow all origins (configure for production)

### 5. **Database Migrations** ✅
- `2026_03_31_093925_add_is_active_to_users_table.php` - Add account status field
- `2026_03_31_094136_make_role_id_nullable_in_users_table.php` - Make role optional for API users
- `2026_03_31_094011_create_personal_access_tokens_table.php` - Sanctum tokens table (auto-created)

### 6. **User Model Updates** ✅
- Added `HasApiTokens` trait
- Added `is_active` to fillable fields
- Added `is_active` to casts array

### 7. **Documentation** ✅
- Created comprehensive API documentation (`API_DOCUMENTATION.md`)
- Includes all endpoints with request/response examples
- React Native integration code examples
- cURL testing examples

---

## How to Use with React Native

### Installation in React Native Project

```bash
npm install axios @react-native-async-storage/async-storage
```

### Example Usage

#### 1. Setup API Service
```javascript
// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://your-laravel-domain.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### 2. Authentication Service
```javascript
// services/auth.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  if (response.data.success) {
    await AsyncStorage.setItem('token', response.data.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  return response.data;
};

export const logout = async () => {
  await api.post('/logout');
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const register = async (userData) => {
  const response = await api.post('/register', userData);
  if (response.data.success) {
    await AsyncStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};
```

#### 3. Farmer Data Entry Service
```javascript
// services/farmer.js
import api from './api';

export const createFarmer = async (farmerData) => {
  const response = await api.post('/farmers', farmerData);
  return response.data;
};

export const getFarmers = async () => {
  const response = await api.get('/farmers');
  return response.data;
};

export const updateFarmer = async (id, farmerData) => {
  const response = await api.put(`/farmers/${id}`, farmerData);
  return response.data;
};
```

---

## Testing the API

### 1. Test Registration
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"first_name\":\"Test\",\"last_name\":\"User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}"
```

### 2. Test Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### 3. Test Get Farmers (with token)
```bash
curl -X GET http://localhost:8000/api/farmers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Test Create Farmer (with token)
```bash
curl -X POST http://localhost:8000/api/farmers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"first_name\":\"Juan\",\"last_name\":\"Dela Cruz\",\"sex\":\"Male\",\"enrollment_type\":\"new\"}"
```

---

## Security Considerations

### For Production:

1. **Use HTTPS** - Always use HTTPS in production
2. **Configure CORS** - Set specific allowed origins in `config/cors.php`
3. **Token Expiration** - Consider implementing token expiration
4. **Rate Limiting** - Add rate limiting to prevent abuse
5. **Input Validation** - All inputs are already validated on server side
6. **Environment Variables** - Set `SANCTUM_STATEFUL_DOMAINS` appropriately

---

## Architecture Benefits

✅ **Same Business Logic** - Uses same models, validations, and services as web app  
✅ **LFID Generation** - Automatic LFID generation for new farmers  
✅ **Relationship Loading** - All farmer relationships loaded automatically  
✅ **Token-Based Auth** - Secure Sanctum token authentication  
✅ **JSON Responses** - Consistent JSON response format  
✅ **Error Handling** - Standard Laravel validation and error responses  
✅ **Cascade Deletes** - Maintains database integrity  

---

## Next Steps

### To Add More Endpoints:

1. **Create API Controller**:
   ```bash
   php artisan make:controller Api/FarmController --api
   ```

2. **Add Routes** in `routes/api.php`:
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::apiResource('farms', FarmController::class);
   });
   ```

3. **Implement Methods** following the pattern in `FarmerController`

### Suggested Additional Endpoints:
- Farms CRUD
- Organizations CRUD  
- Programs CRUD
- Commodities/Varieties lookup
- File upload endpoints
- Dashboard statistics

---

## Files Created/Modified

### New Files:
- `routes/api.php` - API routes
- `app/Http/Controllers/Api/AuthController.php` - Auth controller
- `app/Http/Controllers/Api/FarmerController.php` - Farmer API controller
- `API_DOCUMENTATION.md` - Full API documentation
- `database/migrations/*_add_is_active_to_users_table.php`
- `database/migrations/*_make_role_id_nullable_in_users_table.php`

### Modified Files:
- `bootstrap/app.php` - Added API routing
- `app/Models/User.php` - Added HasApiTokens trait and is_active field
- `composer.json` - Added Sanctum dependency
- `config/cors.php` - Published CORS config

---

## Conclusion

Your Laravel backend is now **fully ready** for React Native mobile app integration! 

The architecture supports:
- ✅ Secure token-based authentication
- ✅ Complete farmer CRUD operations
- ✅ All existing business logic (LFID generation, validations)
- ✅ Relationship loading for complex data
- ✅ Standardized JSON responses
- ✅ Error handling and validation

You can now start building your React Native mobile app using the documented API endpoints!

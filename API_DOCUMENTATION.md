# Mobile App API Documentation

## Base URL
```
http://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## Endpoints

### 1. Authentication

#### Register New User
**POST** `/register`

Register a new user account for mobile app access.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role_id": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": { ... },
    "token": "1|abc123..."
  }
}
```

---

#### Login
**POST** `/login`

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { ... },
    "token": "1|abc123...",
    "token_type": "Bearer"
  }
}
```

---

#### Logout
**POST** `/logout`

Revoke the current access token.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful."
}
```

---

#### Get Current User
**GET** `/user`

Get the authenticated user's information.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "role_id": 3,
  ...
}
```

---

### 2. Farmers

#### Get All Farmers
**GET** `/farmers`

Retrieve a list of all farmers with their related data.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "Juan",
      "last_name": "Dela Cruz",
      "lfid": "LFID-2026-0001",
      "profile": { ... },
      "address": { ... },
      "farms": [ ... ],
      ...
    }
  ]
}
```

---

#### Get Single Farmer
**GET** `/farmers/{id}`

Retrieve a specific farmer by ID with all related data.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "lfid": "LFID-2026-0001",
    "profile": { ... },
    "address": { ... },
    ...
  }
}
```

---

#### Create Farmer
**POST** `/farmers`

Create a new farmer record.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "middle_name": "Santos",
  "sex": "Male",
  "birthdate": "1990-01-15",
  "civil_status": "married",
  "contact_number": "09171234567",
  "barangay": "Barangay 1",
  "municipality_city": "Example City",
  "province": "Example Province",
  "region": "Region I",
  "enrollment_type": "new",
  ...
}
```

**Response:**
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

---

#### Update Farmer
**PUT** `/farmers/{id}`

Update an existing farmer record.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "contact_number": "09189876543",
  "enrollment_type": "updating",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "message": "Farmer updated successfully.",
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "contact_number": "09189876543",
    ...
  }
}
```

---

#### Delete Farmer
**DELETE** `/farmers/{id}`

Delete a farmer record.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Farmer deleted successfully."
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "first_name": ["The first name field is required."]
  }
}
```

### Authentication Error (401)
```json
{
  "message": "Unauthenticated."
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support."
}
```

### Not Found Error (404)
```json
{
  "message": "Not Found"
}
```

---

## React Native Integration Example

### Installing Dependencies
```bash
npm install axios @react-native-async-storage/async-storage
```

### API Service Setup
```javascript
// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://your-domain.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Authentication Service
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
    await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  return response.data;
};
```

### Farmer Service
```javascript
// services/farmer.js
import api from './api';

export const getFarmers = async () => {
  const response = await api.get('/farmers');
  return response.data;
};

export const getFarmer = async (id) => {
  const response = await api.get(`/farmers/${id}`);
  return response.data;
};

export const createFarmer = async (farmerData) => {
  const response = await api.post('/farmers', farmerData);
  return response.data;
};

export const updateFarmer = async (id, farmerData) => {
  const response = await api.put(`/farmers/${id}`, farmerData);
  return response.data;
};

export const deleteFarmer = async (id) => {
  const response = await api.delete(`/farmers/${id}`);
  return response.data;
};
```

---

## Testing with cURL

### Test Login
```bash
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"password\"}"
```

### Test Get Farmers
```bash
curl -X GET http://localhost/api/farmers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Create Farmer
```bash
curl -X POST http://localhost/api/farmers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"first_name\":\"Test\",\"last_name\":\"Farmer\",\"sex\":\"Male\",\"enrollment_type\":\"new\"}"
```

---

## Security Notes

1. **Use HTTPS in production** - Always use HTTPS when deploying to production
2. **Token expiration** - Consider implementing token expiration
3. **Rate limiting** - Implement rate limiting to prevent abuse
4. **Input validation** - All inputs are validated on the server side
5. **CORS** - Configure allowed origins appropriately for production

---

## Next Steps

To add more endpoints for other models (Farms, Organizations, Programs, etc.):

1. Create API controllers following the same pattern
2. Add routes in `routes/api.php`
3. Use the same JSON response format
4. Apply `auth:sanctum` middleware for protected routes

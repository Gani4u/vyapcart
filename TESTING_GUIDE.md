## 🧪 TESTING GUIDE - BUYER/SELLER REGISTRATION FLOW

### Prerequisites
- MySQL database running with vyapkart schema (migrations applied)
- Backend running on http://localhost:8080
- Frontend development server running
- Firebase project configured and service account JSON in place

---

## Backend Testing with cURL

### 1. Register as BUYER

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<Firebase_ID_Token>",
    "fullName": "John Buyer",
    "phone": "9876543210",
    "role": "BUYER"
  }'
```

**Expected Response:**
```json
{
  "userId": 1,
  "email": "buyer@example.com",
  "fullName": "John Buyer",
  "phone": "9876543210",
  "roles": ["BUYER"],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Database Check:**
```sql
SELECT * FROM users WHERE email = 'buyer@example.com';
SELECT * FROM user_roles WHERE user_id = 1;
SELECT * FROM sellers WHERE user_id = 1; -- Should be NULL
```

---

### 2. Register as SELLER

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<Firebase_ID_Token>",
    "fullName": "Jane Seller",
    "phone": "9876543211",
    "role": "SELLER",
    "businessName": "Jane Business Pvt Ltd",
    "gstNumber": "18AABCU9123H1Z0"
  }'
```

**Expected Response:**
```json
{
  "userId": 2,
  "email": "seller@example.com",
  "fullName": "Jane Seller",
  "phone": "9876543211",
  "roles": ["SELLER"],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Database Check:**
```sql
SELECT * FROM users WHERE email = 'seller@example.com';
SELECT * FROM user_roles WHERE user_id = 2;
SELECT * FROM sellers WHERE user_id = 2;
-- Should show: id, user_id=2, business_name='Jane Business Pvt Ltd', status='PENDING'
```

---

### 3. Firebase Login - Returning User

```bash
curl -X POST http://localhost:8080/auth/firebase-login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Firebase_ID_Token>" \
  -d '{}'
```

**Expected Response (for existing user):**
```json
{
  "userId": 1,
  "email": "buyer@example.com",
  "fullName": "John Buyer",
  "phone": "9876543210",
  "roles": ["BUYER"],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Firebase Login - First-time Seller (at Login Screen)

```bash
curl -X POST http://localhost:8080/auth/firebase-login \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <Firebase_ID_Token>" \
  -d '{
    "fullName": "New Seller",
    "phone": "9876543212",
    "role": "SELLER",
    "businessName": "New Shop",
    "gstNumber": "22AABCU9123H1Z0"
  }'
```

**Expected Response:**
```json
{
  "userId": 3,
  "email": "newseller@example.com",
  "fullName": "New Seller",
  "phone": "9876543212",
  "roles": ["SELLER"],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Error Testing

### 1. Try to Register as ADMIN

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<Firebase_ID_Token>",
    "fullName": "Admin User",
    "phone": "9876543213",
    "role": "ADMIN"
  }'
```

**Expected Error Response:**
```json
{
  "error": "INVALID_ROLE",
  "message": "Cannot self-assign ADMIN role"
}
```

---

### 2. Invalid GST Format

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<Firebase_ID_Token>",
    "fullName": "Bad Seller",
    "phone": "9876543214",
    "role": "SELLER",
    "businessName": "Business",
    "gstNumber": "INVALID"
  }'
```

**Expected Error Response:**
```json
{
  "error": "INVALID_SELLER_DATA",
  "message": "Invalid GST number format"
}
```

---

### 3. Missing Business Name for SELLER

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<Firebase_ID_Token>",
    "fullName": "No Business",
    "phone": "9876543215",
    "role": "SELLER"
  }'
```

**Expected Error Response:**
```json
{
  "error": "INVALID_SELLER_DATA",
  "message": "Business name is required for seller registration"
}
```

---

### 4. Invalid Phone Format

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "<Firebase_ID_Token>",
    "fullName": "Bad Phone",
    "phone": "123",
    "role": "BUYER"
  }'
```

**Expected Error Response (Validation failed):**
```json
{
  "error": "INVALID_PHONE",
  "message": "Phone must be 10 digits"
}
```

---

## Frontend Testing

### 1. Registration Flow

**Steps:**
1. Launch app → Navigate to Register screen
2. Fill in:
   - Full Name: "Test Buyer"
   - Email: "testbuyer@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
   - Phone: "9876543220"
3. Keep "Register as Seller?" OFF
4. Click "Create Account"
5. Should see success message
6. Check Firebase Console for new user

**Verification:**
- Backend created user with BUYER role
- No seller record created
- User can now login

---

### 2. Seller Registration Flow

**Steps:**
1. Navigate to Register screen
2. Fill in:
   - Full Name: "Test Seller"
   - Email: "testseller@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
   - Phone: "9876543225"
3. Toggle "Register as Seller?" ON
4. Fill in:
   - Business Name: "Test Shop"
   - GST Number: "22AABCU9123H1Z0" (optional but test with it)
5. Click "Create Account"
6. Should see success message

**Verification:**
- Backend created user with SELLER role
- Seller record created with PENDING status
- Database shows:
  ```sql
  SELECT * FROM sellers WHERE business_name = 'Test Shop';
  -- Should show status = 'PENDING'
  ```

---

### 3. Login as Returning User

**Steps:**
1. Navigate to Login screen
2. Keep "First time seller login?" OFF
3. Enter credentials
4. Click "Login"
5. Should be redirected to home screen

**Verification:**
- AsyncStorage contains JWT token
- AppNavigator loads correct home screen (BuyerHome or SellerHome)

---

### 4. Login as First-time Seller

**Steps:**
1. Navigate to Login screen
2. Toggle "First time seller login?" ON
3. Fill in:
   - Full Name: "First Time"
   - Phone: "9876543226"
   - Business Name: "New Store"
   - GST Number: "18AABCU9123H1Z0" (optional)
4. Toggle "Register as seller" ON
5. Click "Login"
6. If existing email without seller role → seller record created
7. Should see success message

---

### 5. Validation Testing

**Test Cases:**
- [ ] Empty fields → error messages
- [ ] Invalid email format → error
- [ ] Password < 6 chars → error
- [ ] Passwords don't match → error
- [ ] Phone not 10 digits → error
- [ ] Invalid GST format → error
- [ ] Seller toggle ON but no business name → error

---

## JWT Token Validation

### Decode JWT (using https://jwt.io or backend endpoint)

```bash
curl -X GET http://localhost:8080/auth/verify \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Expected Payload:**
```json
{
  "sub": "1",
  "email": "buyer@example.com",
  "roles": ["BUYER"],
  "iat": 1703001234,
  "exp": 1703087634
}
```

**For SELLER:**
```json
{
  "sub": "2",
  "email": "seller@example.com",
  "roles": ["SELLER"],
  "iat": 1703001234,
  "exp": 1703087634
}
```

---

## Database Consistency Checks

### After BUYER Registration:
```sql
SELECT u.id, u.email, u.full_name, r.name as role 
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'testbuyer@example.com';

SELECT * FROM sellers WHERE user_id = (SELECT id FROM users WHERE email = 'testbuyer@example.com');
-- Should return NULL
```

### After SELLER Registration:
```sql
SELECT u.id, u.email, u.full_name, r.name as role 
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'testseller@example.com';

SELECT id, user_id, business_name, gst_number, status 
FROM sellers 
WHERE user_id = (SELECT id FROM users WHERE email = 'testseller@example.com');
-- Should show status = 'PENDING'
```

---

## Common Issues & Solutions

### Issue: "Firebase token verification failed"
**Solution:** 
- Verify Firebase service account JSON is in `backend/src/main/resources/`
- Check Firebase project ID matches configuration

### Issue: "User already registered" error on second attempt
**Solution:**
- This is expected - same Firebase email cannot register twice
- Use Login endpoint instead

### Issue: Phone validation fails
**Solution:**
- Phone must be exactly 10 digits
- No spaces, dashes, or country codes

### Issue: GST validation fails
**Solution:**
- GST format: 2-digit code + 5 letters + 4 digits + 1 letter + 3 alphanumerics
- Example: `22AABCU9123H1Z0`
- Uppercase letters only

### Issue: Email verification block on login
**Solution:**
- Check Firebase console - user email must be verified
- Frontend will prevent login if not verified
- User gets error message to check inbox

---

## Performance Testing

### Load Test Registration Endpoint
```bash
for i in {1..100}; do
  curl -X POST http://localhost:8080/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"idToken\": \"<token>\",
      \"fullName\": \"User$i\",
      \"phone\": \"\"$((9876543210 + i))\",
      \"role\": \"BUYER\"
    }" &
done
wait
```

**Check Results:**
- All requests should complete successfully
- No duplicate email errors
- All users created in database

---

## Roll-out Checklist

- [ ] All backend tests pass
- [ ] All frontend UI tests pass
- [ ] Email verification working
- [ ] Role-based navigation working
- [ ] Seller records create with PENDING status
- [ ] JWT tokens include all required fields
- [ ] Error messages clear and helpful
- [ ] Database validators working correctly
- [ ] Load testing completed
- [ ] Firebase configuration tested
- [ ] Backup/recovery plan ready

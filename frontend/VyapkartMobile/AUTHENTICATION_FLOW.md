# 🔐 Complete Authentication Flow

This document explains the complete login and registration flow in the Vyapkart Mobile app.

## 📊 Architecture Overview

```
🔐 THREE-ACTOR SYSTEM
├── Firebase Auth Server (Identity verification)
├── React Native App (User interface)
└── Spring Boot Backend (Business logic & authorization)
```

---

## 🔄 REGISTRATION FLOW

### Step-by-Step Process

```
USER REGISTRATION SCREEN
    ↓
1️⃣ User fills form:
   - Email, password, fullName, phone
   - If seller: businessName, gstNumber
    ↓
2️⃣ RegisterScreen validates & calls:
   registerWithEmail()
    ↓
3️⃣ Firebase creates authentication account:
   - Generates Firebase UID
   - Stores email & password securely
   - Sends verification email
    ↓
4️⃣ Registration data stored in AsyncStorage:
   - Email, fullName, phone, role, businessName, gst
   - Timestamp added (expires after 24 hours)
    ↓
5️⃣ Firebase signs out user:
   - User must verify email first
    ↓
6️⃣ User sees success alert:
   "Verification email sent to {email}"
   "Check your inbox and verify before logging in"
    ↓
7️⃣ AUTO-REDIRECT TO LOGIN SCREEN
```

### Key Points

✅ **Email verification is mandatory** - prevents fake account creation  
✅ **No backend call yet** - backend user created only after verification  
✅ **Data stored for convenience** - user won't re-enter details on login  
✅ **Clean separation** - Firebase handles identity, backend handles business logic  

---

## 🔑 LOGIN FLOW (First Time After Registration)

### Step-by-Step Process

```
USER LOGIN SCREEN
    ↓
1️⃣ LoginScreen loads:
   - Checks for stored registration data
   - If found: pre-fills email, shows info banner
   - "✅ Account created! Use your email to verify and login"
    ↓
2️⃣ User enters email & password
    ↓
3️⃣ LoginScreen calls:
   loginWithEmail(email, password, SELLER, businessName, etc)
    ↓
4️⃣ Firebase Authentication:
   - Authenticates email/password
   - Checks: emailVerified === true
   - If not verified: throws error, signs out
    ↓
5️⃣ Firebase returns:
   - User object with Firebase UID
   - Email (username/principal)
    ↓
6️⃣ Get Firebase ID Token:
   - Firebase generates JWT-like token
   - Proves: "Firebase verified this user"
   - Valid for ~1 hour
    ↓
7️⃣ Send to Backend:
   POST /auth/firebase-login
   Header: Authorization: Bearer <FIREBASE_ID_TOKEN>
   Body: {
     "fullName": "John Doe",
     "phone": "9876543210",
     "role": "SELLER",
     "businessName": "John's Shop",
     "gstNumber": "22AABCU1234A1Z5"
   }
    ↓
8️⃣ Backend Verification:
   - Verifies Firebase token with Firebase servers
   - Extracts uid & email
   - Checks if user exists in DB by Firebase UID
    ↓
9️⃣ Backend User Creation:
   - User NOT found → Creates new User:
     * firebaseUid
     * email
     * fullName
     * phone
     * status = ACTIVE
   - Assigns role: SELLER
   - If SELLER → Creates Seller entity:
     * businessName
     * gstNumber
     * status = PENDING
    ↓
🔟 Backend Generates JWT:
   - Backend JWT (NOT Firebase token)
   - Contains: userId, email, roles
   - Signed by backend secret
    ↓
1️⃣1️⃣ Backend Returns:
   {
     "userId": 42,
     "email": "john@example.com",
     "fullName": "John Doe",
     "phone": "9876543210",
     "roles": ["SELLER"],
     "token": "eyJhbGciOiJIUzI1NiI..."
   }
    ↓
1️⃣2️⃣ Frontend Stores:
   - Backend JWT in AsyncStorage
   - User data (for role-based navigation)
   - Clears registration data (no longer needed)
    ↓
1️⃣3️⃣ Navigation:
   - AppNavigator checks user roles
   - Routes to appropriate home screen
```

### First-Time Login: What Happens

| Step | What | Who |
|------|------|-----|
| 1-6 | Authenticate | Firebase |
| 7 | Send registration data | Frontend |
| 8-10 | Create user in DB | Backend |
| 11 | Generate JWT | Backend |
| 12-13 | Store JWT & navigate | Frontend |

---

## 🔑 LOGIN FLOW (Regular User)

### Step-by-Step Process

```
EXISTING USER LOGIN
    ↓
1️⃣ User enters email & password
    ↓
2️⃣ LoginScreen detects:
   - No stored registration data
   - Calls: loginWithEmail(email, password)
    ↓
3️⃣-6️⃣ Firebase Authentication (same as above)
    ↓
7️⃣ Send to Backend:
   POST /auth/firebase-login
   Header: Authorization: Bearer <FIREBASE_ID_TOKEN>
   Body: {} (empty - pure login)
    ↓
8️⃣ Backend:
   - Verifies Firebase token
   - Finds user by Firebase UID
   - User found → return JWT
   - User not found → throw error "Please register first"
    ↓
1️⃣2️⃣-1️⃣3️⃣ Store JWT & navigate (same as above)
```

### Regular Login: Key Difference

| Aspect | First-Time | Regular |
|--------|----------|---------|
| Request body | Has registration data | Empty |
| Backend logic | Create new user | Find existing user |
| New Seller | Created | N/A |
| Old Seller | Updated | Used as-is |

---

## 🏗️ Architecture Decision: Why This Way?

### ❌ Why NOT: Create user in backend FIRST, then Firebase?

❌ **Sync problems** - User creates in backend, then cancels Firebase registration = orphaned DB record  
❌ **Duplicate emails** - No guarantee email uniqueness across systems  
❌ **Security** - Backend has to trust frontend claims about email  

### ✅ Why YES: Firebase FIRST, then backend on login?

✅ **Firebase = source of truth** for identities  
✅ **Email verification first** prevents spam accounts  
✅ **Single flow** - Same endpoint for register & login  
✅ **Backend only creates verified users** - Higher data quality  
✅ **Natural flow** - Register → Verify → Login → Create backend user  

---

## 🔎 Token Differences

### Firebase ID Token
```
Who issues: Firebase servers
What it means: "This user owns this email"
Lifetime: ~1 hour
Used for: Sending to backend for verification
Verification: Backend calls Firebase to verify
```

### Backend JWT
```
Who issues: Your Spring Boot backend
What it means: "User is registered, here are their roles"
Lifetime: Configurable (typically 24h or more)
Used for: Every subsequent API call
Verification: Backend validates with its own secret key
Header: Authorization: Bearer <JWT>
```

---

## 📱 Frontend Files

### `firebaseAuth.service.ts`
- `registerWithEmail()` - Creates Firebase account, sends verification email
- `loginWithEmail()` - Firebase auth + backend JWT exchange
- `logout()` - Signs out from Firebase

### `token.service.ts`
- `saveToken()` / `getToken()` - JWT storage
- `saveUserData()` / `getUserData()` - User profile storage
- `saveRegistrationData()` / `getRegistrationData()` - Temporary registration data
- `clearRegistrationData()` - Cleanup after login

### `RegisterScreen.tsx`
1. Collects registration data
2. Calls registerWithEmail()
3. Stores data in AsyncStorage via saveRegistrationData()
4. Shows verification email message
5. Redirects to LoginScreen

### `LoginScreen.tsx`
1. On load: Checks for stored registration data
2. If found: Pre-fills email, shows info banner
3. On login:
   - If registration data exists for this email: Include it in login call
   - If not: Pure login
4. Stores JWT and user data
5. Clears registration data
6. Navigates based on roles

---

## ☕ Backend Endpoint

### `POST /auth/firebase-login`

**Headers:**
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Body (optional):**
```json
{
  "fullName": "string",
  "phone": "string",
  "role": "BUYER|SELLER",
  "businessName": "string (if seller)",
  "gstNumber": "string (if seller, optional)"
}
```

**Logic:**
```
IF request body is empty or has no role:
  → Pure login (user must exist)
  → Find by Firebase UID
  → Return JWT

IF request body has role:
  → Registration login (first-time login after Firebase registration)
  → Find by Firebase UID or email
  → If not found: Create new user + role + seller
  → If found: Update + assign role if needed
  → Return JWT
```

**Response:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "fullName": "User Name",
  "phone": "1234567890",
  "roles": ["SELLER"],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🧪 Testing the Flow

### Test 1: New User Registration → Login

```
1. Open app → Register Screen
2. Fill form as BUYER:
   - Email: buyer@test.com
   - Password: Test123!
   - Full Name: Test Buyer
   - Phone: 9876543210
3. Click "Create Account"
   ✅ See: "Account created! Verification email sent"
4. Verify email (check inbox or Firebase console)
5. Return to app → Login Screen
6. Enter credentials
   ✅ See: Email pre-filled
   ✅ See: "✅ Account created!" banner
7. Login
   ✅ Success: JWT stored
   ✅ Navigate to Home
```

### Test 2: New Seller Registration → Login

```
1. Open app → Register Screen
2. Fill form as SELLER:
   - Email: seller@test.com
   - Password: Test123!
   - Full Name: Test Seller
   - Phone: 9876543210
   - Toggle: "Register as Seller?"
   - Business Name: Test Shop
   - GST Number: 22AABCU1234A1Z5
3. Click "Create Account"
4. Verify email
5. Return to app → Login Screen
6. Enter credentials
   ✅ See: Email pre-filled
   ✅ See: "✅ Account created! Your seller profile will be created after login"
7. Login
   ✅ Success: New User + Seller created in DB
   ✅ Role assigned: SELLER
   ✅ JWT stored
   ✅ Navigate to Seller home
```

### Test 3: Existing User Login

```
1. Assume user buyer@test.com already exists
2. Open app → Login Screen
3. Enter credentials
   ✅ No banner (no registration data)
4. Login
   ✅ Success: JWT stored
   ✅ Navigate to Home
```

---

## 🐛 Troubleshooting

### "User not found. Please register first."
**Cause:** User tried to login but no Firebase account exists  
**Fix:** Redirect to registration

### "Please verify your email before logging in"
**Cause:** Firebase account created but email not verified  
**Fix:** Check email inbox, click verification link

### Email not arriving
**Cause:** Spam folder or Firebase setup issue  
**Fix:** Check Firebase console → Authentication → Templates

### "Email already linked to another account"
**Cause:** Email linked to different Firebase UID  
**Fix:** Use a different email or contact support

---

## 📝 Summary

✅ **Registration** = Firebase account + email verification  
✅ **Login** = Firebase auth + backend JWT exchange  
✅ **Registration data** = Stored locally to avoid re-entry  
✅ **First-time login** = Includes registration data to create backend user  
✅ **Regular login** = Pure authentication, user already exists  
✅ **JWT** = Backend's own token, used for all API calls  
✅ **Firebase token** = Only sent to backend for verification, never stored

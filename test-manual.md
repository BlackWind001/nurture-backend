# Manual API Test Cases

This document contains manual test cases you can run with curl to test each endpoint.

## Prerequisites

1. Server running: `npm run dev`
2. Get JWT token: `node get-token.js`
3. Export token: `export TOKEN="your_jwt_token_here"`

---

## Test Case 1: Health Check (Public Endpoint)

**Purpose:** Verify the server is running

**Request:**
```bash
curl http://localhost:9876/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Nurture backend is running",
  "timestamp": "2026-02-01T14:30:00.000Z"
}
```

**Expected Status:** `200 OK`

---

## Test Case 2: Get Current User (Protected)

**Purpose:** Verify authentication and user retrieval from Clerk

**Request:**
```bash
curl http://localhost:9876/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "user": {
    "id": "user_...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "hasRelationship": false,
    "relationshipId": null,
    "partnerId": null,
    "profileData": {}
  }
}
```

**Expected Status:** `200 OK`

---

## Test Case 3: Get User Profile (Protected)

**Purpose:** Verify retrieval of user data from Firestore

**Request:**
```bash
curl http://localhost:9876/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "profile": {
    "clerkId": "user_...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "relationshipId": null,
    "partnerId": null,
    "profileData": {},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Expected Status:** `200 OK`

---

## Test Case 4: Update User Profile (Protected)

**Purpose:** Verify updating user's custom profile data

**Request:**
```bash
curl -X PATCH http://localhost:9876/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "profileData": {
      "bio": "Love hiking and reading!",
      "age": 28,
      "interests": ["hiking", "reading", "cooking"],
      "relationship_goals": "Better communication"
    }
  }'
```

**Expected Response:**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "profileData": {
      "bio": "Love hiking and reading!",
      "age": 28,
      "interests": ["hiking", "reading", "cooking"],
      "relationship_goals": "Better communication"
    },
    "updatedAt": "..."
  }
}
```

**Expected Status:** `200 OK`

---

## Test Case 5: Verify Profile Update

**Purpose:** Confirm the profile data was saved correctly

**Request:**
```bash
curl http://localhost:9876/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
Should now include the updated `profileData` from Test Case 4.

**Expected Status:** `200 OK`

---

## Test Case 6: Request Without Authentication (Negative Test)

**Purpose:** Verify protected endpoints reject unauthenticated requests

**Request:**
```bash
curl http://localhost:9876/api/auth/me
```

**Expected Response:**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHENTICATED"
}
```

**Expected Status:** `401 Unauthorized`

---

## Test Case 7: Request With Invalid Token (Negative Test)

**Purpose:** Verify invalid tokens are rejected

**Request:**
```bash
curl http://localhost:9876/api/auth/me \
  -H "Authorization: Bearer invalid_token_123"
```

**Expected Response:**
```json
{
  "error": "Authentication required",
  "code": "UNAUTHENTICATED"
}
```

**Expected Status:** `401 Unauthorized`

---

## Test Case 8: Update With Invalid Data (Negative Test)

**Purpose:** Verify validation of profile data

**Request:**
```bash
curl -X PATCH http://localhost:9876/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"profileData": "not_an_object"}'
```

**Expected Response:**
```json
{
  "error": "profileData must be a valid object",
  "code": "INVALID_PROFILE_DATA"
}
```

**Expected Status:** `400 Bad Request`

---

## Test Case 9: Missing profileData Field (Negative Test)

**Purpose:** Verify required fields are validated

**Request:**
```bash
curl -X PATCH http://localhost:9876/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "error": "profileData must be a valid object",
  "code": "INVALID_PROFILE_DATA"
}
```

**Expected Status:** `400 Bad Request`

---

## Test Case 10: Non-Existent Endpoint (Negative Test)

**Purpose:** Verify 404 handling

**Request:**
```bash
curl http://localhost:9876/api/non-existent \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "error": "Endpoint not found",
  "code": "NOT_FOUND",
  "path": "/api/non-existent"
}
```

**Expected Status:** `404 Not Found`

---

## Test Case 11: Webhook Endpoint (Public)

**Purpose:** Verify webhook endpoint exists (actual testing requires Clerk to call it)

**Request:**
```bash
curl -X POST http://localhost:9876/api/auth/webhook \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "error": "Invalid webhook signature",
  "code": "INVALID_SIGNATURE"
}
```

**Expected Status:** `400 Bad Request` (because we don't have valid Svix signature)

**Note:** This is expected. Real webhooks from Clerk will have valid signatures.

---

## Test Case 12: CORS Headers

**Purpose:** Verify CORS is configured correctly

**Request:**
```bash
curl -v http://localhost:9876/health \
  -H "Origin: http://localhost:3001"
```

**Expected Headers:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

**Expected Status:** `200 OK`

---

## Test Summary Checklist

- [ ] Test 1: Health check responds
- [ ] Test 2: Can get current user with valid token
- [ ] Test 3: Can get user profile from Firestore
- [ ] Test 4: Can update user profile
- [ ] Test 5: Profile updates are persisted
- [ ] Test 6: Requests without token are rejected (401)
- [ ] Test 7: Invalid tokens are rejected (401)
- [ ] Test 8: Invalid data is rejected (400)
- [ ] Test 9: Missing required fields rejected (400)
- [ ] Test 10: Non-existent endpoints return 404
- [ ] Test 11: Webhook endpoint exists
- [ ] Test 12: CORS headers present

---

## Verification in Firebase Console

After running tests, verify in [Firebase Console](https://console.firebase.google.com):

1. Navigate to **Firestore Database**
2. Check `users` collection
3. Find your user document
4. Verify:
   - ✅ `clerkId` matches your user ID
   - ✅ `email`, `firstName`, `lastName` are correct
   - ✅ `profileData` contains your test data
   - ✅ `updatedAt` timestamp is recent
   - ✅ `createdAt` matches when user was created

---

## Troubleshooting

**401 Errors:**
- Regenerate token with `node get-token.js`
- Verify `CLERK_SECRET_KEY` in `.env`
- Check token hasn't expired (1 hour validity)

**500 Errors:**
- Check server logs for detailed error
- Verify Firebase credentials are correct
- Ensure Firestore is enabled in Firebase Console

**Connection Errors:**
- Verify server is running (`npm run dev`)
- Check correct port (9876 or 3000)
- Ensure no firewall blocking localhost

---

## Next Steps

Once all tests pass:

1. ✅ Authentication is working
2. ✅ User sync (Clerk → Firestore) is working
3. ✅ Protected endpoints are secure
4. ✅ Profile updates work correctly

You're ready to:
- Build your frontend
- Implement relationship features
- Deploy to production

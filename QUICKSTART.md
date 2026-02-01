# Nurture Backend - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Firebase Setup (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Save the file as `firebase-service-account.json` in your project root

### Step 2: Verify Environment (30 seconds)

Your `.env` file should look like this:

```bash
PORT=3000
NODE_ENV=development

CLERK_PUBLISHABLE_KEY=pk_test_...  # ✓ Already set
CLERK_SECRET_KEY=sk_test_...       # ✓ Already set
CLERK_WEBHOOK_SECRET=whsec_...     # ✓ Already set

FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Step 3: Start the Server (30 seconds)

```bash
npm run dev
```

You should see:
```
🚀 Nurture Backend Server Started
================================
Port: 3000
Environment: development
...
```

### Step 4: Test Health Endpoint (30 seconds)

Open a new terminal and run:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Nurture backend is running",
  "timestamp": "2026-02-01T..."
}
```

✅ **Your backend is now running!**

---

## 🔗 Setting Up Webhooks (For Production)

### For Local Development (Using ngrok)

1. **Install ngrok**
   ```bash
   npm install -g ngrok
   ```

2. **Start your server**
   ```bash
   npm run dev
   ```

3. **In a new terminal, start ngrok**
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL** (looks like `https://abc123.ngrok.io`)

5. **Add to Clerk Dashboard**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Navigate to **Webhooks**
   - Click **"Add Endpoint"**
   - URL: `https://abc123.ngrok.io/api/auth/webhook`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Click **"Create"**

### For Production

Replace the ngrok URL with your production domain:
- `https://your-domain.com/api/auth/webhook`

---

## 🧪 Testing the Authentication

### 1. Create a Test User

You can create users in two ways:

**Option A: Using Clerk Dashboard**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users**
3. Click **"Create user"**
4. Fill in email and password
5. Check your server logs - you should see:
   ```
   📥 Webhook received: user.created for user user_...
   ✅ User created in Firestore: test@example.com
   ```

**Option B: Using Your Frontend**
- If you have a frontend with Clerk auth, sign up there
- The webhook will automatically sync the user to Firestore

### 2. Get Authentication Token

**From Frontend:**
```javascript
import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();
const token = await getToken();
```

**From Clerk Dashboard:**
1. Go to **Users**
2. Click on your test user
3. Scroll to **"User ID"** and copy it
4. Use a tool like [JWT.io](https://jwt.io) to create a test token (for development only)

### 3. Test Protected Endpoints

```bash
# Get current user
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
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

```bash
# Get user profile
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Update user profile
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"profileData": {"bio": "Love hiking!", "age": 28}}'
```

---

## 📊 Verify Data in Firestore

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database**
4. You should see a `users` collection
5. Click on a user document to see their data:
   ```
   clerkId: "user_..."
   email: "test@example.com"
   firstName: "Test"
   lastName: "User"
   relationshipId: null
   partnerId: null
   profileData: {}
   createdAt: timestamp
   updatedAt: timestamp
   ```

---

## 🐛 Troubleshooting

### "Firebase credentials not configured"

**Solution:** Make sure `firebase-service-account.json` exists in your project root

```bash
# Check if file exists
ls -la firebase-service-account.json

# If not found, download it again from Firebase Console
```

### "Invalid webhook signature"

**Solution:** Your webhook secret might be wrong

1. Go to Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Copy the **Signing Secret**
4. Update `CLERK_WEBHOOK_SECRET` in `.env`
5. Restart your server

### "Authentication required" on protected routes

**Solution:** Make sure you're sending the token correctly

```bash
# ✓ Correct format
Authorization: Bearer eyJhbGc...

# ✗ Wrong format
Authorization: eyJhbGc...  # Missing "Bearer "
```

### Port 3000 already in use

**Solution:** Either stop the other process or change the port

```bash
# Option 1: Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Change port in .env
PORT=3001
```

---

## 📝 Next Steps

Now that your backend is running, you can:

1. **Build Your Frontend**
   - Install `@clerk/nextjs` or `@clerk/react`
   - Set up authentication UI
   - Make API calls to your backend

2. **Implement Relationships**
   - Add invitation system
   - Create partner linking
   - Build relationship dashboard

3. **Add Skills Tracking**
   - Create skills collection
   - Track progress
   - Set goals

4. **Deploy to Production**
   - Deploy to Vercel, Railway, or Render
   - Update Clerk webhook URL
   - Configure production environment variables

---

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Project structure and architecture
- **[README.md](README.md)** - Project overview

---

## 💡 Tips

1. **Keep your server running** while developing your frontend
2. **Check server logs** for any errors or webhook activity
3. **Use Postman** or similar tools for API testing
4. **Check Firestore Console** to verify data is being saved correctly
5. **Use ngrok** for webhook testing during local development

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the server logs for error messages
2. Verify all environment variables are set correctly
3. Make sure Firebase and Clerk are properly configured
4. Check that your authentication token is valid

---

**Happy coding! 🎉**

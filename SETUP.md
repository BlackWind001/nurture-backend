# Nurture Backend Setup Instructions

## Prerequisites

Before running this backend, you need:

1. **Node.js** (v14 or higher)
2. **Firebase Project** with Firestore enabled
3. **Clerk Account** with an application created

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

You have two options for Firebase configuration:

#### Option A: Service Account JSON (Recommended)

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-service-account.json` in the project root
4. The `.env` file is already configured to use this path

#### Option B: Individual Environment Variables

1. Get your Firebase credentials from the Firebase Console
2. Update `.env` with:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@...
   FIREBASE_PRIVATE_KEY=your-private-key
   ```

### 3. Configure Clerk Webhook

Your Clerk credentials are already set in `.env`. To set up the webhook:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** section
3. Add a new endpoint with your deployed URL (or use ngrok for local testing):
   - URL: `https://your-domain.com/api/auth/webhook`
   - Or for local: `https://your-ngrok-url.ngrok.io/api/auth/webhook`
4. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. The webhook secret is already configured in your `.env`

### 4. Testing with ngrok (Local Development)

To test webhooks locally:

```bash
# Install ngrok if you haven't
npm install -g ngrok

# In one terminal, start the server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the https URL and add it to Clerk webhooks
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Public Endpoints

- **GET /health** - Health check endpoint
  ```bash
  curl http://localhost:3000/health
  ```

- **POST /api/auth/webhook** - Clerk webhook endpoint (called by Clerk)

### Protected Endpoints (Require Authentication)

All protected endpoints require a Bearer token from Clerk in the Authorization header.

- **GET /api/auth/me** - Get current authenticated user
  ```bash
  curl http://localhost:3000/api/auth/me \
    -H "Authorization: Bearer YOUR_CLERK_TOKEN"
  ```

- **GET /api/users/profile** - Get user profile from Firestore
  ```bash
  curl http://localhost:3000/api/users/profile \
    -H "Authorization: Bearer YOUR_CLERK_TOKEN"
  ```

- **PATCH /api/users/profile** - Update user profile
  ```bash
  curl -X PATCH http://localhost:3000/api/users/profile \
    -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"profileData": {"age": 25, "interests": ["hiking", "reading"]}}'
  ```

## Firestore Collections

### users
```javascript
{
  clerkId: string,           // Clerk user ID (document ID)
  email: string,
  firstName: string,
  lastName: string,
  relationshipId: string | null,
  partnerId: string | null,
  profileData: object,       // Flexible custom data
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### relationships (Future Implementation)
```javascript
{
  user1Id: string,
  user2Id: string,
  status: string,            // 'pending', 'active', 'paused', 'ended'
  invitationToken: string,
  relationshipData: object,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Testing the Setup

1. **Test Health Endpoint**
   ```bash
   curl http://localhost:3000/health
   ```
   Expected: `{"status":"ok","message":"Nurture backend is running","timestamp":"..."}`

2. **Create a User via Clerk** (use your frontend or Clerk dashboard)

3. **Verify Webhook Sync**
   - Check server logs for: `✅ User created in Firestore`
   - Check Firebase Console → Firestore → users collection

4. **Test Authentication**
   - Get a token from Clerk (via frontend login)
   - Call `/api/auth/me` with the token
   - Should return your user data

## Environment Variables

See `.env.example` for all required environment variables:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_WEBHOOK_SECRET` - Clerk webhook signing secret
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to Firebase service account JSON
- `FRONTEND_URL` - Frontend URL for CORS (optional)

## Troubleshooting

### Firebase Connection Issues
- Ensure your service account JSON file is in the correct location
- Check that your Firebase project has Firestore enabled
- Verify the credentials in your `.env` file

### Clerk Webhook Not Working
- Make sure your webhook URL is publicly accessible (use ngrok for local testing)
- Verify the webhook secret matches in Clerk dashboard and `.env`
- Check server logs for webhook verification errors

### Authentication Errors
- Ensure the Bearer token is valid and not expired
- Verify `CLERK_SECRET_KEY` is correctly set in `.env`
- Check that the user exists in Clerk

## Next Steps

This implementation provides the authentication foundation. Future features to build:

1. **Relationship Management**
   - Invitation system
   - Partner linking
   - Relationship data management

2. **Skills Tracking**
   - Create skills collection
   - Track progress
   - Set goals

3. **Notifications**
   - Email notifications
   - Push notifications
   - Reminders

## Support

For issues or questions, please check:
- Server logs in the terminal
- Firebase Console for database issues
- Clerk Dashboard for authentication issues

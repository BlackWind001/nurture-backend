# Nurture Backend - Project Structure

## Directory Tree

```
nurture-backend/
├── src/
│   ├── config/
│   │   └── firebase.js              # Firebase Admin SDK initialization
│   ├── controllers/
│   │   ├── authController.js        # Auth logic (webhook, getCurrentUser)
│   │   └── userController.js        # User profile CRUD operations
│   ├── middleware/
│   │   ├── auth.js                  # Clerk authentication middleware
│   │   └── errorHandler.js          # Global error handler
│   ├── routes/
│   │   ├── auth.js                  # Auth endpoints
│   │   └── users.js                 # User profile endpoints
│   └── server.js                    # Express app entry point
├── .env                              # Environment variables (not in git)
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── package.json                      # NPM dependencies and scripts
├── README.md                         # Original project README
└── SETUP.md                          # Detailed setup instructions

## File Descriptions

### Core Files

#### `src/server.js`
- Main Express application
- Configures CORS, JSON parsing
- Mounts all routes
- Starts HTTP server

#### `src/config/firebase.js`
- Initializes Firebase Admin SDK
- Supports both service account JSON and individual credentials
- Exports `db` (Firestore) and `admin` instances

### Middleware

#### `src/middleware/auth.js`
- `getUserDetails`: Fetches user from Clerk and attaches to request
- `requireRelationship`: Ensures user is in a relationship
- `requireNoRelationship`: Ensures user is NOT in a relationship

#### `src/middleware/errorHandler.js`
- Global error handling
- Handles Clerk auth errors (401)
- Handles validation errors (400)
- Handles not found errors (404)
- Returns consistent error responses

### Controllers

#### `src/controllers/authController.js`
- `handleWebhook`: Processes Clerk webhooks (user.created, user.updated, user.deleted)
- `getCurrentUser`: Returns authenticated user info from Clerk + Firestore

#### `src/controllers/userController.js`
- `getProfile`: Gets user profile from Firestore
- `updateProfile`: Updates user's profileData in Firestore

### Routes

#### `src/routes/auth.js`
- `POST /api/auth/webhook` - Clerk webhook endpoint (public)
- `GET /api/auth/me` - Get current user (protected)

#### `src/routes/users.js`
- `GET /api/users/profile` - Get user profile (protected)
- `PATCH /api/users/profile` - Update user profile (protected)

## Data Flow

### User Registration Flow
```
1. User signs up via Clerk (frontend)
2. Clerk creates user account
3. Clerk sends webhook to /api/auth/webhook
4. Backend creates user document in Firestore users collection
5. User can now authenticate and access protected endpoints
```

### Authentication Flow
```
1. User logs in via Clerk (frontend)
2. Clerk returns JWT token
3. Frontend sends API requests with Bearer token
4. ClerkExpressRequireAuth middleware validates token
5. getUserDetails middleware fetches user info
6. Controller processes request
7. Response sent to frontend
```

### Data Storage
```
Clerk: User accounts, authentication, email/password management
Firestore: User profiles, relationships, custom data
```

## Environment Variables

Required variables in `.env`:

```bash
# Server
PORT=3000
NODE_ENV=development

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Firebase (Option 1: Service Account JSON)
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Firebase (Option 2: Individual Credentials)
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=your-service-account@...
# FIREBASE_PRIVATE_KEY=your-private-key

# Optional
# FRONTEND_URL=http://localhost:3001
```

## NPM Scripts

```bash
npm start       # Production mode (node src/server.js)
npm run dev     # Development mode with auto-reload (nodemon)
npm test        # Run tests (not implemented yet)
```

## Dependencies

### Production
- `@clerk/clerk-sdk-node` - Clerk authentication SDK
- `firebase-admin` - Firebase Admin SDK for Firestore
- `express` - Web framework
- `dotenv` - Environment variable management
- `cors` - CORS middleware
- `express-async-handler` - Async error handling
- `svix` - Webhook signature verification

### Development
- `nodemon` - Auto-restart on file changes

## API Response Format

### Success Response
```json
{
  "user": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Security Features

1. **Authentication**: All protected routes require valid Clerk JWT token
2. **Webhook Verification**: Webhooks verified using Svix signatures
3. **CORS**: Configured to allow only specified origins
4. **Error Handling**: Detailed errors in development, generic in production
5. **Input Validation**: Request body validation before processing
6. **Firebase Security**: Admin SDK with service account credentials

## Future Enhancements

1. **Relationships Module**
   - Invitation system
   - Partner acceptance flow
   - Relationship data management

2. **Skills & Progress**
   - Skills collection in Firestore
   - Progress tracking
   - Goals and milestones

3. **Testing**
   - Unit tests for controllers
   - Integration tests for API endpoints
   - Mock Clerk and Firebase for testing

4. **Logging**
   - Structured logging with Winston or Pino
   - Request/response logging
   - Error tracking with Sentry

5. **API Documentation**
   - Swagger/OpenAPI documentation
   - Postman collection

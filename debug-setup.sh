#!/bin/bash

# Debug script to check if everything is set up correctly

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Nurture Backend Debug Script                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check 1: Server running
echo -e "${YELLOW}1. Checking if server is running...${NC}"
if curl -s http://localhost:9876/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Server is running on port 9876${NC}"
  echo -e "${BLUE}Response:${NC}"
  curl -s http://localhost:9876/health | jq 2>/dev/null || curl -s http://localhost:9876/health
  echo ""
else
  echo -e "${RED}❌ Server is not responding on port 9876${NC}"
  echo -e "${YELLOW}Run: npm run dev${NC}"
  exit 1
fi

echo ""

# Check 2: TOKEN environment variable
echo -e "${YELLOW}2. Checking TOKEN environment variable...${NC}"
if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ TOKEN is not set${NC}"
  echo -e "${YELLOW}Run these commands:${NC}"
  echo -e "  node get-token.js"
  echo -e "  export TOKEN='paste_token_here'"
  exit 1
else
  echo -e "${GREEN}✅ TOKEN is set${NC}"
  echo -e "${BLUE}Token (first 50 chars): ${TOKEN:0:50}...${NC}"
  
  # Check if it looks like a JWT
  if [[ $TOKEN == eyJ* ]]; then
    echo -e "${GREEN}✅ Token appears to be a valid JWT format${NC}"
  else
    echo -e "${RED}❌ Token doesn't look like a JWT (should start with 'eyJ')${NC}"
    echo -e "${YELLOW}Your token: ${TOKEN:0:50}${NC}"
    echo -e "${YELLOW}Run: node get-token.js to get a proper JWT${NC}"
    exit 1
  fi
fi

echo ""

# Check 3: Test authentication
echo -e "${YELLOW}3. Testing authentication with your token...${NC}"
response=$(curl -s -w "\n%{http_code}" http://localhost:9876/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

status_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$status_code" = "200" ]; then
  echo -e "${GREEN}✅ Authentication successful!${NC}"
  echo -e "${BLUE}User info:${NC}"
  echo "$body" | jq 2>/dev/null || echo "$body"
  echo ""
  echo -e "${GREEN}🎉 Everything is working! You can now run ./test-api.sh${NC}"
elif [ "$status_code" = "401" ]; then
  echo -e "${RED}❌ Authentication failed (401 Unauthorized)${NC}"
  echo -e "${YELLOW}Possible causes:${NC}"
  echo -e "  1. Token has expired (tokens are valid for 1 hour)"
  echo -e "  2. Token is invalid or malformed"
  echo -e "  3. CLERK_SECRET_KEY in .env is incorrect"
  echo ""
  echo -e "${YELLOW}Solution:${NC}"
  echo -e "  Run: node get-token.js"
  echo -e "  Then: export TOKEN='new_token_here'"
  echo ""
  echo -e "${BLUE}Error response:${NC}"
  echo "$body" | jq 2>/dev/null || echo "$body"
else
  echo -e "${RED}❌ Unexpected status code: $status_code${NC}"
  echo -e "${BLUE}Response:${NC}"
  echo "$body"
fi

echo ""

# Check 4: Firebase connection
echo -e "${YELLOW}4. Checking Firebase connection...${NC}"
if [ -f "firebase-service-account.json" ]; then
  echo -e "${GREEN}✅ firebase-service-account.json exists${NC}"
else
  echo -e "${YELLOW}⚠️  firebase-service-account.json not found${NC}"
  echo -e "${YELLOW}Check if Firebase is configured via environment variables${NC}"
fi

echo ""

# Check 5: Environment variables
echo -e "${YELLOW}5. Checking required environment variables...${NC}"
source .env 2>/dev/null

if [ -n "$CLERK_SECRET_KEY" ]; then
  echo -e "${GREEN}✅ CLERK_SECRET_KEY is set${NC}"
else
  echo -e "${RED}❌ CLERK_SECRET_KEY is not set in .env${NC}"
fi

if [ -n "$CLERK_PUBLISHABLE_KEY" ]; then
  echo -e "${GREEN}✅ CLERK_PUBLISHABLE_KEY is set${NC}"
else
  echo -e "${RED}❌ CLERK_PUBLISHABLE_KEY is not set in .env${NC}"
fi

if [ -n "$CLERK_WEBHOOK_SECRET" ]; then
  echo -e "${GREEN}✅ CLERK_WEBHOOK_SECRET is set${NC}"
else
  echo -e "${YELLOW}⚠️  CLERK_WEBHOOK_SECRET is not set in .env${NC}"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   Debug Complete                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

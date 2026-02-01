#!/bin/bash

# Nurture Backend API Test Suite
# This script tests all the API endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="http://localhost:9876"

# Check if TOKEN is set
if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Error: TOKEN environment variable not set${NC}"
  echo -e "${YELLOW}Please run: node get-token.js${NC}"
  echo -e "${YELLOW}Then: export TOKEN='your_jwt_token_here'${NC}"
  exit 1
fi

# Check if jq is available for pretty JSON output
if ! command -v jq &> /dev/null; then
  echo -e "${YELLOW}⚠️  Warning: 'jq' is not installed. JSON output won't be formatted.${NC}"
  echo -e "${YELLOW}Install with: brew install jq${NC}"
  JQ_CMD="cat"
else
  JQ_CMD="jq"
fi

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Nurture Backend API Test Suite                 ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}API Base URL: ${API_BASE_URL}${NC}"
echo -e "${BLUE}Token: ${TOKEN:0:20}...${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
  local test_name=$1
  local expected_status=$2
  local response_file=$3
  
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}🧪 Test: ${test_name}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Get HTTP status code (last line of file)
  http_status=$(tail -n 1 "$response_file")
  
  # Get response body (all lines except last)
  response_body=$(head -n -1 "$response_file")
  
  # Check if status matches expected
  if [ "$http_status" = "$expected_status" ]; then
    echo -e "${GREEN}✅ Status: ${http_status} (Expected: ${expected_status})${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}❌ Status: ${http_status} (Expected: ${expected_status})${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
  
  # Show response body
  echo -e "\n${BLUE}Response:${NC}"
  echo "$response_body" | $JQ_CMD
  echo ""
}

# Create temp directory for responses
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# ============================================
# TEST 1: Health Check (No Authentication)
# ============================================
echo -e "${GREEN}Running Test 1: Health Check${NC}"
curl -s -w "\n%{http_code}" \
  "${API_BASE_URL}/health" \
  > "${TEMP_DIR}/test1.txt" 2>&1

run_test "Health Check (Public)" "200" "${TEMP_DIR}/test1.txt"

# ============================================
# TEST 2: Get Current User (With Authentication)
# ============================================
echo -e "${GREEN}Running Test 2: Get Current User${NC}"
curl -s -w "\n%{http_code}" \
  "${API_BASE_URL}/api/auth/me" \
  -H "Authorization: Bearer ${TOKEN}" \
  > "${TEMP_DIR}/test2.txt" 2>&1

run_test "Get Current User (Protected)" "200" "${TEMP_DIR}/test2.txt"

# ============================================
# TEST 3: Get User Profile (With Authentication)
# ============================================
echo -e "${GREEN}Running Test 3: Get User Profile${NC}"
curl -s -w "\n%{http_code}" \
  "${API_BASE_URL}/api/users/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  > "${TEMP_DIR}/test3.txt" 2>&1

run_test "Get User Profile (Protected)" "200" "${TEMP_DIR}/test3.txt"

# ============================================
# TEST 4: Update User Profile (With Authentication)
# ============================================
echo -e "${GREEN}Running Test 4: Update User Profile${NC}"
TIMESTAMP=$(date +%s)
curl -s -w "\n%{http_code}" \
  -X PATCH \
  "${API_BASE_URL}/api/users/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"profileData\": {
      \"bio\": \"Testing Nurture backend auth system\",
      \"age\": 28,
      \"interests\": [\"relationships\", \"communication\", \"growth\"],
      \"relationship_goals\": \"Better understanding and connection\",
      \"lastTestRun\": ${TIMESTAMP}
    }
  }" \
  > "${TEMP_DIR}/test4.txt" 2>&1

run_test "Update User Profile (Protected)" "200" "${TEMP_DIR}/test4.txt"

# ============================================
# TEST 5: Verify Profile Update
# ============================================
echo -e "${GREEN}Running Test 5: Verify Profile Update${NC}"
sleep 1
curl -s -w "\n%{http_code}" \
  "${API_BASE_URL}/api/users/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  > "${TEMP_DIR}/test5.txt" 2>&1

run_test "Verify Profile Update (Protected)" "200" "${TEMP_DIR}/test5.txt"

# ============================================
# TEST 6: Test Without Authentication (Should Fail)
# ============================================
echo -e "${GREEN}Running Test 6: Request Without Token${NC}"
curl -s -w "\n%{http_code}" \
  "${API_BASE_URL}/api/auth/me" \
  > "${TEMP_DIR}/test6.txt" 2>&1

run_test "Request Without Auth (Should Fail)" "401" "${TEMP_DIR}/test6.txt"

# ============================================
# TEST 7: Test With Invalid Token (Should Fail)
# ============================================
echo -e "${GREEN}Running Test 7: Request With Invalid Token${NC}"
curl -s -w "\n%{http_code}" \
  "${API_BASE_URL}/api/auth/me" \
  -H "Authorization: Bearer invalid_token_12345" \
  > "${TEMP_DIR}/test7.txt" 2>&1

run_test "Request With Invalid Token (Should Fail)" "401" "${TEMP_DIR}/test7.txt"

# ============================================
# TEST 8: Test Invalid Profile Data (Should Fail)
# ============================================
echo -e "${GREEN}Running Test 8: Update With Invalid Data${NC}"
curl -s -w "\n%{http_code}" \
  -X PATCH \
  "${API_BASE_URL}/api/users/profile" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"profileData\": \"not_an_object\"}" \
  > "${TEMP_DIR}/test8.txt" 2>&1

run_test "Update With Invalid Data (Should Fail)" "400" "${TEMP_DIR}/test8.txt"

# ============================================
# TEST 9: Test Non-Existent Endpoint (Should Fail)
# ============================================
echo -e "${GREEN}Running Test 9: Non-Existent Endpoint${NC}"
curl -s -w "\n%{http_code}" \
  "${API_BASE_URL}/api/non-existent" \
  -H "Authorization: Bearer ${TOKEN}" \
  > "${TEMP_DIR}/test9.txt" 2>&1

run_test "Non-Existent Endpoint (Should Fail)" "404" "${TEMP_DIR}/test9.txt"

# ============================================
# Test Summary
# ============================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    Test Summary                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Tests Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}❌ Tests Failed: ${TESTS_FAILED}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo ""
if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed! (${TESTS_PASSED}/${TOTAL_TESTS})${NC}"
  echo -e "${GREEN}Your Nurture backend is working correctly!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed (${TESTS_FAILED}/${TOTAL_TESTS})${NC}"
  echo -e "${YELLOW}Please check the error messages above.${NC}"
  exit 1
fi

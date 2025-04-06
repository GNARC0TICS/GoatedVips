#!/bin/bash

COOKIE_JAR="cookies.txt"
API_BASE="http://0.0.0.0:5000/api"

# Clean up cookie jar if it exists
if [ -f "$COOKIE_JAR" ]; then
  rm "$COOKIE_JAR"
fi

echo "========================="
echo "Testing Account Linking API"
echo "========================="

echo -e "\n\n1. First, let's create a test user for testing"
echo "-----------------------------"
REGISTER_RESPONSE=$(curl -s -c "$COOKIE_JAR" -X POST "$API_BASE/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword",
    "email": "test@example.com"
  }')

echo "$REGISTER_RESPONSE" | jq .

echo -e "\n\n2. Now let's login with the test user"
echo "-----------------------------"
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword"
  }')

echo "$LOGIN_RESPONSE" | jq .

echo -e "\n\n3. Let's verify we're logged in"
echo "-----------------------------"
ME_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$API_BASE/user")
echo "$ME_RESPONSE" | jq .

echo -e "\n\n4. Now check a Goated ID"
echo "-----------------------------"
CHECK_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$API_BASE/account/check-goated-id/123456")
echo "$CHECK_RESPONSE" | jq .

echo -e "\n\n5. Let's try to link an account"
echo "-----------------------------"
LINK_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X POST "$API_BASE/account/link-account" \
  -H "Content-Type: application/json" \
  -d '{
    "goatedId": "123456"
  }')

echo "$LINK_RESPONSE" | jq .

echo -e "\n\n6. Finally, let's try to unlink the account"
echo "-----------------------------"
UNLINK_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X POST "$API_BASE/account/unlink-account")
echo "$UNLINK_RESPONSE" | jq .

echo -e "\n\nCleaning up"
rm -f "$COOKIE_JAR"
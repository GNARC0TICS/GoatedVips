#!/bin/bash

# Set variables
BASE_URL="http://localhost:5000/api"
echo "Testing user profile endpoints..."

# Test profile fetching
echo -e "\n===== Testing user profile fetching ====="
echo -e "\nNumeric ID (valid):"
curl -s "$BASE_URL/users/1" | jq .

echo -e "\nNon-numeric ID (testing for error handling):"
curl -s "$BASE_URL/users/test" | jq .

echo -e "\nEnsure-profile endpoint:"
curl -s -X POST "$BASE_URL/users/ensure-profile" -H "Content-Type: application/json" -d '{"userId":"1"}' | jq .

echo -e "\n===== Testing user profile update ====="
echo -e "\nValid profile update:"
curl -s -X PATCH "$BASE_URL/users/1" -H "Content-Type: application/json" -d '{"bio":"Updated profile bio"}' | jq .

echo -e "\nInvalid profile update (non-numeric ID):"
curl -s -X PATCH "$BASE_URL/users/test" -H "Content-Type: application/json" -d '{"bio":"This should fail"}' | jq .

echo -e "\n===== Testing batch user profiles ====="
echo -e "\nBatch user profiles:"
curl -s "$BASE_URL/users/batch?ids=1,2,3" | jq .

echo -e "\nDone testing endpoints."

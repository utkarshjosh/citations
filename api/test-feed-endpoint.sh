#!/bin/bash
# Manual test script for Feed API endpoints

API_URL="http://localhost:3000"

echo "================================"
echo "Brain Scroll Feed API Tests"
echo "================================"
echo ""

# Check if server is running
echo "1. Health Check"
curl -s "${API_URL}/health" | jq '.'
echo ""
echo ""

# Test 1: Basic feed endpoint
echo "2. Test: Basic feed (default pagination)"
curl -s "${API_URL}/api/feed" | jq '.pagination, .filters'
echo ""
echo ""

# Test 2: Custom page and limit
echo "3. Test: Custom pagination (page=2, limit=5)"
curl -s "${API_URL}/api/feed?page=2&limit=5" | jq '.pagination'
echo ""
echo ""

# Test 3: Category filter
echo "4. Test: Filter by category (cs.AI)"
curl -s "${API_URL}/api/feed?category=cs.AI&limit=5" | jq '.pagination, .filters'
echo ""
echo ""

# Test 4: Sort by popular
echo "5. Test: Sort by popular"
curl -s "${API_URL}/api/feed?sort=popular&limit=5" | jq '.data[0:2] | .[] | {title, likes_count, views_count}'
echo ""
echo ""

# Test 5: Sort by trending
echo "6. Test: Sort by trending"
curl -s "${API_URL}/api/feed?sort=trending&limit=5" | jq '.data[0:2] | .[] | {title, likes_count, views_count}'
echo ""
echo ""

# Test 6: Get categories
echo "7. Test: Get available categories"
curl -s "${API_URL}/api/feed/categories" | jq '.data[0:5]'
echo ""
echo ""

# Test 7: Get feed stats
echo "8. Test: Get feed statistics"
curl -s "${API_URL}/api/feed/stats" | jq '.data'
echo ""
echo ""

# Test 8: Cursor-based pagination (get first page, then use cursor)
echo "9. Test: Cursor-based pagination"
RESPONSE=$(curl -s "${API_URL}/api/feed?limit=5")
CURSOR=$(echo $RESPONSE | jq -r '.pagination.nextCursor')
echo "First page cursor: $CURSOR"
if [ "$CURSOR" != "null" ]; then
  echo "Fetching next page with cursor..."
  curl -s "${API_URL}/api/feed?cursor=${CURSOR}&limit=5" | jq '.pagination'
fi
echo ""
echo ""

# Test 9: Invalid cursor
echo "10. Test: Invalid cursor (should return 400)"
curl -s "${API_URL}/api/feed?cursor=invalid" | jq '.'
echo ""
echo ""

# Test 10: Large limit (should be capped at 100)
echo "11. Test: Large limit (should cap at 100)"
curl -s "${API_URL}/api/feed?limit=500" | jq '.pagination.limit'
echo ""
echo ""

echo "================================"
echo "Tests Complete"
echo "================================"

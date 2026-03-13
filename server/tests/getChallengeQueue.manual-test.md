# Manual Test Guide: getChallengeQueue Endpoint

## Endpoint Details
- **URL**: `GET /api/v1/challenge/queue`
- **Authentication**: Required (JWT token)
- **Authorization**: super_admin role required
- **Requirements**: 6.1, 6.2, 6.3, 6.4

## Test Scenarios

### 1. Authorization Test

#### Test 1.1: Non-super-admin user (Expected: 403 Forbidden)
```bash
curl -X GET http://localhost:8000/api/v1/challenge/queue \
  -H "Authorization: Bearer <regular_user_token>"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Only super admins can review challenges",
  "statusCode": 403
}
```

#### Test 1.2: Super admin user (Expected: 200 OK)
```bash
curl -X GET http://localhost:8000/api/v1/challenge/queue \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "challenges": [...],
    "total": <number>
  },
  "message": "Challenge queue retrieved successfully",
  "statusCode": 200
}
```

### 2. Filtering Tests

#### Test 2.1: Filter by adminId
```bash
curl -X GET "http://localhost:8000/api/v1/challenge/queue?adminId=<admin_id>" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected**: Only challenges where the specified admin made the decision

#### Test 2.2: Filter by dateFrom
```bash
curl -X GET "http://localhost:8000/api/v1/challenge/queue?dateFrom=2024-01-01" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected**: Only challenges created on or after 2024-01-01

#### Test 2.3: Filter by dateTo
```bash
curl -X GET "http://localhost:8000/api/v1/challenge/queue?dateTo=2024-12-31" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected**: Only challenges created on or before 2024-12-31

#### Test 2.4: Filter by date range
```bash
curl -X GET "http://localhost:8000/api/v1/challenge/queue?dateFrom=2024-01-01&dateTo=2024-12-31" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected**: Only challenges created between the specified dates

#### Test 2.5: Combine multiple filters
```bash
curl -X GET "http://localhost:8000/api/v1/challenge/queue?adminId=<admin_id>&dateFrom=2024-01-01&dateTo=2024-12-31" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected**: Only challenges matching all filter criteria

### 3. Sorting Test

#### Test 3.1: Verify oldest-first sorting
```bash
curl -X GET http://localhost:8000/api/v1/challenge/queue \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected**: Challenges array sorted by `createdAt` in ascending order (oldest first)

**Verification**: 
```javascript
// In the response, verify:
challenges[0].createdAt <= challenges[1].createdAt <= ... <= challenges[n].createdAt
```

### 4. Data Population Test

#### Test 4.1: Verify populated data
```bash
curl -X GET http://localhost:8000/api/v1/challenge/queue \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected Response Structure**:
```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "_id": "...",
        "issueId": {
          "title": "...",
          "description": "...",
          "imageUrl": "...",
          "location": { "lat": ..., "lng": ... },
          "status": "...",
          "reportedAsFake": false
        },
        "userId": {
          "username": "...",
          "email": "..."
        },
        "adminId": {
          "username": "...",
          "email": "...",
          "role": "admin"
        },
        "challengeType": "spam_report",
        "challengePhotoUrl": "...",
        "similarityScore": 75,
        "status": "accepted",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "total": 1
  },
  "message": "Challenge queue retrieved successfully",
  "statusCode": 200
}
```

### 5. Empty Results Test

#### Test 5.1: No matching challenges
```bash
curl -X GET "http://localhost:8000/api/v1/challenge/queue?adminId=nonexistent_id" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "challenges": [],
    "total": 0
  },
  "message": "Challenge queue retrieved successfully",
  "statusCode": 200
}
```

## Prerequisites for Testing

1. **Database Setup**: Ensure MongoDB is running and contains:
   - At least one user with `role: 'super_admin'`
   - At least one challenge with `status: 'accepted'`
   - Related Issue and User documents

2. **Authentication**: Obtain JWT tokens for:
   - A regular user (for authorization failure test)
   - A super admin user (for successful tests)

3. **Test Data**: Create test challenges with various:
   - Different adminIds
   - Different creation dates
   - Status 'accepted' (should appear in queue)
   - Status 'rejected' or 'reviewed' (should NOT appear in queue)

## Implementation Verification Checklist

- [x] Endpoint created in challenge.controller.js
- [x] Route registered in challenge.route.js
- [x] Routes imported and mounted in app.js
- [x] Authorization check for super_admin role
- [x] Query filter for status 'accepted'
- [x] Support for adminId filter
- [x] Support for dateFrom filter
- [x] Support for dateTo filter
- [x] Sorting by createdAt ascending
- [x] Population of issueId with required fields
- [x] Population of userId with required fields
- [x] Population of adminId with required fields
- [x] Response includes challenges array and total count
- [x] Proper error handling with apiError
- [x] Proper response formatting with apiResponse

## Notes

- The endpoint uses `.lean()` for better performance since we're only reading data
- All challenges in the queue have `status: 'accepted'` by design
- The sorting ensures super admins process challenges in FIFO order (oldest first)
- Populated fields are limited to only necessary data to reduce response size

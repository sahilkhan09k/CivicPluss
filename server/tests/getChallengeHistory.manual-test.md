# Manual Test: getChallengeHistory Endpoint

## Endpoint
`GET /api/v1/challenge/history`

## Requirements
- Requirements: 8.1, 8.2
- Super admin authentication required

## Test Cases

### Test 1: Get all challenge history (no filters)
**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/history \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "challenges": [
      {
        "_id": "...",
        "issueId": { "title": "...", "description": "...", ... },
        "userId": { "username": "...", "email": "..." },
        "adminId": { "username": "...", "email": "...", "role": "..." },
        "challengeType": "spam_report" | "resolved_status",
        "challengePhotoUrl": "...",
        "userLocation": { "lat": ..., "lng": ... },
        "distanceFromIssue": ...,
        "similarityScore": ...,
        "status": "pending" | "accepted" | "rejected" | "reviewed",
        "reviewedBy": { "username": "...", "email": "...", "role": "..." },
        "reviewDecision": "admin_wrong" | "admin_correct",
        "reviewNotes": "...",
        "reviewedAt": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "stats": {
      "totalChallenges": 10,
      "acceptedChallenges": 6,
      "rejectedChallenges": 4,
      "reviewedChallenges": 5,
      "acceptanceRate": 60.00,
      "overturnRate": 40.00,
      "avgSimilarityScore": 55.50,
      "adminWrongCount": 2
    }
  },
  "message": "Challenge history retrieved successfully",
  "success": true
}
```

### Test 2: Filter by userId
**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/challenge/history?userId=<user_id>" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected:** Only challenges from specified user

### Test 3: Filter by issueId
**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/challenge/history?issueId=<issue_id>" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected:** Only challenges for specified issue

### Test 4: Filter by status
**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/challenge/history?status=reviewed" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected:** Only challenges with status "reviewed"

### Test 5: Filter by adminId
**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/challenge/history?adminId=<admin_id>" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected:** Only challenges where specified admin made the decision

### Test 6: Filter by date range
**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/challenge/history?dateFrom=2024-01-01&dateTo=2024-12-31" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected:** Only challenges created within date range

### Test 7: Multiple filters
**Request:**
```bash
curl -X GET "http://localhost:5000/api/v1/challenge/history?status=reviewed&adminId=<admin_id>&dateFrom=2024-01-01" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected:** Only challenges matching all filter criteria

### Test 8: Non-super-admin access (should fail)
**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/history \
  -H "Authorization: Bearer <regular_user_token>"
```

**Expected Response:**
```json
{
  "statusCode": 403,
  "message": "Only super admins can view challenge history",
  "success": false
}
```

## Verification Checklist
- [ ] Returns all challenges with complete lifecycle data
- [ ] Filters work correctly (userId, issueId, status, adminId, date range)
- [ ] Multiple filters can be combined
- [ ] Stats are calculated correctly:
  - [ ] totalChallenges
  - [ ] acceptedChallenges (accepted + reviewed)
  - [ ] rejectedChallenges
  - [ ] reviewedChallenges
  - [ ] acceptanceRate (accepted / total * 100)
  - [ ] overturnRate (admin_wrong / reviewed * 100)
  - [ ] avgSimilarityScore
  - [ ] adminWrongCount
- [ ] Challenges are sorted by createdAt descending (newest first)
- [ ] Related entities are populated (issueId, userId, adminId, reviewedBy)
- [ ] Only super_admin role can access
- [ ] Empty results return zero stats

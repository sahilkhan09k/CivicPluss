# Manual Test: getUserChallenges Endpoint

## Endpoint
`GET /api/v1/challenge/user`

## Requirements
- Requirements: 8.1
- User authentication required

## Test Cases

### Test 1: Get authenticated user's challenges
**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/user \
  -H "Authorization: Bearer <user_token>"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "challenges": [
      {
        "_id": "...",
        "issueId": {
          "title": "Pothole on Main Street",
          "description": "Large pothole causing damage",
          "imageUrl": "https://...",
          "location": { "lat": ..., "lng": ... },
          "status": "Pending" | "Resolved",
          "reportedAsFake": false
        },
        "userId": "...",
        "adminId": {
          "username": "admin_user",
          "email": "admin@example.com",
          "role": "admin"
        },
        "challengeType": "spam_report" | "resolved_status",
        "challengePhotoUrl": "https://...",
        "userLocation": { "lat": ..., "lng": ... },
        "distanceFromIssue": 25.5,
        "similarityScore": 75.5,
        "aiConfidence": 0.85,
        "aiAnalysis": "...",
        "status": "pending" | "accepted" | "rejected" | "reviewed",
        "rejectionReason": "location_too_far" | "low_similarity" | "invalid_photo",
        "reviewedBy": {
          "username": "super_admin",
          "email": "super@example.com",
          "role": "super_admin"
        },
        "reviewDecision": "admin_wrong" | "admin_correct",
        "reviewNotes": "...",
        "reviewedAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-10T14:20:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 5
  },
  "message": "User challenges retrieved successfully",
  "success": true
}
```

### Test 2: User with no challenges
**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/user \
  -H "Authorization: Bearer <user_with_no_challenges_token>"
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "challenges": [],
    "total": 0
  },
  "message": "User challenges retrieved successfully",
  "success": true
}
```

### Test 3: Unauthenticated access (should fail)
**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/user
```

**Expected Response:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "success": false
}
```

### Test 4: Verify data isolation
**Setup:**
1. Create challenges for User A
2. Create challenges for User B
3. Login as User A

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/user \
  -H "Authorization: Bearer <user_a_token>"
```

**Expected:** Only User A's challenges are returned, not User B's

### Test 5: Verify all challenge statuses are included
**Setup:**
1. Create challenges with different statuses for a user:
   - pending
   - accepted
   - rejected
   - reviewed

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/user \
  -H "Authorization: Bearer <user_token>"
```

**Expected:** All challenges regardless of status are returned

### Test 6: Verify sorting (newest first)
**Setup:**
1. Create multiple challenges at different times

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/user \
  -H "Authorization: Bearer <user_token>"
```

**Expected:** Challenges are sorted by createdAt descending (newest first)

### Test 7: Verify issue details are populated
**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/user \
  -H "Authorization: Bearer <user_token>"
```

**Verify Response Contains:**
- issueId.title
- issueId.description
- issueId.imageUrl
- issueId.location
- issueId.status
- issueId.reportedAsFake

### Test 8: Verify admin details are populated
**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/user \
  -H "Authorization: Bearer <user_token>"
```

**Verify Response Contains:**
- adminId.username
- adminId.email
- adminId.role

### Test 9: Verify reviewer details are populated (for reviewed challenges)
**Setup:**
1. Create a reviewed challenge

**Request:**
```bash
curl -X GET http://localhost:5000/api/v1/challenge/user \
  -H "Authorization: Bearer <user_token>"
```

**Verify Response Contains (for reviewed challenges):**
- reviewedBy.username
- reviewedBy.email
- reviewedBy.role
- reviewDecision
- reviewNotes
- reviewedAt

## Verification Checklist
- [ ] Returns only challenges for authenticated user
- [ ] Does not return challenges from other users
- [ ] Includes all challenge statuses (pending, accepted, rejected, reviewed)
- [ ] Issue details are populated correctly
- [ ] Admin details are populated correctly
- [ ] Reviewer details are populated for reviewed challenges
- [ ] Challenges are sorted by createdAt descending (newest first)
- [ ] Returns empty array when user has no challenges
- [ ] Requires authentication (401 without token)
- [ ] Total count matches number of challenges returned
- [ ] All challenge fields are present:
  - [ ] Core fields: _id, issueId, userId, adminId
  - [ ] Challenge details: challengeType, challengePhotoUrl, userLocation, distanceFromIssue
  - [ ] AI analysis: similarityScore, aiConfidence, aiAnalysis
  - [ ] Status: status, rejectionReason (if rejected)
  - [ ] Review: reviewedBy, reviewDecision, reviewNotes, reviewedAt (if reviewed)
  - [ ] Timestamps: createdAt, updatedAt

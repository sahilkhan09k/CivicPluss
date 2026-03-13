# Manual Test Guide: reviewChallenge Endpoint

## Endpoint Details
- **URL**: `PUT /api/v1/challenge/review/:challengeId`
- **Authentication**: Required (JWT token)
- **Authorization**: super_admin role required
- **Requirements**: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.3, 9.4

## Test Scenarios

### 1. Authorization Test

#### Test 1.1: Non-super-admin user (Expected: 403 Forbidden)
```bash
curl -X PUT http://localhost:8000/api/v1/challenge/review/<challenge_id> \
  -H "Authorization: Bearer <regular_user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "admin_wrong",
    "notes": "Test review"
  }'
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
curl -X PUT http://localhost:8000/api/v1/challenge/review/<challenge_id> \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "admin_wrong",
    "notes": "Admin decision was incorrect"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "challenge": { ... },
    "updatedIssue": { ... }
  },
  "message": "Challenge reviewed: Admin decision overturned, issue restored to original state",
  "statusCode": 200
}
```

### 2. Input Validation Tests

#### Test 2.1: Missing decision field (Expected: 400 Bad Request)
```bash
curl -X PUT http://localhost:8000/api/v1/challenge/review/<challenge_id> \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Test review"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Review decision is required",
  "statusCode": 400
}
```

#### Test 2.2: Invalid decision value (Expected: 400 Bad Request)
```bash
curl -X PUT http://localhost:8000/api/v1/challenge/review/<challenge_id> \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "invalid_decision",
    "notes": "Test review"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Decision must be either 'admin_wrong' or 'admin_correct'",
  "statusCode": 400
}
```

#### Test 2.3: Non-existent challenge (Expected: 404 Not Found)
```bash
curl -X PUT http://localhost:8000/api/v1/challenge/review/000000000000000000000000 \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "admin_wrong",
    "notes": "Test review"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Challenge not found",
  "statusCode": 404
}
```

#### Test 2.4: Review non-accepted challenge (Expected: 400 Bad Request)
```bash
# First, try to review a challenge that has status 'rejected' or 'reviewed'
curl -X PUT http://localhost:8000/api/v1/challenge/review/<rejected_challenge_id> \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "admin_wrong",
    "notes": "Test review"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Cannot review challenge with status 'rejected'. Only accepted challenges can be reviewed.",
  "statusCode": 400
}
```

### 3. Admin Was Wrong Decision Tests

#### Test 3.1: Restore issue to original state
```bash
# Prerequisites:
# 1. Create a challenge with originalIssueState stored
# 2. Note the original issue state before admin decision
# 3. Review the challenge with decision='admin_wrong'

curl -X PUT http://localhost:8000/api/v1/challenge/review/<challenge_id> \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "admin_wrong",
    "notes": "After reviewing the evidence, the admin decision was incorrect. The issue should be restored."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "challenge": {
      "_id": "...",
      "status": "reviewed",
      "reviewedBy": {
        "username": "super_admin_user",
        "email": "...",
        "role": "super_admin"
      },
      "reviewDecision": "admin_wrong",
      "reviewNotes": "After reviewing the evidence, the admin decision was incorrect. The issue should be restored.",
      "reviewedAt": "2024-01-15T10:30:00.000Z",
      "issueId": { ... },
      "userId": { ... },
      "adminId": { ... }
    },
    "updatedIssue": {
      "_id": "...",
      "status": "Pending",
      "reportedAsFake": false,
      "wasRestored": true,
      "restoredAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Challenge reviewed: Admin decision overturned, issue restored to original state",
  "statusCode": 200
}
```

**Verification Steps:**
1. Check that issue.status matches challenge.originalIssueState.status
2. Check that issue.reportedAsFake matches challenge.originalIssueState.reportedAsFake
3. Check that issue.resolvedBy matches challenge.originalIssueState.resolvedBy
4. Check that issue.resolvedAt matches challenge.originalIssueState.resolvedAt
5. Check that issue.wasRestored is true
6. Check that issue.restoredAt is set to current timestamp

#### Test 3.2: Verify challenge metadata is recorded
```bash
# After reviewing with admin_wrong, fetch the challenge to verify metadata
curl -X GET http://localhost:8000/api/v1/challenge/<challenge_id> \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected**:
- challenge.status = 'reviewed'
- challenge.reviewedBy = super_admin._id
- challenge.reviewDecision = 'admin_wrong'
- challenge.reviewNotes = provided notes
- challenge.reviewedAt is a valid Date

### 4. Admin Was Correct Decision Tests

#### Test 4.1: Maintain current issue state
```bash
# Prerequisites:
# 1. Create a challenge for an issue that was correctly marked by admin
# 2. Note the current issue state
# 3. Review the challenge with decision='admin_correct'

curl -X PUT http://localhost:8000/api/v1/challenge/review/<challenge_id> \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "admin_correct",
    "notes": "After reviewing the evidence, the admin decision was correct."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "challenge": {
      "_id": "...",
      "status": "reviewed",
      "reviewedBy": {
        "username": "super_admin_user",
        "email": "...",
        "role": "super_admin"
      },
      "reviewDecision": "admin_correct",
      "reviewNotes": "After reviewing the evidence, the admin decision was correct.",
      "reviewedAt": "2024-01-15T10:30:00.000Z",
      "issueId": { ... },
      "userId": { ... },
      "adminId": { ... }
    },
    "updatedIssue": {
      "_id": "...",
      "status": "Resolved",
      "reportedAsFake": true,
      "wasRestored": false,
      "restoredAt": null
    }
  },
  "message": "Challenge reviewed: Admin decision upheld",
  "statusCode": 200
}
```

**Verification Steps:**
1. Check that issue.status remains unchanged from before review
2. Check that issue.reportedAsFake remains unchanged
3. Check that issue.resolvedBy remains unchanged
4. Check that issue.resolvedAt remains unchanged
5. Check that issue.wasRestored is false
6. Check that issue.restoredAt is null

### 5. Transaction Atomicity Test

#### Test 5.1: Verify transaction rollback on error
```bash
# This test requires simulating a database error during the transaction
# You can test this by:
# 1. Temporarily modifying the code to throw an error after updating the issue
# 2. Attempting to review a challenge
# 3. Verifying that neither the issue nor the challenge were updated

# Manual verification steps:
# 1. Note the current state of a challenge and its associated issue
# 2. Simulate an error (e.g., disconnect database during review)
# 3. Attempt to review the challenge
# 4. Verify that both challenge and issue remain in their original state
```

**Expected**: If any part of the transaction fails, all changes should be rolled back

### 6. Admin Accountability Test

#### Test 6.1: Verify admin tracking
```bash
# Fetch a reviewed challenge and verify admin accountability
curl -X GET http://localhost:8000/api/v1/challenge/<challenge_id> \
  -H "Authorization: Bearer <super_admin_token>"
```

**Expected**:
- challenge.adminId references the admin who made the original decision
- challenge.reviewedBy references the super admin who reviewed the challenge
- Both IDs are preserved and accessible for accountability tracking

### 7. Edge Cases

#### Test 7.1: Review with empty notes
```bash
curl -X PUT http://localhost:8000/api/v1/challenge/review/<challenge_id> \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "admin_wrong"
  }'
```

**Expected**: Should succeed with empty reviewNotes (notes are optional)

#### Test 7.2: Review challenge with missing associated issue
```bash
# This test requires:
# 1. Creating a challenge
# 2. Manually deleting the associated issue from the database
# 3. Attempting to review the challenge

# Expected: 404 Not Found error with message "Associated issue not found"
```

## Prerequisites for Testing

1. **Database Setup**: Ensure MongoDB is running and contains:
   - At least one user with `role: 'super_admin'`
   - At least one user with `role: 'admin'`
   - At least one challenge with `status: 'accepted'`
   - Related Issue documents with admin decisions

2. **Authentication**: Obtain JWT tokens for:
   - A regular user (for authorization failure test)
   - A super admin user (for successful tests)

3. **Test Data**: Create test challenges with:
   - Status 'accepted' (can be reviewed)
   - Status 'rejected' or 'reviewed' (cannot be reviewed)
   - Valid originalIssueState data
   - Associated issues with current admin decisions

## Implementation Verification Checklist

- [x] Endpoint created in challenge.controller.js
- [x] Route registered in challenge.route.js
- [x] Authorization check for super_admin role
- [x] Validation for required decision field
- [x] Validation for valid decision values (admin_wrong, admin_correct)
- [x] Validation for challenge existence
- [x] Validation for challenge status (must be 'accepted')
- [x] Validation for associated issue existence
- [x] Database transaction for atomicity
- [x] Issue restoration logic for admin_wrong decision
- [x] Issue state preservation for admin_correct decision
- [x] Challenge status update to 'reviewed'
- [x] Recording of reviewedBy, reviewDecision, reviewNotes, reviewedAt
- [x] Transaction rollback on error
- [x] Proper error handling with apiError
- [x] Proper response formatting with apiResponse
- [x] Population of related documents in response
- [ ] User notification triggering (TODO in code)

## Notes

- The endpoint uses MongoDB transactions to ensure atomicity
- If the transaction fails, all changes are rolled back automatically
- The originalIssueState is stored when the challenge is created
- The endpoint supports optional review notes
- User notifications are marked as TODO and need to be implemented
- The endpoint tracks both the admin who made the original decision and the super admin who reviewed it

## Testing Workflow

1. **Setup**: Create test data (users, issues, challenges)
2. **Authorization**: Test with different user roles
3. **Validation**: Test with invalid inputs
4. **Admin Wrong**: Test issue restoration
5. **Admin Correct**: Test issue state preservation
6. **Verification**: Check database state after each test
7. **Cleanup**: Remove test data

## Sample Test Data Creation

```javascript
// Create a test challenge with originalIssueState
const testChallenge = {
  issueId: "<issue_id>",
  userId: "<user_id>",
  adminId: "<admin_id>",
  challengeType: "spam_report",
  challengePhotoUrl: "https://example.com/photo.jpg",
  userLocation: { lat: 40.7128, lng: -74.0060 },
  distanceFromIssue: 25,
  similarityScore: 75,
  status: "accepted",
  originalIssueState: {
    status: "Pending",
    reportedAsFake: false,
    resolvedBy: null,
    resolvedAt: null
  }
};
```

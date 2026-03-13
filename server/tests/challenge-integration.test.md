# Challenge System Integration Test Guide

This document provides manual testing steps to verify the complete challenge and appeal system integration.

## Prerequisites

1. Server running on http://localhost:5000
2. Client running on http://localhost:5173
3. At least 3 test users:
   - Regular user (issue reporter)
   - Admin user (to make decisions)
   - Super admin user (to review challenges)

## Test Flow 1: Complete Challenge Submission Flow (Task 20.1)

### Setup
1. Login as regular user
2. Create a new issue with photo and location
3. Login as admin user
4. Mark the issue as spam or resolve it (this sets adminDecisionTimestamp)

### Test Steps
1. Login as the original issue reporter
2. Navigate to "My Issues" page
3. Find the issue that was marked as spam/resolved
4. Verify ChallengeButton appears with countdown timer
5. Click "Submit Challenge" button
6. Verify location permission request appears
7. Grant location permission (must be within 50m of issue location for real test)
8. Verify location validation shows distance
9. Click "Continue to Photo Capture"
10. Click camera button to capture photo
11. Verify photo preview appears
12. Click "Submit Challenge"
13. Wait for AI analysis (Groq Vision API)
14. Verify result shows:
    - If similarity >50%: "Challenge Accepted" message with similarity score
    - If similarity ≤50%: "Challenge Rejected" message with similarity score
15. Check email for notification (challenge_accepted or challenge_rejected)

### Expected Results
- ✅ Challenge button appears only within 24-hour window
- ✅ Countdown timer updates every second
- ✅ Location validation works (50m radius check)
- ✅ Camera capture only (no gallery selection)
- ✅ Photo comparison returns similarity score
- ✅ Challenge status determined correctly (>50% = accepted, ≤50% = rejected)
- ✅ Challenge record created in database
- ✅ Issue marked with hasChallenges: true
- ✅ User receives email notification

### Verification Queries
```javascript
// Check challenge was created
db.challenges.findOne({ issueId: ObjectId("ISSUE_ID") })

// Check issue was updated
db.issues.findOne({ _id: ObjectId("ISSUE_ID") }, { hasChallenges: 1, adminDecisionTimestamp: 1 })
```

---

## Test Flow 2: Complete Review Flow (Task 20.2)

### Setup
1. Complete Test Flow 1 with a challenge that has similarity >50% (accepted status)
2. Login as super admin user

### Test Steps
1. Navigate to "Challenge Queue" page (should be in admin navigation)
2. Verify challenge appears in the queue
3. Verify challenge shows:
   - Issue title and description
   - User who submitted challenge
   - Admin who made original decision
   - Challenge type (spam_report or resolved_status)
   - Similarity score
   - Distance from issue
   - Submission date
4. Click "Review" button
5. Verify modal opens with:
   - Side-by-side photo comparison (original vs challenge photo)
   - Challenge details
   - Original issue state information
   - Review notes textarea
   - Two decision buttons: "Admin Was Wrong" and "Admin Was Correct"
6. Enter optional review notes
7. Click "Admin Was Wrong" button
8. Confirm the decision in confirmation dialog
9. Verify success message appears
10. Verify challenge removed from queue
11. Check the original issue - verify it's restored to original state
12. Check email for review notification

### Expected Results
- ✅ Challenge queue shows only accepted challenges
- ✅ Queue sorted by oldest first (createdAt ascending)
- ✅ Photo comparison displays both images side-by-side
- ✅ Review decision updates challenge status to "reviewed"
- ✅ Issue state restored when decision is "admin_wrong"
- ✅ Issue state maintained when decision is "admin_correct"
- ✅ Review metadata recorded (reviewedBy, reviewDecision, reviewNotes, reviewedAt)
- ✅ Database transaction ensures atomicity
- ✅ User receives challenge_reviewed notification

### Verification Queries
```javascript
// Check challenge was reviewed
db.challenges.findOne({ _id: ObjectId("CHALLENGE_ID") }, { 
    status: 1, 
    reviewedBy: 1, 
    reviewDecision: 1, 
    reviewedAt: 1 
})

// Check issue was restored (if admin_wrong)
db.issues.findOne({ _id: ObjectId("ISSUE_ID") }, { 
    status: 1, 
    reportedAsFake: 1, 
    wasRestored: 1, 
    restoredAt: 1 
})
```

---

## Test Flow 3: Challenge Rejection Scenarios (Task 20.3)

### Scenario A: Location Too Far
1. Login as regular user with issue that has admin decision
2. Click "Submit Challenge"
3. Mock location that is >50m from issue location (or physically be >50m away)
4. Verify error message: "You are too far from the issue location"
5. Verify cannot proceed to photo capture step

### Scenario B: Low Similarity Score
1. Login as regular user with issue that has admin decision
2. Be within 50m of issue location
3. Capture photo that is very different from original issue photo
4. Submit challenge
5. Wait for AI analysis
6. Verify challenge rejected with message about low similarity score (≤50%)
7. Verify rejection notification email received

### Scenario C: Expired Challenge Window
1. Create issue with admin decision timestamp >24 hours ago
2. Login as issue reporter
3. Navigate to issue
4. Verify ChallengeButton does NOT appear (window expired)
5. Attempt to submit challenge via API directly
6. Verify error: "The 24-hour challenge window has expired"

### Scenario D: Duplicate Challenge Prevention
1. Submit a challenge successfully
2. Attempt to submit another challenge for the same issue
3. Verify error: "You have already submitted a challenge for this issue"

### Expected Results
- ✅ Location validation rejects users >50m away
- ✅ Low similarity photos (<50%) are automatically rejected
- ✅ Challenge button hidden after 24-hour window expires
- ✅ API rejects expired challenges
- ✅ Duplicate challenges prevented
- ✅ Rejection notifications sent with appropriate reasons
- ✅ User-friendly error messages displayed

---

## Additional Verification

### Challenge History
1. Login as super admin
2. Navigate to "Challenge History" page
3. Verify all challenges displayed with complete lifecycle data
4. Test filters (status, date range, admin)
5. Verify aggregate stats calculated correctly:
   - Total challenges
   - Acceptance rate
   - Overturn rate
   - Average similarity score

### User Challenge View
1. Login as regular user
2. Navigate to profile or challenges section
3. Verify user can see their own challenges
4. Verify challenge status and review decisions displayed

### Authorization
1. Login as regular admin (not super_admin)
2. Attempt to access /admin/challenge-queue
3. Verify access denied or 403 error
4. Attempt to access /admin/challenge-history
5. Verify access denied or 403 error

---

## Integration Test Checklist

- [ ] Challenge submission flow works end-to-end
- [ ] Location validation enforces 50m radius
- [ ] Photo comparison returns similarity scores
- [ ] Challenge status determined correctly (>50% threshold)
- [ ] Challenge appears in super admin queue
- [ ] Super admin can review challenges
- [ ] Issue state restored on "admin_wrong" decision
- [ ] Issue state maintained on "admin_correct" decision
- [ ] Notifications sent at each stage
- [ ] Challenge history displays correctly
- [ ] Admin performance metrics calculated
- [ ] Authorization enforced (super_admin only)
- [ ] Duplicate challenges prevented
- [ ] Expired challenges rejected
- [ ] Location too far rejected
- [ ] Low similarity rejected
- [ ] Database transactions work (rollback on error)
- [ ] Error messages user-friendly

---

## Notes

- All optional property tests (marked with *) were skipped for MVP
- Integration testing requires real user interaction due to:
  - Geolocation API (browser permission required)
  - Camera capture (device camera required)
  - Groq Vision API (external service)
- For automated testing, consider mocking these services
- Database transactions ensure data consistency during review
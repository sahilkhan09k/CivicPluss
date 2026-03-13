# Notification Service

This directory contains service modules for the CivicPulse application.

## notification.service.js

The notification service handles email notifications for challenge-related events in the Issue Challenge and Appeal System.

### Features

- **Three notification types** for challenge lifecycle events:
  - `challenge_accepted`: Sent when a challenge is accepted for super admin review
  - `challenge_rejected`: Sent when a challenge is rejected (low similarity score)
  - `challenge_reviewed`: Sent when a super admin completes their review

- **Dynamic email templates** with challenge-specific data:
  - Issue title
  - Similarity score
  - Decision outcome
  - Review notes
  - Timestamps

- **Error handling**: Notification failures are logged but don't block challenge operations

### Usage

```javascript
import { sendChallengeNotification, formatRejectionReason } from './services/notification.service.js';

// Send acceptance notification
await sendChallengeNotification(userEmail, 'challenge_accepted', {
    issueTitle: 'Broken Street Light',
    similarityScore: 75,
    submittedAt: new Date()
});

// Send rejection notification
await sendChallengeNotification(userEmail, 'challenge_rejected', {
    issueTitle: 'Pothole on Main St',
    rejectionReason: formatRejectionReason('low_similarity'),
    similarityScore: 35
});

// Send review notification
await sendChallengeNotification(userEmail, 'challenge_reviewed', {
    issueTitle: 'Graffiti Issue',
    decision: 'admin_wrong', // or 'admin_correct'
    similarityScore: 82,
    reviewedAt: new Date(),
    reviewNotes: 'Optional review notes'
});
```

### Configuration

The service uses the Resend email API. Ensure the following environment variable is set:

```
RESEND_API_KEY=your_resend_api_key
```

### Testing

Run the manual test script to verify notifications:

```bash
node testChallengeNotifications.js
```

Set the `TEST_EMAIL` environment variable to receive test emails:

```bash
TEST_EMAIL=your-email@example.com node testChallengeNotifications.js
```

### Integration Points

The notification service is integrated into:

1. **Challenge Submission** (`challenge.controller.js` - `submitChallenge`)
   - Triggers `challenge_accepted` or `challenge_rejected` based on similarity score

2. **Challenge Review** (`challenge.controller.js` - `reviewChallenge`)
   - Triggers `challenge_reviewed` with super admin's decision

### Requirements Validated

- **Requirement 9.1**: Notify user when challenge is accepted
- **Requirement 9.2**: Notify user when challenge is rejected
- **Requirement 9.3**: Notify user when super admin reviews challenge
- **Requirement 9.4**: Notify user when admin decision is overturned

### Error Handling

Notification errors are caught and logged but don't fail the challenge operation:

```javascript
try {
    await sendChallengeNotification(...);
} catch (notificationError) {
    console.error('⚠️ Failed to send notification:', notificationError);
    // Challenge operation continues
}
```

This ensures that email delivery issues don't prevent users from submitting challenges or super admins from reviewing them.

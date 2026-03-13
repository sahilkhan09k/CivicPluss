import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null // System notifications won't have a sender
    },
    type: {
        type: String,
        enum: [
            'challenge_submitted',
            'challenge_reviewed',
            'challenge_decision',
            'issue_status_changed',
            'issue_reported_spam',
            'trust_score_changed',
            'trust_score_warning',
            'new_high_priority_issue',
            'system_announcement',
            'maintenance_alert'
        ],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    data: {
        // Additional data specific to notification type
        issueId: { type: Schema.Types.ObjectId, ref: 'Issue' },
        challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge' },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        actionUrl: String, // URL to navigate when notification is clicked
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        }
    },
    read: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date,
        default: null
    },
    // For system-wide notifications
    isSystemWide: {
        type: Boolean,
        default: false
    },
    // For role-based notifications (admin, super_admin, user)
    targetRoles: [{
        type: String,
        enum: ['user', 'admin', 'super_admin']
    }],
    // For city-specific notifications
    targetCity: {
        type: String,
        default: null
    },
    // Expiry for temporary notifications
    expiresAt: {
        type: Date,
        default: null
    }
}, { 
    timestamps: true,
    // Auto-delete expired notifications
    expireAfterSeconds: 0
});

// Indexes for performance
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ isSystemWide: 1, targetRoles: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diff = now - this.createdAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return this.createdAt.toLocaleDateString();
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
    this.read = true;
    this.readAt = new Date();
    return this.save();
};

export const Notification = mongoose.model('Notification', notificationSchema);
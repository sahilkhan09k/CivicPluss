import mongoose, { Schema } from 'mongoose';

const challengeSchema = new Schema({
    // Core References
    issueId: {
        type: Schema.Types.ObjectId,
        ref: 'Issue',
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Challenge Details
    challengeType: {
        type: String,
        enum: ['spam_report', 'resolved_status'],
        required: true
    },
    challengePhotoUrl: {
        type: String,
        required: true
    },
    userLocation: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    distanceFromIssue: {
        type: Number, // meters
        required: true
    },
    
    // AI Analysis
    similarityScore: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    aiConfidence: {
        type: Number,
        min: 0,
        max: 1
    },
    aiAnalysis: {
        type: String
    },
    
    // Status and Workflow
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'reviewed'],
        default: 'pending',
        index: true
    },
    rejectionReason: {
        type: String,
        enum: ['location_too_far', 'low_similarity', 'invalid_photo']
    },
    
    // Review Details
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewDecision: {
        type: String,
        enum: ['admin_wrong', 'admin_correct']
    },
    reviewNotes: {
        type: String
    },
    reviewedAt: {
        type: Date
    },
    
    // Original Issue State (for restoration)
    originalIssueState: {
        status: String,
        reportedAsFake: Boolean,
        resolvedBy: Schema.Types.ObjectId,
        resolvedAt: Date
    },
    
    // User's challenge description
    description: {
        type: String,
        maxlength: 500
    }
}, { 
    timestamps: true 
});

// Compound indexes for query optimization
challengeSchema.index({ status: 1, createdAt: 1 });
challengeSchema.index({ adminId: 1, status: 1 });
challengeSchema.index({ userId: 1, createdAt: -1 });

export const Challenge = mongoose.model('Challenge', challengeSchema);

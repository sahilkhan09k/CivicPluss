import mongoose, { Schema } from 'mongoose';

const issueSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Waste', 'Road', 'Water', 'Electricity', 'Other'],
        default: 'Other'
    },
    city: {
        type: String,
        required: false, // For backward compatibility, will be changed to true after migration
        trim: true,
        index: true
    },
    priorityScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending'
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    scoreBreakdown: {
        severity: Number,
        frequency: Number,
        locationImpact: Number,
        timePending: Number,
        aiAdjustment: Number
    },
    // AI-analyzed dimensions based on issue type
    dimensions: {
        // For potholes
        width: { type: Number }, // in cm
        depth: { type: Number }, // in cm
        area: { type: Number }, // in sq cm or sq meters
        
        // For garbage/waste
        volume: { type: Number }, // in cubic meters
        
        // For water leaks
        flowRate: { type: String }, // descriptive (e.g., "heavy", "moderate", "light")
        affectedArea: { type: Number }, // in sq meters
        
        // For road damage
        length: { type: Number }, // in meters
        
        // General fields
        estimatedSize: { type: String }, // descriptive size
        height: { type: Number }, // in meters (for streetlights, etc.)
        affectedRadius: { type: Number } // in meters
    },
    reportedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedAsFake: {
        type: Boolean,
        default: false
    },
    reportedAsFakeBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reportedAsFakeAt: {
        type: Date,
        default: null
    },
    resolutionImageUrl: {
        type: String,
        default: null
    },
    resolvedScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    resolutionConfirmed: {
        type: Boolean,
        default: false
    },
    // Challenge-related fields
    adminDecisionTimestamp: {
        type: Date,
        default: null
    },
    hasChallenges: {
        type: Boolean,
        default: false
    },
    wasRestored: {
        type: Boolean,
        default: false
    },
    restoredAt: {
        type: Date,
        default: null
    },
    challengeResolved: {
        type: Boolean,
        default: false
    },
    challengeResolvedAt: {
        type: Date,
        default: null
    },
    challengeDecision: {
        type: String,
        enum: ['admin_wrong', 'admin_correct'],
        default: null
    },
    adminDecisionOverturned: {
        type: Boolean,
        default: false
    },
    adminDecisionOverturnedAt: {
        type: Date,
        default: null
    },
    // Trust score penalty scheduling for spam reports
    trustScorePenaltyScheduledFor: {
        type: Date,
        default: null
    },
    trustScorePenaltyApplied: {
        type: Boolean,
        default: false
    },
    // Community upvotes
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    upvoteCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Create indexes for query performance
issueSchema.index({ city: 1, status: 1 });
issueSchema.index({ city: 1, priorityScore: -1 });
issueSchema.index({ city: 1, upvoteCount: -1 });
issueSchema.index({ adminDecisionTimestamp: 1 }); // For challenge window validation

export const Issue = mongoose.model('Issue', issueSchema);

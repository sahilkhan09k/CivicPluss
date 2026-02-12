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
    }
}, { timestamps: true });

// Create indexes for query performance
issueSchema.index({ city: 1, status: 1 });
issueSchema.index({ city: 1, priorityScore: -1 });

export const Issue = mongoose.model('Issue', issueSchema);

import mongoose, { Schema } from 'mongoose';

const bannedEmailSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        default: 'Multiple fake reports (Trust score reached 0)'
    },
    bannedAt: {
        type: Date,
        default: Date.now
    },
    bannedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export const BannedEmail = mongoose.model('BannedEmail', bannedEmailSchema);

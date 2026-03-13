import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Challenge } from "../models/challenge.model.js";
import { Issue } from "../models/issue.model.js";
import { User } from "../models/user.model.js";
import { validateChallengeLocation } from "../utils/locationValidator.js";
import { comparePhotos } from "../utils/photoComparator.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendChallengeNotification, formatRejectionReason } from "../services/notification.service.js";
import mongoose from "mongoose";

/**
 * Submit a new challenge against an admin decision
 * 
 * Requirements: 1.2, 1.3, 1.4, 2.1, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5
 */
export const submitChallenge = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { issueId, description } = req.body;
    
    console.log('🔍 Challenge submission request body:', req.body);
    console.log('📁 Challenge submission file:', req.file);
    
    // Parse currentLocation from JSON string (FormData sends it as string)
    let currentLocation;
    try {
        if (!req.body.currentLocation) {
            throw new apiError(400, "Current location is required");
        }
        
        currentLocation = JSON.parse(req.body.currentLocation);
        console.log('📍 Parsed location:', currentLocation);
        
        // Validate location structure
        if (!currentLocation || typeof currentLocation.lat !== 'number' || typeof currentLocation.lng !== 'number') {
            throw new apiError(400, "Invalid location format. Location must contain valid lat and lng coordinates.");
        }
    } catch (error) {
        console.error('❌ Location parsing error:', error);
        if (error instanceof apiError) {
            throw error;
        }
        throw new apiError(400, "Invalid location data format");
    }

    // Validate required fields
    if (!issueId) {
        throw new apiError(400, "Issue ID is required");
    }

    if (!req.file?.path) {
        throw new apiError(400, "Challenge photo is required");
    }

    // Validate image format (JPEG, PNG, WebP)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        throw new apiError(400, "Invalid image format. Please upload a JPEG, PNG, or WebP image.");
    }

    // Fetch the issue
    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new apiError(404, "Issue not found");
    }

    // Verify the user owns this issue
    if (issue.reportedBy.toString() !== userId.toString()) {
        throw new apiError(403, "You can only challenge decisions on your own issues");
    }

    // Verify the issue has an admin decision
    if (!issue.adminDecisionTimestamp) {
        throw new apiError(400, "This issue has no admin decision to challenge");
    }

    // Validate challenge window (24 hours = 86400 seconds)
    const currentTime = Date.now();
    const decisionTime = new Date(issue.adminDecisionTimestamp).getTime();
    const timeDifference = currentTime - decisionTime;
    const CHALLENGE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (timeDifference > CHALLENGE_WINDOW_MS) {
        throw new apiError(400, "The 24-hour challenge window has expired for this issue");
    }

    // Check if user has already submitted a challenge for this issue
    const existingChallenge = await Challenge.findOne({
        issueId,
        userId
    });

    if (existingChallenge) {
        throw new apiError(409, "You have already submitted a challenge for this issue");
    }

    // Validate user location (must be within 50 meters)
    const locationValidation = validateChallengeLocation(
        { lat: issue.location.lat, lng: issue.location.lng },
        { lat: currentLocation.lat, lng: currentLocation.lng },
        50
    );

    if (!locationValidation.valid) {
        throw new apiError(400, locationValidation.message);
    }

    // Upload challenge photo to Cloudinary
    console.log("📤 Uploading challenge photo...");
    const uploadedPhoto = await uploadOnCloudinary(req.file.path);
    if (!uploadedPhoto) {
        throw new apiError(500, "Failed to upload challenge photo. Please try again.");
    }

    console.log("✅ Challenge photo uploaded:", uploadedPhoto.secure_url);

    // Compare photos using Groq Vision API
    console.log("🔍 Comparing photos...");
    const comparisonResult = await comparePhotos(
        issue.imageUrl,
        uploadedPhoto.secure_url
    );

    console.log("📊 Comparison result:", {
        similarityScore: comparisonResult.similarityScore,
        confidence: comparisonResult.confidence
    });

    // Determine challenge status based on similarity score
    // >50 = accepted, ≤50 = rejected
    const status = comparisonResult.similarityScore > 50 ? 'accepted' : 'rejected';
    const rejectionReason = status === 'rejected' ? 'low_similarity' : undefined;

    // Determine challenge type based on issue state
    let challengeType;
    if (issue.reportedAsFake) {
        challengeType = 'spam_report';
    } else if (issue.status === 'Resolved') {
        challengeType = 'resolved_status';
    } else {
        throw new apiError(400, "Issue does not have a challengeable admin decision");
    }

    // Determine which admin made the decision
    let adminId;
    if (issue.reportedAsFake && issue.reportedAsFakeBy) {
        adminId = issue.reportedAsFakeBy;
    } else if (issue.status === 'Resolved' && issue.resolvedBy) {
        adminId = issue.resolvedBy;
    } else {
        throw new apiError(400, "Cannot determine admin who made the decision");
    }

    // Store original issue state for potential restoration
    const originalIssueState = {
        status: issue.status,
        reportedAsFake: issue.reportedAsFake,
        resolvedBy: issue.resolvedBy,
        resolvedAt: issue.resolvedAt
    };

    // Create challenge record
    const challenge = await Challenge.create({
        issueId,
        userId,
        adminId,
        challengeType,
        challengePhotoUrl: uploadedPhoto.secure_url,
        userLocation: {
            lat: currentLocation.lat,
            lng: currentLocation.lng
        },
        distanceFromIssue: locationValidation.distance,
        similarityScore: comparisonResult.similarityScore,
        aiConfidence: comparisonResult.confidence,
        aiAnalysis: comparisonResult.analysis,
        status,
        rejectionReason,
        originalIssueState,
        description: description || '' // Add user description
    });

    // Update issue to mark it has challenges
    await Issue.findByIdAndUpdate(issueId, {
        hasChallenges: true
    });

    // Send notification to admin about new challenge (only if accepted)
    if (status === 'accepted') {
        try {
            const admin = await User.findById(adminId);
            const { notificationService } = await import('../services/notificationService.js');
            await notificationService.notifyChallengeSubmitted({
                challenge: {
                    _id: challenge._id,
                    userId,
                    issueId: { _id: issueId, title: issue.title }
                },
                admin
            });
        } catch (notificationError) {
            console.error('Error sending challenge notification to admin:', notificationError);
        }
    }

    // Trigger user notification based on status
    try {
        const user = await User.findById(userId).select('email');
        
        if (status === 'accepted') {
            // Notify user that challenge is under review
            await sendChallengeNotification(user.email, 'challenge_accepted', {
                issueTitle: issue.title || 'Your Issue',
                similarityScore: comparisonResult.similarityScore,
                submittedAt: challenge.createdAt
            });
            console.log(`✅ Sent challenge_accepted notification to ${user.email}`);
        } else {
            // Notify user with rejection reason and similarity score
            await sendChallengeNotification(user.email, 'challenge_rejected', {
                issueTitle: issue.title || 'Your Issue',
                rejectionReason: formatRejectionReason(rejectionReason),
                similarityScore: comparisonResult.similarityScore
            });
            console.log(`✅ Sent challenge_rejected notification to ${user.email}`);
        }
    } catch (notificationError) {
        // Log notification error but don't fail the challenge submission
        console.error('⚠️ Failed to send challenge notification:', notificationError);
    }

    // Prepare response message
    let message;
    if (status === 'accepted') {
        message = "Challenge accepted and submitted for super admin review";
    } else {
        message = `Challenge rejected: Similarity score (${comparisonResult.similarityScore}%) is below the required threshold of 50%`;
    }

    return res.status(201).json(
        new apiResponse(
            201,
            {
                challenge: {
                    _id: challenge._id,
                    status: challenge.status,
                    similarityScore: challenge.similarityScore,
                    distanceFromIssue: challenge.distanceFromIssue,
                    createdAt: challenge.createdAt
                }
            },
            message
        )
    );
});

/**
 * Get challenge queue for super admin review
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export const getChallengeQueue = asyncHandler(async (req, res) => {
    // Verify super_admin role
    if (req.user.role !== 'super_admin') {
        throw new apiError(403, "Only super admins can review challenges");
    }

    // Extract query parameters for filtering and pagination
    const { adminId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    // Build query filter
    const filter = { status: 'accepted' };

    if (adminId) {
        filter.adminId = adminId;
    }

    if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) {
            filter.createdAt.$gte = new Date(dateFrom);
        }
        if (dateTo) {
            filter.createdAt.$lte = new Date(dateTo);
        }
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const total = await Challenge.countDocuments(filter);

    // Query challenges with populated data, pagination, and optimization
    const challenges = await Challenge.find(filter)
        .select('issueId userId adminId challengeType challengePhotoUrl userLocation distanceFromIssue similarityScore aiConfidence aiAnalysis status createdAt')
        .populate('issueId', 'title description imageUrl location status reportedAsFake')
        .populate('userId', 'name email')
        .populate('adminId', 'name email role')
        .sort({ createdAt: 1 }) // Sort by oldest first (ascending)
        .skip(skip)
        .limit(limitNum)
        .lean(); // Use lean() for read-only queries to improve performance

    return res.status(200).json(
        new apiResponse(
            200,
            {
                challenges,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            },
            "Challenge queue retrieved successfully"
        )
    );
});

/**
 * Apply consequences based on challenge decision
 * 
 * @param {Object} challenge - The challenge object
 * @param {String} decision - 'admin_wrong' or 'admin_correct'
 * @param {Object} session - Database session for transaction
 */
const applyChallengeDecisionConsequences = async (challenge, decision, session) => {
    console.log(`🎯 Applying consequences for decision: ${decision}`);
    
    if (decision === 'admin_correct') {
        // User was wrong to challenge - apply penalties
        console.log('❌ User challenge was invalid - applying penalties');
        
        // Decrease user's trust score by 50 points (minimum 0)
        const user = await User.findById(challenge.userId).session(session);
        if (user) {
            const oldTrustScore = user.trustScore || 100;
            const newTrustScore = Math.max(0, oldTrustScore - 50);
            await User.findByIdAndUpdate(
                challenge.userId,
                { 
                    trustScore: newTrustScore,
                    lastTrustScoreUpdate: new Date(),
                    lastTrustScoreReason: 'Invalid challenge - admin decision was correct'
                },
                { session }
            );
            console.log(`📉 User trust score updated: ${oldTrustScore} → ${newTrustScore}`);
            
            // Send trust score change notification (after transaction)
            setTimeout(async () => {
                try {
                    const { notificationService } = await import('../services/notificationService.js');
                    await notificationService.notifyTrustScoreChanged({
                        user: { _id: challenge.userId, ...user.toObject(), trustScore: newTrustScore },
                        oldScore: oldTrustScore,
                        newScore: newTrustScore,
                        reason: 'Invalid challenge - admin decision was correct'
                    });
                    
                    // Send warning if trust score is getting low
                    if (newTrustScore <= 50) {
                        await notificationService.notifyTrustScoreWarning({
                            user: { _id: challenge.userId, ...user.toObject(), trustScore: newTrustScore }
                        });
                    }
                } catch (notificationError) {
                    console.error('Error sending trust score notifications:', notificationError);
                }
            }, 1000);
        }

        // Update issue to mark challenge as resolved (but keep original admin decision)
        await Issue.findByIdAndUpdate(
            challenge.issueId,
            {
                challengeResolved: true,
                challengeResolvedAt: new Date(),
                challengeDecision: 'admin_correct'
            },
            { session }
        );
        console.log(`📝 Issue ${challenge.issueId} updated with challengeResolved: true, challengeDecision: admin_correct`);
        
    } else if (decision === 'admin_wrong') {
        // User was right to challenge - apply rewards
        console.log('✅ User challenge was valid - applying rewards');
        
        // Increase user's trust score by 5 points (maximum 100)
        const user = await User.findById(challenge.userId).session(session);
        if (user) {
            const oldTrustScore = user.trustScore || 100;
            const newTrustScore = Math.min(100, oldTrustScore + 5);
            await User.findByIdAndUpdate(
                challenge.userId,
                { 
                    trustScore: newTrustScore,
                    lastTrustScoreUpdate: new Date(),
                    lastTrustScoreReason: 'Valid challenge - admin decision was overturned'
                },
                { session }
            );
            console.log(`📈 User trust score updated: ${oldTrustScore} → ${newTrustScore}`);
            
            // Send trust score change notification (after transaction)
            setTimeout(async () => {
                try {
                    const { notificationService } = await import('../services/notificationService.js');
                    await notificationService.notifyTrustScoreChanged({
                        user: { _id: challenge.userId, ...user.toObject(), trustScore: newTrustScore },
                        oldScore: oldTrustScore,
                        newScore: newTrustScore,
                        reason: 'Valid challenge - admin decision was overturned'
                    });
                } catch (notificationError) {
                    console.error('Error sending trust score notifications:', notificationError);
                }
            }, 1000);
        }

        // Decrease admin's performance score (if tracking admin performance)
        const admin = await User.findById(challenge.adminId).session(session);
        if (admin) {
            // Track admin performance - increment overturned decisions count
            await User.findByIdAndUpdate(
                challenge.adminId,
                {
                    $inc: { 
                        'adminStats.overturnedDecisions': 1,
                        'adminStats.totalChallenges': 1
                    },
                    'adminStats.lastOverturnedAt': new Date()
                },
                { session, upsert: true }
            );
            console.log(`📊 Admin performance updated - decision overturned`);
        }

        // Restore issue to original state and mark challenge as resolved
        const { status, reportedAsFake, resolvedBy, resolvedAt } = challenge.originalIssueState;
        await Issue.findByIdAndUpdate(
            challenge.issueId,
            {
                status,
                reportedAsFake,
                resolvedBy,
                resolvedAt,
                wasRestored: true,
                restoredAt: new Date(),
                challengeResolved: true,
                challengeResolvedAt: new Date(),
                challengeDecision: 'admin_wrong',
                adminDecisionOverturned: true,
                adminDecisionOverturnedAt: new Date(),
                // Cancel any scheduled trust score penalty since user was right
                trustScorePenaltyScheduledFor: null,
                trustScorePenaltyApplied: true // Mark as applied to prevent future processing
            },
            { session }
        );
        console.log(`📝 Issue ${challenge.issueId} restored and updated with challengeResolved: true, challengeDecision: admin_wrong`);
    }
};

/**
 * Review a challenge (super admin only)
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 9.3, 9.4
 */
export const reviewChallenge = asyncHandler(async (req, res) => {
    // Verify super_admin role
    if (req.user.role !== 'super_admin') {
        throw new apiError(403, "Only super admins can review challenges");
    }

    const { challengeId } = req.params;
    const { decision, notes } = req.body;

    // Validate required fields
    if (!decision) {
        throw new apiError(400, "Review decision is required");
    }

    // Validate decision value
    if (decision !== 'admin_wrong' && decision !== 'admin_correct') {
        throw new apiError(400, "Decision must be either 'admin_wrong' or 'admin_correct'");
    }

    // Fetch the challenge
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
        throw new apiError(404, "Challenge not found");
    }

    // Verify challenge is in accepted status
    if (challenge.status !== 'accepted') {
        throw new apiError(400, `Cannot review challenge with status '${challenge.status}'. Only accepted challenges can be reviewed.`);
    }

    // Fetch the issue
    const issue = await Issue.findById(challenge.issueId);
    if (!issue) {
        throw new apiError(404, "Associated issue not found");
    }

    // Start a database transaction for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let updatedIssue;

        // Apply consequences based on the decision (this will handle all issue updates)
        await applyChallengeDecisionConsequences(challenge, decision, session);

        // Get the updated issue after consequences are applied
        updatedIssue = await Issue.findById(challenge.issueId).session(session);

        if (decision === 'admin_wrong') {
            console.log("✅ Issue restored to original state:", {
                issueId: issue._id,
                restoredStatus: updatedIssue.status,
                restoredReportedAsFake: updatedIssue.reportedAsFake
            });
        } else {
            console.log("✅ Issue state maintained (admin was correct):", {
                issueId: issue._id,
                currentStatus: updatedIssue.status,
                currentReportedAsFake: updatedIssue.reportedAsFake
            });
        }

        // Update challenge with review details
        const reviewedChallenge = await Challenge.findByIdAndUpdate(
            challengeId,
            {
                status: 'reviewed',
                reviewedBy: req.user._id,
                reviewDecision: decision,
                reviewNotes: notes || '',
                reviewedAt: new Date()
            },
            { new: true, session }
        ).populate('issueId', 'title description status reportedAsFake')
         .populate('userId', 'name email')
         .populate('adminId', 'name email role')
         .populate('reviewedBy', 'name email role');

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Send notification to user about challenge review
        try {
            const { notificationService } = await import('../services/notificationService.js');
            await notificationService.notifyChallengeReviewed({
                challenge,
                decision,
                reviewNotes: notes || '',
                reviewer: req.user
            });
        } catch (notificationError) {
            console.error('Error sending challenge review notification:', notificationError);
        }

        // Trigger user notification with final decision
        try {
            const user = await User.findById(challenge.userId).select('email');
            
            await sendChallengeNotification(user.email, 'challenge_reviewed', {
                issueTitle: issue.title || 'Your Issue',
                decision: decision,
                similarityScore: challenge.similarityScore,
                reviewedAt: reviewedChallenge.reviewedAt,
                reviewNotes: notes || ''
            });
            console.log(`✅ Sent challenge_reviewed notification to ${user.email} (decision: ${decision})`);
        } catch (notificationError) {
            // Log notification error but don't fail the review
            console.error('⚠️ Failed to send review notification:', notificationError);
        }

        // Prepare response message
        const message = decision === 'admin_wrong'
            ? "Challenge reviewed: Admin decision overturned, issue restored to original state"
            : "Challenge reviewed: Admin decision upheld";

        return res.status(200).json(
            new apiResponse(
                200,
                {
                    challenge: reviewedChallenge,
                    updatedIssue: {
                        _id: updatedIssue._id,
                        status: updatedIssue.status,
                        reportedAsFake: updatedIssue.reportedAsFake,
                        wasRestored: updatedIssue.wasRestored,
                        restoredAt: updatedIssue.restoredAt
                    }
                },
                message
            )
        );
    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();
        
        console.error("❌ Transaction failed, rolled back:", error);
        throw new apiError(500, "Failed to review challenge. Transaction rolled back.");
    }
});

/**
 * Get challenge history with filtering and aggregate stats
 * 
 * Requirements: 8.1, 8.2
 */
export const getChallengeHistory = asyncHandler(async (req, res) => {
    // Verify super_admin role (only super admins can view full history)
    if (req.user.role !== 'super_admin') {
        throw new apiError(403, "Only super admins can view challenge history");
    }

    // Extract query parameters for filtering and pagination
    const { userId, issueId, status, adminId, dateFrom, dateTo, reviewedBy, page = 1, limit = 20 } = req.query;

    // Build query filter
    const filter = {};

    if (userId) {
        filter.userId = userId;
    }

    if (issueId) {
        filter.issueId = issueId;
    }

    if (status) {
        filter.status = status;
    }

    if (adminId) {
        filter.adminId = adminId;
    }

    if (reviewedBy) {
        if (reviewedBy === 'all') {
            // Show all challenges regardless of reviewer
            // Don't add reviewedBy filter
        } else if (reviewedBy === 'me') {
            // Show only challenges reviewed by current super admin
            filter.reviewedBy = req.user._id;
            filter.status = 'reviewed'; // Only reviewed challenges have reviewedBy
        } else {
            filter.reviewedBy = reviewedBy;
            filter.status = 'reviewed'; // Only reviewed challenges have reviewedBy
        }
    } else {
        // Default: show all reviewed challenges (not just current super admin's)
        filter.status = 'reviewed';
    }

    if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) {
            filter.createdAt.$gte = new Date(dateFrom);
        }
        if (dateTo) {
            filter.createdAt.$lte = new Date(dateTo);
        }
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const total = await Challenge.countDocuments(filter);

    // Query challenges with complete lifecycle data, pagination, and optimization
    const challenges = await Challenge.find(filter)
        .select('issueId userId adminId challengeType challengePhotoUrl userLocation distanceFromIssue similarityScore aiConfidence aiAnalysis status rejectionReason reviewedBy reviewDecision reviewNotes reviewedAt originalIssueState createdAt updatedAt')
        .populate('issueId', 'title description imageUrl location status reportedAsFake')
        .populate('userId', 'name email')
        .populate('adminId', 'name email role')
        .populate('reviewedBy', 'name email role')
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limitNum)
        .lean(); // Use lean() for read-only queries to improve performance

    // Calculate aggregate stats (on all matching records, not just current page)
    const allChallenges = await Challenge.find(filter)
        .select('status reviewDecision similarityScore')
        .lean();

    const totalChallenges = allChallenges.length;
    const acceptedChallenges = allChallenges.filter(c => c.status === 'accepted' || c.status === 'reviewed').length;
    const rejectedChallenges = allChallenges.filter(c => c.status === 'rejected').length;
    const reviewedChallenges = allChallenges.filter(c => c.status === 'reviewed').length;
    
    // Calculate acceptance rate (accepted / total)
    const acceptanceRate = totalChallenges > 0 
        ? ((acceptedChallenges / totalChallenges) * 100).toFixed(2)
        : 0;

    // Calculate overturn rate (admin_wrong decisions / reviewed challenges)
    const adminWrongCount = allChallenges.filter(c => c.reviewDecision === 'admin_wrong').length;
    const overturnRate = reviewedChallenges > 0
        ? ((adminWrongCount / reviewedChallenges) * 100).toFixed(2)
        : 0;

    // Calculate average similarity score
    const avgSimilarityScore = totalChallenges > 0
        ? (allChallenges.reduce((sum, c) => sum + c.similarityScore, 0) / totalChallenges).toFixed(2)
        : 0;

    const stats = {
        totalChallenges,
        acceptedChallenges,
        rejectedChallenges,
        reviewedChallenges,
        acceptanceRate: parseFloat(acceptanceRate),
        overturnRate: parseFloat(overturnRate),
        avgSimilarityScore: parseFloat(avgSimilarityScore),
        adminWrongCount
    };

    return res.status(200).json(
        new apiResponse(
            200,
            {
                challenges,
                stats,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            },
            "Challenge history retrieved successfully"
        )
    );
});

/**
 * Get all challenges for authenticated user
 * 
 * Requirements: 8.1
 */
export const getUserChallenges = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Extract pagination parameters
    const { page = 1, limit = 20 } = req.query;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const total = await Challenge.countDocuments({ userId });

    // Query all challenges for the authenticated user with pagination and optimization
    const challenges = await Challenge.find({ userId })
        .select('issueId adminId challengeType challengePhotoUrl distanceFromIssue similarityScore status rejectionReason reviewedBy reviewDecision reviewNotes reviewedAt createdAt updatedAt')
        .populate('issueId', 'title description imageUrl location status reportedAsFake')
        .populate('adminId', 'name email role')
        .populate('reviewedBy', 'name email role')
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(limitNum)
        .lean(); // Use lean() for read-only queries to improve performance

    return res.status(200).json(
        new apiResponse(
            200,
            {
                challenges,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum)
                }
            },
            "User challenges retrieved successfully"
        )
    );
});

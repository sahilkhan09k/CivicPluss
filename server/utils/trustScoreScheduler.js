import { Issue } from '../models/issue.model.js';
import { User } from '../models/user.model.js';
import { BannedEmail } from '../models/bannedEmail.model.js';

/**
 * Apply scheduled trust score penalties for spam reports
 * This function should be called periodically (e.g., every hour) to check for
 * issues that have passed their 24-hour challenge window
 */
export const applyScheduledTrustScorePenalties = async () => {
    try {
        console.log('🕐 Checking for scheduled trust score penalties...');
        
        // Find issues where:
        // 1. Trust score penalty is scheduled
        // 2. The scheduled time has passed
        // 3. Penalty hasn't been applied yet
        // 4. Issue hasn't been challenged (challengeResolved is false or null)
        const now = new Date();
        const issuesForPenalty = await Issue.find({
            trustScorePenaltyScheduledFor: { $lte: now },
            trustScorePenaltyApplied: false,
            reportedAsFake: true,
            $or: [
                { challengeResolved: false },
                { challengeResolved: { $exists: false } },
                { challengeResolved: null }
            ]
        }).populate('reportedBy reportedAsFakeBy');

        console.log(`📋 Found ${issuesForPenalty.length} issues ready for trust score penalty`);

        for (const issue of issuesForPenalty) {
            try {
                const reportingUser = issue.reportedBy;
                
                if (!reportingUser) {
                    console.log(`⚠️ Skipping issue ${issue._id} - reporting user not found`);
                    continue;
                }

                console.log(`📉 Applying trust score penalty to user ${reportingUser.name} (${reportingUser.email})`);
                
                // Apply the -25 trust score penalty
                const oldTrustScore = reportingUser.trustScore || 100;
                const newTrustScore = Math.max(0, oldTrustScore - 25);
                
                reportingUser.trustScore = newTrustScore;
                reportingUser.lastTrustScoreUpdate = new Date();
                reportingUser.lastTrustScoreReason = 'Spam report penalty (24-hour challenge window expired)';
                
                // Send trust score change notification
                try {
                    const { notificationService } = await import('../services/notificationService.js');
                    await notificationService.notifyTrustScoreChanged({
                        user: reportingUser,
                        oldScore: oldTrustScore,
                        newScore: newTrustScore,
                        reason: 'Spam report penalty (24-hour challenge window expired)'
                    });
                    
                    // Send warning if trust score is getting low
                    if (newTrustScore <= 50) {
                        await notificationService.notifyTrustScoreWarning({
                            user: { ...reportingUser.toObject(), trustScore: newTrustScore }
                        });
                    }
                } catch (notificationError) {
                    console.error('Error sending trust score notifications:', notificationError);
                }
                
                // Check if user should be banned (trust score reaches 0)
                if (newTrustScore === 0) {
                    console.log(`🚫 User ${reportingUser.name} trust score reached 0 - banning user`);
                    
                    try {
                        await BannedEmail.create({
                            email: reportingUser.email,
                            userId: reportingUser._id,
                            userName: reportingUser.name,
                            reason: 'Multiple fake reports (Trust score reached 0)',
                            bannedBy: issue.reportedAsFakeBy,
                            bannedAt: new Date()
                        });
                        console.log(`📧 Email ${reportingUser.email} added to banned list`);
                    } catch (err) {
                        console.error('Error adding to banned list:', err);
                    }

                    // Delete the user
                    await User.findByIdAndDelete(reportingUser._id);
                    console.log(`🗑️ User ${reportingUser.name} deleted from system`);
                } else {
                    // Save the updated trust score
                    await reportingUser.save();
                }

                // Mark penalty as applied
                issue.trustScorePenaltyApplied = true;
                await issue.save();
                
                console.log(`✅ Trust score penalty applied: ${oldTrustScore} → ${newTrustScore} for issue ${issue._id}`);
                
            } catch (error) {
                console.error(`❌ Error applying penalty for issue ${issue._id}:`, error);
            }
        }

        console.log('🏁 Trust score penalty check completed');
        return issuesForPenalty.length;
        
    } catch (error) {
        console.error('❌ Error in applyScheduledTrustScorePenalties:', error);
        throw error;
    }
};

/**
 * Start the trust score penalty scheduler
 * This will check every hour for penalties that need to be applied
 */
export const startTrustScoreScheduler = () => {
    console.log('🚀 Starting trust score penalty scheduler...');
    
    // Run immediately on startup
    applyScheduledTrustScorePenalties().catch(console.error);
    
    // Then run every hour
    const intervalId = setInterval(() => {
        applyScheduledTrustScorePenalties().catch(console.error);
    }, 60 * 60 * 1000); // 1 hour in milliseconds
    
    console.log('⏰ Trust score penalty scheduler started (runs every hour)');
    
    return intervalId;
};
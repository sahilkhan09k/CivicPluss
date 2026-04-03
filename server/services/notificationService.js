import { Notification } from '../models/notification.model.js';
import { socketServer } from '../socket/socketServer.js';

class NotificationService {
    
    // Create and send notification
    async createAndSend(notificationData) {
        try {
            const notification = new Notification(notificationData);
            await notification.save();
            
            // Populate sender and recipient for real-time emission
            await notification.populate('sender', 'name email');
            await notification.populate('recipient', 'name email role city');
            
            // Send real-time notification
            await socketServer.sendToUser(notification.recipient._id, {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
                sender: notification.sender,
                createdAt: notification.createdAt,
                timeAgo: notification.timeAgo
            });
            
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Challenge submitted notification
    async notifyChallengeSubmitted(challengeData) {
        const { challenge, admin } = challengeData;
        
        return await this.createAndSend({
            recipient: admin._id,
            sender: challenge.userId,
            type: 'challenge_submitted',
            title: 'New Challenge Submitted',
            message: `A user has challenged your decision on issue "${challenge.issueId.title}"`,
            data: {
                challengeId: challenge._id,
                issueId: challenge.issueId._id,
                actionUrl: `/admin/challenge-queue`,
                priority: 'high'
            }
        });
    }

    // Challenge reviewed notification
    async notifyChallengeReviewed(challengeData) {
        const { challenge, decision, reviewNotes, reviewer } = challengeData;
        
        const isUserWin = decision === 'admin_wrong';
        const title = isUserWin ? 'Challenge Accepted!' : 'Challenge Rejected';
        const message = isUserWin 
            ? `Your challenge was accepted. The admin decision has been overturned.`
            : `Your challenge was rejected. The admin decision was correct.`;
        
        return await this.createAndSend({
            recipient: challenge.userId,
            sender: reviewer._id,
            type: 'challenge_reviewed',
            title,
            message: reviewNotes ? `${message} Note: ${reviewNotes}` : message,
            data: {
                challengeId: challenge._id,
                issueId: challenge.issueId,
                decision,
                actionUrl: `/user/issue/${challenge.issueId}`,
                priority: 'high'
            }
        });
    }

    // Issue status changed notification
    async notifyIssueStatusChanged(issueData) {
        const { issue, oldStatus, newStatus, updatedBy } = issueData;
        
        let title, message, priority = 'medium';
        
        if (newStatus === 'Resolved') {
            title = '✅ Issue Resolved Successfully';
            message = `Great news! Your issue "${issue.title}" has been resolved by our team. ` +
                     `If you believe the issue is not properly resolved, you can file a challenge within 24 hours. ` +
                     `View the resolution photo and details in your dashboard.`;
            priority = 'high';
        } else if (newStatus === 'In Progress') {
            title = '🔧 Issue In Progress';
            message = `Your issue "${issue.title}" is now being worked on by our team. We'll notify you once it's resolved.`;
            priority = 'medium';
        } else if (newStatus === 'Pending') {
            title = '⏳ Issue Status Updated';
            message = `Your issue "${issue.title}" is back to pending status. Our team will review it soon.`;
            priority = 'medium';
        } else {
            // Fallback for any other status
            title = 'Issue Status Updated';
            message = `Your issue "${issue.title}" status changed from ${oldStatus} to ${newStatus}.`;
            priority = 'medium';
        }
        
        return await this.createAndSend({
            recipient: issue.reportedBy,
            sender: updatedBy,
            type: 'issue_status_changed',
            title,
            message,
            data: {
                issueId: issue._id,
                oldValue: oldStatus,
                newValue: newStatus,
                actionUrl: `/user/issue/${issue._id}`,
                priority,
                // Add challenge-related data for resolved issues
                ...(newStatus === 'Resolved' && {
                    challengeDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                    canChallenge: true,
                    resolvedScore: issue.resolvedScore || null
                })
            }
        });
    }

    // Issue reported as spam notification
    async notifyIssueReportedSpam(issueData) {
        const { issue, reportedBy } = issueData;
        
        return await this.createAndSend({
            recipient: issue.reportedBy,
            sender: reportedBy,
            type: 'issue_reported_spam',
            title: '⚠️ Issue Marked as Spam/Fake',
            message: `Your issue "${issue.title}" has been marked as spam or fake by an admin. ` +
                    `If you believe this decision is incorrect, you have 24 hours to file a challenge. ` +
                    `Failure to challenge within 24 hours will result in a trust score penalty.`,
            data: {
                issueId: issue._id,
                actionUrl: `/user/issue/${issue._id}`,
                priority: 'urgent',
                challengeDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
                canChallenge: true,
                penaltyWarning: true
            }
        });
    }

    // Trust score changed notification
    async notifyTrustScoreChanged(userData) {
        const { user, oldScore, newScore, reason } = userData;
        
        const isIncrease = newScore > oldScore;
        const change = Math.abs(newScore - oldScore);
        const title = isIncrease ? 'Trust Score Increased!' : 'Trust Score Decreased';
        const emoji = isIncrease ? '📈' : '📉';
        
        return await this.createAndSend({
            recipient: user._id,
            type: 'trust_score_changed',
            title,
            message: `${emoji} Your trust score changed by ${isIncrease ? '+' : '-'}${change} points. New score: ${newScore}/100. Reason: ${reason}`,
            data: {
                oldValue: oldScore,
                newValue: newScore,
                reason,
                actionUrl: '/user/profile',
                priority: newScore <= 25 ? 'urgent' : 'medium'
            }
        });
    }

    // Trust score warning notification
    async notifyTrustScoreWarning(userData) {
        const { user } = userData;
        
        let message = '';
        let priority = 'medium';
        
        if (user.trustScore <= 10) {
            message = '🚨 URGENT: Your trust score is critically low (≤10). One more violation may result in account suspension.';
            priority = 'urgent';
        } else if (user.trustScore <= 25) {
            message = '⚠️ WARNING: Your trust score is low (≤25). Please be more careful with your reports.';
            priority = 'high';
        } else if (user.trustScore <= 50) {
            message = '📊 NOTICE: Your trust score is below average (≤50). Consider reviewing our community guidelines.';
            priority = 'medium';
        }
        
        return await this.createAndSend({
            recipient: user._id,
            type: 'trust_score_warning',
            title: 'Trust Score Warning',
            message,
            data: {
                currentScore: user.trustScore,
                actionUrl: '/user/profile',
                priority
            }
        });
    }

    // New high priority issue notification (for admins)
    async notifyNewHighPriorityIssue(issueData) {
        const { issue } = issueData;
        
        return await this.createAndSend({
            recipient: null, // Will be sent to role-based room
            type: 'new_high_priority_issue',
            title: 'New High Priority Issue',
            message: `A new high priority issue has been reported: "${issue.title}" (Score: ${issue.priorityScore})`,
            data: {
                issueId: issue._id,
                actionUrl: `/admin/issue/${issue._id}`,
                priority: 'high'
            },
            targetRoles: ['admin', 'super_admin'],
            targetCity: issue.city
        });
    }

    // System announcement notification
    async notifySystemAnnouncement(announcementData) {
        const { title, message, targetRoles = ['user', 'admin', 'super_admin'], priority = 'medium', expiresAt } = announcementData;
        
        return await this.createAndSend({
            recipient: null, // System-wide
            type: 'system_announcement',
            title,
            message,
            data: {
                priority,
                actionUrl: '/announcements'
            },
            isSystemWide: true,
            targetRoles,
            expiresAt
        });
    }

    // Get user notifications with pagination
    async getUserNotifications(userId, options = {}) {
        const { page = 1, limit = 20, unreadOnly = false } = options;
        const skip = (page - 1) * limit;
        
        const query = { recipient: userId };
        if (unreadOnly) {
            query.read = false;
        }
        
        const notifications = await Notification.find(query)
            .populate('sender', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        const total = await Notification.countDocuments(query);
        
        return {
            notifications: notifications.map(n => ({
                ...n,
                timeAgo: this.getTimeAgo(n.createdAt)
            })),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Get unread count for user
    async getUnreadCount(userId) {
        return await Notification.countDocuments({
            recipient: userId,
            read: false
        });
    }

    // Mark notification as read
    async markAsRead(notificationId, userId) {
        return await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { read: true, readAt: new Date() },
            { new: true }
        );
    }

    // Mark all notifications as read for user
    async markAllAsRead(userId) {
        return await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true, readAt: new Date() }
        );
    }

    // Helper method for time ago calculation
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    }
}

export const notificationService = new NotificationService();
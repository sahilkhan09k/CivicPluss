import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { apiError } from '../utils/apiError.js';
import { notificationService } from '../services/notificationService.js';

// Get user notifications
export const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const result = await notificationService.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unreadOnly === 'true'
    });
    
    return res
        .status(200)
        .json(new apiResponse(200, result, "Notifications fetched successfully"));
});

// Get unread notification count
export const getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const count = await notificationService.getUnreadCount(userId);
    
    return res
        .status(200)
        .json(new apiResponse(200, { count }, "Unread count fetched successfully"));
});

// Mark notification as read
export const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user._id;
    
    const notification = await notificationService.markAsRead(notificationId, userId);
    
    if (!notification) {
        throw new apiError(404, "Notification not found");
    }
    
    return res
        .status(200)
        .json(new apiResponse(200, notification, "Notification marked as read"));
});

// Mark all notifications as read
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const result = await notificationService.markAllAsRead(userId);
    
    return res
        .status(200)
        .json(new apiResponse(200, result, "All notifications marked as read"));
});

// Send system announcement (admin only)
export const sendSystemAnnouncement = asyncHandler(async (req, res) => {
    if (req.user.role !== 'super_admin') {
        throw new apiError(403, "Only super admins can send system announcements");
    }
    
    const { title, message, targetRoles, priority, expiresAt } = req.body;
    
    if (!title || !message) {
        throw new apiError(400, "Title and message are required");
    }
    
    const notification = await notificationService.notifySystemAnnouncement({
        title,
        message,
        targetRoles,
        priority,
        expiresAt: expiresAt ? new Date(expiresAt) : null
    });
    
    return res
        .status(201)
        .json(new apiResponse(201, notification, "System announcement sent successfully"));
});
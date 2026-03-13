import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
    getUserNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendSystemAnnouncement
} from '../controllers/notification.controller.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Get user notifications
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllNotificationsAsRead);

// Send system announcement (super admin only)
router.post('/system-announcement', sendSystemAnnouncement);

export default router;
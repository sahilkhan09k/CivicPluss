import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Notification } from '../models/notification.model.js';

class SocketServer {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // userId -> socketId mapping
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
                
                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }

                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                const user = await User.findById(decoded._id).select('-password -refreshToken');
                
                if (!user) {
                    return next(new Error('Authentication error: User not found'));
                }

                socket.userId = user._id.toString();
                socket.user = user;
                next();
            } catch (error) {
                console.error('Socket authentication error:', error);
                next(new Error('Authentication error: Invalid token'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`🔌 User connected: ${socket.user.name} (${socket.userId})`);
            
            // Store user connection
            this.connectedUsers.set(socket.userId, socket.id);
            
            // Join user to their personal room
            socket.join(`user_${socket.userId}`);
            
            // Join role-based rooms
            socket.join(`role_${socket.user.role}`);
            
            // Join city-based room for admins
            if (socket.user.city) {
                socket.join(`city_${socket.user.city}`);
            }

            // Handle notification events
            this.setupNotificationHandlers(socket);

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`🔌 User disconnected: ${socket.user.name} (${socket.userId})`);
                this.connectedUsers.delete(socket.userId);
            });
        });

        console.log('🚀 Socket.IO server initialized');
        return this.io;
    }

    setupNotificationHandlers(socket) {
        // Mark notification as read
        socket.on('mark_notification_read', async (notificationId) => {
            try {
                const notification = await Notification.findOneAndUpdate(
                    { _id: notificationId, recipient: socket.userId },
                    { read: true, readAt: new Date() },
                    { new: true }
                );
                
                if (notification) {
                    socket.emit('notification_marked_read', { notificationId, success: true });
                }
            } catch (error) {
                console.error('Error marking notification as read:', error);
                socket.emit('notification_marked_read', { notificationId, success: false, error: error.message });
            }
        });

        // Mark all notifications as read
        socket.on('mark_all_notifications_read', async () => {
            try {
                await Notification.updateMany(
                    { recipient: socket.userId, read: false },
                    { read: true, readAt: new Date() }
                );
                
                socket.emit('all_notifications_marked_read', { success: true });
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
                socket.emit('all_notifications_marked_read', { success: false, error: error.message });
            }
        });

        // Get unread notification count
        socket.on('get_unread_count', async () => {
            try {
                const count = await Notification.countDocuments({
                    recipient: socket.userId,
                    read: false
                });
                
                socket.emit('unread_count', { count });
            } catch (error) {
                console.error('Error getting unread count:', error);
                socket.emit('unread_count', { count: 0, error: error.message });
            }
        });
    }

    // Send notification to specific user
    async sendToUser(userId, notification) {
        const socketId = this.connectedUsers.get(userId.toString());
        if (socketId) {
            this.io.to(socketId).emit('new_notification', notification);
            console.log(`📧 Notification sent to user ${userId}: ${notification.title}`);
        }
    }

    // Send notification to all users with specific role
    async sendToRole(role, notification) {
        this.io.to(`role_${role}`).emit('new_notification', notification);
        console.log(`📧 Notification sent to role ${role}: ${notification.title}`);
    }

    // Send notification to all users in specific city
    async sendToCity(city, notification) {
        this.io.to(`city_${city}`).emit('new_notification', notification);
        console.log(`📧 Notification sent to city ${city}: ${notification.title}`);
    }

    // Send system-wide notification
    async sendSystemWide(notification) {
        this.io.emit('new_notification', notification);
        console.log(`📧 System-wide notification sent: ${notification.title}`);
    }

    // Get connected users count
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    // Check if user is online
    isUserOnline(userId) {
        return this.connectedUsers.has(userId.toString());
    }
}

// Export singleton instance
export const socketServer = new SocketServer();
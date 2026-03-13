import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        console.log('🔌 SocketContext: Auth state changed:', { isAuthenticated, user: user?.name, userId: user?._id });
        
        if (isAuthenticated && user) {
            // Get token from localStorage or cookies
            const token = localStorage.getItem('accessToken') || 
                         document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];

            console.log('🔌 SocketContext: Token found:', !!token);

            if (token) {
                const socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
                console.log('🔌 SocketContext: Connecting to:', socketUrl);
                
                const newSocket = io(socketUrl, {
                    auth: {
                        token: token
                    },
                    withCredentials: true
                });

                newSocket.on('connect', () => {
                    console.log('🔌 Connected to Socket.IO server');
                    setIsConnected(true);
                    
                    // Request unread count on connection
                    newSocket.emit('get_unread_count');
                });

                newSocket.on('disconnect', () => {
                    console.log('🔌 Disconnected from Socket.IO server');
                    setIsConnected(false);
                });

                newSocket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                    setIsConnected(false);
                });

                // Listen for new notifications
                newSocket.on('new_notification', (notification) => {
                    console.log('📧 New notification received:', notification);
                    
                    // Add to notifications list
                    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
                    
                    // Update unread count
                    setUnreadCount(prev => prev + 1);
                    
                    // Show toast notification
                    showToastNotification(notification);
                });

                // Listen for unread count updates
                newSocket.on('unread_count', ({ count }) => {
                    setUnreadCount(count);
                });

                // Listen for notification marked as read
                newSocket.on('notification_marked_read', ({ notificationId, success }) => {
                    if (success) {
                        setNotifications(prev => 
                            prev.map(n => 
                                n.id === notificationId ? { ...n, read: true } : n
                            )
                        );
                        setUnreadCount(prev => Math.max(0, prev - 1));
                    }
                });

                // Listen for all notifications marked as read
                newSocket.on('all_notifications_marked_read', ({ success }) => {
                    if (success) {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        setUnreadCount(0);
                    }
                });

                setSocket(newSocket);

                return () => {
                    newSocket.close();
                };
            }
        } else {
            // Disconnect socket if user is not authenticated
            if (socket) {
                socket.close();
                setSocket(null);
                setIsConnected(false);
                setNotifications([]);
                setUnreadCount(0);
            }
        }
    }, [isAuthenticated, user]);

    // Show toast notification
    const showToastNotification = (notification) => {
        // Check if browser supports notifications
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id
            });
        }
        
        // You can also integrate with a toast library here
        console.log('🔔 Toast notification:', notification.title);
    };

    // Request notification permission
    const requestNotificationPermission = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    };

    // Mark notification as read
    const markAsRead = (notificationId) => {
        if (socket && isConnected) {
            socket.emit('mark_notification_read', notificationId);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        if (socket && isConnected) {
            socket.emit('mark_all_notifications_read');
        }
    };

    // Get unread count
    const refreshUnreadCount = () => {
        if (socket && isConnected) {
            socket.emit('get_unread_count');
        }
    };

    const value = {
        socket,
        isConnected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshUnreadCount,
        requestNotificationPermission
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
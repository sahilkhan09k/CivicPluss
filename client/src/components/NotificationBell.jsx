import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Clock, AlertCircle, TrendingUp, MessageSquare, Settings } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { apiService } from '../services/api';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [allNotifications, setAllNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } = useSocket();

    // Debug logging
    useEffect(() => {
        console.log('🔔 NotificationBell rendered:', { isConnected, unreadCount, notifications: notifications.length });
    }, [isConnected, unreadCount, notifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen && allNotifications.length === 0) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUserNotifications({ limit: 20 });
            setAllNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = (notification) => {
        // Mark as read if unread
        if (!notification.read) {
            markAsRead(notification._id);
        }

        // Navigate to action URL if available
        if (notification.data?.actionUrl) {
            window.location.href = notification.data.actionUrl;
        }

        setIsOpen(false);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
        setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'challenge_submitted':
            case 'challenge_reviewed':
                return <MessageSquare className="h-4 w-4" />;
            case 'issue_status_changed':
                return <Settings className="h-4 w-4" />;
            case 'trust_score_changed':
            case 'trust_score_warning':
                return <TrendingUp className="h-4 w-4" />;
            case 'issue_reported_spam':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getNotificationColor = (type, priority) => {
        if (priority === 'urgent') return 'text-red-600 bg-red-50 border-red-200';
        if (priority === 'high') return 'text-orange-600 bg-orange-50 border-orange-200';
        
        switch (type) {
            case 'challenge_reviewed':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'trust_score_changed':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'issue_status_changed':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // Combine real-time notifications with fetched ones
    const displayNotifications = [...notifications, ...allNotifications]
        .filter((notification, index, self) => 
            index === self.findIndex(n => n.id === notification.id || n._id === notification._id)
        )
        .slice(0, 20);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all duration-200 ${
                    isConnected 
                        ? 'text-gray-600 hover:text-primary-600 hover:bg-primary-50' 
                        : 'text-gray-400 cursor-not-allowed'
                }`}
                disabled={!isConnected}
                title={isConnected ? 'Notifications' : 'Connecting...'}
            >
                <Bell className={`h-6 w-6 ${isConnected ? '' : 'animate-pulse'}`} />
                
                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}

                {/* Connection Status Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    isConnected ? 'bg-green-500' : 'bg-gray-400'
                }`} />
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                                    >
                                        <CheckCheck className="h-3 w-3" />
                                        <span>Mark all read</span>
                                    </button>
                                )}
                                <span className="text-xs text-gray-500">
                                    {unreadCount} unread
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                                <p className="text-gray-500 text-sm">Loading notifications...</p>
                            </div>
                        ) : displayNotifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {displayNotifications.map((notification) => (
                                    <div
                                        key={notification.id || notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                                            !notification.read ? 'bg-blue-50/30' : ''
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {/* Icon */}
                                            <div className={`p-2 rounded-lg border ${getNotificationColor(notification.type, notification.data?.priority)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500 flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {notification.timeAgo || 'Just now'}
                                                    </span>
                                                    {notification.data?.priority === 'urgent' && (
                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                                            Urgent
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                                <p className="text-gray-400 text-xs mt-1">You'll see updates here when they arrive</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {displayNotifications.length > 0 && (
                        <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // Navigate to full notifications page
                                    window.location.href = '/notifications';
                                }}
                                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
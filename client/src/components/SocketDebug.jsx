import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const SocketDebug = () => {
    const { isConnected, notifications, unreadCount } = useSocket();
    const { user, isAuthenticated } = useAuth();

    return (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-sm">
            <h3 className="font-bold text-sm mb-2">Socket Debug Info</h3>
            <div className="text-xs space-y-1">
                <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
                <div>User: {user?.name || 'None'}</div>
                <div>Socket: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
                <div>Unread: {unreadCount}</div>
                <div>Notifications: {notifications.length}</div>
                <div>Token: {localStorage.getItem('accessToken') ? '✅' : '❌'}</div>
            </div>
        </div>
    );
};

export default SocketDebug;
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, MapPin, User, BarChart3, MessageSquare, LogOut, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isAdmin = false }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const userLinks = [
        { to: '/dashboard', icon: Home, label: 'Dashboard' },
        { to: '/report-issue', icon: FileText, label: 'Report Issue' },
        { to: '/my-issues', icon: AlertCircle, label: 'My Issues' },
        { to: '/verify', icon: Users, label: 'Verify Issues' },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    const adminLinks = [
        { to: '/admin', icon: Home, label: 'Dashboard' },
        { to: '/admin/issues', icon: AlertCircle, label: 'Issue Intelligence' },
        { to: '/admin/manage', icon: FileText, label: 'Manage Issues' },
        { to: '/admin/resolved', icon: CheckCircle, label: 'Resolved Issues' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback & Trust' },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    return (
        <div className="w-64 bg-white h-screen shadow-lg fixed left-0 top-0 flex flex-col">
            <div className="p-6 border-b">
                <Link to="/" className="flex items-center space-x-2">
                    <MapPin className="h-8 w-8 text-primary-600" />
                    <span className="text-xl font-bold text-primary-600">CivicPulse</span>
                </Link>
                <p className="text-sm text-gray-500 mt-1">{isAdmin ? 'Admin Panel' : 'User Dashboard'}</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

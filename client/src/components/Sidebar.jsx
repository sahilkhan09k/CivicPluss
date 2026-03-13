import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, MapPin, User, BarChart3, MessageSquare, LogOut, AlertCircle, Users, CheckCircle, Shield, History, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isAdmin = false }) => {
    const location = useLocation();
    const { logout, user } = useAuth();

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
        { to: '/admin/in-progress', icon: Clock, label: 'In Progress Issues' },
        { to: '/admin/resolved', icon: CheckCircle, label: 'Resolved Issues' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback & Trust' },
    ];

    const superAdminLinks = [
        { to: '/admin', icon: Home, label: 'Dashboard' },
        { to: '/admin/challenge-queue', icon: Shield, label: 'Challenge Queue' },
        { to: '/admin/challenge-history', icon: History, label: 'Challenge History' },
        { to: '/admin/in-progress', icon: Clock, label: 'All In Progress Issues' },
        { to: '/admin/resolved', icon: CheckCircle, label: 'All Resolved Issues' },
        { to: '/admin/analytics', icon: BarChart3, label: 'State Analytics' },
        { to: '/admin/feedback', icon: MessageSquare, label: 'State Feedback & Trust' },
    ];

    // Use different links based on user role
    const links = isAdmin ? (user?.role === 'super_admin' ? superAdminLinks : adminLinks) : userLinks;

    return (
        <div className="w-64 bg-gradient-to-b from-white via-primary-50/30 to-accent-50/20 backdrop-blur-xl h-screen shadow-2xl fixed left-0 top-0 flex flex-col border-r border-primary-100/50">
            <div className="p-6 border-b border-primary-100/50">
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                            CivicPulse
                        </span>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                            {isAdmin ? 'Admin Panel' : 'User Dashboard'}
                        </p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link, index) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 group ${
                                isActive
                                    ? 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white shadow-2xl shadow-primary-500/30 border border-primary-400'
                                    : 'text-gray-700 hover:bg-white/80 backdrop-blur-sm hover:shadow-lg border border-transparent hover:border-primary-200'
                            }`}
                            style={{animationDelay: `${index * 0.1}s`}}
                        >
                            <div className={`p-2 rounded-xl transition-all duration-300 ${
                                isActive 
                                    ? 'bg-white/20' 
                                    : 'bg-primary-100/50 group-hover:bg-primary-200/70'
                            }`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="font-bold">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-primary-100/50">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 w-full transition-all duration-300 transform hover:scale-105 font-semibold border border-transparent hover:border-red-200 hover:shadow-lg group"
                >
                    <div className="p-2 rounded-xl bg-red-100/50 group-hover:bg-red-200/70 transition-all duration-300">
                        <LogOut className="h-5 w-5" />
                    </div>
                    <span className="font-bold">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

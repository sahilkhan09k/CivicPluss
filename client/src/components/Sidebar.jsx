import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, MapPin, User, BarChart3, MessageSquare, LogOut, AlertCircle, Users, CheckCircle, Shield, History, Clock, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isAdmin = false }) => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Close on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setIsOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        { to: '/admin/in-progress', icon: Clock, label: 'In Progress' },
        { to: '/admin/resolved', icon: CheckCircle, label: 'Resolved Issues' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback & Trust' },
    ];

    const superAdminLinks = [
        { to: '/admin', icon: Home, label: 'Dashboard' },
        { to: '/admin/challenge-queue', icon: Shield, label: 'Challenge Queue' },
        { to: '/admin/challenge-history', icon: History, label: 'Challenge History' },
        { to: '/admin/in-progress', icon: Clock, label: 'In Progress' },
        { to: '/admin/resolved', icon: CheckCircle, label: 'Resolved Issues' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/admin/feedback', icon: MessageSquare, label: 'Feedback & Trust' },
    ];

    const links = isAdmin ? (user?.role === 'super_admin' ? superAdminLinks : adminLinks) : userLinks;

    const SidebarContent = () => (
        <div className="w-64 bg-gradient-to-b from-white via-primary-50/30 to-accent-50/20 backdrop-blur-xl h-full flex flex-col border-r border-primary-100/50">
            <div className="p-5 border-b border-primary-100/50 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-3 group" onClick={() => setIsOpen(false)}>
                    <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-2 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-xl font-black bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                            CivicPulse
                        </span>
                        <p className="text-xs text-gray-500 font-medium">
                            {isAdmin ? 'Admin Panel' : 'User Dashboard'}
                        </p>
                    </div>
                </Link>
                {/* Close button — mobile only */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {links.map((link, index) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 group ${
                                isActive
                                    ? 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                                    : 'text-gray-700 hover:bg-white/80 hover:shadow-md'
                            }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                                isActive ? 'bg-white/20' : 'bg-primary-100/50 group-hover:bg-primary-200/70'
                            }`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-primary-100/50">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 w-full transition-all duration-200 font-semibold group"
                >
                    <div className="p-1.5 rounded-xl bg-red-100/50 group-hover:bg-red-200/70 transition-all duration-200">
                        <LogOut className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold">Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger button — fixed top-left */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:bg-primary-50 transition-colors"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Desktop sidebar — fixed positioned, pages use md:ml-64 for offset */}
            <div className="hidden md:block fixed left-0 top-0 h-screen w-64 shadow-2xl z-40">
                <SidebarContent />
            </div>

            {/* Mobile overlay backdrop */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile slide-in drawer */}
            <div className={`md:hidden fixed left-0 top-0 h-full z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <SidebarContent />
            </div>
        </>
    );
};

export default Sidebar;

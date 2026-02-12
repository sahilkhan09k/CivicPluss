import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Clock, Award, AlertCircle, MapPin, Loader, Shield } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const response = await apiService.getAllIssues();
            setIssues(response.data || []);
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError('Failed to load issues');
        } finally {
            setLoading(false);
        }
    };

    const myIssues = issues.filter(issue => issue.reportedBy?._id === user?._id || issue.reportedBy === user?._id);
    const resolvedIssues = myIssues.filter(issue => issue.status === 'Resolved');
    const pendingIssues = myIssues.filter(issue => issue.status === 'Pending');
    const inProgressIssues = myIssues.filter(issue => issue.status === 'In Progress');

    const stats = {
        reported: myIssues.length,
        resolved: resolvedIssues.length,
        pending: pendingIssues.length,
        inProgress: inProgressIssues.length
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'text-success-600 bg-success-100';
            case 'In Progress': return 'text-warning-600 bg-warning-100';
            case 'Pending': return 'text-gray-600 bg-gray-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-100';
            case 'Medium': return 'text-warning-600 bg-warning-100';
            case 'Low': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20">
                <Sidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20">
            <Sidebar />

            <div className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg">Welcome back, {user?.name}! Here's your civic impact overview</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Stats Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Trust Score Widget */}
                    <Link to="/profile" className="stat-card hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1 font-medium">Trust Score</p>
                                <p className={`text-4xl font-bold bg-gradient-to-r ${(user?.trustScore ?? 100) >= 75 ? 'from-green-600 to-green-700' :
                                        (user?.trustScore ?? 100) >= 50 ? 'from-yellow-600 to-yellow-700' :
                                            (user?.trustScore ?? 100) >= 25 ? 'from-orange-600 to-orange-700' :
                                                'from-red-600 to-red-700'
                                    } bg-clip-text text-transparent`}>
                                    {user?.trustScore ?? 100}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${(user?.trustScore ?? 100) >= 75 ? 'bg-green-100' :
                                    (user?.trustScore ?? 100) >= 50 ? 'bg-yellow-100' :
                                        (user?.trustScore ?? 100) >= 25 ? 'bg-orange-100' :
                                            'bg-red-100'
                                }`}>
                                <Shield className={`h-8 w-8 ${(user?.trustScore ?? 100) >= 75 ? 'text-green-600' :
                                        (user?.trustScore ?? 100) >= 50 ? 'text-yellow-600' :
                                            (user?.trustScore ?? 100) >= 25 ? 'text-orange-600' :
                                                'text-red-600'
                                    }`} />
                            </div>
                        </div>
                        {(user?.trustScore ?? 100) < 100 && (
                            <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                                ⚠️ Click to view details
                            </div>
                        )}
                    </Link>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1 font-medium">Issues Reported</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                                    {stats.reported}
                                </p>
                            </div>
                            <div className="bg-primary-100 p-3 rounded-xl">
                                <AlertCircle className="h-8 w-8 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1 font-medium">Resolved</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-success-600 to-success-700 bg-clip-text text-transparent">
                                    {stats.resolved}
                                </p>
                            </div>
                            <div className="bg-success-100 p-3 rounded-xl">
                                <CheckCircle className="h-8 w-8 text-success-600" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1 font-medium">In Progress</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-warning-600 to-warning-700 bg-clip-text text-transparent">
                                    {stats.inProgress}
                                </p>
                            </div>
                            <div className="bg-warning-100 p-3 rounded-xl">
                                <Clock className="h-8 w-8 text-warning-600" />
                            </div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1 font-medium">Pending</p>
                                <p className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
                                    {stats.pending}
                                </p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <TrendingUp className="h-8 w-8 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Recent Issues */}
                <div className="card-gradient mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">My Recent Issues</h2>
                        <Link to="/my-issues" className="text-primary-600 hover:text-primary-700 font-semibold">
                            View All →
                        </Link>
                    </div>

                    {myIssues.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-4">You haven't reported any issues yet</p>
                            <Link to="/report-issue" className="btn-primary inline-block">
                                Report Your First Issue
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myIssues.slice(0, 5).map((issue) => (
                                <div key={issue._id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                                            <div className="flex items-center space-x-4 text-sm">
                                                <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(issue.status)}`}>
                                                    {issue.status}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full font-medium ${getPriorityColor(issue.priority)}`}>
                                                    {issue.priority} Priority
                                                </span>
                                                <span className="text-gray-500 flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {issue.location?.lat?.toFixed(4)}, {issue.location?.lng?.toFixed(4)}
                                                </span>
                                            </div>
                                        </div>
                                        {issue.imageUrl && (
                                            <img
                                                src={issue.imageUrl}
                                                alt={issue.title}
                                                className="w-24 h-24 object-cover rounded-lg ml-4"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Issues Overview */}
                <div className="card-gradient">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Community Issues</h2>
                        <span className="text-sm text-gray-500">{issues.length} total issues</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {issues.slice(0, 6).map((issue) => (
                            <div key={issue._id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                                {issue.imageUrl && (
                                    <img
                                        src={issue.imageUrl}
                                        alt={issue.title}
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                )}
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{issue.title}</h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                                <div className="flex items-center justify-between text-xs">
                                    <span className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(issue.priority)}`}>
                                        {issue.priority}
                                    </span>
                                    <span className="text-gray-500">
                                        Score: {issue.priorityScore}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

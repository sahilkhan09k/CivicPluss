import { useState, useEffect } from 'react';
import { Loader, AlertCircle, MapPin, Calendar, TrendingUp } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';

const MyIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchMyIssues();
    }, []);

    const fetchMyIssues = async () => {
        try {
            const response = await apiService.getUserIssues();
            setIssues(response.data || []);
        } catch (err) {
            console.error('Error fetching issues:', err);
            setError('Failed to load your issues');
        } finally {
            setLoading(false);
        }
    };

    const filteredIssues = filter === 'all'
        ? issues
        : issues.filter(issue => issue.status === filter);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'text-success-600 bg-success-100 border-success-200';
            case 'In Progress': return 'text-warning-600 bg-warning-100 border-warning-200';
            case 'Pending': return 'text-gray-600 bg-gray-100 border-gray-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-100 border-red-200';
            case 'Medium': return 'text-warning-600 bg-warning-100 border-warning-200';
            case 'Low': return 'text-blue-600 bg-blue-100 border-blue-200';
            default: return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20">
                <Sidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading your issues...</p>
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
                        My Issues
                    </h1>
                    <p className="text-gray-600 text-lg">Track and manage all your reported issues</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="mb-6 flex space-x-2">
                    {['all', 'Pending', 'In Progress', 'Resolved'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${filter === status
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'All Issues' : status}
                            {status !== 'all' && (
                                <span className="ml-2 text-xs">
                                    ({issues.filter(i => i.status === status).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Issues List */}
                {filteredIssues.length === 0 ? (
                    <div className="card-gradient text-center py-16">
                        <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {filter === 'all' ? 'No issues reported yet' : `No ${filter.toLowerCase()} issues`}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all'
                                ? 'Start making a difference by reporting your first issue'
                                : 'Try selecting a different filter'}
                        </p>
                        {filter === 'all' && (
                            <Link to="/report-issue" className="btn-primary inline-block">
                                Report an Issue
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredIssues.map((issue) => (
                            <Link
                                key={issue._id}
                                to={`/issue/${issue._id}`}
                                className="block"
                            >
                                <div className="card-gradient hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-start space-x-4">
                                        {issue.imageUrl && (
                                            <img
                                                src={issue.imageUrl}
                                                alt={issue.title}
                                                className="w-32 h-32 object-cover rounded-xl flex-shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                                                    {issue.title}
                                                </h3>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(issue.priority)}`}>
                                                        {issue.priority}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(issue.status)}`}>
                                                        {issue.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-4 line-clamp-2">
                                                {issue.description}
                                            </p>

                                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(issue.createdAt)}
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {issue.location?.lat?.toFixed(4)}, {issue.location?.lng?.toFixed(4)}
                                                </div>
                                                <div className="flex items-center">
                                                    <TrendingUp className="h-4 w-4 mr-1" />
                                                    Priority Score: {issue.priorityScore}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyIssues;

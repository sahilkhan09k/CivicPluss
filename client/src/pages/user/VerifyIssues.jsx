import { useState, useEffect } from 'react';
import { ThumbsUp, MapPin, Loader2, TrendingUp, ArrowUp, Users, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const VerifyIssues = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [upvoting, setUpvoting] = useState({});
    const [sortBy, setSortBy] = useState('priority');

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAllIssues();
            const allIssues = response.data || [];
            
            console.log('Total issues from API:', allIssues.length);
            console.log('Current user ID:', user?._id);
            console.log('Sample issue reportedBy:', allIssues[0]?.reportedBy);

            const filtered = allIssues.filter(issue => {
                // Exclude resolved issues
                if (issue.status === 'Resolved') return false;
                // Exclude user's own issues — compare as strings to handle ObjectId vs string
                const reporterId = issue.reportedBy?._id?.toString() || issue.reportedBy?.toString();
                const currentUserId = user?._id?.toString();
                return reporterId !== currentUserId;
            });

            console.log('Filtered issues (excluding own + resolved):', filtered.length);
            setIssues(filtered);
        } catch (err) {
            setError(err.message || 'Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async (e, issueId) => {
        e.preventDefault();
        e.stopPropagation();
        if (upvoting[issueId]) return;

        setUpvoting(prev => ({ ...prev, [issueId]: true }));
        try {
            const res = await apiService.toggleUpvote(issueId);
            setIssues(prev => prev.map(issue =>
                issue._id === issueId
                    ? {
                        ...issue,
                        upvoteCount: res.data.upvoteCount,
                        userUpvoted: res.data.upvoted
                    }
                    : issue
            ));
        } catch (err) {
            console.error('Upvote error:', err);
        } finally {
            setUpvoting(prev => ({ ...prev, [issueId]: false }));
        }
    };

    const sortedIssues = [...issues].sort((a, b) => {
        if (sortBy === 'upvotes') return (b.upvoteCount || 0) - (a.upvoteCount || 0);
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        return (b.priorityScore || 0) - (a.priorityScore || 0); // default: priority
    });

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-700 border-red-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                <Sidebar />
                <div className="flex-1 md:ml-64 flex items-center justify-center pt-16 md:pt-0">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-primary-500 to-accent-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Loading Issues</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8">
                    <div className="card bg-red-50 border-2 border-red-200 text-center py-12">
                        <p className="text-red-700 text-lg">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl"></div>
            </div>

            <Sidebar />

            <div className="relative z-10 flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-4 mb-3">
                            <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-4 rounded-2xl shadow-lg">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                                    Community Verification
                                </h1>
                                <p className="text-gray-600 text-lg">Upvote genuine issues to boost their priority</p>
                            </div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <ThumbsUp className="h-5 w-5" /> Why Upvote Issues?
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                            <span>✅ Confirms the issue is real</span>
                            <span>📈 Boosts issue priority score</span>
                            <span>🏆 Reporter earns +2 trust points</span>
                            <span>🏛️ Helps admins prioritize faster</span>
                        </div>
                    </div>

                    {/* Sort Controls */}
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">Sort by:</span>
                        {[
                            { key: 'priority', label: '🎯 Priority' },
                            { key: 'upvotes', label: '👍 Most Upvoted' },
                            { key: 'newest', label: '🕐 Newest' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setSortBy(key)}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                    sortBy === key
                                        ? 'bg-primary-600 text-white shadow-lg'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                        <span className="text-sm text-gray-500 font-medium ml-auto">
                            {sortedIssues.length} issues
                        </span>
                    </div>

                    {/* Issues List */}
                    {sortedIssues.length === 0 ? (
                        <div className="card text-center py-16">
                            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg font-semibold">All caught up!</p>
                            <p className="text-sm text-gray-500 mt-2">No community issues to verify right now</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedIssues.map((issue, index) => {
                                const hasUpvoted = issue.userUpvoted ||
                                    issue.upvotes?.some(id =>
                                        id === user?._id || id?._id === user?._id
                                    );
                                const upvoteCount = issue.upvoteCount || 0;
                                const isUpvoting = upvoting[issue._id];

                                return (
                                    <Link
                                        key={issue._id}
                                        to={`/issue/${issue._id}`}
                                        className="block group"
                                    >
                                        <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                                            <div className="flex">
                                                {/* Upvote Column */}
                                                <div className="flex flex-col items-center justify-center px-5 py-6 bg-gray-50 border-r border-gray-100 min-w-[80px]">
                                                    <button
                                                        onClick={(e) => handleUpvote(e, issue._id)}
                                                        disabled={isUpvoting}
                                                        className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 ${
                                                            hasUpvoted
                                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                                                : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-primary-400 hover:text-primary-600'
                                                        } ${isUpvoting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        title={hasUpvoted ? 'Remove upvote' : 'Upvote this issue'}
                                                    >
                                                        {isUpvoting ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <ArrowUp className={`h-5 w-5 ${hasUpvoted ? 'text-white' : ''}`} />
                                                        )}
                                                    </button>
                                                    <span className={`text-lg font-black mt-1 ${
                                                        hasUpvoted ? 'text-primary-600' : 'text-gray-700'
                                                    }`}>
                                                        {upvoteCount}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-medium">votes</span>
                                                </div>

                                                {/* Issue Content */}
                                                <div className="flex-1 p-5">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                                                                    {issue.title}
                                                                </h3>
                                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${getPriorityStyle(issue.priority)}`}>
                                                                    {issue.priority}
                                                                </span>
                                                                {upvoteCount >= 5 && (
                                                                    <span className="text-xs px-2 py-1 rounded-full font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                                                                        🔥 Trending
                                                                    </span>
                                                                )}
                                                                {upvoteCount >= 10 && (
                                                                    <span className="text-xs px-2 py-1 rounded-full font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                                                        ⚡ Hot
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                                {issue.description}
                                                            </p>
                                                        </div>
                                                        {issue.imageUrl && (
                                                            <img
                                                                src={issue.imageUrl}
                                                                alt={issue.title}
                                                                className="w-20 h-20 object-cover rounded-xl ml-4 flex-shrink-0 shadow-sm"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {issue.city || `${issue.location?.lat?.toFixed(3)}, ${issue.location?.lng?.toFixed(3)}`}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <TrendingUp className="h-3 w-3" />
                                                            Score: {issue.priorityScore}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ThumbsUp className="h-3 w-3" />
                                                            {upvoteCount} community {upvoteCount === 1 ? 'vote' : 'votes'}
                                                        </span>
                                                        <span className="ml-auto text-gray-400">
                                                            {new Date(issue.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyIssues;






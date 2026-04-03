import { useState, useEffect } from 'react';
import { Loader, AlertCircle, MapPin, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ChallengeButton from '../../components/ChallengeButton';
import ChallengeModal from '../../components/ChallengeModal';

const MyIssues = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

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
            case 'Resolved': return 'text-success-600 bg-gradient-to-r from-success-100 to-emerald-100 border-success-200';
            case 'In Progress': return 'text-warning-600 bg-gradient-to-r from-warning-100 to-amber-100 border-warning-200';
            case 'Pending': return 'text-gray-600 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200';
            default: return 'text-gray-600 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-gradient-to-r from-red-100 to-pink-100 border-red-200';
            case 'Medium': return 'text-warning-600 bg-gradient-to-r from-warning-100 to-amber-100 border-warning-200';
            case 'Low': return 'text-blue-600 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200';
            default: return 'text-gray-600 bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200';
        }
    };

    const getChallengeStatusBadge = (issue) => {
        // Check if issue has challenges
        if (!issue.hasChallenges) return null;

        // Check if challenge has been resolved
        if (issue.challengeResolved) {
            if (issue.challengeDecision === 'admin_wrong') {
                return (
                    <span className="px-4 py-2 rounded-2xl text-sm font-bold border-2 text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 shadow-lg backdrop-blur-sm">
                        ✅ Challenge Won
                    </span>
                );
            } else if (issue.challengeDecision === 'admin_correct') {
                return (
                    <span className="px-4 py-2 rounded-2xl text-sm font-bold border-2 text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border-red-300 shadow-lg backdrop-blur-sm">
                        ❌ Challenge Lost
                    </span>
                );
            }
        }

        // Challenge is still pending review
        return (
            <span className="px-4 py-2 rounded-2xl text-sm font-bold border-2 text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300 shadow-lg backdrop-blur-sm">
                ⏳ Challenge Pending
            </span>
        );
    };

    const handleChallengeClick = (issue) => {
        setSelectedIssue(issue);
        setIsChallengeModalOpen(true);
    };

    const handleChallengeModalClose = () => {
        setIsChallengeModalOpen(false);
        setSelectedIssue(null);
        // Refresh issues to show updated challenge status
        fetchMyIssues();
    };

    // Check if issue has admin decision and is challengeable (no existing challenge)
    const isChallengeable = (issue) => {
        return issue && (
            issue.status === 'Resolved' || issue.reportedAsFake === true
        ) && issue.adminDecisionTimestamp && !issue.hasChallenges; // Hide if challenge already submitted
    };

    const getAdminDecisionText = (issue) => {
        if (issue.status === 'Resolved') {
            return 'Admin marked this as resolved';
        } else if (issue.reportedAsFake) {
            return 'Admin marked this as fake/spam';
        }
        return 'Admin made a decision on this issue';
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
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-x-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
            </div>

            <Sidebar />
                <div className="relative z-10 flex-1 md:ml-64 flex items-center justify-center pt-16 md:pt-0">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-primary-500 to-accent-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                            <Loader className="h-10 w-10 text-white animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">Loading Your Issues</h2>
                        <p className="text-gray-600 text-lg">Gathering your reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-x-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
            </div>

            <Sidebar />

            <div className="relative z-10 flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0 overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 animate-fade-in">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-4 rounded-2xl shadow-lg">
                                <AlertCircle className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 bg-clip-text text-transparent tracking-tight">
                                    My Issues
                                </h1>
                                <p className="text-gray-600 text-xl font-medium">Track and manage all your reported issues</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-8 p-6 rounded-2xl border-2 bg-gradient-to-r from-red-50 to-red-100/50 border-red-300 animate-slide-up">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 rounded-xl bg-red-500">
                                    <AlertCircle className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-2 text-red-900">Error Loading Issues</h3>
                                    <p className="text-sm leading-relaxed text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="mb-6 grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-3">
                        {['all', 'Pending', 'In Progress', 'Resolved'].map((status) => {
                            const count = status !== 'all' ? issues.filter(i => i.status === status).length : issues.length;
                            const isActive = filter === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                        isActive
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                                    }`}
                                >
                                    <span>{status === 'all' ? 'All Issues' : status}</span>
                                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                                        isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Issues List */}
                    {filteredIssues.length === 0 ? (
                        <div className="card-gradient text-center py-20 animate-scale-in">
                            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <AlertCircle className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-700 mb-4">
                                {filter === 'all' ? 'No issues reported yet' : `No ${filter.toLowerCase()} issues`}
                            </h3>
                            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                                {filter === 'all'
                                    ? 'Start making a difference by reporting your first issue'
                                    : 'Try selecting a different filter to see other issues'}
                            </p>
                            {filter === 'all' && (
                                <Link to="/report-issue" className="btn-primary inline-block text-lg">
                                    Report Your First Issue
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            {filteredIssues.map((issue, index) => (
                                <div key={issue._id}>
                                    <Link to={`/issue/${issue._id}`} className="block group">
                                        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                                            
                                            {/* Mobile: image on top full-width. Desktop: side-by-side */}
                                            <div className="flex flex-col md:flex-row">
                                                {issue.imageUrl && (
                                                    <div className="relative overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={issue.imageUrl}
                                                            alt={issue.title}
                                                            className="w-full h-44 md:w-40 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        {/* Priority badge overlaid on image */}
                                                        <span className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(issue.priority)}`}>
                                                            {issue.priority}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex-1 p-4 min-w-0">
                                                    {/* Title + status */}
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors flex-1 min-w-0">
                                                            {issue.title}
                                                        </h3>
                                                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border flex-shrink-0 ${getStatusColor(issue.status)}`}>
                                                            {issue.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">
                                                        {issue.description}
                                                    </p>

                                                    {/* Metadata row */}
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5 text-primary-400" />
                                                            {formatDate(issue.createdAt)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <TrendingUp className="h-3.5 w-3.5 text-primary-400" />
                                                            Score: {issue.priorityScore}
                                                        </span>
                                                        {(issue.upvoteCount || 0) > 0 && (
                                                            <span className="flex items-center gap-1 text-primary-600 font-semibold">
                                                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                {issue.upvoteCount} votes
                                                            </span>
                                                        )}
                                                        {getChallengeStatusBadge(issue)}
                                                    </div>

                                                    {/* Challenge Status or Challenge Notice */}
                                                    {issue.hasChallenges ? (
                                                        <div className={`mt-2 p-3 rounded-xl border text-xs font-semibold ${
                                                            issue.challengeResolved
                                                                ? issue.challengeDecision === 'admin_wrong'
                                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                                    : 'bg-red-50 border-red-200 text-red-700'
                                                                : 'bg-blue-50 border-blue-200 text-blue-700'
                                                        }`}>
                                                            {issue.challengeResolved
                                                                ? issue.challengeDecision === 'admin_wrong'
                                                                    ? '✅ Challenge won — decision overturned'
                                                                    : '❌ Challenge reviewed — decision upheld'
                                                                : '⏳ Challenge submitted — awaiting review'}
                                                        </div>
                                                    ) : isChallengeable(issue) && (
                                                        <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-2">
                                                            <span className="text-xs text-orange-700 font-medium flex-1">
                                                                {getAdminDecisionText(issue)}
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleChallengeClick(issue);
                                                                }}
                                                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-shrink-0"
                                                            >
                                                                Challenge
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Challenge Modal */}
                    <ChallengeModal
                        isOpen={isChallengeModalOpen}
                        onClose={handleChallengeModalClose}
                        issue={selectedIssue}
                    />
                </div>
            </div>
        </div>
    );
};

export default MyIssues;






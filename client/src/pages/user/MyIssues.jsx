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
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
                </div>

                <Sidebar />
                <div className="relative z-10 flex-1 ml-64 flex items-center justify-center">
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
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
            </div>

            <Sidebar />

            <div className="relative z-10 flex-1 ml-64 p-8">
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
                    <div className="mb-8 flex flex-wrap gap-3 animate-slide-up">
                        {['all', 'Pending', 'In Progress', 'Resolved'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                                    filter === status
                                        ? 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white shadow-2xl shadow-primary-500/30 border-2 border-primary-400'
                                        : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border-2 border-gray-200 hover:border-primary-300 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {status === 'all' ? 'All Issues' : status}
                                {status !== 'all' && (
                                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                        filter === status
                                            ? 'bg-white/20 text-white'
                                            : 'bg-primary-100 text-primary-700'
                                    }`}>
                                        {issues.filter(i => i.status === status).length}
                                    </span>
                                )}
                            </button>
                        ))}
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
                        <div className="space-y-6 animate-fade-in">
                            {filteredIssues.map((issue, index) => (
                                <div key={issue._id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                                    <Link to={`/issue/${issue._id}`} className="block group">
                                        <div className="card-gradient hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] group-hover:border-primary-300">
                                            <div className="flex items-start space-x-6">
                                                {issue.imageUrl && (
                                                    <div className="relative overflow-hidden rounded-2xl flex-shrink-0 shadow-lg">
                                                        <img
                                                            src={issue.imageUrl}
                                                            alt={issue.title}
                                                            className="w-40 h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h3 className="text-2xl font-bold text-gray-900 line-clamp-1 group-hover:text-primary-700 transition-colors duration-300">
                                                            {issue.title}
                                                        </h3>
                                                        <div className="flex items-center space-x-3 ml-6 flex-wrap">
                                                            <span className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 shadow-lg backdrop-blur-sm ${getPriorityColor(issue.priority)}`}>
                                                                {issue.priority}
                                                            </span>
                                                            <span className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 shadow-lg backdrop-blur-sm ${getStatusColor(issue.status)}`}>
                                                                {issue.status}
                                                            </span>
                                                            {getChallengeStatusBadge(issue)}
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-600 mb-6 line-clamp-2 text-lg leading-relaxed">
                                                        {issue.description}
                                                    </p>

                                                    <div className="flex items-center space-x-8 text-sm text-gray-500 mb-4">
                                                        <div className="flex items-center bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl">
                                                            <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                                                            <span className="font-medium">{formatDate(issue.createdAt)}</span>
                                                        </div>
                                                        <div className="flex items-center bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl">
                                                            <MapPin className="h-4 w-4 mr-2 text-primary-500" />
                                                            <span className="font-medium">{issue.location?.lat?.toFixed(4)}, {issue.location?.lng?.toFixed(4)}</span>
                                                        </div>
                                                        <div className="flex items-center bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl">
                                                            <TrendingUp className="h-4 w-4 mr-2 text-primary-500" />
                                                            <span className="font-medium">Score: {issue.priorityScore}</span>
                                                        </div>
                                                    </div>

                                                    {/* Challenge Status or Challenge Notice */}
                                                    {issue.hasChallenges ? (
                                                        <div className={`p-4 rounded-2xl border-2 backdrop-blur-sm ${
                                                            issue.challengeResolved
                                                                ? issue.challengeDecision === 'admin_wrong'
                                                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                                                    : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                                                                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                                                        }`}>
                                                            <div className="flex items-center">
                                                                {issue.challengeResolved ? (
                                                                    issue.challengeDecision === 'admin_wrong' ? (
                                                                        <>
                                                                            <div className="bg-green-500 p-2 rounded-xl mr-3">
                                                                                <CheckCircle className="h-5 w-5 text-white" />
                                                                            </div>
                                                                            <span className="text-sm text-green-700 font-bold">
                                                                                Challenge successful! Super admin overturned the decision. Trust score +5.
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <div className="bg-red-500 p-2 rounded-xl mr-3">
                                                                                <AlertCircle className="h-5 w-5 text-white" />
                                                                            </div>
                                                                            <span className="text-sm text-red-700 font-bold">
                                                                                Challenge reviewed. Super admin upheld the original decision. Trust score -50.
                                                                            </span>
                                                                        </>
                                                                    )
                                                                ) : (
                                                                    <>
                                                                        <div className="bg-blue-500 p-2 rounded-xl mr-3">
                                                                            <CheckCircle className="h-5 w-5 text-white" />
                                                                        </div>
                                                                        <span className="text-sm text-blue-700 font-bold">
                                                                            Challenge submitted and awaiting super admin review
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : isChallengeable(issue) && (
                                                        <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl backdrop-blur-sm">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center">
                                                                    <div className="bg-orange-500 p-2 rounded-xl mr-3">
                                                                        <AlertCircle className="h-5 w-5 text-white" />
                                                                    </div>
                                                                    <span className="text-sm text-gray-700 font-medium">
                                                                        {getAdminDecisionText(issue)}. You can challenge this decision.
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleChallengeClick(issue);
                                                                    }}
                                                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                                                                >
                                                                    Challenge
                                                                </button>
                                                            </div>
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

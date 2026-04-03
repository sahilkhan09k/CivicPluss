import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, MapPin, Calendar, TrendingUp, ArrowLeft, User, CheckCircle, XCircle, ArrowUp, ThumbsUp } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ChallengeButton from '../../components/ChallengeButton';
import ChallengeModal from '../../components/ChallengeModal';

const IssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [issue, setIssue] = useState(null);
    const [challengeData, setChallengeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
    const [upvoting, setUpvoting] = useState(false);

    useEffect(() => {
        fetchIssueDetail();
    }, [id]);

    // Show toast notification for recent challenge decisions
    useEffect(() => {
        if (challengeData && challengeData.status === 'reviewed') {
            const reviewDate = new Date(challengeData.reviewedAt);
            const now = new Date();
            const hoursSinceReview = (now - reviewDate) / (1000 * 60 * 60);
            
            // Show toast if decision was made within last 24 hours
            if (hoursSinceReview <= 24) {
                const message = challengeData.reviewDecision === 'admin_wrong' 
                    ? '🎉 Your challenge was successful! The issue has been restored.'
                    : '📋 Your challenge has been reviewed. The original decision was upheld.';
                
                // Refresh user data to show updated trust score
                refreshUser().then(() => {
                    console.log('User data refreshed after challenge decision');
                });
                
                // Simple toast notification (you could replace this with a proper toast library)
                setTimeout(() => {
                    if (window.confirm(message + '\n\nWould you like to see the details?')) {
                        // Scroll to the notification section
                        document.querySelector('[data-challenge-notification]')?.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }
                }, 1000);
            }
        }
    }, [challengeData, refreshUser]);

    const fetchIssueDetail = async () => {
        try {
            const response = await apiService.getIssueById(id);
            setIssue(response.data);
            
            // If issue has challenges, fetch challenge details for the current user
            if (response.data.hasChallenges && user?._id) {
                try {
                    const challengeResponse = await apiService.getUserChallenges();
                    const userChallenges = challengeResponse.data?.challenges || [];
                    const issueChallenge = userChallenges.find(c => c.issueId?._id === id);
                    setChallengeData(issueChallenge);
                } catch (challengeErr) {
                    console.error('Error fetching challenge data:', challengeErr);
                    // Don't fail the whole component if challenge fetch fails
                }
            }
        } catch (err) {
            console.error('Error fetching issue:', err);
            setError('Failed to load issue details');
        } finally {
            setLoading(false);
        }
    };

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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleChallengeClick = () => {
        setIsChallengeModalOpen(true);
    };

    const handleUpvote = async () => {
        if (upvoting || !issue) return;
        // Cannot upvote own issue
        if (issue.reportedBy?._id === user?._id || issue.reportedBy === user?._id) return;
        setUpvoting(true);
        try {
            const res = await apiService.toggleUpvote(issue._id);
            setIssue(prev => ({
                ...prev,
                upvoteCount: res.data.upvoteCount,
                userUpvoted: res.data.upvoted
            }));
        } catch (err) {
            console.error('Upvote error:', err);
        } finally {
            setUpvoting(false);
        }
    };

    const handleChallengeModalClose = () => {
        setIsChallengeModalOpen(false);
        // Refresh issue data to show updated challenge status
        fetchIssueDetail();
        // Refresh user data to show updated trust score if challenge was processed
        refreshUser().then(() => {
            console.log('User data refreshed after challenge modal close');
        });
    };

    // Check if current user is the issue owner
    const isIssueOwner = user && issue && (
        issue.reportedBy?._id === user._id || issue.reportedBy === user._id
    );

    // Check if issue has admin decision (resolved or marked as fake)
    const hasAdminDecision = issue && (
        issue.status === 'Resolved' || issue.reportedAsFake === true
    ) && issue.adminDecisionTimestamp;

    const getChallengeStatusBadge = (issue) => {
        // Check if issue has challenges
        if (!issue || !issue.hasChallenges) return null;

        // Check if challenge has been resolved (new field from backend)
        if (issue.challengeResolved) {
            if (issue.challengeDecision === 'admin_wrong') {
                return (
                    <span className="px-4 py-2 rounded-xl text-sm font-semibold border text-green-700 bg-green-100 border-green-200">
                        ✅ Challenge Won
                    </span>
                );
            } else if (issue.challengeDecision === 'admin_correct') {
                return (
                    <span className="px-4 py-2 rounded-xl text-sm font-semibold border text-red-700 bg-red-100 border-red-200">
                        ❌ Challenge Lost
                    </span>
                );
            }
        }

        // If we have detailed challenge data from API, show specific status
        if (challengeData) {
            const { status, reviewDecision, reviewedAt, similarityScore } = challengeData;
            
            if (status === 'reviewed') {
                if (reviewDecision === 'admin_wrong') {
                    return (
                        <span className="px-4 py-2 rounded-xl text-sm font-semibold border text-green-700 bg-green-100 border-green-200">
                            ✅ Challenge Won
                        </span>
                    );
                } else if (reviewDecision === 'admin_correct') {
                    return (
                        <span className="px-4 py-2 rounded-xl text-sm font-semibold border text-red-700 bg-red-100 border-red-200">
                            ❌ Challenge Lost
                        </span>
                    );
                }
            } else if (status === 'accepted') {
                return (
                    <span className="px-4 py-2 rounded-xl text-sm font-semibold border text-blue-700 bg-blue-100 border-blue-200">
                        ⏳ Challenge Under Review
                    </span>
                );
            } else if (status === 'rejected') {
                return (
                    <span className="px-4 py-2 rounded-xl text-sm font-semibold border text-orange-700 bg-orange-100 border-orange-200">
                        ⚠️ Challenge Rejected
                    </span>
                );
            }
        }

        // Fallback for when we don't have detailed challenge data
        return (
            <span className="px-4 py-2 rounded-xl text-sm font-semibold border text-purple-700 bg-purple-100 border-purple-200">
                ⚖️ Challenge Submitted
            </span>
        );
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
                <div className="relative z-10 flex-1 md:ml-64 flex items-center justify-center pt-16 md:pt-0">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-primary-500 to-accent-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                            <Loader className="h-10 w-10 text-white animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">Loading Issue Details</h2>
                        <p className="text-gray-600 text-lg">Gathering information...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
                </div>

                <Sidebar />
                <div className="relative z-10 flex-1 md:ml-64 flex items-center justify-center pt-16 md:pt-0">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-red-500 to-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <AlertCircle className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Issue Not Found</h2>
                        <p className="text-gray-600 text-lg mb-8">{error || 'The issue you are looking for does not exist'}</p>
                        <button onClick={() => navigate('/my-issues')} className="btn-primary">
                            Back to My Issues
                        </button>
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

            <div className="relative z-10 flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center text-gray-600 hover:text-primary-600 transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    <span className="font-medium">Back</span>
                </button>

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="card-gradient mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getPriorityColor(issue.priority)}`}>
                                    {issue.priority} Priority
                                </span>
                                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(issue.status)}`}>
                                    {issue.status}
                                </span>
                                <div className="flex-shrink-0">
                                    {getChallengeStatusBadge(issue)}
                                </div>
                            </div>
                        </div>
                            
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Reported by {issue.reportedBy?.name || 'Unknown'}
                            </div>
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDate(issue.createdAt)}
                            </div>
                            <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Score: {issue.priorityScore}/100
                            </div>
                            {isIssueOwner && (
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 mr-2">Your Trust Score:</span>
                                    <span className={`text-sm font-semibold px-2 py-1 rounded ${
                                        (user?.trustScore ?? 100) >= 75 ? 'text-green-700 bg-green-100' :
                                        (user?.trustScore ?? 100) >= 50 ? 'text-yellow-700 bg-yellow-100' :
                                        (user?.trustScore ?? 100) >= 25 ? 'text-orange-700 bg-orange-100' :
                                        'text-red-700 bg-red-100'
                                    }`}>
                                        {user?.trustScore ?? 100}/100
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Upvote Section */}
                        {!isIssueOwner && (
                            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-4">
                                <button
                                    onClick={handleUpvote}
                                    disabled={upvoting}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                                        issue.userUpvoted ||
                                        issue.upvotes?.some(id => id === user?._id || id?._id === user?._id)
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-700 border-2 border-gray-200 hover:border-primary-300'
                                    } ${upvoting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {upvoting ? (
                                        <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ArrowUp className="h-4 w-4" />
                                    )}
                                    {issue.userUpvoted ||
                                     issue.upvotes?.some(id => id === user?._id || id?._id === user?._id)
                                        ? 'Upvoted'
                                        : 'Upvote this Issue'}
                                </button>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <ThumbsUp className="h-4 w-4 text-primary-500" />
                                    <span className="font-bold text-lg text-primary-600">
                                        {issue.upvoteCount || 0}
                                    </span>
                                    <span className="text-sm">
                                        {(issue.upvoteCount || 0) === 1 ? 'community vote' : 'community votes'}
                                    </span>
                                    {(issue.upvoteCount || 0) >= 5 && (
                                        <span className="ml-1 text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                                            🔥 Trending
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                        {isIssueOwner && (
                            <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-2 text-gray-600">
                                <ThumbsUp className="h-4 w-4 text-primary-500" />
                                <span className="font-bold text-lg text-primary-600">{issue.upvoteCount || 0}</span>
                                <span className="text-sm">community {(issue.upvoteCount || 0) === 1 ? 'vote' : 'votes'} on your issue</span>
                                {(issue.upvoteCount || 0) >= 5 && (
                                    <span className="ml-1 text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
                                        🔥 Trending
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Challenge Button - Show only for issue owner with admin decision and challenge not resolved */}
                    {isIssueOwner && hasAdminDecision && !issue.challengeResolved && (
                        <div className="mb-6">
                            <ChallengeButton 
                                issue={issue}
                                onChallengeClick={handleChallengeClick}
                                userHasSubmittedChallenge={issue.hasChallenges}
                            />
                        </div>
                    )}

                    {/* Image */}
                    {issue.imageUrl && (
                        <div className="card-gradient mb-6">
                            <img
                                src={issue.imageUrl}
                                alt={issue.title}
                                className="w-full h-96 object-cover rounded-xl"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div className="card-gradient mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {issue.description}
                        </p>
                    </div>

                    {/* Location */}
                    <div className="card-gradient mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                        <div className="flex items-center text-gray-700">
                            <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                            <span>
                                Latitude: {issue.location?.lat?.toFixed(6)},
                                Longitude: {issue.location?.lng?.toFixed(6)}
                            </span>
                        </div>
                        <a
                            href={`https://www.google.com/maps?q=${issue.location?.lat},${issue.location?.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-block btn-secondary"
                        >
                            View on Google Maps
                        </a>
                    </div>

                    {/* Priority Breakdown */}
                    {issue.scoreBreakdown && (
                        <div className="card-gradient">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">AI Priority Analysis</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Severity</p>
                                    <p className="text-2xl font-bold text-primary-600">
                                        {issue.scoreBreakdown.severity || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Frequency</p>
                                    <p className="text-2xl font-bold text-primary-600">
                                        {issue.scoreBreakdown.frequency || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Location Impact</p>
                                    <p className="text-2xl font-bold text-primary-600">
                                        {issue.scoreBreakdown.locationImpact || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Time Pending</p>
                                    <p className="text-2xl font-bold text-primary-600">
                                        {issue.scoreBreakdown.timePending || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">AI Adjustment</p>
                                    <p className="text-2xl font-bold text-primary-600">
                                        +{issue.scoreBreakdown.aiAdjustment || 0}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-4 rounded-xl text-white">
                                    <p className="text-sm mb-1">Final Score</p>
                                    <p className="text-2xl font-bold">
                                        {issue.priorityScore}/100
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Dimensions Analysis */}
                    {issue.dimensions && Object.keys(issue.dimensions).length > 0 && (
                        <div className="card-gradient">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">📏 AI Dimensions Analysis</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Pothole dimensions */}
                                {issue.dimensions.width && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Width</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {issue.dimensions.width} cm
                                        </p>
                                    </div>
                                )}
                                {issue.dimensions.depth && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Depth</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {issue.dimensions.depth} cm
                                        </p>
                                    </div>
                                )}
                                
                                {/* Area (for various issue types) */}
                                {issue.dimensions.area && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">
                                            {issue.category === 'Road' ? 'Affected Area' : 'Area Covered'}
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {issue.dimensions.area} {issue.dimensions.area > 100 ? 'sq m' : 'sq cm'}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Volume (for garbage) */}
                                {issue.dimensions.volume && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Volume</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {issue.dimensions.volume} m³
                                        </p>
                                    </div>
                                )}
                                
                                {/* Length (for road damage) */}
                                {issue.dimensions.length && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Length</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {issue.dimensions.length} m
                                        </p>
                                    </div>
                                )}
                                
                                {/* Flow Rate (for water leaks) */}
                                {issue.dimensions.flowRate && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Flow Rate</p>
                                        <p className="text-lg font-bold text-cyan-600 capitalize">
                                            {issue.dimensions.flowRate}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Affected Area (for water leaks, etc.) */}
                                {issue.dimensions.affectedArea && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Affected Area</p>
                                        <p className="text-2xl font-bold text-indigo-600">
                                            {issue.dimensions.affectedArea} sq m
                                        </p>
                                    </div>
                                )}
                                
                                {/* Height (for streetlights, etc.) */}
                                {issue.dimensions.height && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Height</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {issue.dimensions.height} m
                                        </p>
                                    </div>
                                )}
                                
                                {/* Affected Radius */}
                                {issue.dimensions.affectedRadius && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Affected Radius</p>
                                        <p className="text-2xl font-bold text-pink-600">
                                            {issue.dimensions.affectedRadius} m
                                        </p>
                                    </div>
                                )}
                                
                                {/* Estimated Size (fallback) */}
                                {issue.dimensions.estimatedSize && (
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Estimated Size</p>
                                        <p className="text-lg font-bold text-gray-600 capitalize">
                                            {issue.dimensions.estimatedSize}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Severity explanation based on dimensions */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">💡 AI Analysis:</span> 
                                    {issue.category === 'Road' && issue.dimensions.width && issue.dimensions.depth && 
                                        ` This pothole is ${issue.dimensions.width > 30 ? 'large' : 'small'} (${issue.dimensions.width}cm wide) and ${issue.dimensions.depth > 10 ? 'deep' : 'shallow'} (${issue.dimensions.depth}cm deep), contributing to its ${issue.priority.toLowerCase()} priority rating.`
                                    }
                                    {issue.category === 'Waste' && issue.dimensions.area && 
                                        ` This garbage covers ${issue.dimensions.area} ${issue.dimensions.area > 100 ? 'square meters' : 'square cm'}, ${issue.dimensions.area > 10 ? 'requiring immediate attention' : 'manageable with regular cleanup'}.`
                                    }
                                    {issue.category === 'Water' && issue.dimensions.flowRate && 
                                        ` This water leak has ${issue.dimensions.flowRate} flow rate${issue.dimensions.affectedArea ? ` affecting ${issue.dimensions.affectedArea} sq m` : ''}.`
                                    }
                                    {!issue.category.match(/Road|Waste|Water/) && issue.dimensions.estimatedSize &&
                                        ` This ${issue.category.toLowerCase()} issue is estimated to be ${issue.dimensions.estimatedSize} in size.`
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Challenge Modal */}
                <ChallengeModal
                    isOpen={isChallengeModalOpen}
                    onClose={handleChallengeModalClose}
                    issue={issue}
                />
            </div>
        </div>
    );
};

export default IssueDetail;






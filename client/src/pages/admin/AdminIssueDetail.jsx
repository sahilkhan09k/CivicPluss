import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, MapPin, Calendar, TrendingUp, ArrowLeft, User, CheckCircle, XCircle, Clock, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminIssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [markingFake, setMarkingFake] = useState(false);

    useEffect(() => {
        fetchIssueDetail();
    }, [id]);

    const fetchIssueDetail = async () => {
        try {
            const response = await apiService.getIssueById(id);
            setIssue(response.data);
        } catch (err) {
            console.error('Error fetching issue:', err);
            setError('Failed to load issue details');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsFake = async () => {
        const confirmed = window.confirm('Are you sure you want to mark this issue as fake/spam?\n\nThis will schedule a trust score penalty (-25 points) in 24 hours, giving the user time to challenge this decision.');
        if (!confirmed) return;

        try {
            setMarkingFake(true);
            await apiService.reportIssueAsFake(id);
            alert('Issue marked as fake/spam successfully! Trust score penalty will be applied in 24 hours if not challenged.');
            fetchIssueDetail(); // Refresh issue data
        } catch (err) {
            console.error('Error marking issue as fake:', err);
            alert('Failed to mark issue as fake. Please try again.');
        } finally {
            setMarkingFake(false);
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

    // Check if current user can take action on this issue
    const canTakeAction = user && (
        user.role === 'admin' || user.role === 'super_admin'
    ) && issue && issue.status === 'Pending' && !issue.reportedAsFake;

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isAdmin={true} />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading issue details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !issue) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isAdmin={true} />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Not Found</h2>
                        <p className="text-gray-600 mb-6">{error || 'The issue you are looking for does not exist'}</p>
                        <button onClick={() => navigate('/admin/issue-intelligence')} className="btn-primary">
                            Back to Issue Intelligence
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isAdmin={true} />

            <div className="flex-1 ml-64 p-8">
                <button
                    onClick={() => navigate('/admin/issue-intelligence')}
                    className="mb-6 flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Issue Intelligence
                </button>

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                                    {issue.title}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                                        <User className="h-4 w-4 mr-2 text-primary-600" />
                                        <span className="font-medium">Reported by {issue.reportedBy?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                                        <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                                        <span>{formatDate(issue.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                                        <TrendingUp className="h-4 w-4 mr-2 text-primary-600" />
                                        <span className="font-medium">Score: {issue.priorityScore}/100</span>
                                    </div>
                                    {issue.city && (
                                        <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                                            <MapPin className="h-4 w-4 mr-2 text-primary-600" />
                                            <span>{issue.city}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 ml-6">
                                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 shadow-sm ${getPriorityColor(issue.priority)}`}>
                                    {issue.priority} Priority
                                </span>
                                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 shadow-sm ${getStatusColor(issue.status)}`}>
                                    {issue.status}
                                </span>
                                {issue.reportedAsFake && (
                                    <span className="px-4 py-2 rounded-xl text-sm font-semibold border-2 text-red-700 bg-gradient-to-r from-red-100 to-pink-100 border-red-300 shadow-sm">
                                        ⚠️ Marked as Fake
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {canTakeAction && (
                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
                            <div className="flex items-center mb-6">
                                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        Admin Actions
                                    </h2>
                                    <p className="text-gray-600 text-sm">Take action to resolve or manage this issue</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Resolve Issue */}
                                <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                                            <CheckCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-700 ml-3">Mark as Resolved</h3>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        Mark this issue as resolved and update its status. You'll be redirected to the manage issues page to complete the process.
                                    </p>
                                    
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-green-800 mb-1">Resolution Process</h4>
                                                <p className="text-xs text-green-700">
                                                    You'll be taken to the manage issues page where you can update the status and add any additional details about the resolution.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/admin/manage')}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 
                                                 hover:from-green-700 hover:to-emerald-700 
                                                 text-white px-6 py-4 rounded-xl font-semibold 
                                                 flex items-center justify-center
                                                 shadow-lg hover:shadow-xl
                                                 transform hover:scale-105
                                                 transition-all duration-200"
                                    >
                                        <CheckCircle className="h-5 w-5 mr-3" />
                                        Go to Manage Issues
                                    </button>
                                </div>

                                {/* Mark as Fake */}
                                <div className="bg-white rounded-xl shadow-lg border border-red-100 p-6 hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-lg">
                                            <XCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-red-700 ml-3">Mark as Fake/Spam</h3>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        Mark this issue as fake or spam if it's not legitimate or violates community guidelines.
                                    </p>

                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start">
                                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-red-800 mb-1">Warning</h4>
                                                <p className="text-xs text-red-700">
                                                    This action will permanently mark the issue as fake and cannot be undone. 
                                                    The user's trust score will be reduced by 25 points after 24 hours (allowing time to challenge).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleMarkAsFake}
                                        disabled={markingFake}
                                        className="w-full bg-gradient-to-r from-red-600 to-pink-600 
                                                 hover:from-red-700 hover:to-pink-700 
                                                 disabled:from-gray-400 disabled:to-gray-500
                                                 text-white px-6 py-4 rounded-xl font-semibold 
                                                 flex items-center justify-center
                                                 shadow-lg hover:shadow-xl
                                                 transform hover:scale-105 disabled:hover:scale-100
                                                 transition-all duration-200"
                                    >
                                        {markingFake ? (
                                            <>
                                                <Loader className="h-5 w-5 mr-3 animate-spin" />
                                                Marking as Fake...
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-5 w-5 mr-3" />
                                                Mark as Fake/Spam
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Issue already resolved or marked as fake */}
                    {!canTakeAction && issue.status !== 'Pending' && (
                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
                            <div className="flex items-center space-x-4">
                                {issue.status === 'Resolved' ? (
                                    <>
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-xl shadow-lg">
                                            <CheckCircle className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-2">
                                                Issue Successfully Resolved
                                            </h3>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <p className="text-green-800 font-medium mb-1">
                                                    ✅ Resolved on {issue.resolvedAt ? formatDate(issue.resolvedAt) : 'Unknown date'}
                                                </p>
                                                {issue.resolvedBy?.name && (
                                                    <p className="text-green-700 text-sm">
                                                        👤 Resolved by: <span className="font-semibold">{issue.resolvedBy.name}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : issue.reportedAsFake ? (
                                    <>
                                        <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-xl shadow-lg">
                                            <XCircle className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-pink-600 bg-clip-text text-transparent mb-2">
                                                Marked as Fake/Spam
                                            </h3>
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <p className="text-red-800 font-medium mb-1">
                                                    ⚠️ Marked as fake on {issue.reportedAsFakeAt ? formatDate(issue.reportedAsFakeAt) : 'Unknown date'}
                                                </p>
                                                {issue.reportedAsFakeBy?.name && (
                                                    <p className="text-red-700 text-sm">
                                                        👤 Marked by: <span className="font-semibold">{issue.reportedAsFakeBy.name}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-xl shadow-lg">
                                            <Clock className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-700 to-orange-600 bg-clip-text text-transparent mb-2">
                                                Issue In Progress
                                            </h3>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                <p className="text-yellow-800 font-medium">
                                                    🔄 This issue is currently being worked on by the admin team
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Issue Image */}
                    {issue.imageUrl && (
                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
                            <div className="flex items-center mb-6">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl shadow-lg">
                                    <ImageIcon className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ml-4">
                                    Issue Photo
                                </h2>
                            </div>
                            <div className="relative overflow-hidden rounded-2xl shadow-lg">
                                <img
                                    src={issue.imageUrl}
                                    alt={issue.title}
                                    className="w-full h-96 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                        </div>
                    )}

                    {/* Resolution Image */}
                    {issue.resolutionImageUrl && (
                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
                            <div className="flex items-center mb-6">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ml-4">
                                    Resolution Photo
                                </h2>
                            </div>
                            <div className="relative overflow-hidden rounded-2xl shadow-lg">
                                <img
                                    src={issue.resolutionImageUrl}
                                    alt="Resolution"
                                    className="w-full h-96 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                    ✅ Resolved
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-xl shadow-lg">
                                <AlertCircle className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ml-4">
                                Issue Description
                            </h2>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                                {issue.description}
                            </p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-8 mb-6">
                        <div className="flex items-center mb-6">
                            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl shadow-lg">
                                <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ml-4">
                                Location Details
                            </h2>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center text-gray-700 mb-4">
                                <MapPin className="h-5 w-5 mr-3 text-primary-600" />
                                <span className="font-mono text-lg">
                                    {issue.location?.lat?.toFixed(6)}, {issue.location?.lng?.toFixed(6)}
                                </span>
                            </div>
                            <a
                                href={`https://www.google.com/maps?q=${issue.location?.lat},${issue.location?.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 
                                         hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 
                                         rounded-xl font-semibold shadow-lg hover:shadow-xl
                                         transform hover:scale-105 transition-all duration-200"
                            >
                                <MapPin className="h-5 w-5 mr-2" />
                                View on Google Maps
                            </a>
                        </div>
                    </div>

                    {/* Priority Breakdown */}
                    {issue.scoreBreakdown && (
                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-8">
                            <div className="flex items-center mb-8">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl shadow-lg">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ml-4">
                                    AI Priority Analysis
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Severity</p>
                                    </div>
                                    <p className="text-3xl font-bold text-red-600">
                                        {issue.scoreBreakdown.severity || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Frequency</p>
                                    </div>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {issue.scoreBreakdown.frequency || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location Impact</p>
                                    </div>
                                    <p className="text-3xl font-bold text-yellow-600">
                                        {issue.scoreBreakdown.locationImpact || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Time Pending</p>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {issue.scoreBreakdown.timePending || 0}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">AI Adjustment</p>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600">
                                        +{issue.scoreBreakdown.aiAdjustment || 0}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-6 rounded-2xl text-white shadow-xl hover:shadow-2xl transition-shadow transform hover:scale-105 duration-200">
                                    <div className="flex items-center mb-3">
                                        <div className="w-3 h-3 bg-white rounded-full mr-2"></div>
                                        <p className="text-sm font-semibold uppercase tracking-wide opacity-90">Final Score</p>
                                    </div>
                                    <p className="text-4xl font-bold">
                                        {issue.priorityScore}/100
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminIssueDetail;
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
            <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
                <Sidebar isAdmin={true} />
                <div className="flex-1 md:ml-64 min-w-0 flex items-center justify-center pt-16 md:pt-0">
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
            <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
                <Sidebar isAdmin={true} />
                <div className="flex-1 md:ml-64 min-w-0 flex items-center justify-center pt-16 md:pt-0">
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
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
            <Sidebar isAdmin={true} />

            <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0 overflow-x-hidden">
                <button
                    onClick={() => navigate('/admin/issue-intelligence')}
                    className="mb-6 flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Issue Intelligence
                </button>

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
                        {/* Title + badges row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <h1 className="text-xl md:text-3xl font-bold text-gray-900 break-words flex-1 min-w-0">
                                {issue.title}
                            </h1>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(issue.priority)}`}>
                                    {issue.priority} Priority
                                </span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(issue.status)}`}>
                                    {issue.status}
                                </span>
                                {issue.reportedAsFake && (
                                    <span className="px-3 py-1 rounded-lg text-xs font-bold border text-red-700 bg-red-100 border-red-200">
                                        ⚠️ Fake
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Metadata — inline compact row */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                <span className="font-medium">{issue.reportedBy?.name || 'Unknown'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                {formatDate(issue.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                Score: <span className="font-semibold text-primary-600">{issue.priorityScore}/100</span>
                            </span>
                            {issue.city && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                    {issue.city}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Admin Actions */}
                    {canTakeAction && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary-600 p-2 rounded-xl flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Admin Actions</h2>
                                    <p className="text-xs text-gray-500">Take action to resolve or manage this issue</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Resolve Issue */}
                                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-green-500 p-1.5 rounded-lg flex-shrink-0">
                                            <CheckCircle className="h-4 w-4 text-white" />
                                        </div>
                                        <h3 className="font-bold text-green-700 text-sm">Mark as Resolved</h3>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                        You'll be redirected to the manage issues page to complete the resolution process.
                                    </p>
                                    <button
                                        onClick={() => navigate('/admin/manage')}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Go to Manage Issues
                                    </button>
                                </div>

                                {/* Mark as Fake */}
                                <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="bg-red-500 p-1.5 rounded-lg flex-shrink-0">
                                            <XCircle className="h-4 w-4 text-white" />
                                        </div>
                                        <h3 className="font-bold text-red-700 text-sm">Mark as Fake/Spam</h3>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                        Trust score penalty (-25 pts) applied after 24 hours, giving user time to challenge.
                                    </p>
                                    <button
                                        onClick={handleMarkAsFake}
                                        disabled={markingFake}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {markingFake ? (
                                            <><Loader className="h-4 w-4 animate-spin" /> Marking...</>
                                        ) : (
                                            <><XCircle className="h-4 w-4" /> Mark as Fake/Spam</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Issue already resolved or marked as fake */}
                    {!canTakeAction && issue.status !== 'Pending' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
                            <div className="flex items-center gap-3">
                                {issue.status === 'Resolved' ? (
                                    <>
                                        <div className="bg-green-500 p-2.5 rounded-xl flex-shrink-0">
                                            <CheckCircle className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-green-700 mb-1">Issue Resolved</h3>
                                            <p className="text-xs text-green-600">
                                                ✅ {issue.resolvedAt ? formatDate(issue.resolvedAt) : 'Unknown date'}
                                                {issue.resolvedBy?.name && ` · By ${issue.resolvedBy.name}`}
                                            </p>
                                        </div>
                                    </>
                                ) : issue.reportedAsFake ? (
                                    <>
                                        <div className="bg-red-500 p-2.5 rounded-xl flex-shrink-0">
                                            <XCircle className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-red-700 mb-1">Marked as Fake/Spam</h3>
                                            <p className="text-xs text-red-600">
                                                ⚠️ {issue.reportedAsFakeAt ? formatDate(issue.reportedAsFakeAt) : 'Unknown date'}
                                                {issue.reportedAsFakeBy?.name && ` · By ${issue.reportedAsFakeBy.name}`}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-yellow-500 p-2.5 rounded-xl flex-shrink-0">
                                            <Clock className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-yellow-700 mb-1">In Progress</h3>
                                            <p className="text-xs text-yellow-600">🔄 Being worked on by the admin team</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Issue Image */}
                    {issue.imageUrl && (
                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-4 md:p-8 mb-6">
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
                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-4 md:p-8 mb-6">
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

                    {/* AI Resolution Verification Score */}
                    {issue.resolvedScore && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-200 p-4 md:p-8 mb-6">
                            <div className="flex items-center mb-6">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ml-4">
                                    AI Resolution Verification
                                </h2>
                            </div>
                            <div className="flex items-center space-x-6">
                                <div className="flex-1">
                                    <div className="bg-gray-200 rounded-full h-4 shadow-inner">
                                        <div 
                                            className={`h-4 rounded-full transition-all duration-1000 shadow-lg ${
                                                issue.resolvedScore >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                issue.resolvedScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                'bg-gradient-to-r from-red-400 to-red-600'
                                            }`}
                                            style={{ width: `${issue.resolvedScore}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                                        <span>0%</span>
                                        <span>50%</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-5xl font-bold ${
                                        issue.resolvedScore >= 80 ? 'text-green-600' :
                                        issue.resolvedScore >= 60 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                        {issue.resolvedScore}%
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                        AI Confidence
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-6 p-4 rounded-xl ${
                                issue.resolvedScore >= 80 ? 'bg-green-100 border border-green-200' :
                                issue.resolvedScore >= 60 ? 'bg-yellow-100 border border-yellow-200' :
                                'bg-red-100 border border-red-200'
                            }`}>
                                <p className={`text-sm font-medium ${
                                    issue.resolvedScore >= 80 ? 'text-green-800' :
                                    issue.resolvedScore >= 60 ? 'text-yellow-800' :
                                    'text-red-800'
                                }`}>
                                    {issue.resolvedScore >= 80 ? '✅ Excellent Resolution Verified' :
                                     issue.resolvedScore >= 60 ? '✅ Good Resolution Verified' :
                                     '⚠️ Resolution Quality Needs Improvement'}
                                </p>
                                <p className={`text-xs mt-1 ${
                                    issue.resolvedScore >= 80 ? 'text-green-700' :
                                    issue.resolvedScore >= 60 ? 'text-yellow-700' :
                                    'text-red-700'
                                }`}>
                                    AI analysis compared the original issue photo with the resolution photo to verify the fix quality.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-4 md:p-8 mb-6">
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
                    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-4 md:p-8 mb-6">
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
                        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200 p-4 md:p-8">
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

                    {/* AI Dimensions Analysis */}
                    {issue.dimensions && Object.keys(issue.dimensions).length > 0 && (
                        <div className="bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-8 rounded-3xl border border-gray-200 shadow-xl">
                            <div className="flex items-center mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg">
                                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ml-4">
                                    📏 AI Dimensions Analysis
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Pothole dimensions */}
                                {issue.dimensions.width && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Width</p>
                                        </div>
                                        <p className="text-3xl font-bold text-orange-600">
                                            {issue.dimensions.width} cm
                                        </p>
                                    </div>
                                )}
                                {issue.dimensions.depth && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Depth</p>
                                        </div>
                                        <p className="text-3xl font-bold text-red-600">
                                            {issue.dimensions.depth} cm
                                        </p>
                                    </div>
                                )}
                                
                                {/* Area (for various issue types) */}
                                {issue.dimensions.area && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                                {issue.category === 'Road' ? 'Affected Area' : 'Area Covered'}
                                            </p>
                                        </div>
                                        <p className="text-3xl font-bold text-blue-600">
                                            {issue.dimensions.area} {issue.dimensions.area > 100 ? 'sq m' : 'sq cm'}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Volume (for garbage) */}
                                {issue.dimensions.volume && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Volume</p>
                                        </div>
                                        <p className="text-3xl font-bold text-green-600">
                                            {issue.dimensions.volume} m³
                                        </p>
                                    </div>
                                )}
                                
                                {/* Length (for road damage) */}
                                {issue.dimensions.length && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Length</p>
                                        </div>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {issue.dimensions.length} m
                                        </p>
                                    </div>
                                )}
                                
                                {/* Flow Rate (for water leaks) */}
                                {issue.dimensions.flowRate && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Flow Rate</p>
                                        </div>
                                        <p className="text-2xl font-bold text-cyan-600 capitalize">
                                            {issue.dimensions.flowRate}
                                        </p>
                                    </div>
                                )}
                                
                                {/* Affected Area (for water leaks, etc.) */}
                                {issue.dimensions.affectedArea && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Affected Area</p>
                                        </div>
                                        <p className="text-3xl font-bold text-indigo-600">
                                            {issue.dimensions.affectedArea} sq m
                                        </p>
                                    </div>
                                )}
                                
                                {/* Height (for streetlights, etc.) */}
                                {issue.dimensions.height && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Height</p>
                                        </div>
                                        <p className="text-3xl font-bold text-yellow-600">
                                            {issue.dimensions.height} m
                                        </p>
                                    </div>
                                )}
                                
                                {/* Affected Radius */}
                                {issue.dimensions.affectedRadius && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Affected Radius</p>
                                        </div>
                                        <p className="text-3xl font-bold text-pink-600">
                                            {issue.dimensions.affectedRadius} m
                                        </p>
                                    </div>
                                )}
                                
                                {/* Estimated Size (fallback) */}
                                {issue.dimensions.estimatedSize && (
                                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="flex items-center mb-3">
                                            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Estimated Size</p>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-600 capitalize">
                                            {issue.dimensions.estimatedSize}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Severity explanation based on dimensions */}
                            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                                <p className="text-sm text-blue-800 leading-relaxed">
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
            </div>
        </div>
    );
};

export default AdminIssueDetail;





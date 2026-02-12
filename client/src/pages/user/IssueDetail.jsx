import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, MapPin, Calendar, TrendingUp, ArrowLeft, User } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';

const IssueDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20">
                <Sidebar />
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
            <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20">
                <Sidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Not Found</h2>
                        <p className="text-gray-600 mb-6">{error || 'The issue you are looking for does not exist'}</p>
                        <button onClick={() => navigate('/my-issues')} className="btn-primary">
                            Back to My Issues
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20">
            <Sidebar />

            <div className="flex-1 ml-64 p-8">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                </button>

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="card-gradient mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{issue.title}</h1>
                            <div className="flex items-center space-x-2">
                                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getPriorityColor(issue.priority)}`}>
                                    {issue.priority} Priority
                                </span>
                                <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(issue.status)}`}>
                                    {issue.status}
                                </span>
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
                        </div>
                    </div>

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
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;

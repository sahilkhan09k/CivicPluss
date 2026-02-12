import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Loader2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';

const FeedbackMetrics = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAllIssues();
            setIssues(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const resolvedIssues = issues.filter(i => i.status === 'Resolved');

    const mockFeedback = resolvedIssues.slice(0, 4).map((issue, idx) => ({
        ...issue,
        rating: 5 - idx,
        feedback: idx === 0 ? 'Excellent work! Fixed quickly and professionally.' :
            idx === 1 ? 'Good job, but took a bit longer than expected.' :
                idx === 2 ? 'Fixed but the area still needs cleanup.' :
                    'Perfect! Very responsive team.',
        userName: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams'][idx],
        trustImpact: ['+10', '+7', '+3', '+10'][idx]
    }));

    const trustMetrics = {
        overallScore: 4.2,
        totalFeedback: resolvedIssues.length,
        positiveRate: resolvedIssues.length > 0 ? Math.round((resolvedIssues.length / issues.length) * 100) : 0,
        avgResolutionQuality: 4.1,
        citizenTrustIndex: 85
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <Star
                key={index}
                className={`h-5 w-5 ${index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
            />
        ));
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isAdmin={true} />
                <div className="flex-1 ml-64 p-8 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isAdmin={true} />
                <div className="flex-1 ml-64 p-8">
                    <div className="card bg-red-50 border-2 border-red-200 text-center py-12">
                        <p className="text-red-700 text-lg">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isAdmin={true} />

            <div className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Feedback & Trust Metrics</h1>
                    <p className="text-gray-600">Accountability and citizen satisfaction tracking</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                    <div className="card text-center">
                        <Star className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-yellow-600 mb-1">{trustMetrics.overallScore}</p>
                        <p className="text-sm text-gray-600">Overall Score</p>
                    </div>

                    <div className="card text-center">
                        <MessageSquare className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-blue-600 mb-1">{trustMetrics.totalFeedback}</p>
                        <p className="text-sm text-gray-600">Total Resolved</p>
                    </div>

                    <div className="card text-center">
                        <ThumbsUp className="h-10 w-10 text-green-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-green-600 mb-1">{trustMetrics.positiveRate}%</p>
                        <p className="text-sm text-gray-600">Resolution Rate</p>
                    </div>

                    <div className="card text-center">
                        <Star className="h-10 w-10 text-purple-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-purple-600 mb-1">{trustMetrics.avgResolutionQuality}</p>
                        <p className="text-sm text-gray-600">Avg Quality</p>
                    </div>

                    <div className="card text-center">
                        <ThumbsUp className="h-10 w-10 text-primary-500 mx-auto mb-2" />
                        <p className="text-3xl font-bold text-primary-600 mb-1">{trustMetrics.citizenTrustIndex}</p>
                        <p className="text-sm text-gray-600">Trust Index</p>
                    </div>
                </div>

                <div className="card mb-8">
                    <h2 className="text-xl font-bold mb-4">Rating Distribution</h2>
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const percentage = rating === 5 ? 45 : rating === 4 ? 30 : rating === 3 ? 15 : rating === 2 ? 7 : 3;
                            return (
                                <div key={rating} className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 w-24">
                                        {renderStars(rating)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div
                                                className="bg-yellow-500 h-4 rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Recent Citizen Feedback</h2>
                    {mockFeedback.length > 0 ? (
                        <div className="space-y-4">
                            {mockFeedback.map(issue => (
                                <div key={issue._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">{issue.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Resolved • Reported by {issue.userName}
                                            </p>
                                            <div className="flex items-center gap-2 mb-2">
                                                {renderStars(issue.rating)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${parseInt(issue.trustImpact) >= 8 ? 'bg-green-100 text-green-700' :
                                                    parseInt(issue.trustImpact) >= 5 ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                Trust {issue.trustImpact}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded border-l-4 border-primary-600">
                                        <p className="text-gray-700 italic">"{issue.feedback}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No feedback available yet</p>
                            <p className="text-sm text-gray-500 mt-2">Feedback will appear as issues are resolved</p>
                        </div>
                    )}
                </div>

                <div className="card mt-6 bg-blue-50 border-2 border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">How Trust Score Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                        <div>
                            <p className="font-medium mb-1">5-Star Rating: +10 points</p>
                            <p>Excellent resolution quality</p>
                        </div>
                        <div>
                            <p className="font-medium mb-1">4-Star Rating: +7 points</p>
                            <p>Good resolution quality</p>
                        </div>
                        <div>
                            <p className="font-medium mb-1">3-Star or below: +3 points</p>
                            <p>Needs improvement</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackMetrics;

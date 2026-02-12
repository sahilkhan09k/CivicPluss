import { useState, useEffect } from 'react';
import { Brain, Filter, TrendingUp, Loader2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';

const IssueIntelligence = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('ai-priority');
    const [filterPriority, setFilterPriority] = useState('all');

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await apiService.getIssuesByPriority();
            setIssues(response.data);
        } catch (err) {
            setError(err.message || 'Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-600 text-white';
            case 'Medium': return 'bg-yellow-100 text-yellow-700';
            case 'Low': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredIssues = issues.filter(issue => {
        if (filterPriority === 'all') return true;
        return issue.priority === filterPriority;
    });

    const topActions = filteredIssues.slice(0, 5);

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
                    <h1 className="text-3xl font-bold mb-2">Issue Intelligence Panel</h1>
                    <p className="text-gray-600">AI-powered insights and prioritization</p>
                </div>

                <div className="card mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <div className="flex items-center space-x-4">
                        <Brain className="h-12 w-12" />
                        <div>
                            <h2 className="text-xl font-bold mb-1">AI Recommendations</h2>
                            <p className="text-blue-100">Focus on these top issues for maximum impact</p>
                        </div>
                    </div>
                </div>

                <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">Top 5 Issues to Fix Today</h2>
                    <div className="space-y-3">
                        {topActions.map((issue, index) => (
                            <div key={issue._id} className="p-4 bg-gradient-to-r from-gray-50 to-white border-l-4 border-primary-600 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">{issue.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="text-gray-600">AI Score: <span className="font-bold text-primary-600">{issue.priorityScore}</span></span>
                                                <span className="text-gray-600">Status: {issue.status}</span>
                                            </div>
                                            {issue.scoreBreakdown && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Severity: {issue.scoreBreakdown.severity} |
                                                    Location: {issue.scoreBreakdown.locationImpact} |
                                                    AI Boost: {issue.scoreBreakdown.aiAdjustment}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full ${getPriorityColor(issue.priority)}`}>
                                        {issue.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card mb-6">
                    <div className="flex items-center gap-6">
                        <Filter className="h-5 w-5 text-gray-600" />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="ai-priority">AI Priority Score</option>
                                    <option value="date">Date Reported</option>
                                    <option value="status">Status</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">All Issues by Priority</h2>
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="space-y-3">
                        {filteredIssues.map(issue => (
                            <div key={issue._id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-medium">{issue.title}</p>
                                        <p className="text-sm text-gray-600">
                                            AI Score: {issue.priorityScore} | Status: {issue.status}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full ${getPriorityColor(issue.priority)}`}>
                                        {issue.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredIssues.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No issues found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueIntelligence;

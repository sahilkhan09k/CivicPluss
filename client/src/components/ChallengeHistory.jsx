import { useState, useEffect } from 'react';
import { Search, Loader2, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { apiService } from '../services/api';

const ChallengeHistory = () => {
    const [challenges, setChallenges] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        adminId: '',
        reviewedBy: '', // Add reviewedBy filter
        dateFrom: '',
        dateTo: ''
    });

    useEffect(() => {
        fetchChallengeHistory();
    }, [filters]);

    const fetchChallengeHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getChallengeHistory(filters);
            setChallenges(response.data?.challenges || []);
            setStats(response.data?.stats || null);
        } catch (err) {
            console.error('Failed to fetch challenge history:', err);
            // Use the user-friendly error message if available
            const errorMessage = err.userMessage || err.message || 'Failed to fetch challenge history';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted': return 'bg-blue-100 text-blue-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            case 'reviewed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-200 text-gray-700';
        }
    };

    const getChallengeTypeLabel = (type) => {
        switch (type) {
            case 'spam_report': return 'Spam Report';
            case 'resolved_status': return 'Resolved Status';
            default: return type;
        }
    };

    const getReviewDecisionLabel = (decision) => {
        switch (decision) {
            case 'admin_wrong': return 'Admin Was Wrong';
            case 'admin_correct': return 'Admin Was Correct';
            default: return 'N/A';
        }
    };

    const filteredChallenges = challenges.filter(challenge =>
        challenge.issueId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.adminId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card bg-red-50 border-2 border-red-200 text-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-red-700 text-lg">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards — 2×2 on mobile */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalChallenges || 0}</p>
                            </div>
                            <BarChart3 className="h-7 w-7 md:h-10 md:w-10 text-primary-600 flex-shrink-0" />
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-600">Accepted</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.acceptedCount || 0}</p>
                            </div>
                            <CheckCircle className="h-7 w-7 md:h-10 md:w-10 text-blue-600 flex-shrink-0" />
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejectedCount || 0}</p>
                            </div>
                            <XCircle className="h-7 w-7 md:h-10 md:w-10 text-red-600 flex-shrink-0" />
                        </div>
                    </div>
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-600">Overturn</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {stats.overturnRate ? `${stats.overturnRate.toFixed(1)}%` : '0%'}
                                </p>
                            </div>
                            {stats.overturnRate > 30 ? (
                                <TrendingUp className="h-7 w-7 md:h-10 md:w-10 text-orange-600 flex-shrink-0" />
                            ) : (
                                <TrendingDown className="h-7 w-7 md:h-10 md:w-10 text-green-600 flex-shrink-0" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Performance Metrics */}
            {stats?.adminPerformance && stats.adminPerformance.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Admin Performance Metrics</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Challenges</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Wrong</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Correct</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overturn Rate</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.adminPerformance.map((admin, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">
                                            <div>
                                                <div className="font-medium text-gray-900">{admin.adminName || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{admin.adminEmail || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                            {admin.totalChallenges || 0}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-red-600 font-medium">
                                            {admin.adminWrongCount || 0}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-green-600 font-medium">
                                            {admin.adminCorrectCount || 0}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={`font-semibold ${
                                                admin.overturnRate > 50 ? 'text-red-600' :
                                                admin.overturnRate > 30 ? 'text-orange-600' :
                                                'text-green-600'
                                            }`}>
                                                {admin.overturnRate ? `${admin.overturnRate.toFixed(1)}%` : '0%'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="col-span-2 md:col-span-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-12 w-full"
                            placeholder="Search challenges..."
                        />
                    </div>
                    <div>
                        <select
                            className="input-field w-full"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Statuses</option>
                            <option value="accepted">Accepted</option>
                            <option value="pending">Pending</option>
                            <option value="rejected">Rejected</option>
                            <option value="reviewed">Reviewed</option>
                        </select>
                    </div>
                    <div>
                        <select
                            className="input-field w-full"
                            value={filters.reviewedBy}
                            onChange={(e) => setFilters({ ...filters, reviewedBy: e.target.value })}
                        >
                            <option value="">All Resolved</option>
                            <option value="me">My Resolved</option>
                            <option value="all">All Challenges</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="date"
                            className="input-field w-full text-sm"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            className="input-field w-full text-sm"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
                {filteredChallenges.map(challenge => (
                    <div key={challenge._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{challenge._id.slice(-6)}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(challenge.status)}`}>{challenge.status}</span>
                            </div>
                            <span className={`text-sm font-bold flex-shrink-0 ${challenge.similarityScore > 70 ? 'text-green-600' : challenge.similarityScore > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {challenge.similarityScore}%
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{challenge.issueId?.title || 'N/A'}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>User: <span className="font-medium text-gray-700">{challenge.userId?.name || 'Unknown'}</span></span>
                            <span>{getChallengeTypeLabel(challenge.challengeType)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>Admin: <span className="font-medium text-gray-700">{challenge.adminId?.name || 'Unknown'}</span></span>
                            <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                        </div>
                        {challenge.reviewDecision && (
                            <div className={`text-xs font-semibold px-2 py-1 rounded-lg inline-block ${challenge.reviewDecision === 'admin_wrong' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {getReviewDecisionLabel(challenge.reviewDecision)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block card overflow-hidden">
                <h3 className="text-lg font-semibold mb-4 px-6 pt-6">
                    {filters.reviewedBy === 'all' ? 'All Challenges' : filters.reviewedBy === 'me' ? 'My Resolved Challenges' : 'All Resolved Challenges'}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Similarity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Decision</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredChallenges.map(challenge => (
                                <tr key={challenge._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{challenge._id.slice(-6)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900"><div className="max-w-xs truncate">{challenge.issueId?.title || 'N/A'}</div></td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="font-medium">{challenge.userId?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{challenge.userId?.email || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="font-medium">{challenge.adminId?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{challenge.adminId?.email || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getChallengeTypeLabel(challenge.challengeType)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-semibold ${challenge.similarityScore > 70 ? 'text-green-600' : challenge.similarityScore > 50 ? 'text-yellow-600' : 'text-red-600'}`}>{challenge.similarityScore}%</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(challenge.status)}`}>{challenge.status}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {challenge.reviewDecision ? (
                                            <span className={`font-medium ${challenge.reviewDecision === 'admin_wrong' ? 'text-red-600' : 'text-green-600'}`}>{getReviewDecisionLabel(challenge.reviewDecision)}</span>
                                        ) : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {challenge.reviewedBy ? (
                                            <div>
                                                <div className="font-medium">{challenge.reviewedBy?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{challenge.reviewedBy?.email || 'N/A'}</div>
                                            </div>
                                        ) : <span className="text-gray-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(challenge.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {challenge.reviewedAt ? new Date(challenge.reviewedAt).toLocaleDateString() : <span className="text-gray-400">-</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredChallenges.length === 0 && (
                <div className="card text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No challenges found</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {searchTerm ? 'Try adjusting your search' : 
                         filters.reviewedBy === 'all' ? 'No challenge history available' : 
                         filters.reviewedBy === 'me' ? 'You have not resolved any challenges yet' :
                         'No resolved challenges available yet'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ChallengeHistory;

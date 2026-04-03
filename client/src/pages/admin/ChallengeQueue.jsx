import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, Calendar, User, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';

const ChallengeQueue = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reviewNotes, setReviewNotes] = useState('');
    const [reviewing, setReviewing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [reviewResult, setReviewResult] = useState(null);
    const [filters, setFilters] = useState({
        status: 'accepted',
        adminId: '',
        dateFrom: '',
        dateTo: ''
    });

    useEffect(() => {
        fetchChallenges();
    }, [filters]);

    const fetchChallenges = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getChallengeQueue(filters);
            setChallenges(response.data?.challenges || []);
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
            // Use the user-friendly error message if available
            const errorMessage = err.userMessage || err.message || 'Failed to fetch challenges';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleViewChallenge = (challenge) => {
        setSelectedChallenge(challenge);
        setReviewNotes('');
        setShowModal(true);
    };

    const handleReview = async (decision) => {
        if (!selectedChallenge) return;

        const confirmed = window.confirm(
            `Are you sure you want to mark this challenge as "${decision === 'admin_wrong' ? 'Admin Was Wrong' : 'Admin Was Correct'}"?\n\n` +
            `This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setReviewing(true);
            const response = await apiService.reviewChallenge(
                selectedChallenge._id,
                decision,
                reviewNotes
            );

            // Store the result for the success modal
            setReviewResult({
                decision,
                challenge: selectedChallenge,
                reviewNotes,
                response: response.data
            });

            // Remove from queue
            setChallenges(challenges.filter(c => c._id !== selectedChallenge._id));
            
            setShowModal(false);
            setSelectedChallenge(null);
            setReviewNotes('');
            
            // Show success modal instead of simple alert
            setShowSuccessModal(true);
        } catch (err) {
            console.error('Failed to review challenge:', err);
            // Use the user-friendly error message if available
            const errorMessage = err.userMessage || err.message || 'Failed to review challenge';
            alert(errorMessage);
        } finally {
            setReviewing(false);
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

    const filteredChallenges = challenges.filter(challenge =>
        challenge.issueId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.adminId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
                <Sidebar isAdmin={true} />
                <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
                <Sidebar isAdmin={true} />
                <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0">
                    <div className="card bg-red-50 border-2 border-red-200 text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                        <p className="text-red-700 text-lg">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
            <Sidebar isAdmin={true} />

            <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0 overflow-x-hidden">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Challenge Queue</h1>
                    <p className="text-gray-600">Review user challenges to admin decisions</p>
                </div>

                {/* Filters */}
                <div className="card mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
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
                            <input
                                type="date"
                                className="input-field w-full"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                placeholder="From Date"
                            />
                        </div>

                        <div>
                            <input
                                type="date"
                                className="input-field w-full"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                placeholder="To Date"
                            />
                        </div>
                    </div>
                </div>

                {/* Challenges Table */}
                <div className="card overflow-hidden">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredChallenges.map(challenge => (
                                    <tr key={challenge._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{challenge._id.slice(-6)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="max-w-xs truncate">
                                                {challenge.issueId?.title || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>
                                                <div className="font-medium">{challenge.userId?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{challenge.userId?.email || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>
                                                <div className="font-medium">{challenge.adminId?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{challenge.adminId?.email || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {getChallengeTypeLabel(challenge.challengeType)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-semibold ${
                                                challenge.similarityScore > 70 ? 'text-green-600' :
                                                challenge.similarityScore > 50 ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                                {challenge.similarityScore}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(challenge.status)}`}>
                                                {challenge.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(challenge.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewChallenge(challenge)}
                                                className="text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredChallenges.length === 0 && (
                    <div className="card text-center py-12 mt-6">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No challenges found</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {searchTerm ? 'Try adjusting your search' : 'All challenges have been reviewed'}
                        </p>
                    </div>
                )}

                {/* Review Modal */}
                {showModal && selectedChallenge && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-4 md:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-6">Review Challenge #{selectedChallenge._id.slice(-6)}</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - Challenge Details */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Challenge Information</h3>
                                        
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Issue Title</label>
                                                <p className="text-gray-900 mt-1">{selectedChallenge.issueId?.title || 'N/A'}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Issue Description</label>
                                                <p className="text-gray-600 mt-1 text-sm">{selectedChallenge.issueId?.description || 'N/A'}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Challenged By</label>
                                                    <p className="text-gray-900 mt-1">{selectedChallenge.userId?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{selectedChallenge.userId?.email || 'N/A'}</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Admin</label>
                                                    <p className="text-gray-900 mt-1">{selectedChallenge.adminId?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{selectedChallenge.adminId?.email || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Challenge Type</label>
                                                    <p className="text-gray-900 mt-1">{getChallengeTypeLabel(selectedChallenge.challengeType)}</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Similarity Score</label>
                                                    <p className={`mt-1 text-lg font-semibold ${
                                                        selectedChallenge.similarityScore > 70 ? 'text-green-600' :
                                                        selectedChallenge.similarityScore > 50 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                        {selectedChallenge.similarityScore}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Distance from Issue</label>
                                                <p className="text-gray-900 mt-1">{selectedChallenge.distanceFromIssue?.toFixed(1) || 'N/A'} meters</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Original Issue State</label>
                                                <div className="mt-1 bg-gray-50 p-3 rounded-lg text-sm">
                                                    <p><span className="font-medium">Status:</span> {selectedChallenge.originalIssueState?.status || 'N/A'}</p>
                                                    <p><span className="font-medium">Reported as Fake:</span> {selectedChallenge.originalIssueState?.reportedAsFake ? 'Yes' : 'No'}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Submitted</label>
                                                <p className="text-gray-900 mt-1">
                                                    {new Date(selectedChallenge.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Photo Comparison */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Photo Comparison</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Original Issue Photo</label>
                                                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                    {selectedChallenge.issueId?.imageUrl ? (
                                                        <img
                                                            src={selectedChallenge.issueId.imageUrl}
                                                            alt="Original issue"
                                                            className="w-full h-64 object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-64 flex items-center justify-center">
                                                            <ImageIcon className="h-12 w-12 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Challenge Photo</label>
                                                <div className="border-2 border-primary-200 rounded-lg overflow-hidden bg-gray-50">
                                                    {selectedChallenge.challengePhotoUrl ? (
                                                        <img
                                                            src={selectedChallenge.challengePhotoUrl}
                                                            alt="Challenge photo"
                                                            className="w-full h-64 object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-64 flex items-center justify-center">
                                                            <ImageIcon className="h-12 w-12 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Review Notes */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Review Notes (Optional)
                                </label>
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    className="input-field w-full"
                                    rows="3"
                                    placeholder="Add any notes about your decision..."
                                />
                            </div>

                            {/* Decision Buttons */}
                            <div className="flex gap-3 pt-6 border-t mt-6">
                                <button
                                    onClick={() => handleReview('admin_wrong')}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                                    disabled={reviewing}
                                >
                                    {reviewing ? (
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    ) : (
                                        <XCircle className="h-5 w-5 mr-2" />
                                    )}
                                    Admin Was Wrong
                                </button>
                                
                                <button
                                    onClick={() => handleReview('admin_correct')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
                                    disabled={reviewing}
                                >
                                    {reviewing ? (
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5 mr-2" />
                                    )}
                                    Admin Was Correct
                                </button>
                                
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary px-6 py-3"
                                    disabled={reviewing}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Success Modal */}
                {showSuccessModal && reviewResult && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-4 md:p-8 max-w-2xl w-full">
                            <div className="text-center">
                                {/* Success Icon */}
                                <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${
                                    reviewResult.decision === 'admin_wrong' ? 'bg-orange-100' : 'bg-green-100'
                                }`}>
                                    {reviewResult.decision === 'admin_wrong' ? (
                                        <XCircle className="h-8 w-8 text-orange-600" />
                                    ) : (
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    Challenge Reviewed Successfully
                                </h3>

                                {/* Decision Summary */}
                                <div className={`p-4 rounded-lg mb-6 ${
                                    reviewResult.decision === 'admin_wrong' ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'
                                }`}>
                                    <h4 className={`font-semibold text-lg mb-2 ${
                                        reviewResult.decision === 'admin_wrong' ? 'text-orange-800' : 'text-green-800'
                                    }`}>
                                        Decision: {reviewResult.decision === 'admin_wrong' ? 'Admin Was Wrong' : 'Admin Was Correct'}
                                    </h4>
                                    
                                    {reviewResult.decision === 'admin_wrong' ? (
                                        <div className="text-orange-700 space-y-2">
                                            <p className="font-medium">✅ Issue has been restored to its original state</p>
                                            <p>• The citizen's challenge was valid</p>
                                            <p>• Admin decision has been overturned</p>
                                            <p>• Issue is now available for proper resolution</p>
                                            <p>• <span className="font-semibold">User's trust score increased by +5 points</span></p>
                                            <p>• Admin performance metrics updated</p>
                                        </div>
                                    ) : (
                                        <div className="text-green-700 space-y-2">
                                            <p className="font-medium">✅ Admin decision has been upheld</p>
                                            <p>• The original admin decision was correct</p>
                                            <p>• Issue status remains unchanged</p>
                                            <p>• System integrity maintained</p>
                                            <p>• <span className="font-semibold">User's trust score decreased by -50 points</span></p>
                                        </div>
                                    )}
                                </div>

                                {/* Issue Details */}
                                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                                    <h5 className="font-semibold text-gray-800 mb-2">Issue Details:</h5>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Title:</span> {reviewResult.challenge.issueId?.title || 'N/A'}
                                    </p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Challenged By:</span> {reviewResult.challenge.userId?.name || 'Unknown'}
                                    </p>
                                    <p className="text-gray-700 mb-1">
                                        <span className="font-medium">Original Admin:</span> {reviewResult.challenge.adminId?.name || 'Unknown'}
                                    </p>
                                    <p className="text-gray-700">
                                        <span className="font-medium">Similarity Score:</span> {reviewResult.challenge.similarityScore}%
                                    </p>
                                </div>

                                {/* Review Notes */}
                                {reviewResult.reviewNotes && (
                                    <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                                        <h5 className="font-semibold text-blue-800 mb-2">Your Review Notes:</h5>
                                        <p className="text-blue-700 italic">"{reviewResult.reviewNotes}"</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            setReviewResult(null);
                                        }}
                                        className="btn-primary px-6 py-3"
                                    >
                                        Continue Reviewing
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            setReviewResult(null);
                                            // Optionally navigate to challenge history
                                            window.location.href = '/admin/challenge-history';
                                        }}
                                        className="btn-secondary px-6 py-3"
                                    >
                                        View Challenge History
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengeQueue;






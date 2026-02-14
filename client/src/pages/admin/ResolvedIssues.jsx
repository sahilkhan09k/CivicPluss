import { useState, useEffect } from 'react';
import { Search, CheckCircle, Loader2, Eye, Calendar, User } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';

const ResolvedIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchResolvedIssues();
    }, []);

    const fetchResolvedIssues = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAllIssues();
            const resolvedIssues = response.data.filter(issue => issue.status === 'Resolved');
            setIssues(resolvedIssues);
        } catch (err) {
            setError(err.message || 'Failed to fetch resolved issues');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (issue) => {
        setSelectedIssue(issue);
        setShowModal(true);
    };

    const filteredIssues = issues.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold mb-2">Resolved Issues</h1>
                    <p className="text-gray-600">View all issues that have been successfully resolved</p>
                </div>

                <div className="card mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <CheckCircle className="h-12 w-12" />
                            <div>
                                <h2 className="text-2xl font-bold">{issues.length}</h2>
                                <p className="text-green-100">Total Resolved Issues</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card mb-6">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10 w-full"
                            placeholder="Search resolved issues..."
                        />
                    </div>
                </div>

                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredIssues.map(issue => (
                                    <tr key={issue._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{issue._id.slice(-6)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {issue.title}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>
                                                <div className="font-medium">{issue.reportedBy?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{issue.reportedBy?.email || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                issue.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewDetails(issue)}
                                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredIssues.length === 0 && (
                    <div className="card text-center py-12 mt-6">
                        <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No resolved issues found</p>
                        <p className="text-sm text-gray-500 mt-2">
                            {searchTerm ? 'Try adjusting your search' : 'Resolved issues will appear here'}
                        </p>
                    </div>
                )}

                {showModal && selectedIssue && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Issue Details #{selectedIssue._id.slice(-6)}</h2>
                                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Resolved
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <p className="text-gray-900">{selectedIssue.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <p className="text-gray-700">{selectedIssue.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <p className="text-gray-900">{selectedIssue.category}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                        <span className={`text-xs px-3 py-1 rounded-full ${
                                            selectedIssue.priority === 'High' ? 'bg-red-100 text-red-700' :
                                            selectedIssue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {selectedIssue.priority} (Score: {selectedIssue.priorityScore})
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Issue Photo</label>
                                    <img
                                        src={selectedIssue.imageUrl}
                                        alt="Original issue"
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                </div>

                                {selectedIssue.resolutionImageUrl && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Photo</label>
                                        <img
                                            src={selectedIssue.resolutionImageUrl}
                                            alt="Resolution"
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <User className="h-4 w-4 mr-1" />
                                            Reported By
                                        </label>
                                        <p className="text-gray-900">{selectedIssue.reportedBy?.name || 'Unknown'}</p>
                                        <p className="text-sm text-gray-500">{selectedIssue.reportedBy?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            Resolved Date
                                        </label>
                                        <p className="text-gray-900">
                                            {selectedIssue.resolvedAt ? new Date(selectedIssue.resolvedAt).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="btn-secondary"
                                    >
                                        Close
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

export default ResolvedIssues;

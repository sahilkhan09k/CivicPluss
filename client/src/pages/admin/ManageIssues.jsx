import { useState, useEffect } from 'react';
import { Search, Edit, CheckCircle, Upload, Loader2, AlertTriangle, Shield } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';

const ManageIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const [reportingFake, setReportingFake] = useState(false);

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

    const handleUpdateIssue = (issue) => {
        setSelectedIssue(issue);
        setNewStatus(issue.status);
        setShowModal(true);
    };

    const handleSaveUpdate = async () => {
        if (!selectedIssue || !newStatus) return;

        try {
            setUpdating(true);
            await apiService.updateIssueStatus(selectedIssue._id, newStatus);

            setIssues(issues.map(issue =>
                issue._id === selectedIssue._id
                    ? { ...issue, status: newStatus }
                    : issue
            ));

            setShowModal(false);
            setSelectedIssue(null);
        } catch (err) {
            alert(err.message || 'Failed to update issue');
        } finally {
            setUpdating(false);
        }
    };

    const handleReportAsFake = async (issue) => {
        if (issue.reportedAsFake) {
            alert('This issue has already been reported as fake');
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to report this issue as FAKE?\n\n` +
            `This will:\n` +
            `• Reduce the user's trust score by 25 points\n` +
            `• Ban the user if trust score reaches 0\n\n` +
            `User: ${issue.reportedBy?.name || 'Unknown'}\n` +
            `Email: ${issue.reportedBy?.email || 'Unknown'}`
        );

        if (!confirmed) return;

        try {
            setReportingFake(true);
            const response = await apiService.reportIssueAsFake(issue._id);

            setIssues(issues.map(i =>
                i._id === issue._id
                    ? { ...i, reportedAsFake: true }
                    : i
            ));

            alert(response.message || 'Issue reported as fake successfully');
            fetchIssues();
        } catch (err) {
            alert(err.message || 'Failed to report issue as fake');
        } finally {
            setReportingFake(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-200 text-gray-700';
        }
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
                    <h1 className="text-3xl font-bold mb-2">Manage Issues</h1>
                    <p className="text-gray-600">Update status and manage reported issues</p>
                </div>

                {/* Search */}
                <div className="card mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                            placeholder="Search issues by title or description..."
                        />
                    </div>
                </div>

                {/* Issues Table */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredIssues.map(issue => (
                                    <tr key={issue._id} className={`hover:bg-gray-50 ${issue.reportedAsFake ? 'bg-red-50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{issue._id.slice(-6)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {issue.title}
                                            {issue.reportedAsFake && (
                                                <span className="ml-2 text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                                                    FAKE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>
                                                <div className="font-medium">{issue.reportedBy?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{issue.reportedBy?.email || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs px-2 py-1 rounded ${issue.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {issue.priorityScore}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(issue.status)}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(issue.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                                            <button
                                                onClick={() => handleUpdateIssue(issue)}
                                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Update
                                            </button>
                                            {!issue.reportedAsFake && (
                                                <button
                                                    onClick={() => handleReportAsFake(issue)}
                                                    disabled={reportingFake}
                                                    className="text-red-600 hover:text-red-700 font-medium flex items-center disabled:opacity-50"
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                                    Report Fake
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filteredIssues.length === 0 && (
                    <div className="card text-center py-12 mt-6">
                        <p className="text-gray-600 text-lg">No issues found</p>
                        <p className="text-sm text-gray-500 mt-2">Try adjusting your search</p>
                    </div>
                )}

                {/* Update Modal */}
                {showModal && selectedIssue && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
                            <h2 className="text-2xl font-bold mb-6">Update Issue #{selectedIssue._id.slice(-6)}</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <p className="text-gray-900">{selectedIssue.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        className="input-field"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Priority</label>
                                    <span className={`text-xs px-3 py-1 rounded-full ${selectedIssue.priority === 'High' ? 'bg-red-100 text-red-700' :
                                        selectedIssue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {selectedIssue.priority} (Score: {selectedIssue.priorityScore})
                                    </span>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSaveUpdate}
                                        className="btn-primary flex items-center"
                                        disabled={updating}
                                    >
                                        {updating ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        {updating ? 'Updating...' : 'Save Update'}
                                    </button>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="btn-secondary"
                                        disabled={updating}
                                    >
                                        Cancel
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

export default ManageIssues;

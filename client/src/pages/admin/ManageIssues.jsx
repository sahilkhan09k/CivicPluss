import { useState, useEffect } from 'react';
import { Search, Edit, CheckCircle, Upload, Loader2, AlertTriangle } from 'lucide-react';
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
    const [resolutionImage, setResolutionImage] = useState(null);
    const [resolutionImagePreview, setResolutionImagePreview] = useState(null);
    const [resolutionConfirmed, setResolutionConfirmed] = useState(false);

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAllIssues();
            // Show only pending issues - others have dedicated pages
            const pendingIssues = response.data.filter(issue => issue.status === 'Pending');
            setIssues(pendingIssues);
        } catch (err) {
            setError(err.message || 'Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateIssue = (issue) => {
        setSelectedIssue(issue);
        setNewStatus(issue.status);
        setResolutionImage(null);
        setResolutionImagePreview(null);
        setResolutionConfirmed(false);
        setShowModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResolutionImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setResolutionImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveUpdate = async () => {
        if (!selectedIssue || !newStatus) return;

        // Validate resolution requirements
        if (newStatus === 'Resolved') {
            if (!resolutionImage) {
                alert('Please upload a photo of the resolved issue');
                return;
            }
            if (!resolutionConfirmed) {
                alert('Please confirm that the issue is completely resolved');
                return;
            }
        }

        try {
            setUpdating(true);
            const response = await apiService.updateIssueStatus(
                selectedIssue._id, 
                newStatus, 
                resolutionImage, 
                resolutionConfirmed
            );

            // Show resolved score if available
            if (response.data.resolvedScore && newStatus === 'Resolved') {
                alert(`✅ Issue marked as resolved!\n\nAI Verification Score: ${response.data.resolvedScore}%\n\n${response.data.message || 'The AI has verified that the issue appears to be properly resolved.'}`);
            }

            setIssues(issues.map(issue =>
                issue._id === selectedIssue._id
                    ? { ...issue, status: newStatus, resolvedScore: response.data.resolvedScore }
                    : issue
            ));

            setShowModal(false);
            setSelectedIssue(null);
            setResolutionImage(null);
            setResolutionImagePreview(null);
            setResolutionConfirmed(false);
        } catch (err) {
            // Enhanced error handling for resolution verification failures
            const errorMessage = err.message || 'Failed to update issue';
            if (errorMessage.includes('AI analysis indicates') || errorMessage.includes('Score:')) {
                alert(`❌ Resolution Verification Failed\n\n${errorMessage}\n\nPlease ensure the issue is completely resolved before uploading the photo.`);
            } else {
                alert(errorMessage);
            }
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
            `• Schedule a trust score penalty of -25 points in 24 hours\n` +
            `• Give the user 24 hours to challenge this decision\n` +
            `• Ban the user if trust score reaches 0 after penalty\n\n` +
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
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-x-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
                </div>

                <Sidebar isAdmin={true} />
                <div className="relative z-10 flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0 overflow-x-hidden flex items-center justify-center">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-primary-500 to-accent-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-gray-900">Loading Issues</h2>
                        <p className="text-gray-600 text-lg">Gathering pending issues...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-x-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
                </div>

                <Sidebar isAdmin={true} />
                <div className="relative z-10 flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0 overflow-x-hidden">
                    <div className="max-w-2xl mx-auto">
                        <div className="card-gradient text-center py-16 border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
                            <div className="bg-gradient-to-br from-red-500 to-red-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <AlertTriangle className="h-10 w-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-red-700 mb-4">Error Loading Issues</h2>
                            <p className="text-red-700 text-lg">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 relative overflow-x-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-200/20 to-transparent rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-accent-200/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
            </div>

            <Sidebar isAdmin={true} />

            <div className="relative z-10 flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 min-w-0 overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 animate-fade-in">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-gradient-to-br from-primary-500 to-accent-500 p-4 rounded-2xl shadow-lg">
                                <Edit className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 bg-clip-text text-transparent tracking-tight">
                                    Manage Issues
                                </h1>
                                <p className="text-gray-600 text-sm md:text-xl font-medium">Review and update status of newly reported issues</p>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-xl font-bold border border-yellow-200 text-xs">
                                        Pending Issues Only
                                    </span>
                                    <span className="text-gray-500 text-xs">Move to "In Progress" or "Resolved"</span>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Search */}
                <div className="card mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-12 w-full"
                            placeholder="Search pending issues..."
                        />
                    </div>
                </div>

                {/* Issues — Card list on mobile, Table on desktop */}

                {/* Mobile card list */}
                <div className="md:hidden space-y-3">
                    {filteredIssues.map(issue => (
                        <div key={issue._id} className={`bg-white rounded-2xl border shadow-sm p-4 ${issue.reportedAsFake ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{issue._id.slice(-6)}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${issue.priority === 'High' ? 'bg-red-100 text-red-700' : issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                            {issue.priority}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(issue.status)}`}>
                                            {issue.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{issue.title}</h3>
                                    {issue.reportedAsFake && (
                                        <span className="inline-flex items-center text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium mt-1">
                                            <AlertTriangle className="h-3 w-3 mr-1" />FAKE
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                <span className="font-medium text-gray-700">{issue.reportedBy?.name || 'Unknown'}</span>
                                <span>Score: <span className="font-semibold text-primary-600">{issue.priorityScore}</span></span>
                                <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdateIssue(issue)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-colors"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    Update
                                </button>
                                {!issue.reportedAsFake && (
                                    <button
                                        onClick={() => handleReportAsFake(issue)}
                                        disabled={reportingFake}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl text-xs font-semibold transition-colors"
                                    >
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Mark Fake
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reporter</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredIssues.map(issue => (
                                    <tr key={issue._id} className={`hover:bg-gray-50 transition-colors duration-150 ${issue.reportedAsFake ? 'bg-red-50 border-l-4 border-red-400' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-mono">#{issue._id.slice(-6)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-medium">{issue.title}</div>
                                            {issue.reportedAsFake && (
                                                <span className="mt-1 inline-flex items-center text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />FAKE REPORT
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="font-medium text-gray-900">{issue.reportedBy?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{issue.reportedBy?.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${issue.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' : issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                                                {issue.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{issue.priorityScore}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(issue.status)} border`}>{issue.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(issue.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                                            <button onClick={() => handleUpdateIssue(issue)} className="cursor-pointer text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-medium flex items-center px-3 py-1.5 rounded-md transition-all duration-200 border border-transparent hover:border-primary-200">
                                                <Edit className="h-4 w-4 mr-1" />Update
                                            </button>
                                            {!issue.reportedAsFake && (
                                                <button onClick={() => handleReportAsFake(issue)} disabled={reportingFake} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 font-medium flex items-center px-3 py-1.5 rounded-md transition-all duration-200 border border-transparent hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <AlertTriangle className="h-4 w-4 mr-1" />Report Fake
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
                        <p className="text-gray-600 text-lg">
                            {searchTerm ? 'No pending issues match your search' : 'No pending issues found'}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            {searchTerm ? 'Try adjusting your search terms' : 'All issues have been processed or are in progress'}
                        </p>
                    </div>
                )}

                {/* Update Modal */}
                {showModal && selectedIssue && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Update Issue</h2>
                                <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono text-gray-600">
                                    #{selectedIssue._id.slice(-6)}
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Title</label>
                                    <p className="text-gray-900 font-medium">{selectedIssue.title}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Update Status</label>
                                    <select
                                        className="input-field cursor-pointer hover:border-primary-400 focus:border-primary-500 focus:ring-primary-500"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>

                                {/* Resolution Photo Upload - Required for Resolved status */}
                                {newStatus === 'Resolved' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Resolution Photo <span className="text-red-500">*</span>
                                            </label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                                                <div className="space-y-1 text-center">
                                                    {resolutionImagePreview ? (
                                                        <div className="relative">
                                                            <img
                                                                src={resolutionImagePreview}
                                                                alt="Resolution preview"
                                                                className="mx-auto h-32 w-auto rounded-lg object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setResolutionImage(null);
                                                                    setResolutionImagePreview(null);
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <Upload className="mx-auto h-10 w-10 text-gray-400" />
                                                            <div className="flex text-sm text-gray-600">
                                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                                                                    <span>Upload a photo</span>
                                                                    <input
                                                                        type="file"
                                                                        className="sr-only"
                                                                        accept="image/*"
                                                                        onChange={handleImageChange}
                                                                    />
                                                                </label>
                                                                <p className="pl-1">or drag and drop</p>
                                                            </div>
                                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Upload a clear photo showing the issue has been completely resolved
                                            </p>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    id="resolutionConfirm"
                                                    checked={resolutionConfirmed}
                                                    onChange={(e) => setResolutionConfirmed(e.target.checked)}
                                                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="resolutionConfirm" className="ml-3 text-sm">
                                                    <span className="font-semibold text-gray-900">
                                                        I confirm that this issue has been completely resolved.
                                                    </span>
                                                    <p className="text-gray-700 mt-1">
                                                        I understand that if the issue is not fully resolved, strict action will be taken against me, including potential suspension of my admin privileges.
                                                    </p>
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Priority & Score</label>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${selectedIssue.priority === 'High' ? 'bg-red-100 text-red-700 border border-red-200' :
                                            selectedIssue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                'bg-green-100 text-green-700 border border-green-200'
                                            }`}>
                                            {selectedIssue.priority}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700">
                                            AI Score: {selectedIssue.priorityScore}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button
                                        onClick={handleSaveUpdate}
                                        className="btn-primary flex items-center cursor-pointer hover:shadow-md transition-all duration-200"
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
                                        className="btn-secondary cursor-pointer hover:shadow-md transition-all duration-200"
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
        </div>
    );
};

export default ManageIssues;






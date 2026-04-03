import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Edit, CheckCircle, Loader2, AlertTriangle, MapPin, Calendar, User } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const InProgressIssues = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [resolutionImage, setResolutionImage] = useState(null);
    const [resolutionImagePreview, setResolutionImagePreview] = useState(null);
    const [resolutionConfirmed, setResolutionConfirmed] = useState(false);

    useEffect(() => {
        fetchInProgressIssues();
    }, []);

    const fetchInProgressIssues = async () => {
        try {
            setLoading(true);
            const response = await apiService.getAllIssues();
            // Filter only in-progress issues
            const inProgressIssues = response.data.filter(issue => issue.status === 'In Progress');
            setIssues(inProgressIssues);
        } catch (err) {
            setError(err.message || 'Failed to fetch in-progress issues');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsResolved = (issue) => {
        setSelectedIssue(issue);
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

    const handleSaveResolution = async () => {
        if (!selectedIssue) return;

        if (!resolutionImage) {
            alert('Please upload a photo of the resolved issue');
            return;
        }
        if (!resolutionConfirmed) {
            alert('Please confirm that the issue is completely resolved');
            return;
        }

        try {
            setUpdating(true);
            await apiService.updateIssueStatus(
                selectedIssue._id, 
                'Resolved', 
                resolutionImage, 
                resolutionConfirmed
            );

            // Remove from in-progress list
            setIssues(issues.filter(issue => issue._id !== selectedIssue._id));
            setShowModal(false);
            setSelectedIssue(null);
            setResolutionImage(null);
            setResolutionImagePreview(null);
            setResolutionConfirmed(false);
        } catch (err) {
            alert(err.message || 'Failed to mark issue as resolved');
        } finally {
            setUpdating(false);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-700 border-red-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTimeInProgress = (createdAt) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffInDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return '1 day';
        return `${diffInDays} days`;
    };

    const filteredIssues = issues.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isAdmin={true} />
                <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar isAdmin={true} />
                <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8">
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

            <div className="flex-1 md:ml-64 p-4 pt-16 md:pt-4 md:p-8">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold">
                            {user?.role === 'super_admin' ? 'All In Progress Issues' : 'In Progress Issues'}
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        {user?.role === 'super_admin' 
                            ? 'Monitor in-progress issues across all cities for oversight and quality control'
                            : 'Track and manage issues currently being worked on'
                        }
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {issues.length} Active Issues
                            {user?.role === 'super_admin' ? ' (State-wide)' : ''}
                        </span>
                        <span className="text-gray-500">
                            {user?.role === 'super_admin'
                                ? 'Oversight only - local admins manage resolution'
                                : 'Focus on completing these to improve resolution metrics'
                            }
                        </span>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="card mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field pl-12 w-full"
                                placeholder="Search in-progress issues..."
                            />
                        </div>
                        {user?.role === 'super_admin' && (
                            <div className="md:w-48">
                                <select
                                    className="input-field w-full"
                                    onChange={(e) => {
                                        // Add city filter logic here if needed
                                        console.log('City filter:', e.target.value);
                                    }}
                                >
                                    <option value="">All Cities</option>
                                    <option value="Mumbai">Mumbai</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Bangalore">Bangalore</option>
                                    <option value="Chennai">Chennai</option>
                                    <option value="Kolkata">Kolkata</option>
                                    <option value="Hyderabad">Hyderabad</option>
                                    <option value="Pune">Pune</option>
                                    <option value="Ahmedabad">Ahmedabad</option>
                                    <option value="Jaipur">Jaipur</option>
                                    <option value="Surat">Surat</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Issues Grid */}
                {filteredIssues.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredIssues.map(issue => (
                            <div key={issue._id} className="card hover:shadow-lg transition-shadow duration-200 border-l-4 border-blue-500">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                            #{issue._id.slice(-6)}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getPriorityColor(issue.priority)}`}>
                                            {issue.priority}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {getTimeInProgress(issue.createdAt)} in progress
                                    </span>
                                </div>

                                <Link 
                                    to={`/admin/issue/${issue._id}`}
                                    className="block hover:text-primary-600 transition-colors"
                                >
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{issue.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{issue.description}</p>
                                </Link>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {issue.reportedBy?.name || 'Unknown'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {issue.city || 'Unknown City'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <span className="text-gray-600">AI Score: </span>
                                        <span className="font-semibold text-primary-600">{issue.priorityScore}</span>
                                    </div>
                                    {user?.role !== 'super_admin' && (
                                        <button
                                            onClick={() => handleMarkAsResolved(issue)}
                                            className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Mark Resolved
                                        </button>
                                    )}
                                    {user?.role === 'super_admin' && (
                                        <div className="text-sm text-gray-500 italic">
                                            Oversight only - managed by local admin
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-16">
                        <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No In Progress Issues</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'No issues match your search criteria' : 
                             user?.role === 'super_admin' ? 'All issues are either pending or resolved across the state' :
                             'All issues are either pending or resolved'}
                        </p>
                        {user?.role !== 'super_admin' && (
                            <Link 
                                to="/admin/manage" 
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Manage All Issues
                            </Link>
                        )}
                        {user?.role === 'super_admin' && (
                            <div className="text-sm text-gray-500 italic">
                                Issues are managed by local city administrators
                            </div>
                        )}
                    </div>
                )}

                {/* Resolution Modal */}
                {showModal && selectedIssue && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl p-4 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Mark as Resolved</h2>
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
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                                    <CheckCircle className="mx-auto h-10 w-10 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600">
                                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                                                            <span>Upload resolution photo</span>
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

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id="resolutionConfirm"
                                            checked={resolutionConfirmed}
                                            onChange={(e) => setResolutionConfirmed(e.target.checked)}
                                            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="resolutionConfirm" className="ml-3 text-sm">
                                            <span className="font-semibold text-gray-900">
                                                I confirm that this issue has been completely resolved.
                                            </span>
                                            <p className="text-gray-700 mt-1">
                                                I understand that marking an unresolved issue as resolved may result in administrative action.
                                            </p>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button
                                        onClick={handleSaveResolution}
                                        className="btn-primary flex items-center cursor-pointer hover:shadow-md transition-all duration-200"
                                        disabled={updating}
                                    >
                                        {updating ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        {updating ? 'Marking Resolved...' : 'Mark as Resolved'}
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
    );
};

export default InProgressIssues;





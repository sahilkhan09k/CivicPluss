import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Award, TrendingUp, CheckCircle, Clock, Shield, AlertTriangle, Edit2, Save, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { CitySelector } from '../../components/CitySelector';

const Profile = () => {
    const { user, login } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        resolved: 0,
        pending: 0,
        inProgress: 0
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || '',
        city: user?.city || ''
    });
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchUserStats();
        setEditData({
            name: user?.name || '',
            city: user?.city || ''
        });
    }, [user]);

    const fetchUserStats = async () => {
        try {
            const response = await apiService.getUserIssues();
            const issues = response.data || [];

            setStats({
                total: issues.length,
                resolved: issues.filter(i => i.status === 'Resolved').length,
                pending: issues.filter(i => i.status === 'Pending').length,
                inProgress: issues.filter(i => i.status === 'In Progress').length
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const impactScore = stats.resolved * 10 + stats.inProgress * 5;

    const handleEditToggle = () => {
        setEditing(!editing);
        setUpdateError('');
        setUpdateSuccess('');
        if (!editing) {
            setEditData({
                name: user?.name || '',
                city: user?.city || ''
            });
        }
    };

    const handleUpdateProfile = async () => {
        setUpdateError('');
        setUpdateSuccess('');
        setUpdating(true);

        try {
            const response = await apiService.updateUserProfile(editData);
            login(response.data); // Update context with new data
            setUpdateSuccess('Profile updated successfully!');
            setEditing(false);
        } catch (err) {
            setUpdateError(err.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const getTrustScoreColor = (score) => {
        if (score >= 75) return 'from-green-500 to-green-600';
        if (score >= 50) return 'from-yellow-500 to-yellow-600';
        if (score >= 25) return 'from-orange-500 to-orange-600';
        return 'from-red-500 to-red-600';
    };

    const getTrustScoreStatus = (score) => {
        if (score === 100) return { label: 'Excellent', icon: '✅', color: 'text-green-700' };
        if (score >= 75) return { label: 'Good', icon: '⚠️', color: 'text-yellow-700' };
        if (score >= 50) return { label: 'Warning', icon: '⚠️', color: 'text-orange-700' };
        if (score >= 25) return { label: 'Critical', icon: '🚨', color: 'text-red-700' };
        return { label: 'Banned', icon: '❌', color: 'text-red-900' };
    };

    const trustScore = user?.trustScore ?? 100;
    const trustStatus = getTrustScoreStatus(trustScore);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20">
            <Sidebar />

            <div className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                            My Profile
                        </h1>
                        <p className="text-gray-600 text-lg">Manage your account and view your civic impact</p>
                    </div>

                    {/* Profile Card */}
                    <div className="card-gradient mb-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-start space-x-6 flex-1">
                                <div className="bg-gradient-to-br from-primary-500 to-primary-700 w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <User className="h-12 w-12 text-white" />
                                </div>
                                <div className="flex-1">
                                    {!editing ? (
                                        <>
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{user?.name}</h2>
                                            <div className="space-y-2 text-gray-600">
                                                <div className="flex items-center">
                                                    <Mail className="h-5 w-5 mr-3 text-primary-600" />
                                                    {user?.email}
                                                </div>
                                                {user?.city && (
                                                    <div className="flex items-center">
                                                        <Award className="h-5 w-5 mr-3 text-primary-600" />
                                                        City: <span className="ml-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                                                            {user.city}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center">
                                                    <Calendar className="h-5 w-5 mr-3 text-primary-600" />
                                                    Member since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                                </div>
                                                <div className="flex items-center">
                                                    <Award className="h-5 w-5 mr-3 text-primary-600" />
                                                    Role: <span className="ml-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                                                        {user?.role || 'User'}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                                <input
                                                    type="text"
                                                    value={editData.name}
                                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-400 outline-none"
                                                    disabled={updating}
                                                />
                                            </div>
                                            <CitySelector
                                                value={editData.city}
                                                onChange={(city) => setEditData({ ...editData, city })}
                                                disabled={updating}
                                            />
                                            {updateError && (
                                                <p className="text-sm text-red-600">{updateError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                {!editing ? (
                                    <button
                                        onClick={handleEditToggle}
                                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        <span>Edit</span>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={updating}
                                            className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-xl hover:bg-success-700 transition-colors disabled:opacity-50"
                                        >
                                            <Save className="h-4 w-4" />
                                            <span>{updating ? 'Saving...' : 'Save'}</span>
                                        </button>
                                        <button
                                            onClick={handleEditToggle}
                                            disabled={updating}
                                            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Cancel</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        {updateSuccess && (
                            <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-xl text-success-700 text-sm">
                                {updateSuccess}
                            </div>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="stat-card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-1 font-medium">Total Issues</p>
                                    <p className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                                        {stats.total}
                                    </p>
                                </div>
                                <div className="bg-primary-100 p-3 rounded-xl">
                                    <TrendingUp className="h-8 w-8 text-primary-600" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-1 font-medium">Resolved</p>
                                    <p className="text-4xl font-bold bg-gradient-to-r from-success-600 to-success-700 bg-clip-text text-transparent">
                                        {stats.resolved}
                                    </p>
                                </div>
                                <div className="bg-success-100 p-3 rounded-xl">
                                    <CheckCircle className="h-8 w-8 text-success-600" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-1 font-medium">In Progress</p>
                                    <p className="text-4xl font-bold bg-gradient-to-r from-warning-600 to-warning-700 bg-clip-text text-transparent">
                                        {stats.inProgress}
                                    </p>
                                </div>
                                <div className="bg-warning-100 p-3 rounded-xl">
                                    <Clock className="h-8 w-8 text-warning-600" />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm mb-1 font-medium">Pending</p>
                                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
                                        {stats.pending}
                                    </p>
                                </div>
                                <div className="bg-gray-100 p-3 rounded-xl">
                                    <TrendingUp className="h-8 w-8 text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Score Card */}
                    <div className="card-gradient mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Shield className="h-7 w-7 mr-3 text-primary-600" />
                                Trust Score
                            </h2>
                            <span className={`text-lg font-semibold ${trustStatus.color}`}>
                                {trustStatus.icon} {trustStatus.label}
                            </span>
                        </div>

                        <div className={`bg-gradient-to-r ${getTrustScoreColor(trustScore)} p-8 rounded-2xl text-white text-center mb-6`}>
                            <p className="text-lg mb-2 opacity-90">Your Trust Score</p>
                            <p className="text-7xl font-bold mb-2">{trustScore}</p>
                            <p className="text-sm opacity-75">out of 100</p>
                        </div>

                        {/* Trust Score Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>Trust Level</span>
                                <span>{trustScore}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full bg-gradient-to-r ${getTrustScoreColor(trustScore)} transition-all duration-500`}
                                    style={{ width: `${trustScore}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Trust Score Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl border-2 ${trustScore === 100 ? 'bg-green-50 border-green-200' :
                                    trustScore >= 75 ? 'bg-yellow-50 border-yellow-200' :
                                        trustScore >= 50 ? 'bg-orange-50 border-orange-200' :
                                            'bg-red-50 border-red-200'
                                }`}>
                                <p className="text-sm font-semibold text-gray-700 mb-2">What is Trust Score?</p>
                                <p className="text-xs text-gray-600">
                                    Your trust score reflects the quality of your reports. It starts at 100 and decreases if reports are marked as fake by admins.
                                </p>
                            </div>

                            <div className={`p-4 rounded-xl border-2 ${trustScore === 100 ? 'bg-green-50 border-green-200' :
                                    trustScore >= 75 ? 'bg-yellow-50 border-yellow-200' :
                                        trustScore >= 50 ? 'bg-orange-50 border-orange-200' :
                                            'bg-red-50 border-red-200'
                                }`}>
                                <p className="text-sm font-semibold text-gray-700 mb-2">How to Maintain It?</p>
                                <p className="text-xs text-gray-600">
                                    Submit genuine reports with accurate information and real images. Fake reports reduce your score by 25 points.
                                </p>
                            </div>
                        </div>

                        {/* Warning Messages */}
                        {trustScore < 100 && trustScore > 0 && (
                            <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                                <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-900 mb-1">
                                            {trustScore >= 75 ? 'Warning: One fake report detected' :
                                                trustScore >= 50 ? 'Serious Warning: Multiple fake reports detected' :
                                                    'Critical Warning: You are close to being banned'}
                                        </p>
                                        <p className="text-xs text-yellow-800">
                                            {trustScore >= 75 ? 'Please ensure all future reports are genuine. Another fake report will further reduce your trust score.' :
                                                trustScore >= 50 ? 'Your account is at risk. Submit only verified and genuine reports to avoid being banned.' :
                                                    'One more fake report will result in a permanent ban. Please be extremely careful with your submissions.'}
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-2 font-medium">
                                            Fake reports remaining before ban: {Math.floor(trustScore / 25)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {trustScore === 0 && (
                            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                <div className="flex items-start">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-900 mb-1">
                                            Account Banned
                                        </p>
                                        <p className="text-xs text-red-800">
                                            Your account has been permanently banned due to multiple fake reports. You can no longer submit new issues.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Impact Score */}
                    <div className="card-gradient">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Civic Impact Score</h2>
                        <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-8 rounded-2xl text-white text-center">
                            <p className="text-lg mb-2">Your Total Impact</p>
                            <p className="text-6xl font-bold mb-4">{impactScore}</p>
                            <p className="text-primary-100">
                                Keep reporting issues to increase your impact score!
                            </p>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <p className="text-gray-600 mb-1">Resolved Issues</p>
                                <p className="text-xl font-bold text-primary-600">+10 points each</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200">
                                <p className="text-gray-600 mb-1">In Progress Issues</p>
                                <p className="text-xl font-bold text-primary-600">+5 points each</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

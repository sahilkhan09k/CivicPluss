import { useState } from 'react';
import { Upload, MapPin, CheckCircle, AlertCircle, Loader, Clock, AlertTriangle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const ReportIssue = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        image: null,
        lat: '',
        lng: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorType, setErrorType] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {

            if (file.size > 10 * 1024 * 1024) {
                setError('Image size should be less than 10MB');
                return;
            }
            setFormData({ ...formData, image: file });
            setError('');
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString()
                    });
                    setLoading(false);
                },
                (error) => {
                    setError('Unable to detect location. Please enter manually.');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrorType('');
        setLoading(true);

        try {

            if (!formData.title || !formData.description || !formData.image || !formData.lat || !formData.lng) {
                throw new Error('All fields are required');
            }

            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('category', formData.category);
            submitData.append('imageUrl', formData.image);
            submitData.append('lat', formData.lat);
            submitData.append('lng', formData.lng);

            const response = await apiService.createIssue(submitData);

            console.log('Issue created:', response);
            setSubmitted(true);

            setTimeout(() => {
                navigate('/my-issues');
            }, 2000);
        } catch (err) {
            console.error('Submit error:', err);
            const errorMessage = err.message || 'Failed to submit issue. Please try again.';


            if (err.status === 429 || errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
                if (errorMessage.includes('wait') && errorMessage.includes('minutes')) {
                    setErrorType('cooldown');
                    setError(errorMessage);
                } else if (errorMessage.includes('Daily issue limit')) {
                    setErrorType('limit');
                    setError(errorMessage);
                } else {
                    setErrorType('cooldown');
                    setError('You can submit only one issue per 30 minutes. Please wait before submitting another report.');
                }
            }

            else if (err.status === 409 || errorMessage.includes('409') || errorMessage.includes('Conflict')) {
                setErrorType('location');
                if (errorMessage.includes('Multiple issues already reported')) {
                    setError(errorMessage);
                } else {
                    setError('Multiple issues have already been reported at this location. Please check existing reports or choose a different location.');
                }
            }

            else if (errorMessage.includes('Multiple issues already reported at this location')) {
                setErrorType('location');
                setError(errorMessage);
            }

            else {
                setErrorType('general');
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20">
                <Sidebar />
                <div className="flex-1 ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-success-500 to-success-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <CheckCircle className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold mb-3 text-gray-900">Issue Reported Successfully!</h2>
                        <p className="text-gray-600 text-lg">AI is analyzing your report...</p>
                        <p className="text-sm text-gray-500 mt-2">Redirecting to your issues...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-accent-50/20">
            <Sidebar />

            <div className="flex-1 ml-64 p-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                            Report an Issue
                        </h1>
                        <p className="text-gray-600 text-lg">Help improve your city by reporting civic issues</p>
                    </div>

                    {error && (
                        <div className={`mb-6 p-5 rounded-xl border-2 ${errorType === 'cooldown' ? 'bg-amber-50 border-amber-300' :
                            errorType === 'limit' ? 'bg-orange-50 border-orange-300' :
                                errorType === 'location' ? 'bg-blue-50 border-blue-300' :
                                    'bg-red-50 border-red-300'
                            }`}>
                            <div className="flex items-start space-x-3">
                                {errorType === 'cooldown' && (
                                    <Clock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                )}
                                {errorType === 'limit' && (
                                    <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                                )}
                                {errorType === 'location' && (
                                    <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                )}
                                {errorType === 'general' && (
                                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <h3 className={`font-semibold mb-1 ${errorType === 'cooldown' ? 'text-amber-900' :
                                        errorType === 'limit' ? 'text-orange-900' :
                                            errorType === 'location' ? 'text-blue-900' :
                                                'text-red-900'
                                        }`}>
                                        {errorType === 'cooldown' && 'Cooldown Period Active'}
                                        {errorType === 'limit' && 'Daily Limit Reached'}
                                        {errorType === 'location' && 'Location Already Covered'}
                                        {errorType === 'general' && 'Submission Failed'}
                                    </h3>
                                    <p className={`text-sm ${errorType === 'cooldown' ? 'text-amber-800' :
                                        errorType === 'limit' ? 'text-orange-800' :
                                            errorType === 'location' ? 'text-blue-800' :
                                                'text-red-800'
                                        }`}>
                                        {error}
                                    </p>
                                    {errorType === 'cooldown' && (
                                        <p className="text-xs text-amber-700 mt-2">
                                            💡 This helps prevent spam and ensures quality reports
                                        </p>
                                    )}
                                    {errorType === 'limit' && (
                                        <p className="text-xs text-orange-700 mt-2">
                                            💡 You can report up to 5 issues per day. Try again tomorrow!
                                        </p>
                                    )}
                                    {errorType === 'location' && (
                                        <div className="mt-3">
                                            <p className="text-xs text-blue-700 mb-2">
                                                💡 Instead of creating a new report, you can:
                                            </p>
                                            <button
                                                onClick={() => navigate('/dashboard')}
                                                className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
                                            >
                                                View existing issues in this area →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div className="card-gradient">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Image *</label>
                            <div className="border-2 border-dashed border-primary-300 rounded-xl p-8 text-center hover:border-primary-500 hover:bg-primary-50/50 transition cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                    required
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload className="h-8 w-8 text-primary-600" />
                                    </div>
                                    <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                                </label>
                                {formData.image && (
                                    <div className="mt-4 p-3 bg-success-50 rounded-lg inline-block">
                                        <p className="text-sm text-success-700 font-medium">✓ {formData.image.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="card-gradient">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Location *</label>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <input
                                    type="number"
                                    step="any"
                                    name="lat"
                                    value={formData.lat}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Latitude"
                                    required
                                />
                                <input
                                    type="number"
                                    step="any"
                                    name="lng"
                                    value={formData.lng}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Longitude"
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                onClick={detectLocation}
                                disabled={loading}
                                className="btn-secondary w-full flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                                        Detecting...
                                    </>
                                ) : (
                                    <>
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Auto-Detect Location
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Category Selection */}
                        <div className="card-gradient">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Category *
                                <span className="text-xs font-normal text-gray-500 ml-2">(AI will suggest, you can override)</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="Road">🛣️ Road/Pothole</option>
                                <option value="Waste">🗑️ Garbage/Waste</option>
                                <option value="Water">💧 Water/Drainage</option>
                                <option value="Electricity">⚡ Electricity/Streetlight</option>
                                <option value="Other">📋 Other</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                💡 AI will analyze your image and description to suggest the best category
                            </p>
                        </div>

                        {/* Title */}
                        <div className="card-gradient">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Issue Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Brief description of the issue"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="card-gradient">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field"
                                rows="5"
                                placeholder="Provide detailed information about the issue (location landmarks, severity, etc.)"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                💡 Tip: Mention nearby landmarks (hospital, school, market) for better AI prioritization
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Issue Report'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportIssue;

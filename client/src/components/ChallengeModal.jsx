import { useState, useEffect } from 'react';
import { X, MapPin, Camera, Loader, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { apiService } from '../services/api';

const ChallengeModal = ({ isOpen, onClose, issue }) => {
    const [step, setStep] = useState('location'); // location, photo, submitting, result
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [locationValidation, setLocationValidation] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('location');
            setLocation(null);
            setLocationError('');
            setLocationValidation(null);
            setPhoto(null);
            setPhotoPreview(null);
            setDescription('');
            setSubmitting(false);
            setResult(null);
            setError('');
        }
    }, [isOpen]);

    // Request location on mount
    useEffect(() => {
        if (isOpen && step === 'location' && !location) {
            requestLocation();
        }
    }, [isOpen, step]);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser. Please use a modern browser with location services.');
            return;
        }

        setLocationError('');
        console.log('🔍 Requesting user location...');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('📍 Location obtained:', userLocation);
                setLocation(userLocation);
                validateLocation(userLocation);
            },
            (error) => {
                console.error('Location error:', error);
                let errorMessage = 'Unable to access your location. ';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location services in your browser settings and try again.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Unable to determine your location. Please ensure GPS is enabled and try again.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                    default:
                        errorMessage = 'Unable to access your location. Please enable location services and try again.';
                }
                
                setLocationError(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000, // Increased timeout to 15 seconds
                maximumAge: 60000 // Allow cached location up to 1 minute old
            }
        );
    };

    const validateLocation = (userLocation) => {
        // Calculate distance from issue location
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            issue.location.lat,
            issue.location.lng
        );

        const isValid = distance <= 50;
        setLocationValidation({
            valid: isValid,
            distance: Math.round(distance),
            message: isValid
                ? `✓ You are ${Math.round(distance)}m from the issue location`
                : `✗ You are ${Math.round(distance)}m from the issue location (must be within 50m)`
        });
    };

    // Haversine formula to calculate distance between two coordinates
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    const handlePhotoCapture = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Invalid image format. Please upload a JPEG, PNG, or WebP image.');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image file size exceeds maximum allowed (5MB). Please capture a new photo.');
            return;
        }

        setPhoto(file);
        setError(''); // Clear any previous errors when photo is captured

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!location || !photo) {
            setError('Location and photo are required');
            return;
        }

        setSubmitting(true);
        setError('');
        setStep('submitting');

        try {
            console.log('📍 Submitting challenge with location:', location);
            console.log('📷 Photo file:', photo);
            
            const formData = new FormData();
            formData.append('issueId', issue._id);
            formData.append('challengePhoto', photo);
            formData.append('currentLocation', JSON.stringify(location));
            if (description.trim()) {
                formData.append('description', description.trim());
            }

            console.log('📤 FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await apiService.submitChallenge(formData);
            console.log('✅ Challenge submission response:', response);

            setResult(response);
            setStep('result');
        } catch (err) {
            console.error('Challenge submission error:', err);
            // Use the user-friendly error message if available
            const errorMessage = err.userMessage || err.message || 'Failed to submit challenge. Please try again.';
            setError(errorMessage);
            setStep('photo');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Challenge Admin Decision</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Issue Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">{issue.title}</h3>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                        {issue.imageUrl && (
                            <img
                                src={issue.imageUrl}
                                alt="Original issue"
                                className="mt-3 rounded-lg w-full h-48 object-cover"
                            />
                        )}
                    </div>

                    {/* Location Step */}
                    {step === 'location' && (
                        <div className="space-y-4">
                            <div className="flex items-center mb-4">
                                <div className="bg-primary-100 rounded-full p-3 mr-3">
                                    <MapPin className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Step 1: Location Verification</h3>
                                    <p className="text-sm text-gray-600">You must be within 50 meters of the issue location</p>
                                </div>
                            </div>

                            {locationError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-red-800">{locationError}</p>
                                        <button
                                            onClick={requestLocation}
                                            className="text-sm text-red-700 underline mt-2 hover:text-red-800"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!location && !locationError && (
                                <div className="flex items-center justify-center py-8">
                                    <Loader className="h-8 w-8 text-primary-600 animate-spin" />
                                    <span className="ml-3 text-gray-600">Detecting your location...</span>
                                </div>
                            )}

                            {location && locationValidation && (
                                <div className={`border rounded-lg p-4 ${
                                    locationValidation.valid
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-red-50 border-red-200'
                                }`}>
                                    <div className="flex items-start">
                                        {locationValidation.valid ? (
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${
                                                locationValidation.valid ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                                {locationValidation.message}
                                            </p>
                                            {locationValidation.valid && (
                                                <button
                                                    onClick={() => {
                                                        setStep('photo');
                                                        setError(''); // Clear any previous errors
                                                    }}
                                                    className="btn-primary mt-4"
                                                >
                                                    Continue to Photo Capture
                                                </button>
                                            )}
                                            {!locationValidation.valid && (
                                                <p className="text-xs text-red-700 mt-2">
                                                    You must be at the issue location to submit a challenge.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Photo Step */}
                    {step === 'photo' && (
                        <div className="space-y-4">
                            <div className="flex items-center mb-4">
                                <div className="bg-primary-100 rounded-full p-3 mr-3">
                                    <Camera className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Step 2: Capture Live Photo</h3>
                                    <p className="text-sm text-gray-600">Take a photo of the current issue state</p>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            {!photoPreview && (
                                <div className="border-2 border-dashed border-primary-300 rounded-xl p-8 text-center hover:border-primary-500 hover:bg-primary-50/50 transition">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handlePhotoCapture}
                                        className="hidden"
                                        id="challenge-photo"
                                    />
                                    <label htmlFor="challenge-photo" className="cursor-pointer">
                                        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Camera className="h-8 w-8 text-primary-600" />
                                        </div>
                                        <p className="text-gray-700 font-medium">Tap to open camera</p>
                                        <p className="text-sm text-gray-500 mt-1">JPEG, PNG, or WebP (max 5MB)</p>
                                        <p className="text-xs text-yellow-600 mt-2">⚠️ Gallery selection disabled - camera only</p>
                                    </label>
                                </div>
                            )}

                            {photoPreview && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center mb-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                            <span className="text-sm font-medium text-green-800">Photo captured successfully</span>
                                        </div>
                                        <img
                                            src={photoPreview}
                                            alt="Challenge photo preview"
                                            className="rounded-lg w-full h-64 object-cover"
                                        />
                                    </div>

                                    {/* Description Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Challenge Description (Optional)
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                                            rows="3"
                                            placeholder="Explain why you believe the admin's decision was incorrect..."
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {description.length}/500 characters
                                        </p>
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => {
                                                setPhoto(null);
                                                setPhotoPreview(null);
                                                setDescription('');
                                            }}
                                            className="btn-secondary flex-1"
                                        >
                                            Retake Photo
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="btn-primary flex-1"
                                        >
                                            Submit Challenge
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setStep('location');
                                    setError(''); // Clear any errors when going back
                                }}
                                className="text-sm text-gray-600 hover:text-gray-800 underline"
                            >
                                ← Back to Location
                            </button>
                        </div>
                    )}

                    {/* Submitting Step */}
                    {step === 'submitting' && (
                        <div className="py-12 text-center">
                            <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitting Challenge</h3>
                            <p className="text-sm text-gray-600">AI is analyzing your photo...</p>
                            <div className="mt-6 space-y-2 text-sm text-gray-500">
                                <p>✓ Validating location</p>
                                <p>✓ Uploading photo</p>
                                <p className="text-primary-600 font-medium">⏳ Comparing with original photo...</p>
                            </div>
                        </div>
                    )}

                    {/* Result Step */}
                    {step === 'result' && result && (
                        <div className="space-y-4">
                            {result.success && result.data?.challenge?.status === 'accepted' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-900 mb-2">Challenge Accepted!</h3>
                                    <p className="text-green-800 mb-4">{result.message}</p>
                                    
                                    <div className="bg-white rounded-lg p-4 mb-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Similarity Score</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {result.data?.challenge?.similarityScore || 'N/A'}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Distance</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {result.data?.challenge?.distanceFromIssue 
                                                        ? `${result.data.challenge.distanceFromIssue}m`
                                                        : locationValidation?.distance 
                                                        ? `${locationValidation.distance}m`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-green-700">
                                        Your challenge has been added to the super admin review queue. You will be notified of the final decision.
                                    </p>
                                </div>
                            )}

                            {result.success && result.data?.challenge?.status === 'rejected' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-900 mb-2">Challenge Rejected</h3>
                                    <p className="text-red-800 mb-4">{result.message}</p>
                                    
                                    <div className="bg-white rounded-lg p-4 mb-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Similarity Score</p>
                                                <p className="text-2xl font-bold text-red-600">
                                                    {result.data?.challenge?.similarityScore || 'N/A'}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Distance</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {result.data?.challenge?.distanceFromIssue 
                                                        ? `${result.data.challenge.distanceFromIssue}m`
                                                        : locationValidation?.distance 
                                                        ? `${locationValidation.distance}m`
                                                        : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-red-700">
                                        The photo similarity score was too low (≤50%). The admin's decision stands.
                                    </p>
                                </div>
                            )}

                            {/* Fallback for unexpected result structure or when challenge status is not in expected format */}
                            {result.success && (!result.data?.challenge?.status || 
                                (result.data?.challenge?.status !== 'accepted' && result.data?.challenge?.status !== 'rejected')) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-blue-900 mb-2">Challenge Submitted!</h3>
                                    <p className="text-blue-800 mb-4">{result.message || 'Your challenge has been submitted successfully.'}</p>
                                    
                                    {result.data?.challenge && (
                                        <div className="bg-white rounded-lg p-4 mb-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Similarity Score</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {result.data.challenge.similarityScore || 'N/A'}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Distance</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {result.data.challenge.distanceFromIssue 
                                                            ? `${result.data.challenge.distanceFromIssue}m`
                                                            : locationValidation?.distance 
                                                            ? `${locationValidation.distance}m`
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-sm text-blue-700">
                                        Your challenge is being processed. You will be notified of the result.
                                    </p>
                                </div>
                            )}

                            {/* Error case */}
                            {!result.success && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-900 mb-2">Challenge Failed</h3>
                                    <p className="text-red-800 mb-4">{result.message || 'Failed to submit challenge. Please try again.'}</p>
                                </div>
                            )}

                            <button
                                onClick={handleClose}
                                className="btn-primary w-full"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChallengeModal;

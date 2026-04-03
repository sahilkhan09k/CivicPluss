// Dynamically resolve API URL based on current hostname.
// This ensures cookies work correctly (same-origin) whether accessing
// from localhost or a local network IP (e.g. 192.168.x.x on mobile).
const getApiBaseUrl = () => {
    // In production, use the env variable (points to Render)
    if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
        return import.meta.env.VITE_API_URL;
    }
    // In development, always use the same hostname the browser is on
    // so cookies are same-origin and sameSite: lax works correctly
    return `http://${window.location.hostname}:5000/api/v1`;
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('Hostname:', window.location.hostname);

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Map backend error messages to user-friendly messages
     */
    getUserFriendlyErrorMessage(error, endpoint) {
        const status = error.status;
        const message = error.message || '';
        const data = error.data || {};

        // Challenge-specific error handling
        if (endpoint.includes('/challenge')) {
            // Location errors
            if (message.includes('location') || message.includes('Location')) {
                if (message.includes('denied') || message.includes('permission')) {
                    return 'Location access denied. Please enable location services in your browser settings and try again.';
                }
                if (message.includes('unavailable') || message.includes('Unable')) {
                    return 'Unable to determine your location. Please ensure GPS is enabled and try again.';
                }
                if (message.includes('timeout') || message.includes('timed out')) {
                    return 'Location request timed out. Please try again.';
                }
                if (message.includes('too far') || message.includes('50 meters') || message.includes('distance')) {
                    return `You are too far from the issue location. You must be within 50 meters to submit a challenge.`;
                }
            }

            // Photo upload errors
            if (message.includes('image') || message.includes('photo') || message.includes('file')) {
                if (message.includes('format') || message.includes('type')) {
                    return 'Invalid image format. Please use JPEG, PNG, or WebP.';
                }
                if (message.includes('size') || message.includes('large') || message.includes('5MB')) {
                    return 'Image file size exceeds 5MB. Please capture a new photo.';
                }
                if (message.includes('upload') || message.includes('failed')) {
                    return 'Failed to upload photo. Please check your connection and try again.';
                }
            }

            // Challenge window errors
            if (message.includes('window') || message.includes('expired') || message.includes('24 hours')) {
                return 'Challenge window has expired (24 hours passed). You can no longer challenge this decision.';
            }
            if (message.includes('already submitted') || message.includes('duplicate')) {
                return 'You have already submitted a challenge for this issue.';
            }
            if (message.includes('no admin decision') || message.includes('not been decided')) {
                return 'This issue has not been decided by an admin yet. There is nothing to challenge.';
            }

            // Validation errors
            if (message.includes('similarity') || message.includes('too low')) {
                return 'Photo similarity too low (must be >50%). The photos do not appear to show the same issue.';
            }

            // AI analysis errors
            if (message.includes('AI') || message.includes('analysis') || message.includes('Groq')) {
                if (status === 503 || message.includes('unavailable') || message.includes('service')) {
                    return 'Photo comparison service is temporarily unavailable. Please try again in a few moments.';
                }
                return 'Failed to analyze photos. Please try again.';
            }

            // Authorization errors for challenge endpoints
            if (status === 403) {
                if (message.includes('super admin') || message.includes('super_admin')) {
                    return 'You do not have permission to access this resource. Only super admins can review challenges.';
                }
                if (message.includes('own issues') || message.includes('your own')) {
                    return 'You can only challenge decisions on your own issues.';
                }
                return 'You do not have permission to perform this action.';
            }

            // Not found errors
            if (status === 404) {
                if (message.includes('challenge')) {
                    return 'Challenge not found. It may have been removed or does not exist.';
                }
                if (message.includes('issue')) {
                    return 'Issue not found. Please verify the issue ID.';
                }
            }

            // Conflict errors
            if (status === 409) {
                return 'A challenge already exists for this issue. You cannot submit multiple challenges.';
            }
        }

        // Generic error handling by status code
        if (status === 400) {
            return data.message || message || 'Invalid request. Please check your input and try again.';
        }
        if (status === 401) {
            return 'Please log in to continue.';
        }
        if (status === 403) {
            // Trust score suspension
            if (message.includes('suspended due to low trust score') || message.includes('trust score has reached zero')) {
                return 'Your account has been suspended due to low trust score. Your trust score has reached zero due to multiple violations. Please contact support if you believe this is an error.';
            }
            // Permanent ban
            if (message.includes('permanently banned')) {
                return 'Your account has been permanently banned due to multiple fake reports. You cannot access the platform.';
            }
            return 'You do not have permission to perform this action.';
        }
        if (status === 404) {
            return 'The requested resource was not found.';
        }
        if (status === 413) {
            return 'File size too large. Please use a smaller file.';
        }
        if (status === 500) {
            return 'Server error. Please try again later.';
        }
        if (status === 503) {
            return 'Service temporarily unavailable. Please try again later.';
        }

        // Network errors
        if (error.message === 'Failed to fetch' || error.message.includes('network')) {
            return 'Network error. Please check your internet connection and try again.';
        }

        // Default fallback
        return message || 'An unexpected error occurred. Please try again.';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Always send cookies
        };

        try {
            const response = await fetch(url, config);

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!response.ok) {
                // If 401 and not already trying to refresh, attempt token refresh
                if (response.status === 401 && !endpoint.includes('/auth/refresh-token') && !endpoint.includes('/auth/login')) {
                    console.log('Access token expired, attempting refresh...');
                    try {
                        await this.refreshToken();
                        
                        // Retry original request (cookies updated automatically)
                        const retryResponse = await fetch(url, config);
                        const retryData = await retryResponse.json();
                        
                        if (retryResponse.ok) {
                            return retryData;
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        // Clear user data and redirect to login (only if not already on login/register)
                        localStorage.removeItem('user');
                        const currentPath = window.location.pathname;
                        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
                            window.location.href = '/login';
                        }
                        throw new Error('Session expired. Please login again.');
                    }
                }

                // Handle trust score suspension (403 errors)
                if (response.status === 403 && (data.message?.includes('suspended due to low trust score') || data.message?.includes('trust score has reached zero'))) {
                    console.log('User suspended due to low trust score');
                    // Clear user data and redirect to login
                    localStorage.removeItem('user');
                    const currentPath = window.location.pathname;
                    if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
                        window.location.href = '/login';
                    }
                }
                
                const error = new Error(data.message || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = data;
                
                // Enhance error message with user-friendly version
                error.userMessage = this.getUserFriendlyErrorMessage(error, endpoint);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            
            // If error doesn't have userMessage yet, add it
            if (!error.userMessage) {
                error.userMessage = this.getUserFriendlyErrorMessage(error, endpoint);
            }
            
            throw error;
        }
    }

    async uploadRequest(endpoint, formData, method = 'POST') {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: method,
                body: formData,
                credentials: 'include', // Send cookies automatically
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (!response.ok) {
                // If 401, attempt token refresh
                if (response.status === 401) {
                    console.log('Access token expired, attempting refresh...');
                    try {
                        await this.refreshToken();
                        
                        // Retry upload (cookies updated automatically)
                        const retryResponse = await fetch(url, {
                            method: method,
                            body: formData,
                            credentials: 'include',
                        });
                        
                        const retryData = await retryResponse.json();
                        
                        if (retryResponse.ok) {
                            return retryData;
                        }
                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        localStorage.removeItem('user');
                        const currentPath = window.location.pathname;
                        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
                            window.location.href = '/login';
                        }
                        throw new Error('Session expired. Please login again.');
                    }
                }

                // Handle trust score suspension (403 errors)
                if (response.status === 403 && (data.message?.includes('suspended due to low trust score') || data.message?.includes('trust score has reached zero'))) {
                    console.log('User suspended due to low trust score');
                    // Clear user data and redirect to login
                    localStorage.removeItem('user');
                    const currentPath = window.location.pathname;
                    if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
                        window.location.href = '/login';
                    }
                }
                
                const error = new Error(data.message || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = data;
                
                // Enhance error message with user-friendly version
                error.userMessage = this.getUserFriendlyErrorMessage(error, endpoint);
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            
            // If error doesn't have userMessage yet, add it
            if (!error.userMessage) {
                error.userMessage = this.getUserFriendlyErrorMessage(error, endpoint);
            }
            
            throw error;
        }
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST',
        });
    }

    async refreshToken() {
        return this.request('/auth/refresh-token', {
            method: 'POST',
        });
    }

    async getCurrentUser() {
        return this.request('/user/profile');
    }

    async getUserIssues() {
        return this.request('/user/issues');
    }

    async updateUserProfile(userData) {
        return this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async createIssue(formData) {
        return this.uploadRequest('/issue/postIssue', formData);
    }

    async getAllIssues() {
        return this.request('/issue/getAllIssue');
    }

    async getIssueById(issueId) {
        return this.request(`/issue/getIssue/${issueId}`);
    }

    async updateIssueStatus(issueId, status, resolutionImage = null, resolutionConfirmed = false) {
        if (status === 'Resolved' && resolutionImage) {
            const formData = new FormData();
            formData.append('status', status);
            formData.append('resolutionImage', resolutionImage);
            formData.append('resolutionConfirmed', resolutionConfirmed ? 'true' : 'false');
            
            return this.uploadRequest(`/issue/updateStatus/${issueId}`, formData, 'PUT');
        }
        
        return this.request(`/issue/updateStatus/${issueId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    async getIssuesByPriority() {
        return this.request('/issue/getIssuesByPriority');
    }

    async getAdminStats() {
        return this.request('/issue/adminStats');
    }

    async reportIssueAsFake(issueId) {
        return this.request(`/issue/reportAsFake/${issueId}`, {
            method: 'PUT',
        });
    }

    async toggleUpvote(issueId) {
        return this.request(`/issue/upvote/${issueId}`, {
            method: 'PUT',
        });
    }

    async verifyOTP(email, otp) {
        return this.request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });
    }

    async resendOTP(email) {
        return this.request('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    // Challenge API methods
    async submitChallenge(formData) {
        console.log('🚀 Submitting challenge to:', `${this.baseURL}/challenge/submit`);
        return this.uploadRequest('/challenge/submit', formData);
    }

    async getChallengeQueue(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.adminId) queryParams.append('adminId', filters.adminId);
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
        
        const queryString = queryParams.toString();
        return this.request(`/challenge/queue${queryString ? `?${queryString}` : ''}`);
    }

    async reviewChallenge(challengeId, decision, reviewNotes = '') {
        return this.request(`/challenge/review/${challengeId}`, {
            method: 'PUT',
            body: JSON.stringify({ decision, reviewNotes }),
        });
    }

    async getChallengeHistory(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.userId) queryParams.append('userId', filters.userId);
        if (filters.issueId) queryParams.append('issueId', filters.issueId);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.adminId) queryParams.append('adminId', filters.adminId);
        if (filters.reviewedBy) queryParams.append('reviewedBy', filters.reviewedBy);
        if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
        
        const queryString = queryParams.toString();
        return this.request(`/challenge/history${queryString ? `?${queryString}` : ''}`);
    }

    // Notification API methods
    async getUserNotifications(options = {}) {
        const queryParams = new URLSearchParams();
        if (options.page) queryParams.append('page', options.page);
        if (options.limit) queryParams.append('limit', options.limit);
        if (options.unreadOnly) queryParams.append('unreadOnly', options.unreadOnly);
        
        const queryString = queryParams.toString();
        return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
    }

    async getUnreadNotificationCount() {
        return this.request('/notifications/unread-count');
    }

    async markNotificationAsRead(notificationId) {
        return this.request(`/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
    }

    async markAllNotificationsAsRead() {
        return this.request('/notifications/mark-all-read', {
            method: 'PUT'
        });
    }

    async sendSystemAnnouncement(data) {
        return this.request('/notifications/system-announcement', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
}

export const apiService = new ApiService();

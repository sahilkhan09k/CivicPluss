const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
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
                
                const error = new Error(data.message || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async uploadRequest(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
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
                            method: 'POST',
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
                
                const error = new Error(data.message || `HTTP error! status: ${response.status}`);
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Upload Error:', error);
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

    async updateIssueStatus(issueId, status) {
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
}

export const apiService = new ApiService();

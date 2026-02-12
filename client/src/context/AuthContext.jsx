import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user profile exists in localStorage first
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setLoading(false);
                
                // Optionally verify with backend in background (don't block UI)
                apiService.getCurrentUser()
                    .then(response => {
                        if (response.success) {
                            setUser(response.data);
                            localStorage.setItem('user', JSON.stringify(response.data));
                        }
                    })
                    .catch((error) => {
                        // If verification fails, check if it's a real auth error or server down
                        if (error.message?.includes('Session expired') || error.status === 401) {
                            // Real auth error - clear user data
                            setUser(null);
                            localStorage.removeItem('user');
                        } else {
                            // Server down or network error - keep using cached data
                            console.log('Using cached user data (server unavailable)');
                        }
                    });
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
                setUser(null);
                setLoading(false);
            }
        } else {
            // No stored user, check with backend
            apiService.getCurrentUser()
                .then(response => {
                    if (response.success) {
                        setUser(response.data);
                        localStorage.setItem('user', JSON.stringify(response.data));
                    }
                })
                .catch((error) => {
                    console.log('Not authenticated:', error.message || 'Unknown error');
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, []);

    const login = (userData) => {
        const userProfile = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            trustScore: userData.trustScore,
            city: userData.city,
            isEmailVerified: userData.isEmailVerified,
        };
        setUser(userProfile);
        localStorage.setItem('user', JSON.stringify(userProfile));
    };

    const updateUser = (userData) => {
        const updatedProfile = { ...user, ...userData };
        setUser(updatedProfile);
        localStorage.setItem('user', JSON.stringify(updatedProfile));
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, updateUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const VerifyEmail = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        console.log('VerifyEmail - User:', user);
        console.log('VerifyEmail - isEmailVerified:', user?.isEmailVerified);
        console.log('VerifyEmail - Current path:', window.location.pathname);
        
        if (!user) {
            console.log('VerifyEmail - No user, redirecting to login');
            navigate('/login');
        } else {
            console.log('VerifyEmail - User exists, showing verification page');
        }
    }, [user, navigate]);

    const handleChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter complete OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiService.verifyOTP(user.email, otpString);
            setSuccess(true);
            
            // Update user context with verified status
            updateUser({ isEmailVerified: true });
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            await apiService.resendOTP(user.email);
            setOtp(['', '', '', '', '', '']);
            alert('OTP resent successfully!');
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="card max-w-md w-full text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
                        <p className="text-gray-600">Redirecting to dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex items-center justify-center min-h-[80vh] px-4">
                <div className="card max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                            <Mail className="h-8 w-8 text-primary-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
                        <p className="text-gray-600">
                            We've sent a 6-digit OTP to<br />
                            <span className="font-semibold">{user?.email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerify}>
                        <div className="flex justify-center gap-2 mb-6">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full mb-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Email'
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">
                                Didn't receive the code?
                            </p>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                                className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                            >
                                {resending ? 'Resending...' : 'Resend OTP'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-800">
                            💡 OTP expires in 10 minutes. Check your spam folder if you don't see the email.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;

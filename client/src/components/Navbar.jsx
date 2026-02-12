import { Link } from 'react-router-dom';
import { Menu, X, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-primary-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                CivicPluss
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="link-hover">Home</Link>
                        <Link to="/map" className="link-hover">Live Map</Link>
                        <Link to="/about" className="link-hover">About</Link>

                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="link-hover">
                                    Dashboard
                                </Link>
                                <button onClick={logout} className="btn-secondary py-2 px-4">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="link-hover">Login</Link>
                                <Link to="/register" className="btn-primary py-2 px-4">Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-primary-600 p-2 rounded-lg hover:bg-primary-50 transition-all duration-200"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-primary-100">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link to="/" className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-medium">
                            Home
                        </Link>
                        <Link to="/map" className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-medium">
                            Live Map
                        </Link>
                        <Link to="/about" className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-medium">
                            About
                        </Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-medium">
                                    Dashboard
                                </Link>
                                <button onClick={logout} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-medium">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all duration-200 font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="block px-4 py-3 text-center bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <MapPin className="h-8 w-8 text-primary-400" />
                            <span className="text-2xl font-bold">CivicPulse</span>
                        </div>
                        <p className="text-gray-300 mb-4 max-w-md">
                            Transforming urban governance with AI-powered issue reporting and smart city analytics.
                            Building better cities, one report at a time.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all duration-200">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all duration-200">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all duration-200">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/map" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                                    Live Map
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-gray-300 hover:text-primary-400 transition-colors duration-200">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-2 text-gray-300">
                                <Mail className="h-4 w-4 text-primary-400" />
                                <span>support@civicpulse.com</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-300">
                                <Phone className="h-4 w-4 text-primary-400" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-300">
                                <MapPin className="h-4 w-4 text-primary-400" />
                                <span>Smart City HQ</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} CivicPulse. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-1 text-gray-400 text-sm">
                            <span>Made with</span>
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                            <span>for smarter cities</span>
                        </div>
                        <div className="flex space-x-6 text-sm">
                            <Link to="/privacy" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-400 hover:text-primary-400 transition-colors duration-200">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

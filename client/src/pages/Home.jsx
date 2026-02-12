import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, MapPin, Brain, Zap, Users, Shield, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
    const [stats, setStats] = useState({
        reported: 0,
        resolved: 0,
        activeZones: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const apiUrl = `${import.meta.env.VITE_API_URL}/issue/homeStats`;
                console.log('Fetching stats from:', apiUrl);

                const response = await fetch(apiUrl);
                console.log('Response status:', response.status);

                const data = await response.json();
                console.log('Response data:', data);

                if (data.success && data.data) {
                    setStats(data.data);
                } else {
                    console.error('API returned unsuccessful response:', data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);

            }
        };

        fetchStats();

        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50/30 py-20">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-6 border border-primary-200">
                            <Zap className="h-4 w-4" />
                            <span className="text-sm font-semibold">AI-Powered Smart City Platform</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            From Complaints to <br />
                            <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 bg-clip-text text-transparent">
                                City Intelligence
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Transform urban governance with AI-powered issue reporting and smart city analytics
                        </p>

                        {/* Live Counters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="stat-card">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="bg-primary-100 p-3 rounded-xl">
                                        <MapPin className="h-6 w-6 text-primary-600" />
                                    </div>
                                </div>
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent mb-2">
                                    {stats.reported.toLocaleString()}
                                </div>
                                <div className="text-gray-600 font-medium">Issues Reported</div>
                            </div>

                            <div className="stat-card">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="bg-success-100 p-3 rounded-xl">
                                        <CheckCircle className="h-6 w-6 text-success-600" />
                                    </div>
                                </div>
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-success-600 to-success-700 bg-clip-text text-transparent mb-2">
                                    {stats.resolved.toLocaleString()}
                                </div>
                                <div className="text-gray-600 font-medium">Issues Resolved</div>
                            </div>

                            <div className="stat-card">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="bg-warning-100 p-3 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-warning-600" />
                                    </div>
                                </div>
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-warning-600 to-warning-700 bg-clip-text text-transparent mb-2">
                                    {stats.activeZones}
                                </div>
                                <div className="text-gray-600 font-medium">Active Zones</div>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/report-issue" className="btn-primary text-lg px-8 inline-flex items-center justify-center">
                                Report an Issue <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link to="/map" className="btn-secondary text-lg px-8 inline-flex items-center justify-center">
                                View City Map <MapPin className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How CivicPulse Works</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Three simple steps to make your city better
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="card-gradient text-center group hover:scale-105 transition-transform duration-300">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <MapPin className="h-8 w-8 text-white" />
                            </div>
                            <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                                Step 1
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Report Issue</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Upload photo, location auto-detected, AI suggests category & priority
                            </p>
                        </div>

                        <div className="card-gradient text-center group hover:scale-105 transition-transform duration-300">
                            <div className="bg-gradient-to-br from-accent-500 to-accent-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div className="inline-block bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                                Step 2
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Community Verifies</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Citizens confirm issues, add evidence, prevent fake reports
                            </p>
                        </div>

                        <div className="card-gradient text-center group hover:scale-105 transition-transform duration-300">
                            <div className="bg-gradient-to-br from-success-500 to-success-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <div className="inline-block bg-success-100 text-success-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                                Step 3
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900">Smart Resolution</h3>
                            <p className="text-gray-600 leading-relaxed">
                                AI prioritizes issues, admins resolve efficiently, citizens rate quality
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section-gradient py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Powered by Intelligence</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Advanced features for modern urban governance
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card flex items-start space-x-4 hover:scale-105 transition-transform duration-300">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3 rounded-xl flex-shrink-0">
                                <Brain className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">AI-Powered Intelligence</h3>
                                <p className="text-gray-600">Machine learning categorizes and prioritizes issues automatically for faster resolution</p>
                            </div>
                        </div>

                        <div className="card flex items-start space-x-4 hover:scale-105 transition-transform duration-300">
                            <div className="bg-gradient-to-br from-accent-500 to-accent-700 p-3 rounded-xl flex-shrink-0">
                                <Zap className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Smart City Ready</h3>
                                <p className="text-gray-600">Built for modern urban governance and digital transformation initiatives</p>
                            </div>
                        </div>

                        <div className="card flex items-start space-x-4 hover:scale-105 transition-transform duration-300">
                            <div className="bg-gradient-to-br from-success-500 to-success-700 p-3 rounded-xl flex-shrink-0">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Community Verification</h3>
                                <p className="text-gray-600">Crowdsourced validation ensures authenticity and prevents spam reports</p>
                            </div>
                        </div>

                        <div className="card flex items-start space-x-4 hover:scale-105 transition-transform duration-300">
                            <div className="bg-gradient-to-br from-warning-500 to-warning-700 p-3 rounded-xl flex-shrink-0">
                                <TrendingUp className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">Real-time Analytics</h3>
                                <p className="text-gray-600">Track trends, monitor hotspots, and make data-driven decisions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-primary-600 via-primary-700 to-accent-600 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Build a Smarter City?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Join thousands of citizens making their communities better
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-white text-primary-700 hover:bg-gray-50 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 inline-flex items-center justify-center">
                            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link to="/about" className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-semibold py-4 px-8 rounded-xl border-2 border-white/30 transition-all duration-200 inline-flex items-center justify-center">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
